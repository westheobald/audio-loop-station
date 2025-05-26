import Queue from 'yocto-queue';

export class AudioTrack {
  id: number;
  audioContext: AudioContext;
  inputStream: MediaStream;
  buffer: AudioBuffer | undefined;
  gain: GainNode;
  pan: StereoPannerNode;
  pitch: number;
  reversed: boolean;
  sourceQueue: Queue<AudioBufferSourceNode>;
  intervalId: ReturnType<typeof setInterval> | null;
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
    this.pitch = 0;
    this.reversed = false;
    this.sourceQueue = new Queue();
    this.intervalId = null;
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
    source.detune.value = this.pitch;
    return source;
  }
  play(startTime: number, loopLength: number, nextLoopStart: number) {
    if (!this.buffer) return;
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
        this.buffer = newBuffer;
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
  changePitch(semitones: number) {
    if (semitones < -12 || semitones > 12) {
      throw Error('Number of semitones must be within -12 and 12');
    }
    this.pitch = semitones * 100;

    // change pitch for any already queued source nodes (changing pitch during playback)
    for (const source of this.sourceQueue) {
      source.detune.value = this.pitch;
    }
  }
  changeReverse() {
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
