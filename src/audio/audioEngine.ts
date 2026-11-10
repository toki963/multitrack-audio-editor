import { loadAsset } from '../storage/projectStorage'
import type { AudioClip, EditorProject } from '../types/project'

class AudioEngine {
  private context?: AudioContext
  private buffers = new Map<string, AudioBuffer>()
  private sources: AudioBufferSourceNode[] = []
  private trackGains = new Map<string, GainNode>()
  private startedAt = 0
  private startPosition = 0
  private playing = false

  private getContext() {
    this.context ??= new AudioContext()
    return this.context
  }

  async decode(assetId: string) {
    const cached = this.buffers.get(assetId)
    if (cached) return cached
    const blob = await loadAsset(assetId)
    if (!blob) throw new Error('프로젝트에 연결된 오디오 파일을 찾을 수 없습니다. 다시 가져와 주세요.')
    const decoded = await this.getContext().decodeAudioData(await blob.arrayBuffer())
    this.buffers.set(assetId, decoded)
    return decoded
  }

  async warm(project: EditorProject) {
    await Promise.all(project.assets.map((asset) => this.decode(asset.id)))
  }

  async play(project: EditorProject, position: number) {
    this.stopSources()
    const context = this.getContext()
    await context.resume()
    await this.warm(project)
    this.startPosition = Math.max(0, Math.min(project.duration, position))
    this.startedAt = context.currentTime
    this.playing = true
    const hasSolo = project.tracks.some((track) => track.solo)
    for (const track of project.tracks) {
      const trackGain = context.createGain()
      trackGain.gain.value = track.muted || (hasSolo && !track.solo) ? 0 : track.volume / 100
      trackGain.connect(context.destination)
      this.trackGains.set(track.id, trackGain)
      for (const clip of track.clips) this.scheduleClip(context, track.id, trackGain, clip, position)
    }
  }

  private scheduleClip(context: AudioContext, trackId: string, trackGain: GainNode, clip: AudioClip, position: number) {
    const clipEnd = clip.timelineStart + clip.duration
    if (clipEnd <= position) return
    const elapsed = Math.max(0, position - clip.timelineStart)
    const sourceOffset = clip.sourceStart + elapsed
    const remaining = Math.min(clip.sourceEnd - sourceOffset, clipEnd - Math.max(position, clip.timelineStart))
    if (remaining <= 0) return
    const source = context.createBufferSource()
    source.buffer = this.buffers.get(clip.assetId)!
    const clipGain = context.createGain()
    const initialAt = context.currentTime + Math.max(0, clip.timelineStart - position)
    const endAt = initialAt + remaining
    const level = Math.max(0, clip.gain)
    clipGain.gain.setValueAtTime(elapsed < clip.fadeIn ? level * elapsed / Math.max(clip.fadeIn, 0.001) : level, initialAt)
    const fadeInEnd = clip.timelineStart + clip.fadeIn
    if (fadeInEnd > Math.max(position, clip.timelineStart)) clipGain.gain.linearRampToValueAtTime(level, context.currentTime + fadeInEnd - position)
    const fadeOutStart = clipEnd - clip.fadeOut
    if (clip.fadeOut > 0 && fadeOutStart > position) {
      clipGain.gain.setValueAtTime(level, context.currentTime + fadeOutStart - position)
      clipGain.gain.linearRampToValueAtTime(0, endAt)
    } else if (clip.fadeOut > 0) {
      clipGain.gain.setValueAtTime(level * Math.max(0, (clipEnd - position) / clip.fadeOut), initialAt)
      clipGain.gain.linearRampToValueAtTime(0, endAt)
    }
    source.connect(clipGain)
    clipGain.connect(trackGain)
    source.start(initialAt, sourceOffset, remaining)
    source.onended = () => { source.disconnect(); clipGain.disconnect(); this.sources = this.sources.filter((item) => item !== source) }
    this.sources.push(source)
    void trackId
  }

  updateMix(project: EditorProject) {
    const hasSolo = project.tracks.some((track) => track.solo)
    for (const track of project.tracks) {
      const gain = this.trackGains.get(track.id)
      if (gain) gain.gain.setTargetAtTime(track.muted || (hasSolo && !track.solo) ? 0 : track.volume / 100, this.context?.currentTime ?? 0, 0.015)
    }
  }

  getPosition() {
    if (!this.playing || !this.context) return this.startPosition
    return this.startPosition + this.context.currentTime - this.startedAt
  }

  pause() {
    const position = this.getPosition()
    this.playing = false
    this.startPosition = position
    this.stopSources()
    return position
  }

  stop() {
    this.playing = false
    this.startPosition = 0
    this.stopSources()
  }

  private stopSources() {
    for (const source of this.sources) {
      source.onended = null
      try { source.stop() } catch { /* Source may have ended already. */ }
      source.disconnect()
    }
    this.sources = []
    for (const gain of this.trackGains.values()) gain.disconnect()
    this.trackGains.clear()
  }
}

export const audioEngine = new AudioEngine()
