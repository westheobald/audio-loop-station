import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import './globals.css';
import "primereact/resources/themes/bootstrap4-dark-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import TransportBar from "@/components/TransportBar";
import MixerSection from "@/components/Mixer";
import GlobalSection from "@/components/Global";
import UserInput from "@/components/UserInput";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Audio Loop Station",
  description: "A Next.js application that enables users to record audio through an input device and creates loops by layering tracks in real time, facilitating live music production and performance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
      suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} font-mono antialiased select-none`}
      >
        <main className="bg-black text-white min-h-screen p-12 space-y-32">
          {/* 12 Columns for spacing the 6 tracks evenly */}
        <div className="grid grid-cols-1 gap-y-32 md:grid-cols-12 md:gap-x-8 flex-grow">
          <div className="md:col-span-12 md:flex md:justify-between">
            {/* Spacing in between User Input and Mixer Section */}
            <div className="md:w-1/4 min-h-[200px] mt-24">
              <UserInput />
            </div>
            <div className="md:w-2/4">
              <MixerSection />
            </div>
            <div className="md:w-1/4">
              <GlobalSection />
            </div>
          </div>
        </div>
          <div className="mt-32">
          <TransportBar />
          </div>
          {children}
        </main>
      </body>
    </html>
  );
};
