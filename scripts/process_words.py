"""
Extracts clean Georgian nominative nouns from the Kaikki JSONL dump
and writes per-length answer and valid-guess lists for lengths 5–9:
  src/data/answers_5.json ... answers_9.json
  src/data/valid-guesses_5.json ... valid-guesses_9.json
"""

import json
import re
import random
import os
from collections import defaultdict

MIN_LENGTH = 5
MAX_LENGTH = 9
GEORGIAN_ONLY = re.compile(r'^[\u10D0-\u10FF]+$')
PROPER_NOUNS = {'ირაკლი', 'ძიძიგური', 'კოსტა'}

ROOT = os.path.join(os.path.dirname(__file__), '..')
INPUT_PATH = os.path.join(ROOT, 'wordbase', 'kaikki.org-dictionary-Georgian-by-pos-noun.jsonl')
DATA_DIR = os.path.join(ROOT, 'src', 'data')
SHUFFLE_SEED = 0xDEADBEEF


def is_form_of(entry: dict) -> bool:
    for sense in entry.get('senses', []):
        tags = sense.get('tags', [])
        if 'form-of' in tags or 'alt-of' in tags:
            return True
    return False


def process():
    # Collect unique words per length (lemma only, Georgian only, no proper nouns)
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

            word: str = entry.get('word', '')

            if not GEORGIAN_ONLY.match(word):
                continue
            if word in PROPER_NOUNS:
                continue
            if is_form_of(entry):
                continue
            if word in seen:
                continue

            length = len(word)
            if not (MIN_LENGTH <= length <= MAX_LENGTH):
                continue

            seen.add(word)
            by_length[length].append(word)

    os.makedirs(DATA_DIR, exist_ok=True)
    rng = random.Random(SHUFFLE_SEED)

    for length in range(MIN_LENGTH, MAX_LENGTH + 1):
        words = by_length.get(length, [])
        if not words:
            print(f'  Length {length}: 0 words (skipped)')
            continue

        # answers_{n}.json — shuffled for stable day-index cycling
        answers = words[:]
        rng.shuffle(answers)
        answers_path = os.path.join(DATA_DIR, f'{length}_answers.json')
        with open(answers_path, 'w', encoding='utf-8') as f:
            json.dump(answers, f, ensure_ascii=False, indent=2)
        print(f'✓ {len(answers)} words → {os.path.basename(answers_path)}')

        # valid-guesses_{n}.json — same words, sorted
        valid_guesses = sorted(words)
        valid_path = os.path.join(DATA_DIR, f'{length}_valid-guesses.json')
        with open(valid_path, 'w', encoding='utf-8') as f:
            json.dump(valid_guesses, f, ensure_ascii=False, indent=2)
        print(f'✓ {len(valid_guesses)} words → {os.path.basename(valid_path)}')


if __name__ == '__main__':
    process()
