import { describe, expect, it } from 'vitest'
import { encodeWav } from './exportEngine'

describe('encodeWav', () => {
  it('writes a valid stereo 16-bit PCM WAV header and interleaved samples', async () => {
    const wav = encodeWav([new Float32Array([-1, 0.5]), new Float32Array([1, -0.5])], 48000)
    const view = new DataView(await wav.arrayBuffer())
    expect(wav.type).toBe('audio/wav')
    expect(view.getUint32(24, true)).toBe(48000)
    expect(view.getUint16(22, true)).toBe(2)
    expect(view.getUint16(34, true)).toBe(16)
    expect(view.getUint32(40, true)).toBe(8)
    expect(view.getInt16(44, true)).toBe(-32768)
    expect(view.getInt16(46, true)).toBe(32767)
    expect(view.getInt16(48, true)).toBe(16383)
    expect(view.getInt16(50, true)).toBe(-16384)
  })
})
