"use client";
import { useLoop } from "@/contexts/LoopContext";

export default function RequestAccessModal({onNext}: {onNext: () => void}) {
    const {init} = useLoop();

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-80">
            <div className="bg-neutral-900 text-white p-6 rounded-lg space-y-4 max-w-lg w-full">
                <h2 className="text-xl font-bold text-center">Welcome to the Audio Loop Station</h2>
                <p className="text-sm text-center">
                    We need to complete a few steps before getting started.
                    First, this app needs access to your microphone to record audio. 
                    Please allow access before continuing:
                </p>
                <div className="flex flex-col items-center gap-4">
                    <button
                        className="bg-blue-400 text-white px-6 py-2 rounded hover:bg-white hover:text-blue-400 transition mx-auto"
                        onClick={() => {
                            init();
                            onNext();
                        }}
                    >Start Looper
                    </button>
                </div>
            </div>
        </div>
    )
}