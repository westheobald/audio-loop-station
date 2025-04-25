"use client";
import {useState} from "react";
import Knob from "./Knob";

export default function GlobalSection() {
    const [tempo, setTempo] = useState(120);
  
    return (
      <section className="flex flex-col gap-4">
        <Knob value={tempo} min={40} max={240} onChange={setTempo} />
        <div className="bg-black text-accent font-mono p-2 text-center rounded">
          {tempo.toFixed(0)}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {["Metro", "Reverse", "Oct", "Ext Clk"].map((label) => (
            <button
              key={label}
              className="border rounded py-1 text-sm hover:bg-accent hover:text-black transition"
            >
              {label}
            </button>
          ))}
        </div>
      </section>
    );
  }
  