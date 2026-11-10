export interface AudioClip {
  id: string
  assetId: string
  name: string
  timelineStart: number
  sourceStart: number
  sourceEnd: number
  duration: number
  gain: number
  fadeIn: number
  fadeOut: number
  color: 'violet' | 'blue' | 'teal' | 'amber'
}

export interface AudioAsset {
  id: string
  name: string
  mimeType: string
  duration: number
}

export interface Track {
  id: string
  name: string
  instrument: string
  color: 'violet' | 'blue' | 'teal' | 'amber'
  volume: number
  muted: boolean
  solo: boolean
  clips: AudioClip[]
}

export interface EditorProject {
  name: string
  tracks: Track[]
  duration: number
  assets?: AudioAsset[]
}
