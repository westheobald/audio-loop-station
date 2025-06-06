import { AudioTrack } from './audio-track';
import LoopInfo from './loop-info';
import { Metronome } from './metronome';

interface storedAudioTrack {
  id: number;
  buffer?: number[][];
  originalBuffer?: number[][];
  sliceMs: number;
  gain: number;
  pan: number;
  reversed: boolean;
}
interface storedLoop {
  loopInfo: LoopInfo;
  audioTracks: storedAudioTrack[];
}
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
    this.metronome.gain.gain.value = 0.5;

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
    metronome.gain.gain.value = 0.5;
    for (const audioTrack of this.audioTracks) {
      audioTrack.removeBuffer();
    }
    this.loopInfo = loopInfo;
    this.metronome = metronome;
  }
  start() {
    this.startTime = this.audioContext.currentTime;
    if (this.isMetronome) {
      if (this.isCountIn) {
        this.startTime = this.metronome.countIn(this.startTime);
      }
      this.metronome.scheduleLoop(this.startTime, this.loopInfo.loopLength);
    }
    this.isRunning = true;
    return this.startTime;
  }
  playAll(recordTrack?: AudioTrack) {
    let startTime = this.audioContext.currentTime;
    if (!this.isRunning) startTime = this.start();
    for (const audioTrack of this.audioTracks) {
      if (!audioTrack.buffer || audioTrack === recordTrack) continue;
      audioTrack.play(
        startTime,
        this.loopInfo.loopLength,
        this.getNextLoopStart(),
      );
    }
    return startTime;
  }
  stopAll() {
    for (const audioTrack of this.audioTracks) {
      audioTrack.stop();
    }
    this.metronome.stop();
    this.isRunning = false;
  }
  async recordTrack(audioTrack: AudioTrack) {
    const startTime = this.isRunning
      ? this.getNextLoopStart()
      : this.playAll(audioTrack);
    this.isRecording = true;
    await audioTrack.record(startTime, this.loopInfo.loopLength, this.latency);
    this.isRecording = false;
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
  store() {
    const fileObject = {
      loopInfo: this.loopInfo,
      audioTracks: this.audioTracks.map((audioTrack) =>
        buildAudioObject(audioTrack),
      ),
    };
    const blob = new Blob([JSON.stringify(fileObject)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const fileName = prompt('Name of loop:');
    if (!fileName) return;
    a.download = fileName;
    document.body.append(a);
    a.click();

    function buildAudioObject(audioTrack: AudioTrack): storedAudioTrack {
      const file: storedAudioTrack = {
        id: audioTrack.id,
        buffer: undefined,
        gain: 1,
        pan: 0,
        sliceMs: 0,
        reversed: false,
      };
      function getBuffer(buffer: AudioBuffer) {
        const data = [];
        for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
          data.push(Array.from(buffer.getChannelData(channel)));
        }
        return data;
      }
      if (audioTrack.originalBuffer) {
        file.buffer = getBuffer(audioTrack.originalBuffer);
        file.gain = audioTrack.gain.gain.value;
        file.pan = audioTrack.pan.pan.value;
        file.sliceMs = audioTrack.sliceMs;
        file.reversed = audioTrack.reversed;
      }
      return file;
    }
  }
  load(file: string) {
    const json: storedLoop = JSON.parse(file);
    this.stopAll();
    this.updateLooper(
      json.loopInfo.bpm,
      json.loopInfo.beatsPerBar,
      json.loopInfo.numberOfBars,
      json.loopInfo.countInLength,
    );
    this.audioTracks = json.audioTracks.map((storedAudioTrack) => {
      const newAudioTrack = new AudioTrack(
        storedAudioTrack.id,
        this.audioContext,
        this.inputStream,
      );

      const audioData = storedAudioTrack.buffer;
      if (audioData) {
        const floatData = audioData.map(
          (arr: number[]) => new Float32Array(arr),
        );
        const buffer = this.audioContext.createBuffer(
          floatData.length,
          floatData[0].length,
          this.audioContext.sampleRate,
        );
        for (let channel = 0; channel < floatData.length; channel++) {
          buffer.copyToChannel(floatData[channel], channel);
        }
        newAudioTrack.originalBuffer = buffer;
        newAudioTrack.buffer = buffer;
      }

      if (storedAudioTrack.gain)
        newAudioTrack.changeGain(storedAudioTrack.gain);
      if (storedAudioTrack.pan) newAudioTrack.changePan(storedAudioTrack.pan);
      if (storedAudioTrack.sliceMs)
        newAudioTrack.changeSlice(storedAudioTrack.sliceMs);
      if (storedAudioTrack.reversed) newAudioTrack.changeReverse();
      newAudioTrack.reversed = storedAudioTrack.reversed;

      return newAudioTrack;
    });
  }
  changeReverse(audioTrack: AudioTrack) {
    audioTrack.changeReverse();
    this.stopTrack(audioTrack);
    this.playTrack(audioTrack);
  }
}
