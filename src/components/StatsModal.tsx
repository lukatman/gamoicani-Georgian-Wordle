import { useEffect, useState } from 'react'
import { MAX_GUESSES } from '../lib/game'
import type { Stats } from '../lib/stats'
import { getMsUntilNextWord, formatCountdown } from '../lib/stats'

interface StatsModalProps {
  stats: Stats
  gameOver: boolean
  lastGuessCount: number
  onClose: () => void
}

export default function StatsModal({ stats, gameOver, lastGuessCount, onClose }: StatsModalProps) {
  const [countdown, setCountdown] = useState(formatCountdown(getMsUntilNextWord()))

  useEffect(() => {
    const id = setInterval(() => {
      setCountdown(formatCountdown(getMsUntilNextWord()))
    }, 1000)
    return () => clearInterval(id)
  }, [])

  const maxCount = Math.max(1, ...Object.values(stats.distribution))
  const winPct = stats.gamesPlayed > 0
    ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
    : 0

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">სტატისტიკა</h2>
          <button className="modal__close" onClick={onClose} aria-label="დახურვა">
            &times;
          </button>
        </div>

        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-item__value">{stats.gamesPlayed}</div>
            <div className="stat-item__label">თამაშები</div>
          </div>
          <div className="stat-item">
            <div className="stat-item__value">{winPct}</div>
            <div className="stat-item__label">მოგება %</div>
          </div>
          <div className="stat-item">
            <div className="stat-item__value">{stats.currentStreak}</div>
            <div className="stat-item__label">მიმდინარე</div>
          </div>
          <div className="stat-item">
            <div className="stat-item__value">{stats.maxStreak}</div>
            <div className="stat-item__label">მაქსიმუმი</div>
          </div>
        </div>

        <hr className="modal__divider" />

        <div className="guess-distribution">
          {Array.from({ length: MAX_GUESSES }, (_, i) => {
            const guessNum = i + 1
            const count = stats.distribution[guessNum] ?? 0
            const width = Math.max(8, (count / maxCount) * 100)
            const isHighlight = gameOver && guessNum === lastGuessCount
            return (
              <div key={guessNum} className="guess-bar-row">
                <span className="guess-bar-row__label">{guessNum}</span>
                <div
                  className={`guess-bar-row__bar${isHighlight ? ' guess-bar-row__bar--highlight' : ''}`}
                  style={{ width: `${width}%` }}
                >
                  {count}
                </div>
              </div>
            )
          })}
        </div>

        <hr className="modal__divider" />

        <div className="countdown">
          <div className="countdown__label">შემდეგი სიტყვა</div>
          <div className="countdown__time">{countdown}</div>
        </div>
      </div>
    </div>
  )
}
