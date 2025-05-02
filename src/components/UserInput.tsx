"use client";
import { useState } from "react";
import { Knob } from 'primereact/knob';
import { InputNumber } from 'primereact/inputnumber';
        

export default function UserInput() {
    const [tempo, setTempo] = useState(120);
    const [beatsPerBar, setBeatsPerBar] = useState(4);
    const [numberOfBars, setNumberOfBars] = useState(2);
    return (
      <div className="flex flex-col gap-4 py-24">
        <div className="flex items-center justify-center gap-16 w-full">
          <div className="flex flex-col items-center gap-2">
            <label className="text-sm text-white">Beats per Bar:</label>
            {/* Custom Number Input field for setting the amount of beats per bar */}
            <InputNumber
              min={1}
              max={16}
              value={beatsPerBar}
              onValueChange={(e) => typeof e.value === 'number' && setBeatsPerBar(e.value)}
              showButtons
              buttonLayout="vertical"
              style={{ width: '4rem' }}
              decrementButtonClassName="p-button-secondary p-button-sm"
              incrementButtonClassName="p-button-secondary p-button-sm"
              incrementButtonIcon="pi pi-plus"
              decrementButtonIcon="pi pi-minus"
            />
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="flex justify-center">
              {/* Knob input for setting the tempo of the loop */}
              <Knob value={tempo} min={40} max={240} onChange={(e) => setTempo(e.value)} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-white">BPM</span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <label className="text-sm text-white">Number of Bars:</label>
            {/* Custom Number Input field for setting the number of bars in the loop */}
            <InputNumber
              min={1}
              max={32}
              value={numberOfBars}
              onValueChange={(e) => typeof e.value === 'number' && setNumberOfBars(e.value)}
              showButtons
              buttonLayout="vertical"
              style={{ width: '4rem' }}
              decrementButtonClassName="p-button-secondary p-button-sm"
              incrementButtonClassName="p-button-secondary p-button-sm"
              incrementButtonIcon="pi pi-plus"
              decrementButtonIcon="pi pi-minus"
            />
          </div>
        </div>
      </div>
    );
  }
  