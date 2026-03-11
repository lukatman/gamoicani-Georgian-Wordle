"""
Analyzes the Kaikki Georgian noun JSONL (lemma forms only) and writes a
comprehensive word-length summary to src/data/word_length_summary.json:
counts per length and 10 random examples per length.
"""

import json
import re
import random
import os
from collections import defaultdict

GEORGIAN_ONLY = re.compile(r'^[\u10D0-\u10FF]+$')
PROPER_NOUNS = {'ირაკლი', 'ძიძიგური', 'კოსტა'}

ROOT = os.path.join(os.path.dirname(__file__), '..')
INPUT_PATH = os.path.join(ROOT, 'wordbase', 'kaikki.org-dictionary-Georgian-by-pos-noun.jsonl')
OUTPUT_PATH = os.path.join(ROOT, 'src', 'data', 'word_length_summary.json')
EXAMPLES_PER_LENGTH = 10
RANDOM_SEED = 42


def is_form_of(entry: dict) -> bool:
    for sense in entry.get('senses', []):
        tags = sense.get('tags', [])
        if 'form-of' in tags or 'alt-of' in tags:
            return True
    return False


def main():
    by_length: dict[int, list[str]] = defaultdict(list)
    seen: set[str] = set()

    with open(INPUT_PATH, encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                entry = json.loads(line)
            except json.JSONDecodeError:
                continue

            word = entry.get('word', '')
            if not GEORGIAN_ONLY.match(word):
                continue
            if word in PROPER_NOUNS:
                continue
            if is_form_of(entry):
                continue
            if word in seen:
                continue

            seen.add(word)
            by_length[len(word)].append(word)

    rng = random.Random(RANDOM_SEED)
    summary = {
        "source": "kaikki.org-dictionary-Georgian-by-pos-noun.jsonl",
        "filter": "lemma only (no form-of/alt-of), Georgian script only, proper nouns excluded",
        "total_unique_words": sum(len(words) for words in by_length.values()),
        "by_length": {},
    }

    for length in sorted(by_length.keys()):
        words = by_length[length]
        examples = rng.sample(words, min(EXAMPLES_PER_LENGTH, len(words)))
        summary["by_length"][str(length)] = {
            "count": len(words),
            "examples": sorted(examples),
        }

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)

    print(f"✓ Wrote {os.path.relpath(OUTPUT_PATH, ROOT)}")
    print(f"  Total unique words: {summary['total_unique_words']}")
    for length in sorted(summary["by_length"].keys(), key=int):
        info = summary["by_length"][length]
        print(f"  Length {length}: {info['count']} words")


if __name__ == '__main__':
    main()
