import { AudioLines, ChevronDown, CircleHelp, Download, FolderOpen, Headphones, Plus, Redo2, Save, Undo2, Upload } from 'lucide-react'
import { useEditorStore } from '../store/editorStore'
import { Icon } from './Icon'

function UnavailableAction({ icon, label }: { icon: typeof Upload; label: string }) {
  return <button className="toolbar-button disabled-action" type="button" disabled title={`${label} will be available in a later phase`}><Icon icon={icon} /><span>{label}</span></button>
}

export function Header() {
  const newProject = useEditorStore((state) => state.newProject)
  return <header className="topbar">
    <a className="brand" href="#workspace" aria-label="Waveform home"><span className="brand-mark"><AudioLines size={19} /></span><span>waveform<span className="brand-dot">.</span></span></a>
    <div className="topbar-divider" />
    <div className="project-menu"><span className="project-name">{useEditorStore((state) => state.project.name)}</span><ChevronDown size={14} /></div>
    <div className="toolbar-group history-tools"><button className="icon-button" type="button" disabled title="Nothing to undo yet"><Icon icon={Undo2} /></button><button className="icon-button" type="button" disabled title="Nothing to redo yet"><Icon icon={Redo2} /></button></div>
    <div className="topbar-spacer" />
    <nav className="header-actions" aria-label="Project actions">
      <button className="toolbar-button new-project-button" type="button" onClick={newProject}>New project</button>
      <UnavailableAction icon={FolderOpen} label="Open" />
      <UnavailableAction icon={Save} label="Save" />
      <UnavailableAction icon={Upload} label="Import" />
      <UnavailableAction icon={Download} label="Export" />
      <button className="avatar-button" aria-label="Audio workspace" title="Local audio workspace" type="button"><Headphones size={16} /></button>
      <button className="help-button" aria-label="About this preview" title="Phase 1 interface preview" type="button"><CircleHelp size={16} /></button>
    </nav>
    <button className="mobile-new" type="button" onClick={newProject} aria-label="New project"><Plus size={18} /></button>
  </header>
}
