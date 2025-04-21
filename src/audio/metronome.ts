import { AudioTrack } from './audio-track';
import LoopInfo from './loop-info';

const accentFrequency = 700;
const normalFrequency = 500;

export class Metronome extends AudioTrack {
  countIn: (startTime: number) => void;
  constructor(
    audioContext: AudioContext,
    { loopLength, beatLength, barLength, countInLength, beatsPerBar }: LoopInfo,
  ) {
    super(0, audioContext);
    this.buffer = this.createMetronome(loopLength, beatLength, beatsPerBar);
    this.countIn = (startTime: number) => {
      const source = this.createSourceNode();
      source.start(startTime, 0, barLength * countInLength);
      this.sourceQueue.enqueue(source);
      source.addEventListener(
        'ended',
        () => this.removeFinishedSource(source),
        {
          once: true,
        },
      );
    };
  }
  createMetronome(loopLength: number, beatLength: number, beatsPerBar: number) {
    const sampleRate = this.audioContext.sampleRate;
    const samples = Math.floor(loopLength * sampleRate);
    const buffer = this.audioContext.createBuffer(1, samples, sampleRate);
    const channelData = buffer.getChannelData(0);
    const noiseSamples = 0.03 * sampleRate;
    const silenceSamples = (beatLength - 0.03) * sampleRate;

    for (
      let currentSample = 0, beat = 0;
      currentSample < samples;
      currentSample++, beat = (beat + 1) % beatsPerBar
    ) {
      for (let i = 0; i < noiseSamples && currentSample < samples; i++) {
        const freq = !beat ? accentFrequency : normalFrequency;
        channelData[currentSample] = Math.sin(
          (2 * Math.PI * freq * i) / sampleRate,
        );
        currentSample++;
      }
      for (let i = 0; i < silenceSamples && currentSample < samples; i++) {
        channelData[currentSample] = 0;
        currentSample++;
      }
    }
    return buffer;
  }
}
