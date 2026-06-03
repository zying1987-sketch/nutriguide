#!/usr/bin/env python3
"""
Phase 2: Analyst + Scientist Pipeline
- Filter low-quality chunks
- Structure into knowledge entries
- Assign evidence levels
- Categorize by taxonomy
"""
import json
import os
import re
from datetime import datetime

BASE = "/Users/junes/WorkBuddy/2026-06-01-00-18-11/nutriguide/knowledge-base/batches/batch_20260603_001"

# Evidence level rules
EVIDENCE_RULES = {
    "meta_analysis": "A",
    "rct": "A",
    "systematic_review": "A",
    "cohort": "B",
    "case_control": "B",
    "expert_consensus": "C",
    "clinical_guideline": "C",
    "textbook": "C",
    "case_report": "D",
    "anecdotal": "D",
}

# Junk filter patterns
JUNK_PATTERNS = [
    r"YOU.?VE JUST PURCHASED",
    r"REGISTER TODAY",
    r"Place\s*Sticker",
    r"ACTIVATE YOUR EBOOK",
    r"EVOLVE\s*ELSEVIER",
    r"^\d+\s*$",  # Pure numbers
    r"^[IVX]+\.\s*$",  # Roman numeral headings alone
]

def is_junk(chunk):
    text = chunk.get("raw_text", "")
    if len(text.strip()) < 30:
        return True
    for pat in JUNK_PATTERNS:
        if re.search(pat, text, re.IGNORECASE):
            return True
    # Filter cover/title pages
    lower = text.lower()
    junk_words = ["copyright ©", "all rights reserved", "printed in the united states", 
                  "library of congress", "isbn:", "publisher:", "www.elsevier"]
    count = sum(1 for w in junk_words if w in lower)
    if count >= 2:
        return True
    return False

def assign_evidence(chunk):
    """Assign evidence level based on claim type and content."""
    claim = chunk.get("claim_type", "")
    text = chunk.get("raw_text", "").lower()
    
    if claim in ["guideline", "clinical_protocol"]:
        return "C"
    if claim == "research_finding":
        # Check for study type indicators
        if any(w in text for w in ["meta-analysis", "meta analysis", "systematic review"]):
            return "A"
        if any(w in text for w in ["randomized", "rct", "controlled trial"]):
            return "A"
        if any(w in text for w in ["cohort", "prospective", "longitudinal"]):
            return "B"
        if any(w in text for w in ["case report", "case series"]):
            return "D"
        return "B"  # Default research finding
    if claim == "fact":
        return "C"  # Textbook fact
    if claim == "opinion":
        return "D"
    return "C"

def normalize_nutrient_name(name):
    """Normalize nutrient names to taxonomy format."""
    mapping = {
        "vitamin a": "vitaminA",
        "vitamin c": "vitaminC", 
        "vitamin d": "vitaminD",
        "vitamin e": "vitaminE",
        "vitamin k": "vitaminK",
        "vitamin b1": "thiamin",
        "vitamin b2": "riboflavin",
        "vitamin b3": "niacin",
        "vitamin b6": "vitaminB6",
        "vitamin b9": "folate",
        "vitamin b12": "vitaminB12",
        "folate": "folate",
        "folic acid": "folate",
        "iron": "iron",
        "calcium": "calcium",
        "magnesium": "magnesium",
        "zinc": "zinc",
        "selenium": "selenium",
        "iodine": "iodine",
        "potassium": "potassium",
        "sodium": "sodium",
        "omega-3": "omega3",
        "omega 3": "omega3",
        "omega-6": "omega6",
        "fiber": "fiber",
        "protein": "protein",
        "probiotic": "probiotics",
        "polyphenol": "polyphenols",
    }
    return mapping.get(name.lower(), name.lower().replace(" ", "_"))

def structure_chunk(chunk, idx):
    """Convert a raw chunk to a structured knowledge entry."""
    return {
        "id": f"kb_{chunk.get('category','gen')}_{idx:04d}",
        "category": chunk.get("category", "general"),
        "subcategory": chunk.get("subcategory", ""),
        "title": chunk.get("raw_text", "")[:80].strip(),
        "content": chunk.get("raw_text", "").strip(),
        "claim_type": chunk.get("claim_type", "fact"),
        "evidence_level": assign_evidence(chunk),
        "confidence": 75 if chunk.get("claim_type") in ["guideline", "fact"] else 60,
        "source": {
            "type": chunk.get("source", {}).get("type", "book"),
            "title": chunk.get("source", {}).get("title", "Unknown"),
            "chapter": chunk.get("source", {}).get("chapter", ""),
            "page": chunk.get("source", {}).get("page", None),
        },
        "tags": chunk.get("tags", []),
        "extracted_date": chunk.get("extracted_date", "2026-06-03"),
        "processed_date": datetime.now().isoformat(),
        "status": "structured",  # pipeline status
    }

def main():
    print("=" * 60)
    print("Phase 2: Analyst + Scientist Pipeline")
    print("=" * 60)
    
    all_chunks = []
    
    # Load all raw chunks
    for fname in ["tier1_core.json", "tier2_clinical.json", "tier3_specialty.json"]:
        path = os.path.join(BASE, "raw_chunks", fname)
        if not os.path.exists(path):
            print(f"  SKIP: {fname} not found")
            continue
        with open(path) as f:
            data = json.load(f)
        all_chunks.extend(data)
        print(f"  LOADED: {fname} ({len(data)} chunks)")
    
    total = len(all_chunks)
    print(f"\n  TOTAL RAW CHUNKS: {total}")
    
    # Filter junk
    filtered = [c for c in all_chunks if not is_junk(c)]
    junk_count = total - len(filtered)
    print(f"  AFTER JUNK FILTER: {len(filtered)} ({junk_count} removed)")
    
    # Deduplicate by content similarity (simple: exact match on first 100 chars)
    seen = set()
    deduped = []
    for c in filtered:
        key = c.get("raw_text", "")[:100].strip().lower()
        if key and key not in seen:
            seen.add(key)
            deduped.append(c)
    print(f"  AFTER DEDUP: {len(deduped)} ({len(filtered) - len(deduped)} duplicates)")
    
    # Structure and validate
    structured = []
    evidence_counts = {"A": 0, "B": 0, "C": 0, "D": 0}
    category_counts = {}
    
    for i, chunk in enumerate(deduped):
        entry = structure_chunk(chunk, i)
        structured.append(entry)
        evidence_counts[entry["evidence_level"]] += 1
        cat = entry["category"]
        category_counts[cat] = category_counts.get(cat, 0) + 1
    
    print(f"\n  STRUCTURED ENTRIES: {len(structured)}")
    print(f"  Evidence levels: {evidence_counts}")
    print(f"  Categories: {category_counts}")
    
    # Write structured output
    out_path = os.path.join(BASE, "structured", "batch_20260603_knowledge.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(structured, f, indent=2, ensure_ascii=False)
    print(f"\n  WRITTEN: {out_path} ({len(structured)} entries)")
    
    # Also split by category for easier integration
    by_category = {}
    for entry in structured:
        cat = entry["category"]
        if cat not in by_category:
            by_category[cat] = []
        by_category[cat].append(entry)
    
    for cat, entries in by_category.items():
        cat_path = os.path.join(BASE, "structured", f"category_{cat}.json")
        with open(cat_path, "w", encoding="utf-8") as f:
            json.dump(entries, f, indent=2, ensure_ascii=False)
        print(f"  WRITTEN: {cat_path} ({len(entries)} entries)")
    
    # Generate audit report
    audit = {
        "batch_id": "batch_20260603_001",
        "phase": "phase2_structured",
        "timestamp": datetime.now().isoformat(),
        "summary": {
            "total_raw": total,
            "junk_removed": junk_count,
            "duplicates_removed": len(filtered) - len(deduped),
            "final_entries": len(structured),
            "evidence_distribution": evidence_counts,
            "category_distribution": category_counts,
        },
        "quality_notes": [
            f"Evidence A: {evidence_counts['A']} entries - high confidence research-backed claims",
            f"Evidence C: {evidence_counts['C']} entries - textbook/guideline level, suitable for general advice",
            f"Evidence D: {evidence_counts['D']} entries - opinion/anecdotal, flag for review",
            "Filtered {junk_count} junk chunks (copyright, cover pages, boilerplate)",
            "Removed {len(filtered) - len(deduped)} near-duplicate entries",
        ],
    }
    
    audit_path = os.path.join(BASE, "audit", "phase2_audit.json")
    with open(audit_path, "w", encoding="utf-8") as f:
        json.dump(audit, f, indent=2, ensure_ascii=False)
    print(f"  WRITTEN: {audit_path}")
    
    print("\n✅ Phase 2 Complete!")
    return structured

if __name__ == "__main__":
    main()
