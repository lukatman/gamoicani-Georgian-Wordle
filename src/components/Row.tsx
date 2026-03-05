import type { EvaluatedLetter } from '../lib/game'
import { WORD_LENGTH } from '../lib/game'
import Tile from './Tile'

interface RowProps {
  /** Letters of the submitted guess with their evaluated statuses. */
  evaluatedLetters?: EvaluatedLetter[]
  /** In-progress current input (only for the active row). */
  currentInput?: string
  /** Whether this row is currently shaking (invalid guess). */
  shaking?: boolean
  /** Whether the tiles in this row have already been revealed. */
  revealed?: boolean
}

export default function Row({ evaluatedLetters, currentInput = '', shaking = false, revealed = false }: RowProps) {
  return (
    <div className={`row${shaking ? ' row--shake' : ''}`}>
      {Array.from({ length: WORD_LENGTH }, (_, i) => {
        if (evaluatedLetters) {
          const { letter, status } = evaluatedLetters[i]
          return <Tile key={i} letter={letter} status={status} revealed={revealed} position={i} />
        }
        const letter = currentInput[i] ?? ''
        return <Tile key={i} letter={letter} status="empty" revealed={false} position={i} />
      })}
    </div>
  )
}
