import { useReducer, useEffect, useState, useCallback } from 'react'
import Board from './components/Board'
import Keyboard from './components/Keyboard'
import { buildLetterStatuses, WORD_LENGTH } from './lib/game'
import { getDailyWord, getGeorgianDateKey } from './lib/words'
import {
  gameReducer,
  initialState,
  loadSavedState,
  persistState,
} from './lib/gameState'

// Georgian QWERTY physical key → Georgian character mappings
const PHYSICAL_KEY_MAP: Record<string, string> = {
  q: 'ქ', w: 'წ', e: 'ე', r: 'რ', t: 'ტ', y: 'ყ', u: 'უ', i: 'ი', o: 'ო', p: 'პ',
  a: 'ა', s: 'ს', d: 'დ', f: 'ფ', g: 'გ', h: 'ჰ', j: 'ჯ', k: 'კ', l: 'ლ',
  z: 'ზ', x: 'ხ', c: 'ც', v: 'ვ', b: 'ბ', n: 'ნ', m: 'მ',
  // Shift variants
  W: 'ჭ', R: 'ღ', T: 'თ', S: 'შ', C: 'ჩ', J: 'ჟ', Z: "ზ"
}

const FLIP_STAGGER_MS = 100  // per-tile delay
const FLIP_DURATION_MS = 500 // total flip duration for one tile
const ROW_FLIP_TOTAL_MS = (WORD_LENGTH - 1) * FLIP_STAGGER_MS + FLIP_DURATION_MS

const dateKey = getGeorgianDateKey()
const answer = getDailyWord()
const saved = loadSavedState(dateKey, answer)

export default function App() {
  const [state, dispatch] = useReducer(
    gameReducer,
    initialState(answer, saved),
  )
  const [shiftActive, setShiftActive] = useState(false)

  // Persist on every meaningful state change
  useEffect(() => {
    persistState(dateKey, state)
  }, [state])

  // Auto-clear shake after animation completes
  useEffect(() => {
    if (state.shakingRow === -1) return
    const t = setTimeout(() => dispatch({ type: 'STOP_SHAKE' }), 500)
    return () => clearTimeout(t)
  }, [state.shakingRow])

  // Auto-clear toast
  useEffect(() => {
    if (!state.toast) return
    const t = setTimeout(() => dispatch({ type: 'CLEAR_TOAST' }), 1800)
    return () => clearTimeout(t)
  }, [state.toast])

  // Trigger ROW_REVEALED after each new submitted guess flip completes
  const prevGuessCount = state.guesses.length
  useEffect(() => {
    if (prevGuessCount <= state.revealedUpTo) return
    const t = setTimeout(() => dispatch({ type: 'ROW_REVEALED' }), ROW_FLIP_TOTAL_MS)
    return () => clearTimeout(t)
  }, [prevGuessCount, state.revealedUpTo])

  const handleKey = useCallback((letter: string) => {
    dispatch({ type: 'ADD_LETTER', letter })
    setShiftActive(false)
  }, [])

  const handleEnter = useCallback(() => dispatch({ type: 'SUBMIT' }), [])
  const handleBackspace = useCallback(() => dispatch({ type: 'BACKSPACE' }), [])

  // Physical keyboard support
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey || e.altKey) return

      if (e.key === 'Enter') { handleEnter(); return }
      if (e.key === 'Backspace') { handleBackspace(); return }

      // Map physical key to Georgian char (shift state from the event)
      const keyChar = e.shiftKey ? e.key.toUpperCase() : e.key
      const georgian = PHYSICAL_KEY_MAP[keyChar]
      if (georgian) handleKey(georgian)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleKey, handleEnter, handleBackspace])

  const letterStatuses = buildLetterStatuses(state.guesses)

  return (
    <>
      <header className="header">
        <h1 className="header__title">გამოიცანი</h1>
      </header>

      {state.toast && (
        <div className="toast-container">
          <div className="toast">{state.toast}</div>
        </div>
      )}

      <main className="game">
        <Board
          evaluatedGuesses={state.guesses}
          currentInput={state.currentInput}
          shakingRow={state.shakingRow}
          revealedUpTo={state.revealedUpTo}
        />
        <Keyboard
          letterStatuses={letterStatuses}
          shiftActive={shiftActive}
          onKey={handleKey}
          onEnter={handleEnter}
          onBackspace={handleBackspace}
          onShiftToggle={() => setShiftActive((s) => !s)}
        />
      </main>
    </>
  )
}
