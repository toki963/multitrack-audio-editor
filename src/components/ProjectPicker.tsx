import { useEffect, useState } from 'react'
import { FolderOpen, X } from 'lucide-react'
import { listProjects, loadProject } from '../storage/projectStorage'
import type { ProjectSummary } from '../types/project'

export function ProjectPicker({ onClose, onSelect }: { onClose: () => void; onSelect: (id: string) => void }) {
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [error, setError] = useState('')
  useEffect(() => { void listProjects().then(setProjects).catch((cause: Error) => setError(cause.message)) }, [])
  return <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="project-dialog" role="dialog" aria-modal="true" aria-labelledby="open-project-heading">
    <div className="dialog-heading"><div><span className="dialog-icon"><FolderOpen size={17} /></span><h2 id="open-project-heading">프로젝트 열기</h2><p>이 브라우저에 저장한 프로젝트입니다.</p></div><button type="button" className="dialog-close" aria-label="닫기" onClick={onClose}><X size={17} /></button></div>
    {error ? <p className="dialog-error">{error}</p> : projects.length ? <div className="project-list">{projects.map((project) => <button type="button" className="project-list-item" key={project.id} onClick={() => onSelect(project.id)}><span><strong>{project.name}</strong><small>{new Date(project.updatedAt).toLocaleString('ko-KR')}</small></span><span>열기 →</span></button>)}</div> : <div className="project-list-empty">저장된 프로젝트가 없습니다. 현재 작업은 자동 저장됩니다.</div>}
    <div className="dialog-footer"><span>오디오 파일은 이 기기의 브라우저 저장소에 보관됩니다.</span><button className="secondary-button" type="button" onClick={onClose}>닫기</button></div>
  </section></div>
}

export { loadProject }
