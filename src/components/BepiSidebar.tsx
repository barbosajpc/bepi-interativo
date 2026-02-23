import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { GroupedStructure } from "@/lib/bepi-api";

interface BepiSidebarProps {
  structure: GroupedStructure[];
  selectedGrupo: string | null;
  selectedDetalhado: string | null;
  onSelect: (grupo: string, detalhado: string) => void;
}

export function BepiSidebar({ structure, selectedGrupo, selectedDetalhado, onSelect }: BepiSidebarProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(selectedGrupo ? [selectedGrupo] : structure.length > 0 ? [structure[0].grupo] : [])
  );

  const toggleGroup = (grupo: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(grupo)) next.delete(grupo);
      else next.add(grupo);
      return next;
    });
  };

  return (
    <aside className="w-72 min-w-72 h-full overflow-y-auto bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <nav className="py-2">
        {structure.map((group, idx) => (
          <div key={group.grupo}>
            <button
              onClick={() => toggleGroup(group.grupo)}
              className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold font-heading hover:bg-sidebar-accent transition-colors text-left"
            >
              <span>
                {idx + 1}. {group.grupo}
              </span>

              {expandedGroups.has(group.grupo) ? (
                <ChevronDown className="h-4 w-4 shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 shrink-0" />
              )}
            </button>

            {expandedGroups.has(group.grupo) && (
              <div className="ml-2">
                {group.detalhados.map((det, dIdx) => {
                  const isActive =
                    selectedGrupo === group.grupo &&
                    selectedDetalhado === det.label;

                  return (
                    <button
                      key={det.label}
                      onClick={() => onSelect(group.grupo, det.label)}
                      className={`w-full text-left px-4 py-1.5 text-xs transition-colors ${
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : "hover:bg-sidebar-accent/50 text-sidebar-foreground/80"
                      }`}
                    >
                      {idx + 1}.{dIdx + 1}. {det.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}
