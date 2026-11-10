import { AudioLines, AudioWaveform, Drum, Ellipsis, Guitar, Headphones, Plus, Volume2 } from 'lucide-react'
import type { CSSProperties } from 'react'
import type { Track } from '../types/project'
import { useEditorStore } from '../store/editorStore'
import { Icon } from './Icon'

const instrumentIcon = { DRUMS: Drum, BASS: Guitar, KEYS: AudioWaveform, TEXTURE: Headphones, AUDIO: AudioLines }

export function TrackControls({ track }: { track: Track }) {
  const setTrackVolume = useEditorStore((state) => state.setTrackVolume)
  const toggleTrack = useEditorStore((state) => state.toggleTrack)
  const InstrumentIcon = instrumentIcon[track.instrument as keyof typeof instrumentIcon] ?? AudioLines
  return <div className={`track-controls ${track.muted ? 'track-muted' : ''}`}>
    <div className="track-identity"><span className={`track-icon ${track.color}`}><Icon icon={InstrumentIcon} size={15} /></span><div className="track-copy"><strong>{track.name}</strong><span>{track.instrument}</span></div><button className="track-more" aria-label={`More options for ${track.name}`} title="Track options will be added with editing tools" type="button"><Ellipsis size={17} /></button></div>
    <div className="track-mixer"><div className="volume-row"><Volume2 size={13} /><input aria-label={`${track.name} volume`} type="range" min="0" max="100" value={track.volume} style={{ '--volume': `${track.volume}%` } as CSSProperties} onChange={(event) => setTrackVolume(track.id, Number(event.target.value))} /><span className="volume-value">{track.volume}</span></div>
      <div className="track-toggles"><button className={track.muted ? 'toggle active mute-active' : 'toggle'} type="button" aria-pressed={track.muted} onClick={() => toggleTrack(track.id, 'muted')}>M</button><button className={track.solo ? 'toggle active solo-active' : 'toggle'} type="button" aria-pressed={track.solo} onClick={() => toggleTrack(track.id, 'solo')}>S</button><span className="pan-label">PAN</span><span className="pan-center" aria-label="Pan center"><i /></span></div>
    </div>
  </div>
}

export function TrackPanel({ tracks }: { tracks: Track[] }) {
  const addTrack = useEditorStore((state) => state.addTrack)
  return <aside className="track-panel" aria-label="Track controls"><div className="panel-heading"><span>TRACKS</span><span className="track-count">{String(tracks.length).padStart(2, '0')}</span><button onClick={addTrack} className="add-track-button" type="button"><Plus size={14} /><span>Add track</span></button></div><div className="track-list">{tracks.length ? tracks.map((track) => <TrackControls key={track.id} track={track} />) : <div className="track-empty"><span className="empty-icon"><AudioLines size={18} /></span><strong>Your tracks will live here</strong><span>Add a track to shape your session.</span><button type="button" onClick={addTrack}><Plus size={14} /> Add your first track</button></div>}</div></aside>
}
