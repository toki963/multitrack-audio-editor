import { useEffect, useRef } from 'react'
import WaveSurfer from 'wavesurfer.js'
import { useEditorStore } from '../store/editorStore'
import { loadAsset } from '../storage/projectStorage'
import type { AudioClip as AudioClipData } from '../types/project'

const waveColors = { violet: '#c1a7ff', blue: '#9ab4ff', teal: '#82dfca', amber: '#f0c181' }
const snap = (time: number) => Math.max(0, Math.round(time * 10) / 10)

function Waveform({ clip }: { clip: AudioClipData }) {
  const container = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!container.current) return
    let wavesurfer: WaveSurfer | undefined
    let cancelled = false
    void loadAsset(clip.assetId).then((blob) => {
      if (!blob || cancelled || !container.current) return
      wavesurfer = WaveSurfer.create({ container: container.current, height: 34, waveColor: waveColors[clip.color], progressColor: '#ffffff', cursorWidth: 0, barWidth: 2, barGap: 1, barRadius: 2, normalize: true, interact: false, hideScrollbar: true })
      return wavesurfer.loadBlob(blob)
    }).catch(() => undefined)
    return () => { cancelled = true; wavesurfer?.destroy() }
  }, [clip.assetId, clip.color])
  return <div className="waveform-render" ref={container} aria-hidden="true" />
}

export function Clip({ clip, zoom, pixelsPerSecond }: { clip: AudioClipData; zoom: number; pixelsPerSecond: number }) {
  const selected = useEditorStore((state) => state.selectedClipId === clip.id)
  const selectClip = useEditorStore((state) => state.selectClip)
  const moveClip = useEditorStore((state) => state.moveClip)
  const trimClip = useEditorStore((state) => state.trimClip)
  const pointer = useRef<{ mode: 'move' | 'start' | 'end'; x: number; start: number; duration: number } | null>(null)
  const pixelsPerSecondZoomed = pixelsPerSecond * zoom
  return <div role="button" tabIndex={0} className={`audio-clip ${clip.color} ${selected ? 'selected' : ''}`} style={{ left: clip.timelineStart * pixelsPerSecondZoomed, width: Math.max(24, clip.duration * pixelsPerSecondZoomed) }} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectClip(clip.id) } }} onPointerDown={(event) => {
    if (event.button !== 0) return
    event.stopPropagation()
    event.preventDefault()
    const mode = (event.target as HTMLElement).closest('.trim-handle')?.getAttribute('data-edge') as 'start' | 'end' | null
    pointer.current = { mode: mode ?? 'move', x: event.clientX, start: clip.timelineStart, duration: clip.duration }
    selectClip(clip.id)
    event.currentTarget.setPointerCapture(event.pointerId)
  }} onPointerMove={(event) => {
    const drag = pointer.current
    if (!drag || !event.currentTarget.hasPointerCapture(event.pointerId)) return
    const delta = snap((event.clientX - drag.x) / pixelsPerSecondZoomed)
    if (drag.mode === 'move') {
      const targetTrack = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>('[data-track-id]')?.dataset.trackId
      moveClip(clip.id, snap(drag.start + delta), targetTrack)
    }
    else if (drag.mode === 'start') trimClip(clip.id, 'start', snap(drag.start + delta))
    else trimClip(clip.id, 'end', snap(drag.start + drag.duration + delta))
  }} onPointerUp={(event) => { pointer.current = null; if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId) }} onPointerCancel={() => { pointer.current = null }} aria-pressed={selected} title={`${clip.name} · 드래그하여 이동, 양쪽 손잡이로 자르기`}>
    <span className="trim-handle trim-start" data-edge="start" aria-label="클립 시작 부분 자르기" />
    <span className="clip-label"><span className="clip-dot" />{clip.name}</span>
    <Waveform clip={clip} />
    <span className="trim-handle trim-end" data-edge="end" aria-label="클립 끝부분 자르기" />
  </div>
}
