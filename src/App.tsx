import { ArrowDownToLine, ChevronRight, Clock3, Disc3, Plus, Sparkles } from 'lucide-react'
import { Header } from './components/Header'
import { Icon } from './components/Icon'
import { Timeline } from './components/Timeline'
import { TrackPanel } from './components/TrackControls'
import { Transport } from './components/Transport'
import { useEditorStore } from './store/editorStore'

export default function App() {
  const project = useEditorStore((state) => state.project)
  return <div className="app-frame"><Header /><div className="project-strip"><div className="breadcrumbs"><span>MY PROJECTS</span><Icon icon={ChevronRight} size={13} /><strong>{project.name}</strong><span className="draft-badge">DRAFT</span></div><div className="project-meta"><span><Icon icon={Clock3} size={13} />Saved just now</span><span className="meta-separator" /><span>48 kHz <i>·</i> 24 bit</span><button className="invite-button" type="button"><Sparkles size={13} /> Made for making</button></div></div>
    <section className="session-heading"><div><div className="eyebrow"><span className="eyebrow-line" />YOUR CREATIVE SPACE</div><h1>{project.name}</h1><p>A good sound starts with a little space.</p></div><div className="heading-actions"><button className="secondary-button" type="button" onClick={() => useEditorStore.getState().addTrack()}><Plus size={15} /> Add track</button><button className="primary-button" type="button" disabled title="WAV export will be available with the audio engine"><ArrowDownToLine size={15} /> Export mix</button></div></section>
    <section className="editor-card"><div className="editor-card-top"><div className="session-chip"><Disc3 size={14} /><span>SESSION 01</span></div><span className="session-mode">LOCAL WORKSPACE <i>•</i> PHASE 1</span></div><div className="editor-workspace"><TrackPanel tracks={project.tracks} /><Timeline tracks={project.tracks} duration={project.duration} /></div><div className="editor-card-foot"><span className="foot-tip"><span className="tip-star">✳</span> Small steps. Good sounds.</span><span>{project.tracks.length} tracks <i>·</i> 32 sec</span></div></section>
    <div className="bottom-note"><span><Sparkles size={13} /> Looks better with headphones</span><span>Every idea has a first draft.</span></div>
    <Transport />
  </div>
}
