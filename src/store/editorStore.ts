import { create } from 'zustand'
import { audioEngine } from '../audio/audioEngine'
import { saveAsset } from '../storage/projectStorage'
import type { AudioAsset, AudioClip, EditorProject, Track } from '../types/project'

const colors: Track['color'][] = ['violet', 'blue', 'teal', 'amber']
export const createEmptyProject = (name = '새 세션'): EditorProject => ({ id: crypto.randomUUID(), name, tracks: [], duration: 32, assets: [], updatedAt: Date.now() })

interface EditorState {
  project: EditorProject
  selectedClipId: string | null
  zoom: number
  currentTime: number
  isPlaying: boolean
  undoStack: EditorProject[]
  redoStack: EditorProject[]
  replaceProject: (project: EditorProject) => void
  selectClip: (id: string | null) => void
  setZoom: (zoom: number) => void
  setCurrentTime: (time: number) => void
  setPlaying: (playing: boolean) => void
  setTrackVolume: (id: string, volume: number) => void
  toggleTrack: (id: string, control: 'muted' | 'solo') => void
  addTrack: () => void
  deleteTrack: (id: string) => void
  importAudio: (asset: AudioAsset, file: Blob) => Promise<void>
  moveClip: (id: string, timelineStart: number, trackId?: string) => void
  trimClip: (id: string, edge: 'start' | 'end', timelineTime: number) => void
  splitSelectedClip: () => void
  deleteSelectedClip: () => void
  newProject: () => void
  undo: () => void
  redo: () => void
}

const historyLimit = 80
function editProject(state: EditorState, project: EditorProject): Partial<EditorState> {
  const next = { ...project, updatedAt: Date.now() }
  audioEngine.updateMix(next)
  return { project: next, undoStack: [...state.undoStack, state.project].slice(-historyLimit), redoStack: [] }
}

export const useEditorStore = create<EditorState>((set) => ({
  project: createEmptyProject(), selectedClipId: null, zoom: 1, currentTime: 0, isPlaying: false, undoStack: [], redoStack: [],
  replaceProject: (project) => set({ project, selectedClipId: null, currentTime: 0, undoStack: [], redoStack: [], isPlaying: false }),
  selectClip: (id) => set({ selectedClipId: id }),
  setZoom: (zoom) => set({ zoom: Math.max(0.35, Math.min(3, zoom)) }),
  setCurrentTime: (time) => set((state) => ({ currentTime: Math.max(0, Math.min(state.project.duration, time)) })),
  setPlaying: (isPlaying) => set({ isPlaying }),
  setTrackVolume: (id, volume) => set((state) => editProject(state, { ...state.project, tracks: state.project.tracks.map((track) => track.id === id ? { ...track, volume } : track) })),
  toggleTrack: (id, control) => set((state) => editProject(state, { ...state.project, tracks: state.project.tracks.map((track) => track.id === id ? { ...track, [control]: !track[control] } : track) })),
  addTrack: () => set((state) => {
    const index = state.project.tracks.length + 1
    const track: Track = { id: crypto.randomUUID(), name: `새 트랙 ${index}`, instrument: 'AUDIO', color: colors[(index - 1) % colors.length], volume: 80, muted: false, solo: false, clips: [] }
    return editProject(state, { ...state.project, tracks: [...state.project.tracks, track] })
  }),
  deleteTrack: (id) => set((state) => {
    const tracks = state.project.tracks.filter((track) => track.id !== id)
    const activeAssetIds = new Set(tracks.flatMap((track) => track.clips.map((clip) => clip.assetId)))
    const next = { ...state.project, tracks, assets: state.project.assets.filter((asset) => activeAssetIds.has(asset.id)) }
    return { ...editProject(state, next), selectedClipId: tracks.some((track) => track.clips.some((clip) => clip.id === state.selectedClipId)) ? state.selectedClipId : null }
  }),
  importAudio: async (asset, file) => {
    const state = useEditorStore.getState()
    await saveAsset(state.project.id, asset, file)
    const color = colors[state.project.assets.length % colors.length]
    const track: Track = {
      id: crypto.randomUUID(), name: asset.name.replace(/\.[^.]+$/, ''), instrument: 'AUDIO', color, volume: 80, muted: false, solo: false,
      clips: [{ id: crypto.randomUUID(), assetId: asset.id, name: asset.name, timelineStart: state.currentTime, sourceStart: 0, sourceEnd: asset.duration, duration: asset.duration, gain: 1, fadeIn: 0, fadeOut: 0, color }],
    }
    set((current) => editProject(current, { ...current.project, assets: [...current.project.assets, asset], tracks: [...current.project.tracks, track], duration: Math.max(current.project.duration, Math.ceil((track.clips[0].timelineStart + asset.duration) / 8) * 8) }))
  },
  moveClip: (id, timelineStart, targetTrackId) => set((state) => {
    const source = state.project.tracks.find((track) => track.clips.some((clip) => clip.id === id))
    const clip = source?.clips.find((item) => item.id === id)
    const target = state.project.tracks.find((track) => track.id === targetTrackId)
    if (!source || !clip) return {}
    const start = Math.max(0, timelineStart)
    const tracks = state.project.tracks.map((track) => {
      if (target && track.id === source.id && target.id !== source.id) return { ...track, clips: track.clips.filter((item) => item.id !== id) }
      if (target && track.id === target.id && target.id !== source.id) return { ...track, clips: [...track.clips, { ...clip, timelineStart: start }] }
      return { ...track, clips: track.clips.map((item) => item.id === id ? { ...item, timelineStart: start } : item) }
    })
    return editProject(state, { ...state.project, tracks })
  }),
  trimClip: (id, edge, timelineTime) => set((state) => editProject(state, { ...state.project, tracks: state.project.tracks.map((track) => ({ ...track, clips: track.clips.map((clip) => {
    if (clip.id !== id) return clip
    if (edge === 'start') {
      const end = clip.timelineStart + clip.duration
      const start = Math.max(0, Math.min(end - 0.1, timelineTime))
      const shift = start - clip.timelineStart
      return { ...clip, timelineStart: start, sourceStart: Math.min(clip.sourceEnd - 0.1, clip.sourceStart + shift), duration: end - start }
    }
    const duration = Math.max(0.1, timelineTime - clip.timelineStart)
    return { ...clip, duration, sourceEnd: Math.min(clip.sourceStart + duration, clip.sourceEnd) }
  }) })) })),
  splitSelectedClip: () => set((state) => {
    const selected = state.project.tracks.flatMap((track) => track.clips).find((clip) => clip.id === state.selectedClipId)
    if (!selected) return {}
    const splitAt = state.currentTime
    if (splitAt <= selected.timelineStart + 0.05 || splitAt >= selected.timelineStart + selected.duration - 0.05) return {}
    const leftDuration = splitAt - selected.timelineStart
    const right: AudioClip = { ...selected, id: crypto.randomUUID(), timelineStart: splitAt, sourceStart: selected.sourceStart + leftDuration, duration: selected.duration - leftDuration, fadeIn: 0 }
    const tracks = state.project.tracks.map((track) => ({ ...track, clips: track.clips.flatMap((clip) => clip.id === selected.id ? [{ ...clip, duration: leftDuration, sourceEnd: clip.sourceStart + leftDuration, fadeOut: 0 }, right] : [clip]) }))
    return { ...editProject(state, { ...state.project, tracks }), selectedClipId: right.id }
  }),
  deleteSelectedClip: () => set((state) => {
    if (!state.selectedClipId) return {}
    const tracks = state.project.tracks.map((track) => ({ ...track, clips: track.clips.filter((clip) => clip.id !== state.selectedClipId) }))
    const activeAssetIds = new Set(tracks.flatMap((track) => track.clips.map((clip) => clip.assetId)))
    return { ...editProject(state, { ...state.project, tracks, assets: state.project.assets.filter((asset) => activeAssetIds.has(asset.id)) }), selectedClipId: null }
  }),
  newProject: () => set((state) => ({ ...editProject(state, createEmptyProject()), currentTime: 0, selectedClipId: null, isPlaying: false })),
  undo: () => set((state) => {
    const previous = state.undoStack[state.undoStack.length - 1]
    if (!previous) return {}
    audioEngine.updateMix(previous)
    return { project: previous, undoStack: state.undoStack.slice(0, -1), redoStack: [...state.redoStack, state.project], selectedClipId: null }
  }),
  redo: () => set((state) => {
    const next = state.redoStack[state.redoStack.length - 1]
    if (!next) return {}
    audioEngine.updateMix(next)
    return { project: next, redoStack: state.redoStack.slice(0, -1), undoStack: [...state.undoStack, state.project], selectedClipId: null }
  }),
}))
