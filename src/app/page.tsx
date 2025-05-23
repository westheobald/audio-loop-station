"use client"
import TransportBar from "@/components/TransportBar";
import MixerSection from "@/components/MixerSection";
import GlobalSection from "@/components/GlobalSection";
import UserInput from "@/components/UserInput";
import LoopSetupModal from "@/components/LoopSetupModal";
import RequestAccessModal from "@/components/RequestAccessModal";
import LatencyModal from "@/components/LatencyModal";
import { useState } from "react";

export default function Home() {
  const [setupStep, setSetupStep] = useState<1 | 2 | 3>(1);
  return (
    <>
      {setupStep === 1 && <RequestAccessModal onNext={() => setSetupStep(2)} />}
      {setupStep === 2 && <LatencyModal onNext={() => setSetupStep(3)} />}
      {setupStep === 3 && <LoopSetupModal />}

      <main className="bg-black text-white min-h-screen flex flex-col items-center px-4 py-2 gap-12">
        {/* User Inputs */}
        <section className="w-full max-w-5xl flex flex-col items-center">
          <UserInput />
        </section>

        {/* Mixer Section */}
        <section className="w-full max-w-5xl flex justify-center">
          <MixerSection />
        </section>

        {/* Global Controls */}
        <section className="w-full max-w-5xl flex justify-center">
          <GlobalSection />
        </section>

        {/* Transport Controls */}
        {/* <section className="w-full max-w-5xl flex justify-center mt-auto pt-2">
          <TransportBar />
        </section> */}
      </main>
    </>
  );
}
