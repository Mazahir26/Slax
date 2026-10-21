import { useId } from "react";
import { Check } from "lucide-react";

import Colors from "../lib/colors";

/** Pick readable ink for a swatch (ported from the old Card implementation). */
function getContrast(hexColor: string) {
  const hex = hexColor.replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return "#111111";

  const red = parseInt(hex.slice(0, 2), 16);
  const green = parseInt(hex.slice(2, 4), 16);
  const blue = parseInt(hex.slice(4, 6), 16);
  const brightness = Math.round(
    (red * 299 + green * 587 + blue * 114) / 1000
  );

  return brightness > 125 ? "#111111" : "#ffffff";
}

export default function ColorSelector({
  options = Colors,
  setColor,
  color,
  disabled = false,
}: {
  options?: string[];
  setColor: (color: string) => void;
  color: string;
  disabled?: boolean;
}) {
  const groupName = useId();

  return (
    <fieldset className="min-w-0" disabled={disabled}>
      <legend className="sr-only">Birthday color</legend>
      <div className="flex flex-wrap items-center gap-1.5">
        {options.map((option, index) => {
          const selected = color.toLowerCase() === option.toLowerCase();

          return (
            <label
              key={option}
              className="flex size-11 cursor-pointer items-center justify-center rounded-full focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background"
            >
              <input
                type="radio"
                name={groupName}
                value={option}
                checked={selected}
                onChange={() => setColor(option)}
                disabled={disabled}
                aria-label={`Color option ${index + 1} (${option})`}
                className="peer sr-only"
              />
              <span
                aria-hidden="true"
                className="flex size-9 items-center justify-center rounded-full border border-black/10 shadow-sm transition-all duration-150 peer-checked:ring-2 peer-checked:ring-brand peer-checked:ring-offset-2 peer-checked:ring-offset-background peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background peer-disabled:cursor-not-allowed peer-disabled:opacity-50 motion-safe:peer-checked:scale-105 dark:border-white/20"
                style={{ backgroundColor: option }}
              >
                {selected ? (
                  <Check
                    className="size-4"
                    strokeWidth={3}
                    style={{ color: getContrast(option) }}
                  />
                ) : null}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
