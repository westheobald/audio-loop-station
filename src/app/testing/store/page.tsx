'use client';
import { LoopStation } from '@/audio/loop-station';
import { ChangeEvent, useState } from 'react';

export default function StoreAndLoadTest() {
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
  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || !loopStation) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const fileContent = event.target?.result;
      if (typeof fileContent === 'string') loopStation.load(fileContent);
    };
    reader.readAsText(file);
  }
  if (!loopStation) return <button onClick={init}>Start</button>;
  loopStation.latency = 50;
  loopStation.isCountIn = false;
  return (
    <div className='flex flex-col'>
      <button
        onClick={() => {
          loopStation.recordTrack(loopStation.audioTracks[0]);
        }}
      >
        Record 1
      </button>
      <button
        onClick={() => {
          loopStation.recordTrack(loopStation.audioTracks[1]);
        }}
      >
        Record 2
      </button>
      <button
        onClick={() => {
          loopStation.stopAll();
        }}
      >
        Stop
      </button>
      <button
        onClick={() => {
          loopStation.playAll();
        }}
      >
        Play
      </button>
      <button onClick={() => loopStation.store()}>Store</button>
      <input type='file' onChange={handleFileChange} />
    </div>
  );
}
