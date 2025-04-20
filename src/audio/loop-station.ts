import { AudioTrack } from './audio-track';
import LoopInfo from './loop-info';
import { Metronome } from './metronome';
import LooperState from './looper-state';

export class LoopStation {
  audioContext: AudioContext;
  inputStream: MediaStream;
  loopInfo: LoopInfo;
  startTime: number;
  latency: number;
  metronome: Metronome;
  audioTracks: AudioTrack[];
  looperState: LooperState;

  constructor(audioContext: AudioContext, inputStream: MediaStream) {
    this.audioContext = audioContext;
    this.inputStream = inputStream;

    this.loopInfo = new LoopInfo({
      bpm: 100,
      beatsPerBar: 4,
      numberOfBars: 2,
      countInLength: 1,
      sampleRate: audioContext.sampleRate,
    });
    this.metronome = new Metronome(audioContext, this.loopInfo);

    this.latency = 0;
    // this.latencyTrack = new AudioTrack(-1, audioContext);

    this.audioTracks = new Array(4).map(
      (_, i) => new AudioTrack(i + 1, audioContext),
    );
    this.startTime = audioContext.currentTime;

    this.looperState = new LooperState({
      isPlaying: false,
      isRecording: 0,
      isMetronome: true,
      isCountIn: true,
    });
  }
  getNextLoop() {}
  updateLooper(
    bpm: number,
    beatsPerBar: number,
    numberOfBars: number,
    countInLength: number,
  ) {
    const loopInfo = new LoopInfo({
      bpm,
      beatsPerBar,
      numberOfBars,
      countInLength,
      sampleRate: this.audioContext.sampleRate,
    });
    const metronome = new Metronome(this.audioContext, loopInfo);
    this.loopInfo = loopInfo;
    this.metronome = metronome;
    // NOTE: If implementing audio track tempo changes, alter playback speeds
    // to match new loopInfo
    // Otherwise make changes go on some kind of confirm that will delete the
    // already recorder tracks
  }
  playAll() {}
  stopAll() {}
  recordTrack() {}
  playTrack() {}
  stopTrack() {}
}
