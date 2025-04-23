import { AudioTrack } from './audio-track';

export default class LatencyCorrection extends AudioTrack {
  originalBuffer: null | AudioBuffer;
  constructor(
    id: number,
    audioContext: AudioContext,
    inputStream: MediaStream,
  ) {
    super(id, audioContext, inputStream);
    this.originalBuffer = null;
  }
  sliceOriginal(offset: number, length: number) {
    if (!this.originalBuffer) throw Error('');
    return super.slice(offset, length, this.originalBuffer);
  }
  async record(startTime: number, loopLength: number, latency: number) {
    this.originalBuffer = await super.record(startTime, loopLength, latency);
    return this.originalBuffer;
  }
}
