import Queue from 'yocto-queue';

export class AudioTrack {
  id: number;
  audioContext: AudioContext;
  inputStream: MediaStream;
  buffer: AudioBuffer | undefined;
  originalBuffer: AudioBuffer | undefined;
  sliceMs: number;
  gain: GainNode;
  pan: StereoPannerNode;
  reversed: boolean;
  sourceQueue: Queue<AudioBufferSourceNode>;
  intervalId: ReturnType<typeof setInterval> | null;
  startTime: number;
  loopLength: number;
  nextLoopStart: number;
  constructor(
    id: number,
    audioContext: AudioContext,
    inputStream: MediaStream,
  ) {
    this.id = id;
    this.audioContext = audioContext;
    this.inputStream = inputStream;
    this.gain = audioContext.createGain();
    this.pan = audioContext.createStereoPanner();
    this.gain.connect(this.pan);
    this.pan.connect(audioContext.destination);
    this.sliceMs = 0;
    this.reversed = false;
    this.sourceQueue = new Queue();
    this.intervalId = null;
    this.startTime = 0;
    this.loopLength = 0;
    this.nextLoopStart = 0;
  }
  removeBuffer() {
    this.stop();
    this.buffer = undefined;
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
    if (!this.buffer) return;
    this.startTime = startTime;
    this.loopLength = loopLength;
    this.nextLoopStart = nextLoopStart;
    this.scheduleSingle(startTime, nextLoopStart);
    this.scheduleLoop(nextLoopStart, loopLength);
  }
  stop() {
    const previousGain = this.gain.gain.value;
    this.gain.gain.value = 0;
    if (this.intervalId) clearInterval(this.intervalId);
    for (const node of this.sourceQueue.drain()) {
      try {
        node.stop(); // <--- make sure this is here
      } catch (e) {
        console.warn(`Node stopped: ${e}`);
      }
      node.disconnect();
    }
    this.intervalId = null;
    this.gain.gain.value = previousGain;
  }
  async record(
    startTime: number,
    loopLength: number,
    latency: number,
  ): Promise<AudioBuffer> {
    return new Promise((res) => {
      // record audio track (starting at next loop) then begin playing loop
      const recorder = new MediaRecorder(this.inputStream);
      if (this.sourceQueue.size) this.stop();
      const waitTime = startTime - this.audioContext.currentTime;
      recorder.start();

      setTimeout(
        () => recorder.stop(),
        (waitTime + loopLength) * 1000 + latency,
      );

      recorder.addEventListener('dataavailable', async (ev) => {
        const array = await ev.data.arrayBuffer();
        const audio = await this.audioContext.decodeAudioData(array);
        const newBuffer = this.slice(
          waitTime + latency / 1000,
          loopLength,
          audio,
        );
        this.originalBuffer = newBuffer;
        this.buffer = newBuffer;
        this.sliceMs = 0;
        this.reversed = false;
        res(newBuffer);
      });
    });
  }
  scheduleLoop(startTime: number, loopLength: number) {
    if (this.intervalId) {
      throw Error(`Loop already in progress for track: ${this.id}`);
    }

    let nextLoopStart = startTime;
    const loop = () => {
      const source = this.createSourceNode();
      source.addEventListener('ended', () => this.removeFinishedSource(), {
        once: true,
      });
      this.nextLoopStart = nextLoopStart;
      source.start(nextLoopStart);
      this.sourceQueue.enqueue(source);
      nextLoopStart += loopLength;
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

    source.addEventListener('ended', () => this.removeFinishedSource(), {
      once: true,
    });

    source.start(startTime, offset);
    this.sourceQueue.enqueue(source);
  }
  removeFinishedSource() {
    this.sourceQueue.dequeue();
  }
  slice(offset: number, length: number, buffer: AudioBuffer) {
    // offset in seconds
    const data: Float32Array[] = [];
    const sampleRate = this.audioContext.sampleRate;
    const startSample = offset * sampleRate;
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      data.push(channelData.slice(startSample));
    }
    const newBuffer = this.audioContext.createBuffer(
      buffer.numberOfChannels,
      Math.floor(length * sampleRate), // TODO: Check length and end parts of recordings
      sampleRate,
    );
    for (let channel = 0; channel < data.length; channel++) {
      newBuffer.copyToChannel(data[channel], channel);
    }
    return newBuffer;
  }
  sliceLeft(offset: number, length: number, buffer: AudioBuffer) {
    const data: Float32Array[] = [];
    const sampleRate = this.audioContext.sampleRate;
    const startSample = Math.abs(offset * sampleRate);
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      const newData = new Float32Array(channelData.length).fill(0);
      for (let i = startSample, j = 0; i < channelData.length; i++, j++) {
        newData[i] = channelData[j];
      }
      data.push(newData);
    }
    const newBuffer = this.audioContext.createBuffer(
      buffer.numberOfChannels,
      Math.floor(length * sampleRate), // TODO: Check length and end parts of recordings
      sampleRate,
    );
    for (let channel = 0; channel < data.length; channel++) {
      newBuffer.copyToChannel(data[channel], channel);
    }
    return newBuffer;
  }
  changePan(val: number) {
    // -1 is panned hard left, 1 is panned hard right, 0 is center pan
    if (val < -1 || val > 1) {
      throw Error('Pan value must be within -1 an 1 (inclusive).');
    }
    this.pan.pan.value = val;
  }
  changeGain(val: number) {
    this.gain.gain.value = val;
  }
  changeSlice(val: number) {
    if (!this.originalBuffer) return;
    if (val >= 0) {
      this.buffer = this.slice(
        val / 1000,
        this.loopLength,
        this.originalBuffer,
      );
      if (this.reversed) this.buffer = this.reversedBuffer();
    } else {
      this.buffer = this.sliceLeft(
        val / 1000,
        this.loopLength,
        this.originalBuffer,
      );
      if (this.reversed) this.buffer = this.reversedBuffer();
    }
    this.sliceMs = val;
  }
  changeReverse() {
    if (!this.buffer) return;
    this.reversed = !this.reversed;
    this.buffer = this.reversedBuffer();
  }
  reversedBuffer() {
    if (!this.buffer) {
      throw Error(`No buffer found for track ${this.id} to reverse`);
    }
    const data = [];
    for (let channel = 0; channel < this.buffer.numberOfChannels; channel++) {
      const audio = this.buffer.getChannelData(channel);
      data.push(audio.reverse());
    }
    const newBuffer = this.audioContext.createBuffer(
      this.buffer.numberOfChannels,
      this.buffer.length,
      this.buffer.sampleRate,
    );
    for (let channel = 0; channel < this.buffer.numberOfChannels; channel++) {
      newBuffer.copyToChannel(data[channel], channel);
    }
    return newBuffer;
  }
}
