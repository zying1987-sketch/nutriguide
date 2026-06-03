#!/usr/bin/env python3
"""Check which PDFs are text-based vs scanned (need OCR)."""
import os
import json

BASE = "/Users/junes/Downloads/ 营养学书籍"

BOOKS = {
    "tier1": [
        "中国居民膳食营养素参考摄入量（2023） (中国营养学会) (z-library.sk, 1lib.sk, z-lib.sk).pdf",
        "营养学基础与临床实践 (中国生理科学会营养学会编著) (z-library.sk, 1lib.sk, z-lib.sk).pdf",
        "膳食营养素使用手册 (吴惠娟主编) (z-library.sk, 1lib.sk, z-lib.sk).pdf",
    ],
    "tier2": [
        "哈佛家庭医学全书(女性健康手册)(精) (科马罗夫) (z-library.sk, 1lib.sk, z-lib.sk).pdf",
        "镁,一种可以改变你生活的营养素 (J. I. RODALE, HARALD J. TAUB) (z-library.sk, 1lib.sk, z-lib.sk).pdf",
        "The Anti-Inflammation Diet and Recipe Book Protect Yourself and Your Family from Heart Disease, Arthritis, Diabetes, Allergies… (N.D. Jessica K. Black) (z-library.sk, 1lib.sk, z-lib.sk).pdf",
        "nutrients-17-03068-v2.pdf",
        "Epigenetics and Human Health Linking Hereditary, Environmental and Nutritional Aspects (Alexander Haslberger, Sabine Greßler) (z-library.sk, 1lib.sk, z-lib.sk).pdf",
    ],
    "tier3": [
        "实用运动营养学（中文翻译版，原书第5版） (Louise Burke Vicki Deakin) (z-library.sk, 1lib.sk, z-lib.sk).pdf",
        "Krause and Mahans Food  the Nutrition Care Process, 15e (Janice L. Raymond, Kelly Morrow) (z-library.sk, 1lib.sk, z-lib.sk).pdf",
        "Medical Nutrition Therapy A Case Study Approach (Marcia Nelms, Sara Long Roth) (z-library.sk, 1lib.sk, z-lib.sk).pdf",
        "NUTRITION (BYU-Idaho) (z-library.sk, 1lib.sk, z-lib.sk).pdf",
        "Nutrition Concepts and Controversies  14th Edition (Frances Sizer Ellie Whitney) (z-library.sk, 1lib.sk, z-lib.sk).pdf",
        "Prescription for Nutritional Healing (Phyllis A. Balch) (z-library.sk, 1lib.sk, z-lib.sk).pdf",
        "Public Health Nutrition Rural, Urban, and Global Community-Based Practice (M. Margaret Barth, Ronny A. Bell etc.) (z-library.sk, 1lib.sk, z-lib.sk).pdf",
        "Understanding Nutrition, Fifth Edition ( etc.) (z-library.sk, 1lib.sk, z-lib.sk).pdf",
        "Williams' Basic Nutrition  Diet Therapy, 15th Edition (Staci Nix McIntosh) (z-library.sk, 1lib.sk, z-lib.sk).pdf",
    ],
}

from pypdf import PdfReader

results = []

for tier, files in BOOKS.items():
    for fname in files:
        full = os.path.join(BASE, fname)
        if not os.path.exists(full):
            results.append({"tier": tier, "name": fname[:40], "status": "NOT_FOUND", "pages": 0, "chars": 0, "type": "unknown"})
            continue

        try:
            r = PdfReader(full)
            total_pages = len(r.pages)
            text = ""
            check_pages = min(10, total_pages)
            for i in range(check_pages):
                t = r.pages[i].extract_text()
                if t:
                    text += t
            char_count = len(text.strip())
            pdf_type = "text" if char_count > 500 else "scanned"
            total_chars = char_count * (total_pages // check_pages) if char_count > 0 else 0

            results.append({
                "tier": tier,
                "name": fname[:60],
                "status": "OK",
                "pages": total_pages,
                "chars_10p": char_count,
                "type": pdf_type,
                "est_total_chars": total_chars,
                "path": full,
            })
        except Exception as e:
            results.append({"tier": tier, "name": fname[:40], "status": f"ERROR: {str(e)[:60]}", "pages": 0, "chars": 0, "type": "error"})

for r in results:
    status = "✅" if r.get("type") == "text" else ("🔴" if r.get("type") == "scanned" else "⚠️")
    print(f"{status} [{r['tier']}] {r['name']}")
    print(f"      Pages: {r.get('pages',0)}, Type: {r.get('type','?')}, Chars(10p): {r.get('chars_10p',0)}")
    print()

# Save as JSON
out_path = "/Users/junes/WorkBuddy/2026-06-01-00-18-11/nutriguide/knowledge-base/batches/batch_20260603_001/pdf_inventory.json"
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2, ensure_ascii=False)

print(f"Saved inventory to {out_path}")
