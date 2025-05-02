import Track from "./Track";

export default function MixerSection() {
    return (
      <section className="flex justify-around gap-6 w-full px-24 mt-32 mb-32 min-h-[200px]">
        {[1,2,3,4,5,6].map((i) => (
          
          // Maps 6 tracks to the Mixer Section
          <div key={i} className="flex flex-col items-center gap-8 mt-12">

            {/* Labels each track */}
            <Track key={i} index={i} />
          </div>
        ))}
      </section>
    );
  }
  