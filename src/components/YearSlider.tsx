import { useEffect, useState } from "react";
import { Slider } from "@/components/ui/slider";

interface YearSliderProps {
  min: number;
  max: number;
  value: [number, number];              // valor “confirmado” (usado na query)
  onChange: (value: [number, number]) => void; // commit final
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function normalizeRange(
  start: number,
  end: number,
  min: number,
  max: number
): [number, number] {
  const safeMaxStart = max - 1;

  let s = clamp(start, min, safeMaxStart);
  let e = clamp(end, s + 1, max);

  if (s >= e) e = clamp(s + 1, s + 1, max);

  return [s, e];
}

export function YearSlider({ min, max, value, onChange }: YearSliderProps) {
  const disabled = min === 0 && max === 0;

  // ✅ valor local do slider (UI), independente do "value" do pai
  const [uiRange, setUiRange] = useState<[number, number]>(value);

  // Inputs como texto
  const [startText, setStartText] = useState(disabled ? "" : String(value[0]));
  const [endText, setEndText] = useState(disabled ? "" : String(value[1]));

  useEffect(() => {
    if (disabled) {
      setStartText("");
      setEndText("");
      return;
    }
    setStartText(String(value[0]));
    setEndText(String(value[1]));
  }, [value, disabled]);

  // ✅ quando o pai muda (ex: selecionou outro item), sincroniza UI também
  useEffect(() => {
    setUiRange(value);
  }, [value]);

  function commitStart() {
    if (disabled) return;

    const parsed = Number(startText);
    if (!Number.isFinite(parsed)) {
      setStartText(String(value[0]));
      return;
    }

    const [s, e] = normalizeRange(parsed, uiRange[1], min, max);
    setUiRange([s, e]);
    onChange([s, e]); // commit (digitar é intencional, pode atualizar na hora)
  }

  function commitEnd() {
    if (disabled) return;

    const parsed = Number(endText);
    if (!Number.isFinite(parsed)) {
      setEndText(String(value[1]));
      return;
    }

    const [s, e] = normalizeRange(uiRange[0], parsed, min, max);
    setUiRange([s, e]);
    onChange([s, e]);
  }

  return (
    <div className={`flex items-center gap-4 min-w-[320px] ${disabled ? "opacity-60" : ""}`}>
      {/* INÍCIO */}
      <input
        type="number"
        value={disabled ? "" : startText}
        placeholder="—"
        disabled={disabled}
        min={disabled ? undefined : min}
        max={disabled ? undefined : max - 1}
        onChange={(e) => setStartText(e.target.value)}
        onBlur={commitStart}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        }}
        className="w-20 text-sm font-semibold text-primary font-heading bg-secondary px-2 py-0.5 rounded outline-none disabled:cursor-not-allowed"
      />

      <Slider
        min={disabled ? 0 : min}
        max={disabled ? 0 : max}
        step={1}
        value={disabled ? [0, 0] : uiRange}     // ✅ usa UI state
        disabled={disabled}
        onValueChange={(v) => {
          if (disabled) return;
          const [s, e] = normalizeRange(
            (v as [number, number])[0],
            (v as [number, number])[1],
            min,
            max
          );
          setUiRange([s, e]);                  // ✅ só UI (não chama onChange!)
          setStartText(String(s));
          setEndText(String(e));
        }}
        onValueCommit={(v) => {                // ✅ commit quando solta o mouse
          if (disabled) return;
          const [s, e] = normalizeRange(
            (v as [number, number])[0],
            (v as [number, number])[1],
            min,
            max
          );
          onChange([s, e]);
        }}
        className="
          flex-1
          [&_[data-radix-slider-range]]:transition-all
          [&_[data-radix-slider-range]]:duration-200
          [&_[data-radix-slider-range]]:ease-out
          [&_[data-radix-slider-thumb]]:transition-transform
          [&_[data-radix-slider-thumb]]:duration-150
          [&_[data-radix-slider-thumb]]:ease-out
        "
      />

      {/* FIM */}
      <input
        type="number"
        value={disabled ? "" : endText}
        placeholder="—"
        disabled={disabled}
        min={disabled ? undefined : min + 1}
        max={disabled ? undefined : max}
        onChange={(e) => setEndText(e.target.value)}
        onBlur={commitEnd}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        }}
        className="w-20 text-sm font-semibold text-primary font-heading bg-secondary px-2 py-0.5 rounded outline-none disabled:cursor-not-allowed"
      />
    </div>
  );
}