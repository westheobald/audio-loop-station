import Queue from 'yocto-queue';

export class AudioTrack {
  id: number;
  audioContext: AudioContext;
  inputStream: MediaStream;
  buffer: AudioBuffer | undefined;
  gain: GainNode;
  pan: PannerNode;
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
        console.log(audio);
        console.log(
          `Recording finished. Wait Time: ${waitTime}, LoopLength: ${loopLength}, Latency: ${latency}`,
        );
        const newBuffer = this.slice(
          waitTime + latency / 1000,
          loopLength,
          audio,
        );
        console.log(newBuffer);
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
}
