'use client';
import LatencyCorrection from '@/audio/latency-correction';
import { LoopStation } from '@/audio/loop-station';
import { useState, useEffect } from 'react';

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
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      setLoopStation(new LoopStation(audioContxt, stream));
      setLatencyTrack(new LatencyCorrection(-1, audioContxt));
    });
  }
  if (!loopStation) return <button onClick={init}>Start</button>;
  return (
    <div>
      <button>Record</button>
      <button>Playback</button>
      <div>Slider</div>
    </div>
  );
}
