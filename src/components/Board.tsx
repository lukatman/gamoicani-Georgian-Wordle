import type { EvaluatedLetter } from '../lib/game'
import { MAX_GUESSES } from '../lib/game'
import Row from './Row'

interface BoardProps {
  /** Submitted and evaluated guesses (oldest first). */
  evaluatedGuesses: EvaluatedLetter[][]
  /** Letters typed so far in the current active guess. */
  currentInput: string
  /** Index of the row currently shaking (invalid guess). -1 = none. */
  shakingRow: number
  /** How many rows have been revealed so far (used to decide if a row should flip). */
  revealedUpTo: number
}

export default function Board({ evaluatedGuesses, currentInput, shakingRow, revealedUpTo }: BoardProps) {
  const rows = Array.from({ length: MAX_GUESSES }, (_, i) => {
    if (i < evaluatedGuesses.length) {
      return (
        <Row
          key={i}
          evaluatedLetters={evaluatedGuesses[i]}
          shaking={shakingRow === i}
          revealed={i < revealedUpTo}
        />
      )
    }
    if (i === evaluatedGuesses.length) {
      return <Row key={i} currentInput={currentInput} shaking={shakingRow === i} />
    }
    return <Row key={i} />
  })

  return <div className="board">{rows}</div>
}
