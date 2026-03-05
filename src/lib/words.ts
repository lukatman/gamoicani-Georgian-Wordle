import answers from '../data/answers.json'
import validGuesses from '../data/valid-guesses.json'

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
