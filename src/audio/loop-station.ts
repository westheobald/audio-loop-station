import { AudioTrack } from "./audio-track";
import { Metronome } from "./metronome";

export class LoopStation {
  beatLength: number;
  barLength: number;
  loopLength: number;
  audioContext: AudioContext;
  inputStream: MediaStream;
  startTime: number;
  latency: number;
  metronome: Metronome;
  audioTracks: AudioTrack[];
  isPlaying: boolean;
  isRecording: boolean;
  isMetronome: boolean;
  isCountIn: boolean;

  constructor(
    audioContext: AudioContext,
    inputStream: MediaStream,
    bpm: number,
    beatsPerBar: number,
    numberOfBars: number,
  ) {
    this.beatLength = 1 / (bpm / 60);
    this.barLength = this.beatLength * beatsPerBar;
    this.loopLength = this.barLength * numberOfBars;

    this.audioContext = audioContext;
    this.inputStream = inputStream;

    this.startTime = audioContext.currentTime;

    this.latency = 0; // TODO: Set up latency

    this.metronome = new Metronome(
      -1,
      audioContext,
      this.beatLength,
      this.barLength,
      this.loopLength,
    );
    this.audioTracks = new Array(4).map(
      (_, i) => new AudioTrack(i, audioContext),
    );

    this.isPlaying = false;
    this.isRecording = false;
    this.isMetronome = true;
    this.isCountIn = true;
  }
  getNextLoop() {
    // get next start time for loop
  }
  adjustSong(bpm: number, beatsPerBar: number, numberOfBars: number) {
    this.beatLength = 1 / (bpm / 60);
    this.barLength = this.beatLength * beatsPerBar;
    this.loopLength = this.barLength * numberOfBars;
    this.metronome = new Metronome(
      -1,
      this.audioContext,
      this.beatLength,
      this.barLength,
      this.loopLength,
    );
  }
  playAll() {}
  stopAll() {}
  recordTrack() {}
  playTrack() {}
  stopTrack() {}
}
