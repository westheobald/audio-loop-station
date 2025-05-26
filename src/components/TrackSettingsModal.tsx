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
  if (!loopStation) return null;
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70'>
      <div className='bg-neutral-900 p-6 rounded-lg w-[90vw] max-w-md text-white space-y-4 shadow-xl'>
        <h2 className='text-xl font-bold text-center'>
          Track {track.id} Settings
        </h2>

        <div className='flex flex-col gap-2'>
          <label className='text-sm'>Pitch (semitones)</label>
          <input
            type='range'
            min={-12}
            max={12}
            step={1}
            defaultValue={track.pitch / 100}
            onChange={(e) => track.changePitch(+e.target.value)}
          />

          <label className='text-sm'>Pan</label>
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
            className='border px-4 py-2 rounded hover:bg-accent hover:text-black transition'
            onClick={() => loopStation.changeReverse(track)}
          >
            Reverse Audio
          </button>

          <button
            className='border px-4 py-2 rounded hover:bg-accent hover:text-black transition'
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
