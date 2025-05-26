'use client';
import { useLoop } from '@/contexts/LoopContext';
import { ChangeEvent, useState } from 'react';

export default function GlobalSection() {
  const {
    loopStation,
    isInitialized,
    isPlaying,
    setIsPlaying,
    setBpm,
    setNumberOfBars,
    setBeatsPerBar,
    setCountInLength,
    audioTrackGains,
    setAudioTrackGains,
  } = useLoop();
  const [isMetronome, setIsMetronome] = useState(true);
  const [isCountIn, setIsCountIn] = useState(true);

  if (!isInitialized || !loopStation) return null;

  async function handleLoad(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || !loopStation) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const fileContent = event.target?.result;
      if (typeof fileContent === 'string') {
        loopStation.load(fileContent);
        setBpm(loopStation.loopInfo.bpm);
        setNumberOfBars(loopStation.loopInfo.numberOfBars);
        setBeatsPerBar(loopStation.loopInfo.beatsPerBar);
        setCountInLength(loopStation.loopInfo.countInLength);
        loopStation.audioTracks.forEach((audioTrack, i) => {
          audioTrackGains[i] = +audioTrack.gain.gain.value * 100;
        });
        setAudioTrackGains([...audioTrackGains]);
      }
    };
    reader.readAsText(file);
  }

  return (
    <section className='flex flex-col gap-2'>
      <div className='grid grid-cols-2 gap-2'>
        {/* Controls metronome */}
        <button
          onClick={() => {
            if (!loopStation) return;
            if (isPlaying && loopStation.isMetronome) {
              loopStation.metronome.stop();
            }
            loopStation.isMetronome = !isMetronome;
            setIsMetronome(!isMetronome);
          }}
          className='border rounded py-1 text-sm hover:bg-accent hover:text-black transition'
        >
          {isMetronome ? 'Disable Metronome' : 'Enable Metronome'}
        </button>
        <button
          disabled={isPlaying}
          onClick={() => {
            if (!loopStation) return;
            loopStation.isCountIn = !isCountIn;
            setIsCountIn(!isCountIn);
          }}
          className='border rounded py-1 text-sm hover:bg-accent hover:text-black transition'
        >
          {isCountIn ? 'Disable Count In' : 'Enable Count In'}
        </button>

        {/* Controls loop playback */}
        <button
          onClick={() => {
            if (!isPlaying) {
              loopStation.playAll();
            } else {
              loopStation.stopAll();
            }
            setIsPlaying(!isPlaying);
          }}
          className='border rounded py-1 text-sm hover:bg-accent hover:text-black transition'
        >
          {isPlaying ? 'Stop' : 'Play'}
        </button>
        <button onClick={() => loopStation.store()}>Store Loop</button>
        <label>Load Loop</label>
        <input type='file' onChange={handleLoad} />
      </div>
    </section>
  );
}

