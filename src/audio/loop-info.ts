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
    this.countInLength = this.validateNumber(
      countInLength,
      1,
      numberOfBars,
      'Count in length',
    );
    this.beatLength = 1 / (this.validateNumber(bpm, 50, 300, 'Tempo') / 60);
    this.barLength =
      this.validateNumber(beatsPerBar, 1, 16, 'Beats per bar') *
      this.beatLength;
    const loopLength =
      this.barLength *
      this.validateNumber(numberOfBars, 1, 32, 'Number of bars');

    sampleRate = this.validateSampleRate(sampleRate);
    // remove any fractional amount of sample to get
    const samples = Math.floor(loopLength * sampleRate);
    this.loopLength = samples / sampleRate;
  }
  validateSampleRate(rate: number) {
    const validSampleRates = [
      8000, 11025, 16000, 22050, 44100, 48000, 88200, 96000, 176400, 192000,
      352800, 384000,
    ];
    if (validSampleRates.includes(rate)) return rate;
    throw Error(`Invalid sample rate (recieved: ${rate}).`);
  }
  validateNumber(num: number, min: number, max: number, description: string) {
    if (!Number.isInteger(num)) {
      throw Error(`${description} must be an integer (revieved: ${num}).`);
    }
    if (num < min || num > max) {
      throw Error(
        `${description} must be between ${min} and ${max} (revieve: ${num}).`,
      );
    }
    return num;
  }
}
