import { ArrowDownToLine, ChevronRight, Clock3, Disc3, Plus, Sparkles, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { DragEvent } from 'react'
import { audioEngine } from './audio/audioEngine'
import { inspectAudioFile } from './audio/assetImport'
import { exportProjectWav } from './audio/exportEngine'
import { Header } from './components/Header'
import { Icon } from './components/Icon'
import { ProjectPicker, loadProject } from './components/ProjectPicker'
import { Timeline } from './components/Timeline'
import { TrackPanel } from './components/TrackControls'
import { Transport } from './components/Transport'
import { deleteAssetsNotInProject, listProjects, saveProject } from './storage/projectStorage'
import { useEditorStore } from './store/editorStore'

export default function App() {
  const project = useEditorStore((state) => state.project)
  const isPlaying = useEditorStore((state) => state.isPlaying)
  const replaceProject = useEditorStore((state) => state.replaceProject)
  const setCurrentTime = useEditorStore((state) => state.setCurrentTime)
  const setPlaying = useEditorStore((state) => state.setPlaying)
  const [ready, setReady] = useState(false)
  const [dialog, setDialog] = useState(false)
  const [busy, setBusy] = useState('')
  const [notice, setNotice] = useState('')
  const dragDepth = useRef(0)
  const [draggingFiles, setDraggingFiles] = useState(false)

  useEffect(() => {
    let cancelled = false
    void listProjects().then(async (projects) => {
      if (cancelled || projects.length === 0) return
      const saved = await loadProject(projects[0].id)
      if (saved && !cancelled && saved.tracks && saved.assets) replaceProject(saved)
    }).catch((cause: Error) => { if (!cancelled) setNotice(`프로젝트를 불러오지 못했습니다: ${cause.message}`) }).finally(() => { if (!cancelled) setReady(true) })
    return () => { cancelled = true }
  }, [replaceProject])

  useEffect(() => {
    if (!ready) return
    const timeout = window.setTimeout(() => {
      void saveProject(project).then(() => deleteAssetsNotInProject(project)).catch((cause: Error) => setNotice(`자동 저장에 실패했습니다: ${cause.message}`))
    }, 600)
    return () => window.clearTimeout(timeout)
  }, [project, ready])

  const importFiles = useCallback(async (files: FileList | null) => {
    if (!files?.length) return
    setBusy('오디오 파일을 가져오는 중…')
    const errors: string[] = []
    for (const file of Array.from(files)) {
      try {
        const asset = await inspectAudioFile(file)
        await useEditorStore.getState().importAudio(asset, file)
      } catch (cause) { errors.push(cause instanceof Error ? cause.message : `${file.name} 파일을 가져오지 못했습니다.`) }
    }
    setBusy('')
    setNotice(errors.length ? errors.join(' ') : `${files.length}개 오디오 파일을 가져왔습니다.`)
  }, [])

  const saveCurrent = useCallback(async () => {
    setBusy('프로젝트 저장 중…')
    try { await saveProject(useEditorStore.getState().project); setNotice('프로젝트와 오디오 파일을 이 브라우저에 저장했습니다.') }
    catch (cause) { setNotice(cause instanceof Error ? cause.message : '프로젝트를 저장하지 못했습니다.') }
    finally { setBusy('') }
  }, [])

  const openProject = useCallback(async (id: string) => {
    setBusy('프로젝트를 여는 중…')
    try {
      const saved = await loadProject(id)
      if (!saved) throw new Error('저장된 프로젝트를 찾을 수 없습니다.')
      replaceProject(saved)
      setCurrentTime(0)
      setDialog(false)
      setNotice(`'${saved.name}' 프로젝트를 열었습니다.`)
    } catch (cause) { setNotice(cause instanceof Error ? cause.message : '프로젝트를 열지 못했습니다.') }
    finally { setBusy('') }
  }, [replaceProject, setCurrentTime])

  const play = useCallback(async () => {
    const state = useEditorStore.getState()
    if (!state.project.assets.length) { setNotice('먼저 오디오 파일을 가져오세요.'); return }
    try {
      const position = state.currentTime >= state.project.duration ? 0 : state.currentTime
      await audioEngine.play(state.project, position)
      setCurrentTime(position)
      setPlaying(true)
      setNotice('')
    } catch (cause) { setNotice(cause instanceof Error ? cause.message : '오디오를 재생하지 못했습니다.') }
  }, [setCurrentTime, setPlaying])

  const pause = useCallback(() => {
    if (!useEditorStore.getState().isPlaying) return
    setCurrentTime(audioEngine.pause())
    setPlaying(false)
  }, [setCurrentTime, setPlaying])

  const stop = useCallback(() => { audioEngine.stop(); setPlaying(false); setCurrentTime(0) }, [setCurrentTime, setPlaying])
  const beginning = useCallback(() => {
    if (useEditorStore.getState().isPlaying) {
      audioEngine.stop()
      setPlaying(false)
      setCurrentTime(0)
      void play()
    } else setCurrentTime(0)
  }, [play, setCurrentTime, setPlaying])

  useEffect(() => {
    if (!isPlaying) return
    let frame = 0
    const tick = () => {
      const position = audioEngine.getPosition()
      if (position >= useEditorStore.getState().project.duration) { setCurrentTime(useEditorStore.getState().project.duration); audioEngine.stop(); setPlaying(false); return }
      setCurrentTime(position)
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [isPlaying, setCurrentTime, setPlaying])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      const editing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable
      if (event.code === 'Space' && !editing && target.tagName !== 'BUTTON') { event.preventDefault(); if (useEditorStore.getState().isPlaying) pause(); else void play() }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') { event.preventDefault(); void saveCurrent() }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') { event.preventDefault(); if (event.shiftKey) useEditorStore.getState().redo(); else useEditorStore.getState().undo() }
      if ((event.key === 'Delete' || event.key === 'Backspace') && !editing && useEditorStore.getState().selectedClipId) useEditorStore.getState().deleteSelectedClip()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [pause, play, saveCurrent])

  const exportAudio = async () => {
    setBusy('프로젝트를 WAV로 렌더링하는 중…')
    try {
      const wav = await exportProjectWav(project)
      const url = URL.createObjectURL(wav)
      const link = document.createElement('a')
      link.href = url
      link.download = `${project.name.replace(/[\\/:*?"<>|]/g, '_') || 'waveform'}.wav`
      link.click()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
      setNotice('WAV 파일을 내보냈습니다.')
    } catch (cause) { setNotice(cause instanceof Error ? cause.message : 'WAV 파일을 내보내지 못했습니다.') }
    finally { setBusy('') }
  }

  const handleDrop = (event: DragEvent) => {
    event.preventDefault()
    dragDepth.current = 0
    setDraggingFiles(false)
    void importFiles(event.dataTransfer.files)
  }

  return <div className="app-frame" onDragEnter={(event) => { event.preventDefault(); dragDepth.current += 1; setDraggingFiles(true) }} onDragOver={(event) => event.preventDefault()} onDragLeave={(event) => { event.preventDefault(); dragDepth.current -= 1; if (dragDepth.current <= 0) setDraggingFiles(false) }} onDrop={handleDrop}>
    <Header onOpen={() => setDialog(true)} onSave={() => void saveCurrent()} onImport={(files) => void importFiles(files)} onExport={() => void exportAudio()} onNew={() => useEditorStore.getState().newProject()} />
    <div className="project-strip"><div className="breadcrumbs"><span>내 프로젝트</span><Icon icon={ChevronRight} size={13} /><strong>{project.name}</strong><span className="draft-badge">초안</span></div><div className="project-meta"><span><Icon icon={Clock3} size={13} />{ready ? '자동 저장 켜짐' : '저장소 확인 중'}</span><span className="meta-separator" /><span>브라우저 로컬 저장</span><button className="invite-button" type="button" onClick={() => void saveCurrent()}><Sparkles size={13} /> 지금 저장</button></div></div>
    <section className="session-heading"><div><div className="eyebrow"><span className="eyebrow-line" />나만의 창작 공간</div><h1>{project.name}</h1><p>오디오를 가져와 트랙을 만들고, 타임라인에서 편집하세요.</p></div><div className="heading-actions"><button className="secondary-button" type="button" onClick={() => useEditorStore.getState().addTrack()}><Plus size={15} /> 트랙 추가</button><button className="primary-button" type="button" onClick={() => void exportAudio()} disabled={!project.assets.length || !!busy}><ArrowDownToLine size={15} /> WAV 내보내기</button></div></section>
    <section className="editor-card"><div className="editor-card-top"><div className="session-chip"><Disc3 size={14} /><span>세션 작업 공간</span></div><span className="session-mode">로컬 오디오 엔진 <i>•</i> 자동 저장</span></div><div className="editor-workspace"><TrackPanel tracks={project.tracks} /><Timeline tracks={project.tracks} duration={project.duration} /></div><div className="editor-card-foot"><span className="foot-tip"><span className="tip-star">✳</span> 클립을 자유롭게 배치해 보세요.</span><span>트랙 {project.tracks.length}개 <i>·</i> {project.duration.toFixed(0)}초</span></div></section>
    <div className="bottom-note"><span><Sparkles size={13} /> 오디오는 이 기기에서 처리됩니다.</span><span>프로젝트와 원본 파일은 브라우저에 저장됩니다.</span></div>
    <Transport onPlay={() => void play()} onPause={pause} onStop={stop} onBeginning={beginning} />
    {busy && <div className="busy-indicator" role="status">{busy}</div>}
    {notice && <div className="notice-banner" role="status"><span>{notice}</span><button type="button" aria-label="알림 닫기" onClick={() => setNotice('')}><X size={15} /></button></div>}
    {draggingFiles && <div className="drop-overlay"><div><Icon icon={ArrowDownToLine} size={26} /><strong>오디오 파일을 놓아 가져오기</strong></div></div>}
    {dialog && <ProjectPicker onClose={() => setDialog(false)} onSelect={(id) => void openProject(id)} />}
  </div>
}
