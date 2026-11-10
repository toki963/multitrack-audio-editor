import { AudioLines, ChevronDown, Download, FolderOpen, Plus, Save, Undo2, Redo2, Upload } from 'lucide-react'
import { useRef } from 'react'
import { useEditorStore } from '../store/editorStore'
import { Icon } from './Icon'

interface HeaderProps {
  onOpen: () => void
  onSave: () => void
  onImport: (files: FileList | null) => void
  onExport: () => void
  onNew: () => void
}

export function Header({ onOpen, onSave, onImport, onExport, onNew }: HeaderProps) {
  const input = useRef<HTMLInputElement>(null)
  const project = useEditorStore((state) => state.project)
  const undo = useEditorStore((state) => state.undo)
  const redo = useEditorStore((state) => state.redo)
  const canUndo = useEditorStore((state) => state.undoStack.length > 0)
  const canRedo = useEditorStore((state) => state.redoStack.length > 0)
  const canExport = project.assets.length > 0
  return <header className="topbar">
    <a className="brand" href="#workspace" aria-label="Waveform 홈"><span className="brand-mark"><AudioLines size={19} /></span><span>waveform<span className="brand-dot">.</span></span></a>
    <div className="topbar-divider" />
    <div className="project-menu"><span className="project-name">{project.name}</span><ChevronDown size={14} /></div>
    <div className="toolbar-group history-tools"><button className="icon-button" type="button" disabled={!canUndo} title="실행 취소 (Ctrl+Z)" aria-label="실행 취소" onClick={undo}><Icon icon={Undo2} /></button><button className="icon-button" type="button" disabled={!canRedo} title="다시 실행 (Ctrl+Shift+Z)" aria-label="다시 실행" onClick={redo}><Icon icon={Redo2} /></button></div>
    <div className="topbar-spacer" />
    <nav className="header-actions" aria-label="프로젝트 작업">
      <button className="toolbar-button new-project-button" type="button" onClick={onNew}>새 프로젝트</button>
      <button className="toolbar-button" type="button" onClick={onOpen}><Icon icon={FolderOpen} /><span>열기</span></button>
      <button className="toolbar-button" type="button" onClick={onSave}><Icon icon={Save} /><span>저장</span></button>
      <button className="toolbar-button" type="button" onClick={() => input.current?.click()}><Icon icon={Upload} /><span>오디오 가져오기</span></button>
      <button className="toolbar-button export-button" type="button" onClick={onExport} disabled={!canExport}><Icon icon={Download} /><span>WAV 내보내기</span></button>
      <input ref={input} className="visually-hidden" type="file" accept="audio/*,.wav,.mp3,.ogg,.m4a,.flac,.aac" multiple onChange={(event) => { onImport(event.target.files); event.currentTarget.value = '' }} />
    </nav>
    <button className="mobile-new" type="button" onClick={() => input.current?.click()} aria-label="오디오 가져오기"><Plus size={18} /></button>
  </header>
}
