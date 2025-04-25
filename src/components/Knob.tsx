import React from "react";

type KnobProps = {
    size?: number;
    min?: number;
    max?: number;
    value: number;
    onChange: (val: number) => void;
}

export default function Knob({ size = 48, min = 0, max = 127, value, onChange }: KnobProps) {
  const deg = ((value - min) / (max - min)) * 270 - 135; // -135 to 135
  return (
    <div
      className="relative"
      style={{ width: size, height: size }}
      onWheel={(e) => {
        const delta = Math.sign(e.deltaY) * -1; // inversion
        onChange(Math.min(max, Math.max(min, value + delta)));
      }}
    >
      <div
        className="absolute inset-0 rounded-full bg-neutral-700"
        style={{ transform: `rotate(${deg}deg)` }}
      >
        <div className="w-1 h-1 bg-white rounded-full mx-auto mt-1" />
      </div>
    </div>
  );
}
