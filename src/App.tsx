import Board from './components/Board'
import { evaluateGuess } from './lib/game'

// Demo: show the board with two revealed guesses + one active row
const ANSWER = 'სახლები'
const guess1 = evaluateGuess('სიმინდი', ANSWER)
const guess2 = evaluateGuess('სასახლე', ANSWER)

export default function App() {
  return (
    <>
      <header className="header">
        <h1 className="header__title">გამოიცანი</h1>
      </header>
      <main className="game">
        <Board
          evaluatedGuesses={[guess1, guess2]}
          currentInput="სახლ"
          shakingRow={-1}
          revealedUpTo={2}
        />
      </main>
    </>
  )
}
