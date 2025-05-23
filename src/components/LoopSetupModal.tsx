"use client";

import { useEffect, useState } from "react";
import { Knob } from "primereact/knob";
import { InputNumber } from "primereact/inputnumber";
import { useLoop } from "@/contexts/LoopContext";

export default function LoopSetupModal() {
  const {
    bpm, setBpm,
    beatsPerBar, setBeatsPerBar,
    numberOfBars, setNumberOfBars,
    isInitialized, init
  } = useLoop();

  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
  }, []);
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-[0]" />
      <div className="bg-neutral-900 rounded-lg p-8 shadow-xl text-white space-y-8 w-[90vw] max-w-2xl z-[1]">
        <h2 className="text-2xl font-bold text-center">Loop Setup</h2>

        <div className="flex flex-wrap gap-8 justify-center items-center">
          {/* Beats per Bar */}
          <div className="flex flex-col items-center gap-2">
            <label className="text-sm">Beats per Bar</label>
            <InputNumber
              min={1}
              max={16}
              value={beatsPerBar}
              onValueChange={(e) => typeof e.value === "number" && setBeatsPerBar(e.value)}
              showButtons
              buttonLayout="vertical"
              style={{ width: "4rem" }}
              decrementButtonClassName="p-button-secondary p-button-sm"
              incrementButtonClassName="p-button-secondary p-button-sm"
              incrementButtonIcon="pi pi-plus"
              decrementButtonIcon="pi pi-minus"
            />
          </div>

          {/* BPM Knob */}
          <div className="flex flex-col items-center gap-2">
            <label className="text-sm">Tempo</label>
            <Knob
              value={bpm}
              min={40}
              max={240}
              onChange={(e) => typeof e.value === "number" && setBpm(e.value)}
            />
            <span>{bpm} BPM</span>
          </div>

          {/* Number of Bars */}
          <div className="flex flex-col items-center gap-2">
            <label className="text-sm">Number of Bars</label>
            <InputNumber
              min={1}
              max={32}
              value={numberOfBars}
              onValueChange={(e) => typeof e.value === "number" && setNumberOfBars(e.value)}
              showButtons
              buttonLayout="vertical"
              style={{ width: "4rem" }}
              decrementButtonClassName="p-button-secondary p-button-sm"
              incrementButtonClassName="p-button-secondary p-button-sm"
              incrementButtonIcon="pi pi-plus"
              decrementButtonIcon="pi pi-minus"
            />
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          {/* Requests access to user input */}
          {!isInitialized && (
            <button
              className="bg-accent text-black px-6 py-2 rounded hover:bg-blue-400 transition"
              onClick={init}
            >
              Start Looper
            </button>
          )}
          <button
            className="block mx-auto mt-6 border px-6 py-2 rounded hover:bg-neutral hover:text-blue-400 transition"
            onClick={() => setShow(false)}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
