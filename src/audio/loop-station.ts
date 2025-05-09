import { AudioTrack } from './audio-track';
import LoopInfo from './loop-info';
import { Metronome } from './metronome';

export class LoopStation {
  audioContext: AudioContext;
  inputStream: MediaStream;
  loopInfo: LoopInfo;
  startTime: number;
  latency: number;
  metronome: Metronome;
  audioTracks: AudioTrack[];
  isRunning: boolean;
  isRecording: boolean;
  isMetronome: boolean;
  isCountIn: boolean;

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
    this.metronome = new Metronome(audioContext, inputStream, this.loopInfo);

    this.latency = 0;

    this.audioTracks = new Array(4)
      .fill(0)
      .map((_, i) => new AudioTrack(i + 1, audioContext, inputStream));
    this.startTime = audioContext.currentTime;

    this.isRunning = false;
    this.isRecording = false;
    this.isMetronome = true;
    this.isCountIn = true;
  }
  getNextLoopStart() {
    // get the next start time for the loop
    const currentTime = this.audioContext.currentTime;
    if (currentTime <= this.startTime) return this.startTime;
    const currentLoopsCompleted = Math.floor(
      (currentTime - this.startTime) / this.loopInfo.loopLength,
    );
    const nextLoop =
      (currentLoopsCompleted + 1) * this.loopInfo.loopLength + this.startTime;
    return nextLoop;
  }
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
    const metronome = new Metronome(
      this.audioContext,
      this.inputStream,
      loopInfo,
    );
    this.loopInfo = loopInfo;
    this.metronome = metronome;
    // NOTE: If implementing audio track tempo changes, alter playback speeds
    // to match new loopInfo
    // Otherwise make changes go on some kind of confirm that will delete the
    // already recorder tracks
  }
  start() {
    this.startTime = this.audioContext.currentTime;
    if (this.isCountIn) this.startTime = this.metronome.countIn(this.startTime);
    this.metronome.play(
      this.startTime,
      this.loopInfo.loopLength,
      this.getNextLoopStart(),
    );
    return this.startTime;
  }
  playAll() {
    if (this.isRunning) this.stopAll();
    const now = this.audioContext.currentTime;
    const startTime = this.isRunning ? now : this.start();
    const nextLoopStart = this.getNextLoopStart();

    for (const track of this.audioTracks) {
      if (track.buffer) 
      track.play(startTime, this.loopInfo.loopLength, nextLoopStart);
    }
    this.isRunning = true;
  }

  stopAll() {
    for (const track of this.audioTracks) {
      track.stop();
    }
    this.metronome.stop();
    this.isRunning = false;
  }

  async recordTrack(audioTrack: AudioTrack) {
    const startTime = this.isRunning ? this.getNextLoopStart() : this.start();
    await audioTrack.record(startTime, this.loopInfo.loopLength, this.latency);
    audioTrack.play(
      this.audioContext.currentTime,
      this.loopInfo.loopLength,
      this.getNextLoopStart(),
    );
  }
  playTrack(audioTrack: AudioTrack) {
    let startTime = this.audioContext.currentTime;
    if (!this.isRunning) startTime = this.start();
    audioTrack.play(
      startTime,
      this.loopInfo.loopLength,
      this.getNextLoopStart(),
    );
  }
  stopTrack(audioTrack: AudioTrack) {
    audioTrack.stop();
  }
}
