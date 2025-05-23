"use client";
import { useLoop } from "@/contexts/LoopContext";
import { useState } from "react";

export default function GlobalSection() {
  const { loopStation, isInitialized } = useLoop();
  const [isMetronomeOn, setIsMetronomeOn] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  if (!isInitialized) return null;

return (
  <section className="flex flex-col gap-2">
    <div className="grid grid-cols-2 gap-2">
      
      {/* Controls metronome */}
      <button
        onClick={() => {
          if (isMetronomeOn) {
            loopStation?.metronome.stop();
            setIsMetronomeOn(false);
          } else {
            const now = loopStation!.audioContext.currentTime;
            const length = loopStation!.loopInfo.loopLength;
            const next = loopStation!.audioContext.currentTime + loopStation!.loopInfo.loopLength;
            loopStation?.metronome.play(now, length, next);
            setIsMetronomeOn(true);
          }
        }}
        className="border rounded py-1 text-sm hover:bg-accent hover:text-black transition"
        >
          {isMetronomeOn ? "Stop Metronome" : "Start Metronome"}
        </button>

        {/* Controls loop playback */}
        <button
          onClick={() => {
            if (!isPlaying) {
              loopStation?.playAll();
            } else {
              loopStation?.stopAll();
            }
            setIsPlaying(!isPlaying);
          }}
        className="border rounded py-1 text-sm hover:bg-accent hover:text-black transition"
        >
          {isPlaying ? "Stop" : "Play"}
        </button>
    </div>
  </section>
  );
}
  