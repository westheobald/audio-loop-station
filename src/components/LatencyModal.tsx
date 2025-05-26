'use client';
import { useEffect, useState } from 'react';
import { useLoop } from '@/contexts/LoopContext';
import LatencyCorrection from '@/audio/latency-correction';

export default function LatencyModal({ onNext }: { onNext: () => void }) {
  const { loopStation } = useLoop();
  const [latencyTrack, setLatencyTrack] = useState<LatencyCorrection | null>(
    null,
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [latency, setLatency] = useState(0);

  useEffect(() => {
    if (loopStation) {
      const track = new LatencyCorrection(
        -1,
        loopStation.audioContext,
        loopStation.inputStream,
      );
      setLatencyTrack(track);
    }
  }, [loopStation]);

  if (!loopStation || !latencyTrack) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80'>
      <div className='bg-neutral-900 text-white p-6 rounded-lg space-y-4 max-w-xl w-full'>
        <h2 className='text-xl font-bold text-center'>Great! Next Step:</h2>
        <p className='text-sm text-center'>
          To check for latency, record a test and adjust the delay until
          playback is in sync. One bar count in followed by two bars of
          recording audio.
        </p>
        <p className='text-sm text-center'>
          Recommended: Count along with the click then correct until the count
          and click are aligned.
        </p>
        <div className='flex justify-center gap-4'>
          <button
            onClick={() => loopStation.recordTrack(latencyTrack)}
            className='bg-neutral-700 text-white px-4 py-2 rounded hover:bg-red-500 hover:text-white transition'
          >
            Record
          </button>
          <button
            onClick={() => {
              if (isPlaying) {
                loopStation.stopAll();
                loopStation.stopTrack(latencyTrack);
              } else loopStation.playTrack(latencyTrack);
              setIsPlaying(!isPlaying);
            }}
            className='bg-neutral-700 px-4 py-2 rounded hover:bg-black transition'
          >
            {isPlaying ? 'Stop' : 'Play'}
          </button>
        </div>

        <label className='text-sm block text-center mt-4'>
          Latency: {latency}ms
        </label>
        <input
          className='w-full mt-1'
          type='range'
          min='0'
          max='1000'
          step='10'
          defaultValue='0'
          onChange={(e) => {
            loopStation.latency = +e.target.value;
            setIsPlaying(true);
            setLatency(+e.target.value);
            if (!latencyTrack.originalBuffer) return;
            const newBuffer = latencyTrack.sliceOriginal(
              +e.target.value / 1000,
              loopStation.loopInfo.loopLength,
            );
            latencyTrack.stop();
            latencyTrack.buffer = newBuffer;
            loopStation.playTrack(latencyTrack);
          }}
        />

        <button
          className='block mx-auto mt-6 border px-6 py-2 rounded hover:bg-neutral hover:text-blue-400 transition'
          onClick={() => {
            loopStation.stopAll();
            loopStation.stopTrack(latencyTrack);
            onNext();
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
