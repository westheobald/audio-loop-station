'use client';

import { useLoop } from '@/contexts/LoopContext';
import { useState } from 'react';
import LoopSetupModal from '@/components/LoopSetupModal';
import { Wrench } from 'lucide-react';

export default function UserInput() {
  const { bpm, beatsPerBar, numberOfBars, countInLength, setCountInLength } =
    useLoop();
  const [showModal, setShowModal] = useState(false);

  return (
    // Displays inputs from modal
    <div className='flex flex-col items-center gap-2 mt-4'>
      <div className='flex gap-8 justify-center'>
        <div className='flex flex-col items-center gap-1'>
          <span className='text-xs text-white'>Beats per Bar</span>
          <span className='text-xl font-semibold'>{beatsPerBar}</span>
        </div>

        <div className='flex flex-col items-center gap-1'>
          <span className='text-xs text-white'>BPM</span>
          <span className='text-xl font-semibold'>{bpm}</span>
        </div>

        <div className='flex flex-col items-center gap-1'>
          <span className='text-xs text-white'>Number of Bars</span>
          <span className='text-xl font-semibold'>{numberOfBars}</span>
        </div>

        <div className='flex flex-col items-center gap-1'>
          <span className='text-sm text-white'>Count In</span>
          <span className='text-xl font-semibold'>{countInLength}</span>
        </div>
      </div>

      {/* Opens modal */}
      <button
        className='mt-3 border px-4 py-2 rounded hover:bg-accent hover:text-blue-400 transition'
        onClick={() => setShowModal(true)}
      >
        <Wrench />
      </button>

      {showModal && <LoopSetupModal />}
    </div>
  );
}
