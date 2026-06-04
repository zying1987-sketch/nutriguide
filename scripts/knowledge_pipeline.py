#!/usr/bin/env python3
"""
NutriGuide 知识库 Pipeline — 5 Agent 自动化处理
从PDF提取文本 → LLM提炼结构化知识 → 存入knowledge-base/structured/

用法: /usr/bin/python3 scripts/knowledge_pipeline.py <pdf_path> [--source "书名"] [--max-pages N]
"""

import sys, os, json, time, re, hashlib
from datetime import datetime
from pathlib import Path

# --- Config ---
DASHSCOPE_API_KEY = os.environ.get("DASHSCOPE_API_KEY", "sk-b5030eaa2c044ae8b9ff3efd0fbcf843")
DASHSCOPE_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions"
MODEL = "qwen-plus"
MAX_TOKENS = 2048
TIMEOUT = 120
CHUNK_SIZE = 8000  # 字符/块

# --- Knowledge Base Output Dir ---
KB_DIR = Path(__file__).resolve().parent.parent / "knowledge-base" / "structured"

# ============================================================
# Agent 1: 知识提炼师 — 从原始文本提取结构化营养知识
# ============================================================
KNOWLEDGE_EXTRACTOR_PROMPT = """你是一位资深营养学知识提炼师。从以下书籍/文献片段中提取关键营养学知识，输出JSON格式。

要求：
1. 只提取与营养学、代谢、饮食、补充剂、健康相关的核心事实
2. 每条知识需包含：nutrient（营养素名或主题）、fact（核心事实）、mechanism（机制简述，可选）、population（适用人群，可选）、source_context（引用原文片段）
3. 忽略致谢、目录、索引、纯叙述性段落
4. 每条控制在200字以内

输出格式（JSON数组）：
[{"nutrient":"维生素D","fact":"维生素D缺乏与认知功能下降相关，补充可降低阿尔茨海默病风险","mechanism":"通过调节钙稳态和抗炎作用保护神经元","population":"老年人","evidence":"A","source_context":"原文相关片段"}]

仅输出JSON数组，不要其他内容。"""

def call_llm(prompt, system_prompt="", max_tokens=MAX_TOKENS):
    """调用通义千问"""
    import urllib.request, urllib.error
    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": prompt})
    
    data = json.dumps({
        "model": MODEL,
        "messages": messages,
        "temperature": 0.3,
        "max_tokens": max_tokens,
    }).encode('utf-8')
    
    req = urllib.request.Request(DASHSCOPE_URL, data=data, headers={
        "Content-Type": "application/json",
        "Authorization": f"Bearer {DASHSCOPE_API_KEY}",
    })
    
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
            result = json.loads(resp.read())
            content = result["choices"][0]["message"]["content"]
            return content
    except Exception as e:
        print(f"  LLM调用失败: {e}")
        return None

def extract_text_from_pdf(pdf_path, max_pages=None):
    """用PyMuPDF提取PDF文本"""
    import fitz
    doc = fitz.open(pdf_path)
    pages = []
    total = min(len(doc), max_pages or len(doc))
    
    for i in range(total):
        page = doc[i]
        text = page.get_text("text")
        if text.strip():
            pages.append(text)
    
    doc.close()
    print(f"  提取了 {len(pages)}/{total} 页文本，共 {sum(len(p) for p in pages)} 字符")
    return pages

def split_into_chunks(pages, chunk_size=CHUNK_SIZE):
    """将页面文本分成适合 LLM 处理的块"""
    chunks = []
    current = ""
    for page in pages:
        if len(current) + len(page) > chunk_size:
            if current:
                chunks.append(current)
            current = page
        else:
            current += "\n" + page
    if current:
        chunks.append(current)
    return chunks

def extract_knowledge(chunks, source_name):
    """Agent 1: 从文本块提取知识"""
    all_knowledge = []
    
    for i, chunk in enumerate(chunks):
        print(f"  [Agent 1] 处理块 {i+1}/{len(chunks)} ({len(chunk)}字符)...", end=" ", flush=True)
        prompt = f"来源：{source_name}\n\n文本内容：\n{chunk[:5000]}"
        result = call_llm(prompt, KNOWLEDGE_EXTRACTOR_PROMPT)
        
        if result:
            try:
                # 提取JSON数组
                json_match = re.search(r'\[[\s\S]*\]', result)
                if json_match:
                    items = json.loads(json_match.group())
                    all_knowledge.extend(items)
                    print(f"提取 {len(items)} 条")
                else:
                    print("无知识")
            except json.JSONDecodeError:
                print("JSON解析失败")
        else:
            print("失败")
        
        if i < len(chunks) - 1:
            time.sleep(0.5)  # 避免限流
    
    return all_knowledge

def add_ids_and_metadata(knowledge, source_name):
    """添加ID和元数据"""
    for item in knowledge:
        if isinstance(item, dict):
            item["id"] = hashlib.md5(
                f"{source_name}|{item.get('nutrient','')}|{item.get('fact','')[:50]}".encode()
            ).hexdigest()[:12]
            item["source"] = source_name
            item["extracted_at"] = datetime.now().isoformat()
    return knowledge

def save_knowledge(knowledge, source_slug):
    """保存知识到knowledge-base/structured/"""
    os.makedirs(KB_DIR, exist_ok=True)
    
    filename = f"{source_slug}_{datetime.now().strftime('%Y%m%d')}.json"
    filepath = KB_DIR / filename
    
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump({
            "source": source_slug,
            "extracted_at": datetime.now().isoformat(),
            "total_items": len(knowledge),
            "items": knowledge,
        }, f, ensure_ascii=False, indent=2)
    
    print(f"  ✅ 保存 {len(knowledge)} 条知识 → {filepath}")
    return filepath

def run_pipeline(pdf_path, source_name=None, max_pages=None):
    """运行完整 pipeline"""
    pdf_path = Path(pdf_path)
    if not pdf_path.exists():
        print(f"❌ 文件不存在: {pdf_path}")
        return
    
    source_name = source_name or pdf_path.stem[:50]
    source_slug = re.sub(r'[^a-zA-Z0-9\u4e00-\u9fff_-]', '_', source_name)[:40]
    
    print(f"\n{'='*60}")
    print(f"NutriGuide 知识库 Pipeline")
    print(f"来源: {source_name}")
    print(f"文件: {pdf_path}")
    print(f"{'='*60}\n")
    
    # Step 1: 提取文本
    print("[Step 1] PDF文本提取...")
    pages = extract_text_from_pdf(pdf_path, max_pages)
    if not pages:
        print("❌ 无文本可提取")
        return
    
    # Step 2: 分块
    print(f"\n[Step 2] 文本分块 (每块≤{CHUNK_SIZE}字符)...")
    chunks = split_into_chunks(pages)
    print(f"  共 {len(chunks)} 个块")
    
    # Step 3: Agent 1 知识提取
    print(f"\n[Step 3] Agent 1 知识提炼师开始工作...")
    knowledge = extract_knowledge(chunks, source_name)
    
    # Step 4: 去重和标注
    print(f"\n[Step 4] 去重 + 元数据标注...")
    knowledge = add_ids_and_metadata(knowledge, source_name)
    
    # Step 5: 保存
    print(f"\n[Step 5] 保存到知识库...")
    filepath = save_knowledge(knowledge, source_slug)
    
    # Summary
    print(f"\n{'='*60}")
    print(f"Pipeline 完成!")
    print(f"  总知识条数: {len(knowledge)}")
    print(f"  输出文件: {filepath}")
    print(f"{'='*60}")
    
    return knowledge

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    source_name = None
    max_pages = None
    
    for i, arg in enumerate(sys.argv):
        if arg == "--source" and i+1 < len(sys.argv):
            source_name = sys.argv[i+1]
        if arg == "--max-pages" and i+1 < len(sys.argv):
            max_pages = int(sys.argv[i+1])
    
    run_pipeline(pdf_path, source_name, max_pages)
