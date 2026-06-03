#!/usr/bin/env python3
"""
食材 Markdown → 结构化 JSON 解析器
读取 knowledge-base/*.md（食材百科），输出两份数据：
  1. structured/foods/*.json — 单食材详情（供食材百科页面用）
  2. structured/foods/index.json — 分类索引（供 API 用）
同时生成知识库扁平条目供 knowledge-base-loader 搜索。
"""

import re
import json
import os
import sys
from pathlib import Path

KB_DIR = Path(__file__).resolve().parent.parent / 'knowledge-base'
STRUCTURED_DIR = KB_DIR / 'structured' / 'foods'
BATCH_STRUCTURED = KB_DIR / 'batches'

# 排除的文件
EXCLUDE_FILES = {
    'README.md', 'ARCHITECTURE.md', 'pipeline.md',
    '00-食材百科总索引.md', '深度分析食材汇总.md'
}


def parse_evidence_level(text):
    """从功效文本提取证据等级"""
    if 'A级' in text or '🟢' in text:
        return 'A'
    elif 'B级' in text or '🟡' in text:
        return 'B'
    elif 'C级' in text or '⚪' in text:
        return 'C'
    elif 'D级' in text or '🔴' in text:
        return 'D'
    return 'B'


def parse_health_benefits(lines, start_idx):
    """解析 💪 健康功效 section"""
    benefits = []
    i = start_idx
    while i < len(lines):
        line = lines[i].strip()
        if line.startswith('## ') or line.startswith('# '):
            break
        if line.startswith('**') and '级' in line:
            benefit = {'text': line.strip('*').strip()}
            benefit['evidence_level'] = parse_evidence_level(line)
            # 收集后续描述行
            desc_lines = []
            j = i + 1
            while j < len(lines):
                nl = lines[j].strip()
                if nl.startswith('## ') or nl.startswith('# ') or nl.startswith('**') or nl.startswith('---') or nl == '':
                    break
                if nl.startswith('>') and '参考' in nl:
                    benefit['reference'] = nl.strip('> ').strip()
                else:
                    desc_lines.append(nl)
                j += 1
            benefit['description'] = ' '.join(desc_lines).strip()
            benefits.append(benefit)
            i = j
            continue
        i += 1
    return benefits


def parse_nutrient_table(lines, start_idx):
    """解析 📊 营养素成分 表格"""
    nutrients = {}
    i = start_idx
    while i < len(lines):
        line = lines[i].strip()
        if line.startswith('## ') or line.startswith('# ') or line.startswith('### '):
            break
        # 匹配表格行: | 营养素 | 含量 | 单位 |
        if line.startswith('|') and not line.startswith('|---') and '营养素' not in line:
            parts = [p.strip() for p in line.split('|')]
            parts = [p for p in parts if p]
            if len(parts) >= 2 and parts[0] not in ('营养素', ''):
                try:
                    value = float(parts[1])
                    nutrients[parts[0]] = {
                        'value': value,
                        'unit': parts[2] if len(parts) >= 3 else ''
                    }
                except ValueError:
                    nutrients[parts[0]] = {
                        'value': parts[1],
                        'unit': parts[2] if len(parts) >= 3 else ''
                    }
        i += 1
    return nutrients


def parse_active_compounds(lines, start_idx):
    """解析 🧪 活性成分与作用机制 section"""
    compounds = []
    i = start_idx
    while i < len(lines):
        line = lines[i].strip()
        if line.startswith('## ') or line.startswith('# ') or line.startswith('### '):
            break
        if line.startswith('**') and '—' in line:
            # **化合物名称** — 含量：...
            name_part = line.strip('*').split('—')[0].strip()
            rest = line.split('—')[1] if '—' in line else ''
            compound = {'name': name_part, 'content_text': rest.strip()}
            # 找下一行的作用机制
            if i + 1 < len(lines) and lines[i + 1].strip().startswith('>'):
                compound['mechanism'] = lines[i + 1].strip('> ').strip()
                i += 1
            compounds.append(compound)
        i += 1
    return compounds


def parse_simple_list(lines, start_idx):
    """解析简单的列表/文本 section"""
    items = []
    i = start_idx
    while i < len(lines):
        line = lines[i].strip()
        if line.startswith('## ') or line.startswith('# ') or line.startswith('### ') or line == '---':
            break
        if line.startswith('- '):
            items.append(line[2:])
        elif line and not line.startswith('[') and not line.startswith('>'):
            if items:
                items[-1] += ' ' + line
            else:
                items.append(line)
        i += 1
    return items, i


def parse_food_section(lines, start_idx):
    """解析一个食材 section (从 ## 开始)"""
    title_line = lines[start_idx].strip()
    food_name = title_line.lstrip('#').strip()

    food = {
        'id': food_name.lower().replace(' ', '_').replace(',', '').replace('(', '').replace(')', '').replace('.', ''),
        'name': food_name,
        'category': '',  # 由文件名推断
        'tags': [],
        'deep_analysis': False,
        'nutrients': {},
        'active_compounds': [],
        'health_benefits': [],
        'daily_intake': '',
        'cooking_tips': [],
        'synergy': [],
        'contraindications': [],
        'tcm': {},
        'source': ''
    }

    i = start_idx + 1  # 从标题下一行开始

    while i < len(lines):
        line = lines[i].strip()

        # 遇到下一个食材标题则结束
        if line.startswith('## ') and i > start_idx:
            break

        # 健康标签
        if line.startswith('**健康标签'):
            tags_match = re.findall(r'`([^`]+)`', line)
            food['tags'] = tags_match
            i += 1
            continue

        # 深度分析标记
        if '深度分析' in line and '🔬' in line:
            food['deep_analysis'] = True
            i += 1
            continue

        # TCM 标记
        if '中医性味归经' in line or '🌿' in line:
            tcm_match = re.findall(r'归经[：:]\s*(.+)', line)
            if tcm_match:
                food['tcm']['meridian'] = tcm_match[0]
            i += 1
            continue

        # 各子 section
        if line.startswith('### '):
            section_title = line.strip('#').strip()

            if '营养素' in section_title:
                food['nutrients'] = parse_nutrient_table(lines, i + 1)
            elif '活性成分' in section_title:
                food['active_compounds'] = parse_active_compounds(lines, i + 1)
            elif '健康功效' in section_title:
                food['health_benefits'] = parse_health_benefits(lines, i + 1)
            elif '每日建议' in section_title or '摄入' in section_title:
                # 收集下一行文本
                if i + 1 < len(lines):
                    intake_lines = []
                    j = i + 1
                    while j < len(lines):
                        nl = lines[j].strip()
                        if nl.startswith('## ') or nl.startswith('# ') or nl.startswith('### ') or nl == '---':
                            break
                        if nl:
                            intake_lines.append(nl)
                        j += 1
                    food['daily_intake'] = ' '.join(intake_lines)
                    i = j - 1
            elif '推荐吃法' in section_title or '烹饪' in section_title:
                items, _ = parse_simple_list(lines, i + 1)
                food['cooking_tips'] = items
            elif '搭配' in section_title:
                items, _ = parse_simple_list(lines, i + 1)
                food['synergy'] = items
            elif '禁忌' in section_title or '注意' in section_title:
                items, _ = parse_simple_list(lines, i + 1)
                food['contraindications'] = items
            elif '中医详解' in section_title or '中医' in section_title:
                # 收集 TCM 详细属性
                j = i + 1
                while j < len(lines):
                    nl = lines[j].strip()
                    if nl.startswith('## ') or nl.startswith('# ') or nl.startswith('### ') or nl == '---':
                        break
                    if nl.startswith('**'):
                        # 归经/功效/性味等
                        parts = nl.split('：') if '：' in nl else nl.split(':')
                        if len(parts) >= 2:
                            food['tcm'][parts[0].strip('* ')] = parts[1].strip()
                    elif nl and not nl.startswith('['):
                        # 普通文本
                        if 'tcm_notes' not in food['tcm']:
                            food['tcm']['tcm_notes'] = nl
                    j += 1
                i = j - 1

        i += 1

    return food


def parse_file(filepath, category_name):
    """解析单个食材 markdown 文件"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    lines = content.split('\n')
    foods = []

    i = 0
    while i < len(lines):
        line = lines[i].strip()
        if line.startswith('## ') and not line.startswith('### ') and '返回' not in line and '收录' not in line and '📊' not in line and '🧪' not in line and '💪' not in line and '📏' not in line and '🍳' not in line and '🤝' not in line and '⚠️' not in line and '🌿' not in line:
            food = parse_food_section(lines, i)
            food['category'] = category_name
            if food['name'] and '返回' not in food['name']:
                foods.append(food)
            # 跳到解析结束的位置
            while i < len(lines) and not (lines[i].strip().startswith('## ') and '返回' not in lines[i]):
                i += 1
        i += 1

    return foods


def food_to_kb_entries(food):
    """将食材转为知识库扁平条目"""
    entries = []

    # 主条目：食材概览
    content_parts = [f"分类: {food['category']}"]

    # 营养素
    if food['nutrients']:
        nut_strs = []
        for k, v in food['nutrients'].items():
            nut_strs.append(f"{k}: {v['value']}{v.get('unit', '')}")
        content_parts.append(f"每100g营养素: {', '.join(nut_strs)}")

    # 活性成分
    if food['active_compounds']:
        for comp in food['active_compounds']:
            mech = f" — {comp['mechanism']}" if comp.get('mechanism') else ''
            content_parts.append(f"活性成分 [{comp['name']}]: {comp.get('content_text', '')}{mech}")

    # 健康功效
    if food['health_benefits']:
        for b in food['health_benefits']:
            ref = f" (来源: {b['reference']})" if b.get('reference') else ''
            content_parts.append(f"[证据{b['evidence_level']}级] {b['text']}: {b.get('description', '')}{ref}")

    # 摄入建议
    if food['daily_intake']:
        content_parts.append(f"每日建议摄入: {food['daily_intake']}")

    # 禁忌
    if food['contraindications']:
        content_parts.append(f"注意事项: {'; '.join(food['contraindications'])}")

    main_entry = {
        'id': f"food_{food['id']}",
        'title': food['name'],
        'content': '\n'.join(content_parts),
        'tags': food['tags'] + [food['category']],
        'category': 'food',
        'source': 'NutriGuide食材百科',
        'evidence_level': 'A' if food['deep_analysis'] else 'B',
        'meta_source': f"食材百科 - {food['category']}"
    }
    entries.append(main_entry)

    # 健康功效单独条目
    for b in food['health_benefits']:
        benefit_entry = {
            'id': f"benefit_{food['id']}_{b['text'].replace(' ', '_')[:50]}",
            'title': f"{food['name']} - {b['text']}",
            'content': f"[证据{b['evidence_level']}级] {b.get('description', '')}" + (
                f"\n来源: {b['reference']}" if b.get('reference') else ''),
            'tags': [food['category'], b['text']] + food['tags'],
            'category': 'food',
            'source': 'NutriGuide食材百科',
            'evidence_level': b['evidence_level'],
            'meta_source': f"食材百科 - {food['category']}"
        }
        entries.append(benefit_entry)

    # TCM 条目（如果有中医属性）
    if food.get('tcm') and (food['tcm'].get('meridian') or '归经' in str(food['tcm'])):
        tcm_content = []
        for k, v in food['tcm'].items():
            if k != 'tcm_notes':
                tcm_content.append(f"{k}: {v}")
        if food['tcm'].get('tcm_notes'):
            tcm_content.append(food['tcm']['tcm_notes'])
        tcm_entry = {
            'id': f"tcm_{food['id']}",
            'title': f"{food['name']}（中医属性）",
            'content': '\n'.join(tcm_content),
            'tags': ['中医', '药食同源', food['category']],
            'category': 'food',
            'source': 'NutriGuide食材百科',
            'evidence_level': 'C',
            'meta_source': f"食材百科（中医） - {food['category']}"
        }
        entries.append(tcm_entry)

    return entries


def main():
    md_files = sorted(KB_DIR.glob('*.md'))

    all_foods = []
    all_kb_entries = []
    category_index = {}

    for md_file in md_files:
        if md_file.name in EXCLUDE_FILES:
            continue

        category_name = md_file.stem
        print(f"解析: {md_file.name} → 分类: {category_name}")

        foods = parse_file(str(md_file), category_name)
        all_foods.extend(foods)

        category_index[category_name] = {
            'name': category_name,
            'file': md_file.name,
            'count': len(foods),
            'foods': [{'id': f['id'], 'name': f['name'], 'tags': f['tags']} for f in foods]
        }

        # 生成知识库条目
        for food in foods:
            entries = food_to_kb_entries(food)
            all_kb_entries.extend(entries)

    print(f"\n总计解析: {len(all_foods)} 种食材, {len(all_kb_entries)} 条知识库条目")
    print(f"分类: {len(category_index)} 个")

    # 创建输出目录
    os.makedirs(STRUCTURED_DIR, exist_ok=True)

    # 输出1: 分类索引
    index_path = STRUCTURED_DIR / 'index.json'
    index_data = {
        'total_foods': len(all_foods),
        'total_categories': len(category_index),
        'categories': category_index,
        'all_foods': [
            {
                'id': f['id'],
                'name': f['name'],
                'category': f['category'],
                'tags': f['tags'],
                'deep_analysis': f['deep_analysis'],
                'health_benefits_count': len(f['health_benefits']),
                'has_tcm': bool(f.get('tcm') and f['tcm'].get('meridian'))
            }
            for f in all_foods
        ]
    }
    with open(index_path, 'w', encoding='utf-8') as f:
        json.dump(index_data, f, ensure_ascii=False, indent=2)
    print(f"索引文件: {index_path}")

    # 输出2: 每个食材的详细 JSON
    for food in all_foods:
        food_path = STRUCTURED_DIR / f"{food['id']}.json"
        with open(food_path, 'w', encoding='utf-8') as f:
            json.dump(food, f, ensure_ascii=False, indent=2)

    print(f"详细文件: {STRUCTURED_DIR}/ (共 {len(all_foods)} 个)")

    # 输出3: 知识库扁平条目（给 knowledge-base-loader 用）
    kb_path = STRUCTURED_DIR / 'food_knowledge_base.json'
    with open(kb_path, 'w', encoding='utf-8') as f:
        json.dump(all_kb_entries, f, ensure_ascii=False, indent=2)
    print(f"知识库条目: {kb_path} ({len(all_kb_entries)} 条)")

    # 输出4: 精简版给前端用（含完整数据但无冗余）
    foods_for_frontend = []
    for food in all_foods:
        foods_for_frontend.append({
            'id': food['id'],
            'name': food['name'],
            'category': food['category'],
            'tags': food['tags'],
            'deep_analysis': food['deep_analysis'],
            'nutrients': food['nutrients'],
            'active_compounds': food['active_compounds'],
            'health_benefits': food['health_benefits'],
            'daily_intake': food['daily_intake'],
            'cooking_tips': food['cooking_tips'],
            'synergy': food['synergy'],
            'contraindications': food['contraindications'],
            'tcm': food['tcm']
        })

    fe_path = STRUCTURED_DIR / 'foods_frontend.json'
    with open(fe_path, 'w', encoding='utf-8') as f:
        json.dump(foods_for_frontend, f, ensure_ascii=False, indent=2)
    print(f"前端数据: {fe_path}")

    # 统计
    deep_count = sum(1 for f in all_foods if f['deep_analysis'])
    tcm_count = sum(1 for f in all_foods if f.get('tcm') and f['tcm'].get('meridian'))
    print(f"\n统计: {deep_count} 深度分析, {tcm_count} 含中医属性")


if __name__ == '__main__':
    main()
