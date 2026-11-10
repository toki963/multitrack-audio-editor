import { AudioLines, ChevronDown, CircleHelp, Download, FolderOpen, Headphones, Plus, Redo2, Save, Undo2, Upload } from 'lucide-react'
import { useEditorStore } from '../store/editorStore'
import { Icon } from './Icon'

function UnavailableAction({ icon, label }: { icon: typeof Upload; label: string }) {
  return <button className="toolbar-button disabled-action" type="button" disabled title={`${label} 기능은 다음 단계에서 제공됩니다`}><Icon icon={icon} /><span>{label}</span></button>
}

export function Header() {
  const newProject = useEditorStore((state) => state.newProject)
  return <header className="topbar">
    <a className="brand" href="#workspace" aria-label="Waveform 홈"><span className="brand-mark"><AudioLines size={19} /></span><span>waveform<span className="brand-dot">.</span></span></a>
    <div className="topbar-divider" />
    <div className="project-menu"><span className="project-name">{useEditorStore((state) => state.project.name)}</span><ChevronDown size={14} /></div>
    <div className="toolbar-group history-tools"><button className="icon-button" type="button" disabled title="되돌릴 작업이 없습니다"><Icon icon={Undo2} /></button><button className="icon-button" type="button" disabled title="다시 실행할 작업이 없습니다"><Icon icon={Redo2} /></button></div>
    <div className="topbar-spacer" />
    <nav className="header-actions" aria-label="프로젝트 작업">
      <button className="toolbar-button new-project-button" type="button" onClick={newProject}>새 프로젝트</button>
      <UnavailableAction icon={FolderOpen} label="열기" />
      <UnavailableAction icon={Save} label="저장" />
      <UnavailableAction icon={Upload} label="가져오기" />
      <UnavailableAction icon={Download} label="내보내기" />
      <button className="avatar-button" aria-label="오디오 작업 공간" title="내 컴퓨터의 오디오 작업 공간" type="button"><Headphones size={16} /></button>
      <button className="help-button" aria-label="미리보기 안내" title="1단계 화면 미리보기" type="button"><CircleHelp size={16} /></button>
    </nav>
    <button className="mobile-new" type="button" onClick={newProject} aria-label="새 프로젝트"><Plus size={18} /></button>
  </header>
}
