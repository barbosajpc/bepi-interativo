import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

type OrigemFilterProps = {
  options: string[];
  value: string[];
  onChange: (next: string[]) => void;
};

export function OrigemFilter({ options, value, onChange }: OrigemFilterProps) {
  const [q, setQ] = useState("");

  const selected = useMemo(() => new Set(value), [value]);

  const filteredOptions = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return options;
    return options.filter((o) => o.toLowerCase().includes(qq));
  }, [options, q]);

  const label =
    value.length === 0
      ? "Todas"
      : value.length === 1
      ? value[0]
      : `${value.length} selecionadas`;

  function toggle(opt: string) {
    const next = new Set(selected);
    if (next.has(opt)) next.delete(opt);
    else next.add(opt);
    onChange(Array.from(next));
  }

  function selectAllFiltered() {
    const next = new Set(selected);
    for (const o of filteredOptions) next.add(o);
    onChange(Array.from(next));
  }

  function clearAll() {
    onChange([]);
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="secondary" className="gap-2 min-w-[220px] justify-between">
          <span className="truncate"> {label}</span>
          <ChevronDown className="h-4 w-4 opacity-70" />
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 p-2">
        <div className="flex items-center gap-2 px-1 pb-2">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Selecione uma origem..."
            className="h-9"
          />
        </div>

        <div className="flex items-center justify-between px-1 pb-2">
          <div className="text-xs text-muted-foreground">
            {value.length === 0 ? "Nenhum filtro" : `${value.length} selecionada(s)`}
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={selectAllFiltered}>
              Selecionar
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearAll}
              disabled={value.length === 0}
            >
              Limpar
            </Button>
          </div>
        </div>

        <ScrollArea className="h-64 px-1">
          <div className="space-y-2 py-1">
            {filteredOptions.map((opt) => (
              <label key={opt} className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox
                  checked={selected.has(opt)}
                  onCheckedChange={() => toggle(opt)}
                />
                <span className="leading-tight">{opt}</span>
              </label>
            ))}

            {filteredOptions.length === 0 && (
              <div className="text-sm text-muted-foreground py-6 text-center">
                Nada encontrado.
              </div>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}