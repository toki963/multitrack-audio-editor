import { AudioLines, AudioWaveform, Drum, Ellipsis, Guitar, Headphones, Plus, Volume2 } from 'lucide-react'
import type { CSSProperties } from 'react'
import type { Track } from '../types/project'
import { useEditorStore } from '../store/editorStore'
import { Icon } from './Icon'

const instrumentIcon = { DRUMS: Drum, BASS: Guitar, KEYS: AudioWaveform, TEXTURE: Headphones, AUDIO: AudioLines }
const instrumentLabel = { DRUMS: '드럼', BASS: '베이스', KEYS: '건반', TEXTURE: '텍스처', AUDIO: '오디오' }

export function TrackControls({ track }: { track: Track }) {
  const setTrackVolume = useEditorStore((state) => state.setTrackVolume)
  const toggleTrack = useEditorStore((state) => state.toggleTrack)
  const instrumentKey = track.instrument as keyof typeof instrumentIcon
  const InstrumentIcon = instrumentIcon[instrumentKey] ?? AudioLines
  return <div className={`track-controls ${track.muted ? 'track-muted' : ''}`}>
    <div className="track-identity"><span className={`track-icon ${track.color}`}><Icon icon={InstrumentIcon} size={15} /></span><div className="track-copy"><strong>{track.name}</strong><span>{instrumentLabel[instrumentKey]}</span></div><button className="track-more" aria-label={`${track.name} 트랙 옵션`} title="트랙 편집 기능은 다음 단계에서 추가됩니다" type="button"><Ellipsis size={17} /></button></div>
    <div className="track-mixer"><div className="volume-row"><Volume2 size={13} /><input aria-label={`${track.name} 음량`} type="range" min="0" max="100" value={track.volume} style={{ '--volume': `${track.volume}%` } as CSSProperties} onChange={(event) => setTrackVolume(track.id, Number(event.target.value))} /><span className="volume-value">{track.volume}</span></div>
      <div className="track-toggles"><button className={track.muted ? 'toggle active mute-active' : 'toggle'} type="button" aria-label="음소거" title="음소거" aria-pressed={track.muted} onClick={() => toggleTrack(track.id, 'muted')}>M</button><button className={track.solo ? 'toggle active solo-active' : 'toggle'} type="button" aria-label="솔로" title="솔로" aria-pressed={track.solo} onClick={() => toggleTrack(track.id, 'solo')}>S</button><span className="pan-label">좌우</span><span className="pan-center" aria-label="중앙 패닝"><i /></span></div>
    </div>
  </div>
}

export function TrackPanel({ tracks }: { tracks: Track[] }) {
  const addTrack = useEditorStore((state) => state.addTrack)
  return <aside className="track-panel" aria-label="트랙 컨트롤"><div className="panel-heading"><span>트랙</span><span className="track-count">{String(tracks.length).padStart(2, '0')}</span><button onClick={addTrack} className="add-track-button" type="button"><Plus size={14} /><span>트랙 추가</span></button></div><div className="track-list">{tracks.length ? tracks.map((track) => <TrackControls key={track.id} track={track} />) : <div className="track-empty"><span className="empty-icon"><AudioLines size={18} /></span><strong>여기에 트랙이 표시됩니다</strong><span>트랙을 추가해 세션을 시작하세요.</span><button type="button" onClick={addTrack}><Plus size={14} /> 첫 트랙 추가</button></div>}</div></aside>
}
