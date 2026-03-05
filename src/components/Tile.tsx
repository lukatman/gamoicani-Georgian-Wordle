import type { LetterStatus } from '../lib/game'

interface TileProps {
  letter: string
  status: LetterStatus
  revealed: boolean   // true once the row has been submitted and the flip plays
  position: number    // 0-based index within the row, used for staggered animation
}

export default function Tile({ letter, status, revealed, position }: TileProps) {
  const isEmpty = letter === ''

  return (
    <div
      className={[
        'tile',
        isEmpty ? 'tile--empty' : 'tile--filled',
        revealed ? `tile--revealed tile--${status}` : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ '--tile-index': position } as React.CSSProperties}
    >
      <div className="tile__inner">
        <div className="tile__front">{letter}</div>
        <div className="tile__back">{letter}</div>
      </div>
    </div>
  )
}
