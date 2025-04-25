import Track from "./Track";

export default function MixerSection() {
    return (
      <section className="flex justify-around items-end gap-4 w-full px-4">
        {[1,2,3,4,5,6].map((i) => (
          <Track key={i} index={i} />
        ))}
      </section>
    );
  }
  