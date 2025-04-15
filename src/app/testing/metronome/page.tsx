'use client';
import { LoopStation } from '@/audio/loop-station';
import { useEffect, useState } from 'react';

export default function MetronomeTest() {
  const [loopStation, setLoopStation]: [
    LoopStation | undefined,
    (loopStation: LoopStation) => void,
  ] = useState();
  const [bpm, setBpm] = useState(120);
  const [beatsPerBar, setBeatsPerBar] = useState(4);
  const [numberOfBars, setNumberOfBars] = useState(2);
  useEffect(() => {
    if (!loopStation) return;
    loopStation.metronome.stop();
    loopStation.adjustSong(bpm, beatsPerBar, numberOfBars);
  });
  function init() {
    if (!AudioContext) throw Error('');
    const audioContxt = new AudioContext();
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      setLoopStation(new LoopStation(audioContxt, stream, 120, 4, 2));
    });
  }
  return (
    <main>
      {!loopStation ? (
        <button onClick={init}>Start</button>
      ) : (
        <div className='flex flex-col gap-5 w-50 m-10'>
          <div>
            <label>Tempo</label>
            <input
              type='number'
              min='50'
              max='300'
              value={bpm}
              onChange={(e) => setBpm(+e.target.value)}
            />
          </div>
          <div>
            <label>Beats Per Bar</label>
            <input
              type='number'
              min='1'
              max='16'
              value={beatsPerBar}
              onChange={(e) => setBeatsPerBar(+e.target.value)}
            />
          </div>
          <div>
            <label>Number of Bars</label>
            <input
              type='number'
              min='1'
              max='32'
              value={numberOfBars}
              onChange={(e) => setNumberOfBars(+e.target.value)}
            />
          </div>
          <button
            onClick={() => {
              loopStation.metronome.play(
                loopStation.audioContext.currentTime,
                loopStation.loopLength,
                loopStation.audioContext.currentTime + loopStation.loopLength,
              );
            }}
          >
            Start Metronome
          </button>
          <button onClick={() => loopStation.metronome.stop()}>
            Stop Metronome
          </button>
        </div>
      )}
    </main>
  );
}
