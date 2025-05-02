"use client";

export default function GlobalSection() {
  
    return (
      <section className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-2">
          {/* Creates buttons for the main global track features */}
          {["Metronome", "Stop / Play", "Pitch Change", "Reverse"].map((label) => (
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
  