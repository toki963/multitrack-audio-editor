import { useEditorStore } from '../store/editorStore'
import type { AudioClip } from '../types/project'
import { secondsToPercent } from '../timeline/geometry'

const waveSeed: Record<AudioClip['color'], number> = { violet: 5, blue: 12, teal: 20, amber: 28 }

function Waveform({ color, id }: { color: AudioClip['color']; id: string }) {
  const seed = waveSeed[color] + id.length
  return <div className="waveform-bars" aria-hidden="true">{Array.from({ length: 116 }, (_, index) => {
    const height = 16 + Math.abs(Math.sin((index + seed) * 0.34) * 54) + Math.abs(Math.cos((index + seed) * 0.13) * 25)
    return <i key={index} style={{ height: `${Math.min(height, 92)}%` }} />
  })}</div>
}

export function Clip({ clip, zoom, duration }: { clip: AudioClip; zoom: number; duration: number }) {
  const selected = useEditorStore((state) => state.selectedClipId === clip.id)
  const selectClip = useEditorStore((state) => state.selectClip)
  return <button type="button" className={`audio-clip ${clip.color} ${selected ? 'selected' : ''}`} style={{ left: `${secondsToPercent(clip.timelineStart, duration) * zoom}%`, width: `${Math.max(0, Math.min(100 * zoom, clip.duration / duration * 100 * zoom))}%` }} onClick={() => selectClip(clip.id)} aria-pressed={selected} title={`${clip.name} — select clip`}>
    <span className="clip-label"><span className="clip-dot" />{clip.name}</span><Waveform color={clip.color} id={clip.id} />
  </button>
}
