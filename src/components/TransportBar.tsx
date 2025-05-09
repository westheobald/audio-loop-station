"use client";
import { useLoop } from "@/contexts/LoopContext";
import { useState } from "react";

export default function TransportBar() {
  const { loopStation, isInitialized} = useLoop();
  const [isRecording, setIsRecording] = useState(false);

  const btnBase =
    "min-w-[5rem] py-2 px-4 mx-1 rounded-lg text-sm tracking-widest font-semibold";

  if (!isInitialized || !loopStation) return null;
  const track = loopStation.audioTracks[0];

  const handleRecordToggle = async () => {
    if (isRecording) {
      loopStation.stopTrack(track);
      loopStation.metronome.stop();
      loopStation.isRunning = false;
      setIsRecording(false);
    } else {
      await loopStation.recordTrack(track);
      setIsRecording(true);
    }
  };

  return (
    <footer className="flex justify-center bg-neutral-800 p-2 rounded-lg w-full max-w-xl shadow-md">
      <button className={`${btnBase} bg-neutral-700 text-white`}>TRACK</button>
      <button className={`${btnBase} bg-neutral-700 text-white`}>UNDO</button>
      <button 
        className={`${btnBase} ${isRecording ? "bg-red-500 text-white" : "bg-neutral-700 text-white"}`}
        onClick={handleRecordToggle}
      >
        {isRecording ? "STOP" : "RECORD"}
        </button>
      <button className={`${btnBase} bg-neutral-700 text-white`}>LOOP</button>
    </footer>
  );
}
