import { CircleStop, Pause, Play, SkipBack } from 'lucide-react'
import { useEditorStore } from '../store/editorStore'
import { Icon } from './Icon'

export function Transport() {
  const currentTime = useEditorStore((state) => state.currentTime)
  const timestamp = `${Math.floor(currentTime / 60).toString().padStart(2, '0')}:${Math.floor(currentTime % 60).toString().padStart(2, '0')}.${Math.floor((currentTime % 1) * 100).toString().padStart(2, '0')}`
  return <section className="transport-bar" aria-label="재생 컨트롤">
    <div className="transport-buttons">
      <button className="transport-icon" type="button" disabled title="재생 기능은 오디오 엔진 단계에서 제공됩니다"><Icon icon={SkipBack} /></button>
      <button className="play-button" type="button" disabled title="재생 기능은 오디오 엔진 단계에서 제공됩니다"><Icon icon={Play} size={17} /></button>
      <button className="transport-icon" type="button" disabled title="재생 기능은 오디오 엔진 단계에서 제공됩니다"><Icon icon={Pause} /></button>
      <button className="transport-icon" type="button" disabled title="재생 기능은 오디오 엔진 단계에서 제공됩니다"><Icon icon={CircleStop} /></button>
    </div>
    <div className="transport-time"><span className="time-current">{timestamp}</span><span className="time-divider">/</span><span>00:32.00</span></div>
    <div className="transport-status"><span className="status-dot" />화면 미리보기 <span className="status-separator">·</span> 오디오 엔진은 다음 단계</div>
    <div className="transport-spacer" />
    <div className="master-output"><span className="master-label">마스터</span><div className="master-meter"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div><span className="master-value">−6.0 <small>dB</small></span></div>
  </section>
}
