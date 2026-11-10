import { ArrowDownToLine, ChevronRight, Clock3, Disc3, Plus, Sparkles } from 'lucide-react'
import { Header } from './components/Header'
import { Icon } from './components/Icon'
import { Timeline } from './components/Timeline'
import { TrackPanel } from './components/TrackControls'
import { Transport } from './components/Transport'
import { useEditorStore } from './store/editorStore'

export default function App() {
  const project = useEditorStore((state) => state.project)
  return <div className="app-frame"><Header /><div className="project-strip"><div className="breadcrumbs"><span>내 프로젝트</span><Icon icon={ChevronRight} size={13} /><strong>{project.name}</strong><span className="draft-badge">초안</span></div><div className="project-meta"><span><Icon icon={Clock3} size={13} />지금 저장됨</span><span className="meta-separator" /><span>48 kHz <i>·</i> 24 bit</span><button className="invite-button" type="button"><Sparkles size={13} /> 창작을 위한 작업 공간</button></div></div>
    <section className="session-heading"><div><div className="eyebrow"><span className="eyebrow-line" />나만의 창작 공간</div><h1>{project.name}</h1><p>좋은 소리는 여유로운 공간에서 시작됩니다.</p></div><div className="heading-actions"><button className="secondary-button" type="button" onClick={() => useEditorStore.getState().addTrack()}><Plus size={15} /> 트랙 추가</button><button className="primary-button" type="button" disabled title="오디오 엔진이 추가되면 WAV 내보내기를 사용할 수 있습니다"><ArrowDownToLine size={15} /> 믹스 내보내기</button></div></section>
    <section className="editor-card"><div className="editor-card-top"><div className="session-chip"><Disc3 size={14} /><span>세션 01</span></div><span className="session-mode">로컬 작업 공간 <i>•</i> 1단계</span></div><div className="editor-workspace"><TrackPanel tracks={project.tracks} /><Timeline tracks={project.tracks} duration={project.duration} /></div><div className="editor-card-foot"><span className="foot-tip"><span className="tip-star">✳</span> 천천히, 좋은 소리로.</span><span>트랙 {project.tracks.length}개 <i>·</i> 32초</span></div></section>
    <div className="bottom-note"><span><Sparkles size={13} /> 헤드폰을 끼면 더 좋아요</span><span>모든 아이디어는 첫 초안에서 시작됩니다.</span></div>
    <Transport />
  </div>
}
