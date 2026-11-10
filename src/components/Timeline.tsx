import { Minus, Plus } from 'lucide-react'
import { useEditorStore } from '../store/editorStore'
import type { Track } from '../types/project'
import { Icon } from './Icon'
import { Clip } from './Clip'
import { formatRulerTime, secondsToPercent } from '../timeline/geometry'

export function Timeline({ tracks, duration }: { tracks: Track[]; duration: number }) {
  const zoom = useEditorStore((state) => state.zoom)
  const setZoom = useEditorStore((state) => state.setZoom)
  const currentTime = useEditorStore((state) => state.currentTime)
  const contentWidth = `${zoom * 100}%`
  return <main className="timeline-shell" id="workspace" aria-label="Timeline workspace">
    <div className="timeline-toolbar"><div className="timeline-title"><span className="live-dot" /><strong>ARRANGEMENT</strong><span className="toolbar-slash">/</span><span>Session view</span></div><div className="timeline-actions"><span className="snap-pill"><span /> Snap on</span><div className="zoom-control"><button aria-label="Zoom out" type="button" onClick={() => setZoom(zoom - 0.12)}><Icon icon={Minus} size={14} /></button><input aria-label="Timeline zoom" type="range" min="70" max="155" value={Math.round(zoom * 100)} onChange={(event) => setZoom(Number(event.target.value) / 100)} /><button aria-label="Zoom in" type="button" onClick={() => setZoom(zoom + 0.12)}><Icon icon={Plus} size={14} /></button></div><span className="zoom-value">{Math.round(zoom * 100)}%</span></div></div>
    <div className="timeline-scroll"><div className="timeline-content" style={{ width: contentWidth }}>
      <div className="ruler-row"><div className="ruler-offset" />{Array.from({ length: duration / 2 + 1 }, (_, index) => <div key={index} className={`ruler-mark ${index % 2 === 0 ? 'major' : ''}`} style={{ left: `${secondsToPercent(index * 2, duration)}%` }}><i />{index % 2 === 0 && <span>{formatRulerTime(index * 2)}</span>}</div>)}</div>
      <div className="timeline-tracks">{tracks.length ? tracks.map((track) => <div className={`timeline-lane ${track.muted ? 'muted-lane' : ''}`} key={track.id}><div className="lane-grid">{Array.from({ length: duration / 2 }, (_, index) => <i key={index} />)}</div>{track.clips.map((clip) => <Clip key={clip.id} clip={clip} zoom={zoom} duration={duration} />)}</div>) : <div className="timeline-empty"><span>◌</span><strong>A little room to begin</strong><small>Add a track, then import audio to start arranging.</small></div>}
        {tracks.length > 0 && <div className="playhead" style={{ left: `${secondsToPercent(currentTime, duration)}%` }}><span /></div>}
      </div>
    </div></div>
    <div className="timeline-footer"><span><kbd>⌘</kbd> + <kbd>scroll</kbd> to zoom</span><span>32 sec session</span></div>
  </main>
}
