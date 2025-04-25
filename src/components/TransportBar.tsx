export default function TransportBar() {
    const btnBase = "flex-1 py-3 mx-1 rounded-lg text-sm tracking-widest";
    return (
      <footer className="flex bg-neutral-800 mt-4 p-2 rounded-lg">
        <button className={`${btnBase} bg-accent`}>TRACK</button>
        <button className={`${btnBase} bg-neutral-700`}>UNDO</button>
        <button className={`${btnBase} bg-neutral-700`}>RECORD</button>
        <button className={`${btnBase} bg-neutral-700`}>LOOP</button>
      </footer>
    );
  }
  