/** Convert a timeline second to a percent position within the project duration. */
export function secondsToPercent(seconds: number, duration: number): number {
  if (!Number.isFinite(seconds) || !Number.isFinite(duration) || duration <= 0) return 0
  return Math.max(0, Math.min(100, seconds / duration * 100))
}

/** Format non-negative seconds as a zero-padded mm:ss ruler label. */
export function formatRulerTime(seconds: number): string {
  const safeSeconds = Number.isFinite(seconds) ? Math.max(0, seconds) : 0
  return `${String(Math.floor(safeSeconds / 60)).padStart(2, '0')}:${String(Math.floor(safeSeconds % 60)).padStart(2, '0')}`
}
