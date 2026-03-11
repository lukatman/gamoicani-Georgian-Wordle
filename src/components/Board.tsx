import type { EvaluatedLetter } from '../lib/game'
import { MAX_GUESSES } from '../lib/game'
import type { GameStatus } from '../lib/gameState'
import Row from './Row'

interface BoardProps {
  evaluatedGuesses: EvaluatedLetter[][]
  currentInput: string
  shakingRow: number
  revealedUpTo: number
  gameStatus: GameStatus
}

export default function Board({ evaluatedGuesses, currentInput, shakingRow, revealedUpTo, gameStatus }: BoardProps) {
  const rows = Array.from({ length: MAX_GUESSES }, (_, i) => {
    if (i < evaluatedGuesses.length) {
      const isWinningRow = gameStatus === 'won' && i === evaluatedGuesses.length - 1
      return (
        <Row
          key={i}
          evaluatedLetters={evaluatedGuesses[i]}
          shaking={shakingRow === i}
          revealed={i < revealedUpTo}
          won={isWinningRow}
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
