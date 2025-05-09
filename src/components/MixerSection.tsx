import Track from "./Track";

export default function MixerSection() {
    return (
      <section className="flex justify-around gap-6 w-full px-2 min-h-[200px]">
        {[1,2,3,4,5,6].map((i) => (
          
          // Maps 6 tracks to the Mixer Section
          <div key={i} className="flex flex-col items-center gap-2 mt-2">

            {/* Labels each track */}
            <Track key={i} index={i} />
          </div>
        ))}
      </section>
    );
  }
  