"use client";

import { useState } from "react";
import { Slider } from 'primereact/slider';
import Led from "./Led";

export default function Track({ index }: {index: number}) {
    const [level, setLevel] = useState(80);
    const [muted, setMuted] = useState(false);
    return (
      <div className="flex flex-col items-center gap-8 px-2">
        {/* Slider for track levels */}
        <Led color="red-500" />
        <Slider value={level} onChange={(e) => setLevel(Array.isArray(e.value) ? e.value[0] : e.value)} orientation="vertical" style={{width: '1.5rem'}} />

        {/* Turns LED color red when track is muted */}
        <button
          onClick={() => setMuted(!muted)}
          className={`w-8 h-8 text-sm font-medium rounded shadow border
                    ${muted ? "bg-ledRed text-white" : "bg-neutral-300 text-black"}`}
        >
          {index}
        </button>

      </div>
    );
  }
  