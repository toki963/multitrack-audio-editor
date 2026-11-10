import { describe, expect, it } from 'vitest'
import { formatRulerTime, secondsToPercent } from './geometry'

describe('secondsToPercent', () => {
  it('maps a time within the project duration to a percentage', () => {
    expect(secondsToPercent(8, 32)).toBe(25)
  })

  it('clamps positions outside the project bounds', () => {
    expect(secondsToPercent(-4, 32)).toBe(0)
    expect(secondsToPercent(40, 32)).toBe(100)
  })

  it('returns zero for invalid durations or times', () => {
    expect(secondsToPercent(4, 0)).toBe(0)
    expect(secondsToPercent(Number.NaN, 32)).toBe(0)
  })
})

describe('formatRulerTime', () => {
  it('formats seconds with zero-padded minutes and seconds', () => {
    expect(formatRulerTime(0)).toBe('00:00')
    expect(formatRulerTime(65)).toBe('01:05')
  })

  it('normalizes negative and invalid values to zero', () => {
    expect(formatRulerTime(-1)).toBe('00:00')
    expect(formatRulerTime(Number.NaN)).toBe('00:00')
  })
})
