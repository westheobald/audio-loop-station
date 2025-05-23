"use client";
import { useEffect, useState } from "react";
import { useLoop } from "@/contexts/LoopContext";
import LatencyCorrection from "@/audio/latency-correction";

export default function LatencyModal({onNext}: {onNext: () => void}) {
    const {loopStation} = useLoop();
    const [latencyTrack, setLatencyTrack] = useState<LatencyCorrection | null>(null);

    useEffect(() => {
        if(loopStation) { 
            setLatencyTrack(new LatencyCorrection(-1, loopStation.audioContext, loopStation.inputStream));  
        }
    }, [loopStation]);

    if (!loopStation || !latencyTrack)
        return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
        <div className="bg-neutral-900 text-white p-6 rounded-lg space-y-4 max-w-xl w-full">
            <h2 className="text-xl font-bold text-center">Adjust for Input Latency</h2>
            <p className="text-sm text-center">
                Great! Now, record a test and adjust the delay until playback is in sync.
            </p>
            <p className="text-sm text-center">
                Recommended: Count along with the click then correct until the count and click are aligned.
            </p>
            <div className="flex justify-center gap-4">
            <button
                onClick={() => loopStation.recordTrack(latencyTrack)}
                className="bg-neutral-700 text-white px-4 py-2 rounded hover:bg-red-500 hover:text-white transition"
            >
                Record
            </button>
            <button
                onClick={() => {
                loopStation.stopTrack(latencyTrack);
                loopStation.metronome.stop();
                loopStation.isRunning = false;
                }}
                className="bg-neutral-700 px-4 py-2 rounded hover:bg-black transition"
            >
                Stop
            </button>
            </div>

            <label className="text-sm block text-center mt-4">Latency (ms)</label>
            <input
            className="w-full mt-1"
            type="range"
            min="0"
            max="1000"
            step="10"
            defaultValue="0"
            onChange={(e) => {
                if (!latencyTrack.originalBuffer) return;
                const newBuffer = latencyTrack.sliceOriginal(
                +e.target.value / 1000,
                loopStation.loopInfo.loopLength,
                );
                latencyTrack.stop();
                latencyTrack.buffer = newBuffer;
                latencyTrack.play(
                loopStation.audioContext.currentTime,
                loopStation.loopInfo.loopLength,
                loopStation.getNextLoopStart()
                );
                loopStation.latency = +e.target.value;
            }}
            />

            <button
            className="block mx-auto mt-6 border px-6 py-2 rounded hover:bg-neutral hover:text-blue-400 transition"
            onClick={onNext}
            >
            Continue
            </button>
        </div>
        </div>
    );
}