"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { LoopStation } from "@/audio/loop-station";

type LoopContextType = {
    loopStation?: LoopStation;
    init: () => void;
    isInitialized: boolean;
    bpm: number;
    setBpm: (value: number) => void;
    beatsPerBar: number;
    setBeatsPerBar: (value: number) => void;
    numberOfBars: number;
    setNumberOfBars: (value: number) => void;
    countInLength: number;
    setCountInLength: (value: number) => void;
  };

const LoopContext = createContext<LoopContextType | undefined>(undefined);

// Modularizes Loop Station functionalities for use in all components
export const LoopProvider = ({ children}: {children: React.ReactNode }) => {
    const [loopStation, setLoopStation] = useState<LoopStation>();
    const [isInitialized, setIsInitialized] = useState(false);
    const [bpm, setBpm] = useState(120);
    const [beatsPerBar, setBeatsPerBar] = useState(4);
    const [numberOfBars, setNumberOfBars] = useState(2);
    const [countInLength, setCountInLength] = useState(1);

    useEffect(() => {
        if (!loopStation) return;
        loopStation.metronome.stop();
        loopStation.updateLooper(bpm, beatsPerBar, numberOfBars, countInLength);
      }, [bpm, beatsPerBar, numberOfBars, countInLength, loopStation]);

    const init = () => {
        if (loopStation) return;

        const audioContext = new AudioContext ();
        navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
            const station = new LoopStation(audioContext, stream);
            setLoopStation(station);
            setIsInitialized(true);
        });
    };

    return (
        <LoopContext.Provider value={{
          loopStation,
          init,
          isInitialized,
          bpm, setBpm,
          beatsPerBar, setBeatsPerBar,
          numberOfBars, setNumberOfBars,
          countInLength, setCountInLength,
        }}>
          {children}
        </LoopContext.Provider>
      );
};

// For use in components
export const useLoop = () => {
    const context = useContext(LoopContext);
    if (!context) {
        throw new Error("useLoop has to be used within a LoopProvider");
    }
    return context;
}