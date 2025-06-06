'use client';
import { AudioTrack } from '@/audio/audio-track';
import { useLoop } from '@/contexts/LoopContext';
import { useState } from 'react';

export default function TrackSettingsModal({
  track,
  onClose,
}: {
  track: AudioTrack;
  onClose: () => void;
}) {
  const { loopStation } = useLoop();
  const [pan, setPan] = useState(+track.pan.pan.value * 100);
  const [slice, setSlice] = useState(+track.sliceMs);
  const trackLength = track.buffer?.duration ? track.buffer.duration * 1000 : 0;
  if (!loopStation) return null;
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70'>
      <div className='bg-neutral-900 p-6 rounded-lg w-[90vw] max-w-md text-white space-y-4 shadow-xl'>
        <h2 className='text-xl font-bold text-center'>
          Track {track.id} Settings
        </h2>

        <div className='flex flex-col gap-2'>
          <label className='text-sm'>Slip: {slice}ms</label>
          <input
            type='range'
            min={-trackLength}
            max={trackLength}
            step={1}
            value={slice}
            onChange={(e) => {
              track.changeSlice(+e.target.value);
              setSlice(+e.target.value);
              if (loopStation.isRunning) {
                track.stop();
                track.play(
                  track.audioContext.currentTime,
                  track.loopLength,
                  track.nextLoopStart,
                );
              }
            }}
          />

          <label className='text-sm'>Pan: {pan}</label>
          <input
            type='range'
            min={-100}
            max={100}
            step={1}
            value={pan}
            onChange={(e) => {
              track.changePan(+e.target.value / 100);
              setPan(+e.target.value);
            }}
          />

          <button
            className='border px-4 py-2 rounded hover:bg-neutral hover:text-blue-400 transition'
            onClick={() => {
              if (loopStation.isRunning) loopStation.changeReverse(track);
              else track.changeReverse();
            }}
          >
            Reverse Audio
          </button>

          <button
            className='border px-4 py-2 rounded hover:bg-neutral hover:text-blue-400 transition'
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
