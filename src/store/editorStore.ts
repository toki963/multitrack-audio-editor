import { create } from 'zustand'
import type { EditorProject, Track } from '../types/project'

const starterTracks: Track[] = [
  {
    id: 'track-drums', name: 'Soft Focus', instrument: 'DRUMS', color: 'violet', volume: 82, muted: false, solo: false,
    clips: [{ id: 'clip-drums-a', assetId: 'sample-drums', name: 'soft-focus drums.wav', timelineStart: 0, sourceStart: 0, sourceEnd: 17.2, duration: 17.2, gain: 1, fadeIn: 0, fadeOut: 0, color: 'violet' }, { id: 'clip-drums-b', assetId: 'sample-drums', name: 'soft-focus drums.wav', timelineStart: 20.3, sourceStart: 0, sourceEnd: 11.8, duration: 11.8, gain: 1, fadeIn: 0, fadeOut: 0, color: 'violet' }],
  },
  {
    id: 'track-bass', name: 'Low Current', instrument: 'BASS', color: 'blue', volume: 74, muted: false, solo: false,
    clips: [{ id: 'clip-bass-a', assetId: 'sample-bass', name: 'low-current bass.wav', timelineStart: 4.1, sourceStart: 0, sourceEnd: 15.8, duration: 15.8, gain: 1, fadeIn: 0, fadeOut: 0, color: 'blue' }],
  },
  {
    id: 'track-keys', name: 'Glasshouse', instrument: 'KEYS', color: 'teal', volume: 67, muted: false, solo: false,
    clips: [{ id: 'clip-keys-a', assetId: 'sample-keys', name: 'glasshouse keys.wav', timelineStart: 0.4, sourceStart: 0, sourceEnd: 22.6, duration: 22.6, gain: 1, fadeIn: 0, fadeOut: 0, color: 'teal' }],
  },
  {
    id: 'track-texture', name: 'Night Air', instrument: 'TEXTURE', color: 'amber', volume: 58, muted: true, solo: false,
    clips: [{ id: 'clip-texture-a', assetId: 'sample-texture', name: 'night-air texture.wav', timelineStart: 12.6, sourceStart: 0, sourceEnd: 16.3, duration: 16.3, gain: 1, fadeIn: 0, fadeOut: 0, color: 'amber' }],
  },
]

interface EditorState {
  project: EditorProject
  selectedClipId: string | null
  zoom: number
  currentTime: number
  selectClip: (id: string) => void
  setZoom: (zoom: number) => void
  setTrackVolume: (id: string, volume: number) => void
  toggleTrack: (id: string, control: 'muted' | 'solo') => void
  addTrack: () => void
  newProject: () => void
}

export const createEmptyProject = (): EditorProject => ({ name: 'Untitled session', tracks: [], duration: 32 })

export const useEditorStore = create<EditorState>((set) => ({
  project: { name: 'Soft Focus — mix 04', tracks: starterTracks, duration: 32 },
  selectedClipId: 'clip-keys-a',
  zoom: 1,
  currentTime: 8.5,
  selectClip: (id) => set({ selectedClipId: id }),
  setZoom: (zoom) => set({ zoom: Math.max(0.7, Math.min(1.55, zoom)) }),
  setTrackVolume: (id, volume) => set((state) => ({ project: { ...state.project, tracks: state.project.tracks.map((track) => track.id === id ? { ...track, volume } : track) } })),
  toggleTrack: (id, control) => set((state) => ({ project: { ...state.project, tracks: state.project.tracks.map((track) => track.id === id ? { ...track, [control]: !track[control] } : track) } })),
  addTrack: () => set((state) => {
    const index = state.project.tracks.length + 1
    const track: Track = { id: `track-${globalThis.crypto.randomUUID()}`, name: `New track ${index}`, instrument: 'AUDIO', color: 'violet', volume: 80, muted: false, solo: false, clips: [] }
    return { project: { ...state.project, tracks: [...state.project.tracks, track] } }
  }),
  newProject: () => set({ project: createEmptyProject(), selectedClipId: null, currentTime: 0 }),
}))
