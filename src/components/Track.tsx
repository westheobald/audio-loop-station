'use client';

import { useState } from 'react';
import { Slider } from 'primereact/slider';
import Led from './Led';
import { AudioTrack } from '@/audio/audio-track';
import TrackSettingsModal from './TrackSettingsModal';
import { useLoop } from '@/contexts/LoopContext';
import { Settings } from "lucide-react";

export default function Track({
  index,
  track,
  i,
}: {
  index: number;
  track: AudioTrack;
  i: number;
}) {
  const { loopStation, setIsPlaying, audioTrackGains, setAudioTrackGains } =
    useLoop();
  const level = audioTrackGains[i];
  const [muted, setMuted] = useState(false);
  const [previousGain, setPreviousGain] = useState(track.gain.gain.value * 100);
  const [showSettings, setShowSettings] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const handleGainChange = (value: number) => {
    audioTrackGains[i] = value;
    setAudioTrackGains([...audioTrackGains]);
    track.changeGain(value / 100);
  };

  const handleRecord = async () => {
    if (!loopStation || loopStation.isRecording) return;
    setIsRecording(true);
    setIsPlaying(true);
    await loopStation.recordTrack(track);
    setIsRecording(false);
  };

  return (
    <div className='flex flex-col items-center gap-2 px-2'>
      {/* Slider for track levels */}
      <Led color='red-500' />
      <Slider
        value={level}
        onChange={(e) =>
          handleGainChange(Array.isArray(e.value) ? e.value[0] : e.value)
        }
        orientation='vertical'
        style={{ width: '1.5rem' }}
      />

      {/* Turns LED color red when track is muted */}
      <div className='flex flex-col items-center'>
        <button
          onClick={() => {
            if (muted) handleGainChange(previousGain);
            else {
              setPreviousGain(level);
              handleGainChange(0);
            }
            setMuted(!muted);
          }}
          className={`w-8 h-8 text-sm font-medium rounded shadow border hover:bg-white
                    ${muted ? 'bg-black text-white' : 'bg-neutral-300 text-black'}`}
        >
          {index}
        </button>
        <button
          onClick={handleRecord}
          disabled={isRecording}
            className={`w-8 h-8 flex items-center justify-center rounded shadow bg-neutral-300 hover:bg-white my-2 ${
              isRecording ? "bg-red-600 text-white" : "bg-neutral-300 text-black"
            }`}
        >
          <span className="w-3 h-3 rounded-full bg-red-600"></span>
          
        </button>
        {track.buffer && (
          <button
            onClick={() => setShowSettings(true)}
            className="w-8 h-8 flex items-center justify-center rounded shadow bg-neutral-300 hover:bg-white my-1"
            aria-label="Settings"
            title="Settings"
          >
            <Settings className="w-4 h-4" color="#000000" />
          </button>
        )}
      </div>
      {showSettings && (
        <TrackSettingsModal
          track={track}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
