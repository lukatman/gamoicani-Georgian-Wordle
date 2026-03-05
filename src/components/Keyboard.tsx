import type { LetterStatuses } from '../lib/game'

interface KeyboardProps {
  letterStatuses: LetterStatuses
  shiftActive: boolean
  onKey: (key: string) => void
  onEnter: () => void
  onBackspace: () => void
  onShiftToggle: () => void
}

// Each entry is either a letter string or a special action key.
// Pairs [base, shift] mean the key shows/types the shift char when shift is active.
type KeyDef =
  | { type: 'letter'; base: string; shift?: string }
  | { type: 'enter' }
  | { type: 'backspace' }
  | { type: 'shift' }

const ROWS: KeyDef[][] = [
  // Row 1: Q W E R T Y U I O P
  [
    { type: 'shift' },
    { type: 'letter', base: 'ქ' },
    { type: 'letter', base: 'წ', shift: 'ჭ' },
    { type: 'letter', base: 'ე' },
    { type: 'letter', base: 'რ', shift: 'ღ' },
    { type: 'letter', base: 'ტ', shift: 'თ' },
    { type: 'letter', base: 'ყ' },
    { type: 'letter', base: 'უ' },
    { type: 'letter', base: 'ი' },
    { type: 'letter', base: 'ო' },
    { type: 'letter', base: 'პ' },
  ],
  // Row 2: A S D F G H J K L  + ჟ (shift+;)
  [
    { type: 'letter', base: 'ა' },
    { type: 'letter', base: 'ს', shift: 'შ' },
    { type: 'letter', base: 'დ' },
    { type: 'letter', base: 'ფ' },
    { type: 'letter', base: 'გ' },
    { type: 'letter', base: 'ჰ' },
    { type: 'letter', base: 'ჯ', shift: 'ჟ'},
    { type: 'letter', base: 'კ' },
    { type: 'letter', base: 'ლ' },
  ],
  // Row 3: ENTER  Z X C V B N M  ძ (shift+\)  BACKSPACE
  [
    { type: 'enter' },
    { type: 'letter', base: 'ზ', shift: 'ძ' },
    { type: 'letter', base: 'ხ' },
    { type: 'letter', base: 'ც', shift: 'ჩ' },
    { type: 'letter', base: 'ვ' },
    { type: 'letter', base: 'ბ' },
    { type: 'letter', base: 'ნ' },
    { type: 'letter', base: 'მ' },
    { type: 'backspace' },
  ],
]

export default function Keyboard({
  letterStatuses,
  shiftActive,
  onKey,
  onEnter,
  onBackspace,
  onShiftToggle,
}: KeyboardProps) {
  return (
    <div className="keyboard" role="group" aria-label="keyboard">
      {ROWS.map((row, ri) => (
        <div key={ri} className="keyboard__row">
          {row.map((keyDef, ki) => {
            if (keyDef.type === 'shift') {
              return (
                <button
                  key={ki}
                  className={`key key--shift${shiftActive ? ' key--shift-active' : ''}`}
                  onClick={onShiftToggle}
                  aria-label="shift"
                  aria-pressed={shiftActive}
                >
                  ⇧
                </button>
              )
            }

            if (keyDef.type === 'enter') {
              return (
                <button key={ki} className="key key--wide" onClick={onEnter} aria-label="enter">
                  ENTER
                </button>
              )
            }

            if (keyDef.type === 'backspace') {
              return (
                <button key={ki} className="key key--wide" onClick={onBackspace} aria-label="backspace">
                  ⌫
                </button>
              )
            }

            // Letter key
            const displayChar =
              shiftActive && keyDef.shift ? keyDef.shift : keyDef.base
            // Color by best status of either the base or shift char
            const statusBase = letterStatuses[keyDef.base]
            const statusShift = keyDef.shift ? letterStatuses[keyDef.shift] : undefined
            const STATUS_PRIORITY = { correct: 3, present: 2, absent: 1, empty: 0 } as const
            const bestStatus = (() => {
              const pb = statusBase ? (STATUS_PRIORITY[statusBase] ?? 0) : 0
              const ps = statusShift ? (STATUS_PRIORITY[statusShift] ?? 0) : 0
              if (pb === 0 && ps === 0) return undefined
              return pb >= ps ? statusBase : statusShift
            })()

            return (
              <button
                key={ki}
                className={['key', bestStatus ? `key--${bestStatus}` : ''].filter(Boolean).join(' ')}
                onClick={() => onKey(displayChar)}
                aria-label={displayChar}
              >
                {displayChar}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}
