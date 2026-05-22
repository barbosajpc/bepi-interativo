// ⚠️  Adicione no .env do frontend:
//     VITE_API_URL=http://localhost:3000

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

// ========== TYPES ==========

export interface BepiStructure {
  Grupo: string;
  Detalhado: string;
  "Índice - Grupo"?: number | null;
  "Índice - Detalhado"?: number | null;
}

export interface BepiDataPoint {
  Ano: number;
  Agregação: string;
  "Origem da Energia": string;
  "Tipo de fonte": string;
  "Valor da Energia": number;
}

export interface GroupedStructure {
  grupo: string;
  indiceGrupo: number;
  detalhados: { label: string; indiceDetalhado: number }[];
}

// ========== HTTP HELPER ==========

async function postBepi<T>(body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${API_URL}/bepi-data`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json?.error ?? `Erro ${res.status}`);
  }

  return json as T;
}

// ========== API CALLS ==========

export async function fetchStructure(): Promise<BepiStructure[]> {
  return postBepi<BepiStructure[]>({ action: "get_structure" });
}

export async function fetchYearRange(
  grupo: string,
  detalhado: string
): Promise<{ minAno: number | null; maxAno: number | null }> {
  return postBepi({ action: "get_year_range", grupo, detalhado });
}

export async function fetchChartData(
  grupo: string,
  detalhado: string,
  anoMin: number,
  anoMax: number
): Promise<BepiDataPoint[]> {
  return postBepi<BepiDataPoint[]>({ action: "get_data", grupo, detalhado, anoMin, anoMax });
}

// ========== UTILS ==========

export function groupStructure(data: BepiStructure[]): GroupedStructure[] {
  const map = new Map<string, { indiceGrupo: number; detalhados: Map<string, number> }>();

  for (const item of data) {
    const grupo = item.Grupo;
    const det = item.Detalhado;
    const ig = Number(item["Índice - Grupo"] ?? 0);
    const id = Number(item["Índice - Detalhado"] ?? 0);

    if (!map.has(grupo)) map.set(grupo, { indiceGrupo: ig, detalhados: new Map() });

    const bucket = map.get(grupo)!;
    const prev = bucket.detalhados.get(det);
    if (prev == null || id < prev) bucket.detalhados.set(det, id);
    if (ig < bucket.indiceGrupo) bucket.indiceGrupo = ig;
  }

  return Array.from(map.entries())
    .map(([grupo, obj]) => ({
      grupo,
      indiceGrupo: obj.indiceGrupo,
      detalhados: Array.from(obj.detalhados.entries())
        .map(([label, indiceDetalhado]) => ({ label, indiceDetalhado }))
        .sort((a, b) => a.indiceDetalhado - b.indiceDetalhado),
    }))
    .sort((a, b) => a.indiceGrupo - b.indiceGrupo);
}