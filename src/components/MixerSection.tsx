"use client";
import { useLoop } from "@/contexts/LoopContext";
import Track from "./Track";

export default function MixerSection() {
  const { loopStation } = useLoop();

  if (!loopStation) return null;

  return (
    <section className="flex justify-around gap-6 w-full px-2 min-h-[200px]">
      {loopStation.audioTracks.map((track) => (
        <div key={track.id} className="flex flex-col items-center gap-2 mt-2">
          <Track index={track.id} track={track} />
        </div>
      ))}
    </section>
  );
}
  