"use client";

import { InputNumber } from "primereact/inputnumber";
import { useLoop } from "@/contexts/LoopContext";
import { useState } from "react";
import LoopSetupModal from "@/components/LoopSetupModal"; 

export default function UserInput() {
  const {
    bpm,
    beatsPerBar,
    numberOfBars,
    countInLength,
    setCountInLength,
  } = useLoop();

  const [showModal, setShowModal] = useState(false);

  return (
    // Displays inputs from modal
    <div className="flex flex-col items-center gap-2 mt-4">
      <div className="flex gap-8 justify-center">
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs text-white">Beats per Bar</span>
          <span className="text-xl font-semibold">{beatsPerBar}</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <span className="text-xs text-white">BPM</span>
          <span className="text-xl font-semibold">{bpm}</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <span className="text-xs text-white">Number of Bars</span>
          <span className="text-xl font-semibold">{numberOfBars}</span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 mt-8">
        <label className="text-sm text-white">Count In</label>
        <InputNumber
          min={1}
          max={2}
          value={countInLength}
          onValueChange={(e) =>
            typeof e.value === "number" && setCountInLength(e.value)
          }
          showButtons
          buttonLayout="vertical"
          style={{ width: "4rem" }}
          decrementButtonClassName="p-button-secondary p-button-sm"
          incrementButtonClassName="p-button-secondary p-button-sm"
          incrementButtonIcon="pi pi-plus"
          decrementButtonIcon="pi pi-minus"
        />
      </div>

      {/* Opens modal */}
      <button
        className="mt-3 border px-4 py-2 rounded hover:bg-accent hover:text-black transition"
        onClick={() => setShowModal(true)}
      >
        Edit Loop Parameters
      </button>

      {showModal && (
        <LoopSetupModal />
      )}
    </div>
  );
}
