import { MAX_GUESSES } from './game'

const STATS_KEY = 'gamoicani_stats'
const HELP_SEEN_KEY = 'gamoicani_help_seen'

export interface Stats {
  gamesPlayed: number
  gamesWon: number
  currentStreak: number
  maxStreak: number
  distribution: Record<number, number>
  lastPlayedDateKey: string
}

function emptyDistribution(): Record<number, number> {
  const d: Record<number, number> = {}
  for (let i = 1; i <= MAX_GUESSES; i++) d[i] = 0
  return d
}

export function getDefaultStats(): Stats {
  return {
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    distribution: emptyDistribution(),
    lastPlayedDateKey: '',
  }
}

export function loadStats(): Stats {
  try {
    const raw = localStorage.getItem(STATS_KEY)
    if (!raw) return getDefaultStats()
    const parsed = JSON.parse(raw) as Stats
    return {
      ...getDefaultStats(),
      ...parsed,
      distribution: { ...emptyDistribution(), ...parsed.distribution },
    }
  } catch {
    return getDefaultStats()
  }
}

export function saveStats(stats: Stats): void {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats))
  } catch { /* ignore */ }
}

export function recordGame(dateKey: string, won: boolean, guessCount: number): Stats {
  const stats = loadStats()
  if (stats.lastPlayedDateKey === dateKey) return stats

  const prevDate = stats.lastPlayedDateKey
  const isConsecutive = prevDate !== '' && (() => {
    const a = new Date(prevDate + 'T12:00:00Z').getTime()
    const b = new Date(dateKey + 'T12:00:00Z').getTime()
    return Math.floor((b - a) / 86_400_000) === 1
  })()

  const newStreak = won ? (isConsecutive ? stats.currentStreak + 1 : 1) : 0
  const next: Stats = {
    gamesPlayed: stats.gamesPlayed + 1,
    gamesWon: stats.gamesWon + (won ? 1 : 0),
    currentStreak: newStreak,
    maxStreak: Math.max(stats.maxStreak, newStreak),
    distribution: { ...stats.distribution },
    lastPlayedDateKey: dateKey,
  }

  if (won && guessCount >= 1 && guessCount <= MAX_GUESSES) {
    next.distribution[guessCount] = (stats.distribution[guessCount] ?? 0) + 1
  }

  saveStats(next)
  return next
}

export function wasHelpSeen(): boolean {
  try { return localStorage.getItem(HELP_SEEN_KEY) === '1' }
  catch { return false }
}

export function setHelpSeen(): void {
  try { localStorage.setItem(HELP_SEEN_KEY, '1') }
  catch { /* ignore */ }
}

export function getMsUntilNextWord(): number {
  const georgianNowMs = Date.now() + 4 * 60 * 60 * 1000
  return 86_400_000 - (georgianNowMs % 86_400_000)
}

export function formatCountdown(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}
