export default class LooperState {
  isPlaying: boolean;
  isRecording: number;
  isMetronome: boolean;
  isCountIn: boolean;
  constructor({
    isPlaying,
    isRecording,
    isMetronome,
    isCountIn,
  }: {
    isPlaying: boolean;
    isRecording: number;
    isMetronome: boolean;
    isCountIn: boolean;
  }) {
    this.isPlaying = isPlaying;
    this.isRecording = isRecording;
    this.isMetronome = isMetronome;
    this.isCountIn = isCountIn;
  }
}
