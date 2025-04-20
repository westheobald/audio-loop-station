import { AudioTrack } from './audio-track';

export default class LatencyCorrection extends AudioTrack {
  originalBuffer: null | AudioBuffer;
  constructor(id: number, audioContext: AudioContext) {
    super(id, audioContext);
    this.originalBuffer = null;
  }
}
