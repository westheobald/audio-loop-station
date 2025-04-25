export default function Fader({ value, onChange }: {value: number; onChange: (v: number) => void;}) {
    return (
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
        className="w-1 h-32 appearance-none bg-neutral-700 rounded-full rotate-180 vertical-slider"
      />
    );
  }
  