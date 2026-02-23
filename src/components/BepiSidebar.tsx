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

              <ChevronRight
                className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                  expandedGroups.has(group.grupo) ? "rotate-90" : "rotate-0"
                }`}
              />
            </button>

            <div
              className={`
                ml-2 overflow-hidden transition-all duration-200 ease-out
                ${expandedGroups.has(group.grupo) ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"}
              `}
            >
              <div className={`
                transition-transform duration-200 ease-out
                ${expandedGroups.has(group.grupo) ? "translate-y-0" : "-translate-y-1"}
              `}>
                {group.detalhados.map((det, dIdx) => {
                  const isActive =
                    selectedGrupo === group.grupo &&
                    selectedDetalhado === det.label;

                  return (
                    <button
                      key={det.label}
                      onClick={() => onSelect(group.grupo, det.label)}
                      className={`
                        relative w-full text-left px-4 py-2 text-xs transition-colors rounded-md
                        ${isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : "hover:bg-sidebar-accent/50 text-sidebar-foreground/80"}
                      `}
                    >
                      {/* Barra lateral do item ativo */}
                      <span
                        className={`
                          absolute left-0 top-1 bottom-1 w-1 rounded-r
                          ${isActive ? "bg-primary" : "bg-transparent"}
                        `}
                      />
                      {idx + 1}.{dIdx + 1}. {det.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
