export const WORD_LENGTH = 6
export const MAX_GUESSES = WORD_LENGTH+1

export type LetterStatus = 'correct' | 'present' | 'absent' | 'empty'

export interface EvaluatedLetter {
  letter: string
  status: LetterStatus
}

/**
 * Evaluate a guess against the answer using standard Wordle rules:
 * 1. First pass: mark exact matches (correct).
 * 2. Second pass: for remaining letters, mark present/absent based on
 *    unmatched letters left in the answer — handles duplicates correctly.
 */
export function evaluateGuess(guess: string, answer: string): EvaluatedLetter[] {
  const result: EvaluatedLetter[] = Array.from({ length: WORD_LENGTH }, (_, i) => ({
    letter: guess[i],
    status: 'absent' as LetterStatus,
  }))

  // Track which answer positions are still unmatched
  const answerRemaining: (string | null)[] = answer.split('')

  // First pass: exact matches
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guess[i] === answer[i]) {
      result[i].status = 'correct'
      answerRemaining[i] = null
    }
  }

  // Second pass: present / absent
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (result[i].status === 'correct') continue
    const idx = answerRemaining.indexOf(guess[i])
    if (idx !== -1) {
      result[i].status = 'present'
      answerRemaining[idx] = null
    }
  }

  return result
}

/** Map from letter → best status seen across all evaluated guesses so far. */
export type LetterStatuses = Record<string, LetterStatus>

const STATUS_PRIORITY: Record<LetterStatus, number> = {
  correct: 3,
  present: 2,
  absent: 1,
  empty: 0,
}

export function buildLetterStatuses(evaluatedGuesses: EvaluatedLetter[][]): LetterStatuses {
  const statuses: LetterStatuses = {}
  for (const row of evaluatedGuesses) {
    for (const { letter, status } of row) {
      const current = statuses[letter]
      if (!current || STATUS_PRIORITY[status] > STATUS_PRIORITY[current]) {
        statuses[letter] = status
      }
    }
  }
  return statuses
}
