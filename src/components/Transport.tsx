import { CircleStop, Pause, Play, SkipBack } from 'lucide-react'
import { useEditorStore } from '../store/editorStore'
import { Icon } from './Icon'

function timestamp(time: number) {
  return `${Math.floor(time / 60).toString().padStart(2, '0')}:${Math.floor(time % 60).toString().padStart(2, '0')}.${Math.floor((time % 1) * 100).toString().padStart(2, '0')}`
}

export function Transport({ onPlay, onPause, onStop, onBeginning }: { onPlay: () => void; onPause: () => void; onStop: () => void; onBeginning: () => void }) {
  const currentTime = useEditorStore((state) => state.currentTime)
  const duration = useEditorStore((state) => state.project.duration)
  const isPlaying = useEditorStore((state) => state.isPlaying)
  return <section className="transport-bar" aria-label="재생 컨트롤">
    <div className="transport-buttons">
      <button className="transport-icon" type="button" onClick={onBeginning} title="처음으로"><Icon icon={SkipBack} /></button>
      <button className="play-button" type="button" onClick={isPlaying ? onPause : onPlay} title={isPlaying ? '일시 정지' : '재생'}><Icon icon={isPlaying ? Pause : Play} size={17} /></button>
      <button className="transport-icon" type="button" onClick={onPause} title="일시 정지"><Icon icon={Pause} /></button>
      <button className="transport-icon" type="button" onClick={onStop} title="정지"><Icon icon={CircleStop} /></button>
    </div>
    <div className="transport-time"><span className="time-current">{timestamp(currentTime)}</span><span className="time-divider">/</span><span>{timestamp(duration)}</span></div>
    <div className="transport-status"><span className="status-dot" />{isPlaying ? '재생 중' : '로컬 오디오 엔진'} <span className="status-separator">·</span> 브라우저에서 처리</div>
    <div className="transport-spacer" />
    <div className="master-output"><span className="master-label">마스터</span><div className="master-meter"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div><span className="master-value">0.0 <small>dB</small></span></div>
  </section>
}
