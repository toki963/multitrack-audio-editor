import { Scissors, Trash2, Minus, Plus } from 'lucide-react'
import type { PointerEvent } from 'react'
import { useEditorStore } from '../store/editorStore'
import type { Track } from '../types/project'
import { Icon } from './Icon'
import { Clip } from './Clip'
import { formatRulerTime } from '../timeline/geometry'

const pixelsPerSecond = 56

export function Timeline({ tracks, duration }: { tracks: Track[]; duration: number }) {
  const zoom = useEditorStore((state) => state.zoom)
  const setZoom = useEditorStore((state) => state.setZoom)
  const currentTime = useEditorStore((state) => state.currentTime)
  const selectedClipId = useEditorStore((state) => state.selectedClipId)
  const setCurrentTime = useEditorStore((state) => state.setCurrentTime)
  const splitClip = useEditorStore((state) => state.splitSelectedClip)
  const deleteClip = useEditorStore((state) => state.deleteSelectedClip)
  const contentWidth = Math.max(680, duration * pixelsPerSecond * zoom)
  const rulerInterval = duration > 240 ? 30 : duration > 100 ? 15 : 5
  const rulerTicks = Array.from({ length: Math.ceil(duration / rulerInterval) + 1 }, (_, index) => index * rulerInterval).filter((time) => time <= duration)
  const seekFromPointer = (event: PointerEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest('.audio-clip')) return
    const scroll = event.currentTarget.closest('.timeline-scroll')
    if (!scroll) return
    const bounds = scroll.getBoundingClientRect()
    const time = (event.clientX - bounds.left + scroll.scrollLeft) / (pixelsPerSecond * zoom)
    setCurrentTime(time)
  }
  return <main className="timeline-shell" id="workspace" aria-label="타임라인 작업 공간">
    <div className="timeline-toolbar"><div className="timeline-title"><span className="live-dot" /><strong>편곡</strong><span className="toolbar-slash">/</span><span>세션 보기</span>{selectedClipId && <><button className="clip-action" type="button" onClick={splitClip} title="재생 위치에서 클립 나누기"><Scissors size={13} /> 나누기</button><button className="clip-action danger-action" type="button" onClick={deleteClip} title="선택한 클립 삭제"><Trash2 size={13} /> 삭제</button></>}</div><div className="timeline-actions"><span className="snap-pill"><span /> 0.1초 스냅</span><div className="zoom-control"><button aria-label="축소" type="button" onClick={() => setZoom(zoom - 0.12)}><Icon icon={Minus} size={14} /></button><input aria-label="타임라인 확대/축소" type="range" min="35" max="300" value={Math.round(zoom * 100)} onChange={(event) => setZoom(Number(event.target.value) / 100)} /><button aria-label="확대" type="button" onClick={() => setZoom(zoom + 0.12)}><Icon icon={Plus} size={14} /></button></div><span className="zoom-value">{Math.round(zoom * 100)}%</span></div></div>
    <div className="timeline-scroll" onPointerDown={seekFromPointer}><div className="timeline-content" style={{ width: contentWidth }}>
      <div className="ruler-row">{rulerTicks.map((time) => <button type="button" key={time} className="ruler-mark major" style={{ left: time * pixelsPerSecond * zoom }} onPointerDown={(event) => event.stopPropagation()} onClick={() => setCurrentTime(time)}><i /><span>{formatRulerTime(time)}</span></button>)}</div>
      <div className="timeline-tracks">{tracks.length ? tracks.map((track) => <div className={`timeline-lane ${track.muted ? 'muted-lane' : ''}`} key={track.id} data-track-id={track.id} onPointerDown={seekFromPointer}><div className="lane-grid" style={{ backgroundSize: `${rulerInterval * pixelsPerSecond * zoom}px 100%` }} />{track.clips.map((clip) => <Clip key={clip.id} clip={clip} zoom={zoom} pixelsPerSecond={pixelsPerSecond} />)}</div>) : <div className="timeline-empty"><span>◌</span><strong>오디오를 가져와 시작해 보세요</strong><small>상단의 가져오기를 눌러 파일을 추가하거나 파일을 이곳에 끌어다 놓으세요.</small></div>}
        {tracks.length > 0 && <div className="playhead" style={{ left: currentTime * pixelsPerSecond * zoom }}><span /></div>}
      </div>
    </div></div>
    <div className="timeline-footer"><span>클립을 드래그해 이동 · 가장자리를 끌어 자르기 · 눈금 또는 빈 공간을 눌러 재생 위치 이동</span><span>{formatRulerTime(duration)} 세션</span></div>
  </main>
}
