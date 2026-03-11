import type { EvaluatedLetter } from '../lib/game'
import { WORD_LENGTH } from '../lib/game'
import Tile from './Tile'

interface RowProps {
  evaluatedLetters?: EvaluatedLetter[]
  currentInput?: string
  shaking?: boolean
  revealed?: boolean
  won?: boolean
}

export default function Row({ evaluatedLetters, currentInput = '', shaking = false, revealed = false, won = false }: RowProps) {
  const classes = ['row']
  if (shaking) classes.push('row--shake')
  if (won && revealed) classes.push('row--win')

  return (
    <div className={classes.join(' ')}>
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
