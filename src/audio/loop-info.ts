export default class LoopInfo {
  loopLength: number;
  barLength: number;
  beatLength: number;
  countInLength: number;
  constructor({
    bpm,
    beatsPerBar,
    numberOfBars,
    countInLength,
    sampleRate,
  }: {
    bpm: number;
    beatsPerBar: number;
    numberOfBars: number;
    countInLength: number;
    sampleRate: number;
  }) {
    this.countInLength = countInLength;
    this.beatLength = 1 / (bpm / 60);
    this.barLength = beatsPerBar * this.beatLength;
    const loopLength = this.barLength * numberOfBars;

    // remove any fractional amount of sample to get
    const samples = Math.floor(loopLength * sampleRate);

    this.loopLength = samples / sampleRate;
  }
}
