import { useReducer, useEffect, useState, useCallback, useRef } from 'react'
import Board from './components/Board'
import Keyboard from './components/Keyboard'
import HelpModal from './components/HelpModal'
import StatsModal from './components/StatsModal'
import { buildLetterStatuses, WORD_LENGTH } from './lib/game'
import { getDailyWord, getGeorgianDateKey } from './lib/words'
import {
  gameReducer,
  initialState,
  loadSavedState,
  persistState,
} from './lib/gameState'
import {
  loadStats,
  recordGame,
  wasHelpSeen,
  setHelpSeen,
  type Stats,
} from './lib/stats'

const PHYSICAL_KEY_MAP: Record<string, string> = {
  q: 'ქ', w: 'წ', e: 'ე', r: 'რ', t: 'ტ', y: 'ყ', u: 'უ', i: 'ი', o: 'ო', p: 'პ',
  a: 'ა', s: 'ს', d: 'დ', f: 'ფ', g: 'გ', h: 'ჰ', j: 'ჯ', k: 'კ', l: 'ლ',
  z: 'ზ', x: 'ხ', c: 'ც', v: 'ვ', b: 'ბ', n: 'ნ', m: 'მ',
  W: 'ჭ', R: 'ღ', T: 'თ', S: 'შ', C: 'ჩ', Z: 'ძ', J: 'ჟ',
}

const GEORGIAN_CHAR_RE = /^[\u10D0-\u10FF]$/

const FLIP_STAGGER_MS = 100
const FLIP_DURATION_MS = 500
const ROW_FLIP_TOTAL_MS = (WORD_LENGTH - 1) * FLIP_STAGGER_MS + FLIP_DURATION_MS

const dateKey = getGeorgianDateKey()
const answer = getDailyWord()
const saved = loadSavedState(dateKey, answer)

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, initialState(answer, saved))
  const [shiftActive, setShiftActive] = useState(false)
  const [showHelp, setShowHelp] = useState(!wasHelpSeen())
  const [showStats, setShowStats] = useState(false)
  const [stats, setStats] = useState<Stats>(loadStats)
  const gameEndHandled = useRef(state.status !== 'playing')

  // Persist game state
  useEffect(() => { persistState(dateKey, state) }, [state])

  // Auto-clear shake
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

  // Trigger ROW_REVEALED after flip animation
  useEffect(() => {
    if (state.guesses.length <= state.revealedUpTo) return
    const t = setTimeout(() => dispatch({ type: 'ROW_REVEALED' }), ROW_FLIP_TOTAL_MS)
    return () => clearTimeout(t)
  }, [state.guesses.length, state.revealedUpTo])

  // When game ends: record stats and show stats modal after reveal animation finishes
  useEffect(() => {
    if (state.status === 'playing' || gameEndHandled.current) return
    gameEndHandled.current = true

    const won = state.status === 'won'
    const guessCount = state.guesses.length
    const updatedStats = recordGame(dateKey, won, guessCount)
    setStats(updatedStats)

    const delay = ROW_FLIP_TOTAL_MS + 800
    const t = setTimeout(() => setShowStats(true), delay)
    return () => clearTimeout(t)
  }, [state.status, state.guesses.length])

  const handleKey = useCallback((letter: string) => {
    dispatch({ type: 'ADD_LETTER', letter })
    setShiftActive(false)
  }, [])

  const handleEnter = useCallback(() => dispatch({ type: 'SUBMIT' }), [])
  const handleBackspace = useCallback(() => dispatch({ type: 'BACKSPACE' }), [])

  // Physical keyboard
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      if (e.key === 'Enter') { handleEnter(); return }
      if (e.key === 'Backspace') { handleBackspace(); return }
      if (GEORGIAN_CHAR_RE.test(e.key)) { handleKey(e.key); return }
      const mapped = PHYSICAL_KEY_MAP[e.key]
      if (mapped) handleKey(mapped)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleKey, handleEnter, handleBackspace])

  function handleCloseHelp() {
    setShowHelp(false)
    setHelpSeen()
  }

  const letterStatuses = buildLetterStatuses(state.guesses)
  const gameOver = state.status !== 'playing'

  return (
    <>
      <header className="header">
        <button className="header__btn header__btn--left" onClick={() => setShowHelp(true)} aria-label="დახმარება">
          ?
        </button>
        <h1 className="header__title">გამოიცანი</h1>
        <button className="header__btn" onClick={() => { setStats(loadStats()); setShowStats(true) }} aria-label="სტატისტიკა">
          &#x1F4CA;
        </button>
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
          gameStatus={state.status}
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

      {showHelp && <HelpModal onClose={handleCloseHelp} />}
      {showStats && (
        <StatsModal
          stats={stats}
          gameOver={gameOver}
          lastGuessCount={state.guesses.length}
          onClose={() => setShowStats(false)}
        />
      )}
    </>
  )
}
