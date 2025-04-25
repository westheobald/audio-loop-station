type LedColor = "ledRed";

interface LedProps {
    color: LedColor
}

export default function Led({ color }: LedProps) {
    return (
    <span className={`block w-2 h-2 rounded-full bg-${color} mx-auto`} />
    );
}