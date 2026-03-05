import type { EvaluatedLetter } from './game'
import { evaluateGuess, WORD_LENGTH, MAX_GUESSES } from './game'
import { isValidGuess } from './words'

export type GameStatus = 'playing' | 'won' | 'lost'

export interface GameState {
  answer: string
  guesses: EvaluatedLetter[][]   // submitted, evaluated rows
  currentInput: string           // letters typed in the active row
  status: GameStatus
  shakingRow: number             // row index to shake, -1 = none
  revealedUpTo: number           // how many rows have been flipped
  toast: string                  // transient message (empty = hidden)
}

export type GameAction =
  | { type: 'ADD_LETTER'; letter: string }
  | { type: 'BACKSPACE' }
  | { type: 'SUBMIT' }
  | { type: 'STOP_SHAKE' }
  | { type: 'ROW_REVEALED' }     // called after each row's flip animation
  | { type: 'CLEAR_TOAST' }

export function initialState(answer: string, saved?: Partial<GameState>): GameState {
  return {
    answer,
    guesses: [],
    currentInput: '',
    status: 'playing',
    revealedUpTo: 0,
    ...saved,
    // always reset volatile fields — they should never be persisted
    shakingRow: -1,
    toast: '',
  }
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'ADD_LETTER': {
      if (state.status !== 'playing') return state
      if (state.currentInput.length >= WORD_LENGTH) return state
      return { ...state, currentInput: state.currentInput + action.letter }
    }

    case 'BACKSPACE': {
      if (state.status !== 'playing') return state
      return { ...state, currentInput: state.currentInput.slice(0, -1) }
    }

    case 'SUBMIT': {
      if (state.status !== 'playing') return state
      const word = state.currentInput

      if (word.length < WORD_LENGTH) {
        return {
          ...state,
          shakingRow: state.guesses.length,
          toast: 'სიტყვა მოკლეა',
        }
      }

      if (!isValidGuess(word)) {
        return {
          ...state,
          shakingRow: state.guesses.length,
          toast: 'სიტყვა სიაში არ არის',
        }
      }

      const evaluated = evaluateGuess(word, state.answer)
      const newGuesses = [...state.guesses, evaluated]
      const won = word === state.answer
      const lost = !won && newGuesses.length >= MAX_GUESSES

      return {
        ...state,
        guesses: newGuesses,
        currentInput: '',
        status: won ? 'won' : lost ? 'lost' : 'playing',
        shakingRow: -1,
        toast: '',
      }
    }

    case 'STOP_SHAKE':
      return { ...state, shakingRow: -1 }

    case 'ROW_REVEALED':
      return { ...state, revealedUpTo: state.revealedUpTo + 1 }

    case 'CLEAR_TOAST':
      return { ...state, toast: '' }

    default:
      return state
  }
}

// ── localStorage persistence ─────────────────────────────────────

const STORAGE_KEY_PREFIX = 'gamoicani_state_'

interface PersistedState {
  answer: string
  guesses: EvaluatedLetter[][]
  currentInput: string
  status: GameStatus
  revealedUpTo: number
}

export function loadSavedState(dateKey: string, answer: string): Partial<GameState> | undefined {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + dateKey)
    if (!raw) return undefined
    const saved = JSON.parse(raw) as PersistedState
    // Only restore if the saved answer matches today's (safeguard)
    if (saved.answer !== answer) return undefined
    return saved
  } catch {
    return undefined
  }
}

export function persistState(dateKey: string, state: GameState): void {
  const toSave: PersistedState = {
    answer: state.answer,
    guesses: state.guesses,
    currentInput: state.currentInput,
    status: state.status,
    revealedUpTo: state.revealedUpTo,
  }
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + dateKey, JSON.stringify(toSave))
  } catch {
    // localStorage unavailable (private mode etc.) — silently ignore
  }
}
