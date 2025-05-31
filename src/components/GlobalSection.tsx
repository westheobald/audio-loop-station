'use client';
import { useLoop } from '@/contexts/LoopContext';
import { ChangeEvent, useState } from 'react';
import { ArrowDownToLine, Play, Pause, AlarmClockCheck, Drum } from "lucide-react";
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
  const [selectedFileName, setSelectedFileName] = useState("");

  if (!isInitialized || !loopStation) return null;

  async function handleLoad(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || !loopStation) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const fileContent = event.target?.result;
      if (typeof fileContent === 'string') {
        loopStation.load(fileContent);
        console.log(loopStation.audioTracks);
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
          className='border rounded p-2 flex justify-center items-center hover:bg-neutral hover:text-blue-400 transition'
        >
          <Drum className='w-5 h-5' color={isMetronome ? "#ffffff" : "#7a7a7a"} />
        </button>
        <button
          disabled={isPlaying}
          onClick={() => {
            if (!loopStation) return;
            loopStation.isCountIn = !isCountIn;
            setIsCountIn(!isCountIn);
          }}
          className='border rounded p-2 flex justify-center items-center hover:bg-neutral hover:text-blue-400 transition'
        
        >
          <AlarmClockCheck className='w-5 h-5' color={isCountIn ? "#ffffff" : "#7a7a7a"} />

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
          className='border rounded p-2 flex justify-center items-center text-sm hover:bg-neutral hover:text-blue-400 transition'
        >
          {isPlaying ? <Pause className='w-5 h-5' /> : <Play className='w-5 h-5'/>}
        </button>

        <button 
        onClick={() => loopStation.store()}
        className='border rounded p-2 flex justify-center items-center text-sm hover:bg-neutral hover:text-blue-400 transition'
        >
        <ArrowDownToLine className='w-5 h-5'/>
        </button>
      </div>
      <div className="flex flex-col items-center justify-center mt-4">
          <button
            onClick={() => document.getElementById('fileInput')?.click()}
            className="border px-4 py-2 rounded text-sm hover:bg-accent hover:text-blue-400 transition"
          >
            Choose File
          </button>
          <span className="mt-2 text-xs text-neutral-400">
            {selectedFileName || "No file chosen"}
          </span>
        </div>
        <input
          id="fileInput"
          type="file"
          onChange={(e) => {
            handleLoad(e);
            if (e.target.files?.length) {
              setSelectedFileName(e.target.files[0].name);
            }
          }}
          className="hidden"
        />
    </section>
  );
}
