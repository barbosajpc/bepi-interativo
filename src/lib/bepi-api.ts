import { supabase } from "@/integrations/supabase/client";

export interface BepiStructure {
  Grupo: string;
  Detalhado: string;
  "Índice - Grupo"?: number | null;
  "Índice - Detalhado"?: number | null;
}

export interface BepiDataPoint {
  Ano: number;
  "Agregação": string;
  "Origem da Energia": string;
  "Tipo de fonte": string;
  "Valor da Energia": number;
}

type OkResponse<T> = { ok: true; data: T };
type ErrResponse = { ok: false; error: string };

function unwrap<T>(payload: any): T {
  // suporta tanto retorno novo {ok,data} quanto antigo (direto)
  if (payload?.ok === false) throw new Error(payload.error || "Erro na function");
  if (payload?.ok === true) return payload.data as T;
  return payload as T;
}

export async function fetchStructure(): Promise<BepiStructure[]> {
  const { data, error } = await supabase.functions.invoke("bepi-data", {
    body: { action: "get_structure" },
  });

  if (error) throw error;
  return unwrap<BepiStructure[]>(data);
}

export async function fetchYearRange(
  grupo: string,
  detalhado: string
): Promise<{ minAno: number | null; maxAno: number | null }> {
  const { data, error } = await supabase.functions.invoke("bepi-data", {
    body: { action: "get_year_range", grupo, detalhado },
  });

  if (error) throw error;
  return unwrap<{ minAno: number | null; maxAno: number | null }>(data);
}

export async function fetchChartData(
  grupo: string,
  detalhado: string,
  anoMin: number,
  anoMax: number
): Promise<BepiDataPoint[]> {
  const { data, error } = await supabase.functions.invoke("bepi-data", {
    body: { action: "get_data", grupo, detalhado, anoMin, anoMax },
  });

  if (error) throw error;
  return unwrap<BepiDataPoint[]>(data);
}

export interface GroupedStructure {
  grupo: string;
  indiceGrupo: number; // <- vem do banco
  detalhados: { label: string; indiceDetalhado: number }[];
}

export function groupStructure(data: BepiStructure[]): GroupedStructure[] {
  const map = new Map<
    string,
    { indiceGrupo: number; detalhados: Map<string, number> }
  >();

  for (const item of data) {
    const grupo = item.Grupo;
    const det = item.Detalhado;

    const ig = Number(item["Índice - Grupo"] ?? item["indice_grupo"] ?? 0);
    const id = Number(item["Índice - Detalhado"] ?? item["indice_detalhado"] ?? 0);

    if (!map.has(grupo)) map.set(grupo, { indiceGrupo: ig, detalhados: new Map() });

    const bucket = map.get(grupo)!;

    // mantém menor índice se houver duplicatas
    const prev = bucket.detalhados.get(det);
    if (prev == null || id < prev) bucket.detalhados.set(det, id);

    if (ig < bucket.indiceGrupo) bucket.indiceGrupo = ig;
  }

  const grouped = Array.from(map.entries()).map(([grupo, obj]) => ({
    grupo,
    indiceGrupo: obj.indiceGrupo,
    detalhados: Array.from(obj.detalhados.entries())
      .map(([label, indiceDetalhado]) => ({ label, indiceDetalhado }))
      .sort((a, b) => a.indiceDetalhado - b.indiceDetalhado),
  }));

  grouped.sort((a, b) => a.indiceGrupo - b.indiceGrupo);

  return grouped;
}
