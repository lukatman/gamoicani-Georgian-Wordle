import { WORD_LENGTH } from './game'

import answers5 from '../data/5_answers.json'
import answers6 from '../data/6_answers.json'
import answers7 from '../data/7_answers.json'
import answers8 from '../data/8_answers.json'
import answers9 from '../data/9_answers.json'

import validGuesses5 from '../data/5_valid-guesses.json'
import validGuesses6 from '../data/6_valid-guesses.json'
import validGuesses7 from '../data/7_valid-guesses.json'
import validGuesses8 from '../data/8_valid-guesses.json'
import validGuesses9 from '../data/9_valid-guesses.json'

const ANSWERS_MAP: Record<number, string[]> = {
  5: answers5,
  6: answers6,
  7: answers7,
  8: answers8,
  9: answers9,
}

const VALID_GUESSES_MAP: Record<number, string[]> = {
  5: validGuesses5,
  6: validGuesses6,
  7: validGuesses7,
  8: validGuesses8,
  9: validGuesses9,
}

const answers = ANSWERS_MAP[WORD_LENGTH]
const validGuesses = VALID_GUESSES_MAP[WORD_LENGTH]

export { answers }

// O(1) lookup for valid guess validation
const validGuessSet = new Set<string>(validGuesses)

/**
 * Returns today's answer based on Georgian time (UTC+4).
 * The day index is computed relative to the epoch date so that every
 * calendar day in Georgia maps to exactly one word, deterministically.
 */
export function getDailyWord(): string {
  const EPOCH_MS = new Date('2026-03-05T00:00:00+04:00').getTime()
  // Current time shifted to Georgian timezone (UTC+4)
  const georgianNowMs = Date.now() + 4 * 60 * 60 * 1000
  // Truncate to start-of-day in Georgian time
  const georgianMidnightMs = georgianNowMs - (georgianNowMs % 86_400_000)
  const dayIndex = Math.floor((georgianMidnightMs - EPOCH_MS) / 86_400_000)
  const idx = ((dayIndex % answers.length) + answers.length) % answers.length
  return answers[idx]
}

/**
 * Returns a string key for the current Georgian calendar date, e.g. "2026-03-05".
 * Used to key localStorage state so progress resets each new day.
 */
export function getGeorgianDateKey(): string {
  const georgianNowMs = Date.now() + 4 * 60 * 60 * 1000
  return new Date(georgianNowMs).toISOString().slice(0, 10)
}

export function isValidGuess(word: string): boolean {
  return validGuessSet.has(word)
}
