import type { AudioAsset } from '../types/project'

export async function inspectAudioFile(file: File): Promise<AudioAsset> {
  const AudioContextConstructor = window.AudioContext
  if (!AudioContextConstructor) throw new Error('이 브라우저는 Web Audio를 지원하지 않습니다.')
  const context = new AudioContextConstructor()
  try {
    const buffer = await context.decodeAudioData(await file.arrayBuffer())
    return { id: crypto.randomUUID(), name: file.name, mimeType: file.type || 'audio/unknown', duration: buffer.duration, sampleRate: buffer.sampleRate, channels: buffer.numberOfChannels }
  } catch {
    throw new Error(`'${file.name}' 파일을 읽을 수 없습니다. WAV, MP3, OGG 등 브라우저에서 지원하는 오디오 파일인지 확인해 주세요.`)
  } finally {
    await context.close()
  }
}
