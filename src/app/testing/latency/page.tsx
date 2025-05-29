'use client';
import LatencyCorrection from '@/audio/latency-correction';
import { LoopStation } from '@/audio/loop-station';
import { useState } from 'react';

export default function LatencyTest() {
  const [loopStation, setLoopStation]: [
    LoopStation | undefined,
    (loopStation: LoopStation) => void,
  ] = useState();
  const [latencyTrack, setLatencyTrack]: [
    LatencyCorrection | undefined,
    (track: LatencyCorrection) => void,
  ] = useState();
  function init() {
    if (!AudioContext) throw Error('');
    const audioContxt = new AudioContext();
    navigator.mediaDevices.getUserMedia({  }).then((stream) => {
      setLoopStation(new LoopStation(audioContxt, stream));
      setLatencyTrack(new LatencyCorrection(-1, audioContxt, stream));
    });
  }
  if (!loopStation || !latencyTrack)
    return <button onClick={init}>Start</button>;
  return (
    <div>
      <button
        onClick={() => {
          loopStation.recordTrack(latencyTrack);
        }}
      >
        Record
      </button>
      <button
        onClick={() => {
          loopStation.stopTrack(latencyTrack);
          loopStation.metronome.stop();
          loopStation.isRunning = false;
        }}
      >
        Stop
      </button>
      Latency
      <input
        type='number'
        min='0'
        max='1000'
        step={10}
        defaultValue={0}
        onChange={(e) => {
          if (!latencyTrack.originalBuffer) return;
          const newBuffer = latencyTrack.sliceOriginal(
            +e.target.value / 1000,
            loopStation.loopInfo.loopLength,
          );
          latencyTrack.stop();
          latencyTrack.buffer = newBuffer;
          latencyTrack.play(
            loopStation.audioContext.currentTime,
            loopStation.loopInfo.loopLength,
            loopStation.getNextLoopStart(),
          );
          loopStation.latency = +e.target.value;
        }}
      />
    </div>
  );
}
