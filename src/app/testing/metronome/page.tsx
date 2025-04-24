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
  const [countInLength, setCountInLength] = useState(1);
  useEffect(() => {
    if (!loopStation) return;
    loopStation.metronome.stop();
    loopStation.updateLooper(bpm, beatsPerBar, numberOfBars, countInLength);
  }, [bpm, beatsPerBar, numberOfBars, loopStation, countInLength]);
  function init() {
    if (!AudioContext) throw Error('');
    const audioContxt = new AudioContext();
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      setLoopStation(new LoopStation(audioContxt, stream));
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
              min={50}
              max={300}
              value={bpm}
              onChange={(e) => {
                const tempo = +e.target.value;
                setBpm(tempo);
              }}
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
          <div>
            <label>Count In Length</label>
            <input
              type='number'
              min={1}
              max={4}
              value={countInLength}
              onChange={(e) => setCountInLength(+e.target.value)}
            />
          </div>
          <button
            onClick={() => {
              loopStation.metronome.countIn(0);
            }}
          >
            Test Metronome Count In
          </button>
          <button
            onClick={() => {
              loopStation.metronome.play(
                loopStation.audioContext.currentTime,
                loopStation.loopInfo.loopLength,
                loopStation.audioContext.currentTime +
                  loopStation.loopInfo.loopLength,
              );
            }}
          >
            Test Metronome Loop
          </button>
          <button onClick={() => loopStation.metronome.stop()}>
            Stop Metronome
          </button>
        </div>
      )}
    </main>
  );
}
