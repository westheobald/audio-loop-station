'use client';
import { LoopStation } from '@/audio/loop-station';
import { useState } from 'react';

export default function LatencyTest() {
  const [loopStation, setLoopStation]: [
    LoopStation | undefined,
    (loopStation: LoopStation) => void,
  ] = useState();
  function init() {
    if (!AudioContext) throw Error('');
    const audioContxt = new AudioContext();
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      setLoopStation(new LoopStation(audioContxt, stream));
    });
  }
  if (!loopStation) return <button onClick={init}>Start</button>;
  const audioTrack = loopStation.audioTracks[0];
  return (
    <div>
      <button onClick={() => loopStation.recordTrack(audioTrack)}>
        Record
      </button>
      <button onClick={() => loopStation.playTrack(audioTrack)}>Play</button>
      <button
        onClick={() => {
          loopStation.stopTrack(audioTrack);
          loopStation.metronome.stop();
          loopStation.isRunning = false;
        }}
      >
        Stop
      </button>
    </div>
  );
}
