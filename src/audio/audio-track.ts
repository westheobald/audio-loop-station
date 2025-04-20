import Queue from 'yocto-queue';

export class AudioTrack {
  id: number;
  audioContext: AudioContext;
  buffer: AudioBuffer | undefined;
  gain: GainNode;
  pan: PannerNode;
  sourceQueue: Queue<AudioBufferSourceNode>;
  intervalId: ReturnType<typeof setInterval> | null;
  constructor(id: number, audioContext: AudioContext) {
    this.id = id;
    this.audioContext = audioContext;
    this.gain = audioContext.createGain();
    this.pan = audioContext.createPanner();
    this.gain.connect(this.pan);
    this.pan.connect(audioContext.destination);
    this.sourceQueue = new Queue();
    this.intervalId = null;
  }
  updateBuffer(buffer: AudioBuffer) {
    this.buffer = buffer;
  }
  createSourceNode() {
    if (!this.buffer) throw Error(`No buffer found for track: ${this.id}`);
    const source = this.audioContext.createBufferSource();
    source.buffer = this.buffer;
    source.connect(this.gain);
    return source;
  }
  play(startTime: number, loopLength: number, nextLoopStart: number) {
    this.scheduleSingle(startTime, nextLoopStart);
    this.scheduleLoop(nextLoopStart, loopLength);
  }
  stop() {
    const previousGain = this.gain.gain.value;
    this.gain.gain.value = 0;
    if (this.intervalId) clearInterval(this.intervalId);
    for (const node of this.sourceQueue.drain()) node.disconnect();
    this.intervalId = null;
    this.gain.gain.value = previousGain;
  }
  scheduleLoop(startTime: number, loopLength: number) {
    if (this.intervalId) {
      throw Error(`Loop already in progress for track: ${this.id}`);
    }

    let nextLoopStart = startTime;
    const loop = () => {
      const source = this.createSourceNode();
      source.start(nextLoopStart);
      this.sourceQueue.enqueue(source);
      nextLoopStart += loopLength;

      source.addEventListener(
        'ended',
        () => this.removeFinishedSource(source),
        { once: true },
      );
    };

    loop();
    loop(); // will stay one queued ahead of playback
    this.intervalId = setInterval(loop, loopLength * 1000);
  }
  scheduleSingle(startTime: number, nextLoopStart: number) {
    const source = this.createSourceNode();
    if (!source.buffer) throw Error(`No buffer found for track: ${this.id}`);
    let offset = source.buffer.duration - (nextLoopStart - startTime);
    if (offset < 0) offset = 0; // protect against floating point math

    source.start(startTime, offset);
    this.sourceQueue.enqueue(source);
    source.addEventListener('ended', () => this.removeFinishedSource(source), {
      once: true,
    });
  }
  removeFinishedSource(source: AudioBufferSourceNode) {
    const finishedSource = this.sourceQueue.dequeue();
    if (finishedSource !== source) {
      throw Error(
        `Source queue error for track: ${this.id}. Dequeue source does not match.`,
      );
    }
  }
  slice(offset: number, buffer?: AudioBuffer) {
    if (!buffer && this.buffer) buffer = this.buffer;
    if (!buffer) {
      throw Error(`No audio buffer found to slice on track: ${this.id}`);
    }

    const data: Float32Array[] = [];
    const sampleRate = this.audioContext.sampleRate;
    const startSample = (offset / 1000) * sampleRate;
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      data.push(channelData.slice(startSample));
    }
    const newBuffer = this.audioContext.createBuffer(
      buffer.numberOfChannels,
      data[0].length,
      sampleRate,
    );
    for (let channel = 0; channel < data.length; channel++) {
      newBuffer.copyToChannel(data[channel], channel);
    }
    return newBuffer;
  }
}
