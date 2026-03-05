"""
Extracts clean 7-letter Georgian nominative nouns from the Kaikki JSONL dump
and writes src/data/answers.json (shuffled with a fixed seed).
"""

import json
import re
import random
import os

WORD_LENGTH = 7
GEORGIAN_ONLY = re.compile(r'^[\u10D0-\u10FF]+$')
PROPER_NOUNS = {'ირაკლი', 'ძიძიგური', 'კოსტა'}

ROOT = os.path.join(os.path.dirname(__file__), '..')
INPUT_PATH = os.path.join(ROOT, 'wordbase', 'kaikki.org-dictionary-Georgian-by-pos-noun.jsonl')
ANSWERS_PATH = os.path.join(ROOT, 'src', 'data', 'answers.json')
VALID_GUESSES_PATH = os.path.join(ROOT, 'src', 'data', 'valid-guesses.json')



def is_form_of(entry: dict) -> bool:
    for sense in entry.get('senses', []):
        tags = sense.get('tags', [])
        if 'form-of' in tags or 'alt-of' in tags:
            return True
    return False


def process():
    seen: set[str] = set()
    words: list[str] = []

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
            if len(word) != WORD_LENGTH:
                continue
            if word in PROPER_NOUNS:
                continue
            if is_form_of(entry):
                continue
            if word in seen:
                continue

            seen.add(word)
            words.append(word)

    os.makedirs(os.path.join(ROOT, 'src', 'data'), exist_ok=True)

    # answers.json — shuffled with fixed seed for stable day-index cycling
    rng = random.Random(0xDEADBEEF)
    answers = words[:]
    rng.shuffle(answers)
    with open(ANSWERS_PATH, 'w', encoding='utf-8') as f:
        json.dump(answers, f, ensure_ascii=False, indent=2)
    print(f'✓ {len(answers)} words written to {os.path.relpath(ANSWERS_PATH, ROOT)}')

    # valid-guesses.json — same words, sorted alphabetically for readability
    valid_guesses = sorted(words)
    with open(VALID_GUESSES_PATH, 'w', encoding='utf-8') as f:
        json.dump(valid_guesses, f, ensure_ascii=False, indent=2)
    print(f'✓ {len(valid_guesses)} words written to {os.path.relpath(VALID_GUESSES_PATH, ROOT)}')


if __name__ == '__main__':
    process()
