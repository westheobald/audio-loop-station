"use client";

import { useState } from "react";
import Fader from './Fader';
import Led from "./Led";

export default function Track({ index }: {index: number}) {
    const [level, setLevel] = useState(80);
    const [muted, setMuted] = useState(false);
    return (
      <div className="flex flex-col items-center gap-2 px-2">
        <Led color={'ledRed'} />
        <Fader value={level} onChange={setLevel} />
        <button
          onClick={() => setMuted(!muted)}
          className={`w-8 h-8 text-sm font-medium rounded shadow border mt-2 
                    ${muted ? "bg-ledRed text-white" : "bg-neutral-300 text-black"}`}
        >
          {index}
        </button>
      </div>
    );
  }
  