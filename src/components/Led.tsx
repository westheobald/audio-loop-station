type LedColor = "red-500";

interface LedProps {
    color: LedColor
}

const ledColorClasses: Record<LedColor, string> = {
    "red-500": "bg-red-500",
  };
// Defines color for when LED is turned on
// Dynamic set-up for multiple colors if needed

export default function Led({ color }: LedProps) {
    return (
        <span
        className={`${ledColorClasses[color]}`}
        />
    );
}