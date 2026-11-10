import { loadAsset } from '../storage/projectStorage'
import type { AudioClip, EditorProject } from '../types/project'

function addClip(context: OfflineAudioContext, buffer: AudioBuffer, clip: AudioClip, trackGain: GainNode) {
  const source = context.createBufferSource()
  source.buffer = buffer
  const gain = context.createGain()
  const start = Math.max(0, clip.timelineStart)
  const sourceStart = clip.sourceStart + Math.max(0, -clip.timelineStart)
  const duration = Math.min(clip.sourceEnd - sourceStart, clip.timelineStart + clip.duration - start, context.length / context.sampleRate - start)
  if (duration <= 0) return
  const finish = start + duration
  const level = Math.max(0, clip.gain)
  gain.gain.setValueAtTime(level, start)
  if (clip.fadeIn > 0) {
    gain.gain.setValueAtTime(0, start)
    gain.gain.linearRampToValueAtTime(level, start + Math.min(clip.fadeIn, duration))
  }
  if (clip.fadeOut > 0) {
    const fadeStart = Math.max(start, finish - clip.fadeOut)
    gain.gain.setValueAtTime(level, fadeStart)
    gain.gain.linearRampToValueAtTime(0, finish)
  }
  source.connect(gain)
  gain.connect(trackGain)
  source.start(start, sourceStart, duration)
}

export async function renderProject(project: EditorProject) {
  const sampleRate = 44100
  const duration = Math.max(1, project.duration)
  const context = new OfflineAudioContext(2, Math.ceil(duration * sampleRate), sampleRate)
  const buffers = new Map<string, AudioBuffer>()
  await Promise.all(project.assets.map(async (asset) => {
    const blob = await loadAsset(asset.id)
    if (!blob) throw new Error(`'${asset.name}' 파일을 찾을 수 없습니다. 프로젝트에 오디오를 다시 가져와 주세요.`)
    buffers.set(asset.id, await context.decodeAudioData(await blob.arrayBuffer()))
  }))
  const hasSolo = project.tracks.some((track) => track.solo)
  for (const track of project.tracks) {
    if (track.muted || (hasSolo && !track.solo)) continue
    const gain = context.createGain()
    gain.gain.value = track.volume / 100
    gain.connect(context.destination)
    track.clips.forEach((clip) => {
      const buffer = buffers.get(clip.assetId)
      if (buffer) addClip(context, buffer, clip, gain)
    })
  }
  return context.startRendering()
}

export function encodeWav(samples: Float32Array[], sampleRate: number) {
  const channels = samples.length
  const frameCount = samples[0]?.length ?? 0
  const bytes = new ArrayBuffer(44 + frameCount * channels * 2)
  const view = new DataView(bytes)
  const write = (offset: number, value: string) => { for (let i = 0; i < value.length; i += 1) view.setUint8(offset + i, value.charCodeAt(i)) }
  write(0, 'RIFF'); view.setUint32(4, bytes.byteLength - 8, true); write(8, 'WAVE'); write(12, 'fmt ')
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, channels, true)
  view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * channels * 2, true)
  view.setUint16(32, channels * 2, true); view.setUint16(34, 16, true); write(36, 'data'); view.setUint32(40, frameCount * channels * 2, true)
  let offset = 44
  for (let frame = 0; frame < frameCount; frame += 1) for (let channel = 0; channel < channels; channel += 1) {
    const sample = Math.max(-1, Math.min(1, samples[channel][frame]))
    view.setInt16(offset, sample < 0 ? sample * 32768 : sample * 32767, true)
    offset += 2
  }
  return new Blob([bytes], { type: 'audio/wav' })
}

export async function exportProjectWav(project: EditorProject) {
  const rendered = await renderProject(project)
  return encodeWav(Array.from({ length: rendered.numberOfChannels }, (_, channel) => rendered.getChannelData(channel)), rendered.sampleRate)
}

