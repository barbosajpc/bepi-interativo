import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ========== CONSTANTS ==========
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const ACTIONS = {
  GET_STRUCTURE: "get_structure",
  GET_YEAR_RANGE: "get_year_range",
  GET_DATA: "get_data",
} as const;

const STATUS_CODES = {
  OK: 200,
  BAD_REQUEST: 400,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

const ERROR_MESSAGES = {
  REQUIRED_FIELDS: "grupo e detalhado são obrigatórios",
  YEAR_RANGE_NOT_FOUND: "Não foi possível determinar o range de anos.",
  UNKNOWN_ACTION: "Unknown action",
} as const;

// ========== HELPER FUNCTIONS ==========

/**
 * Sanitiza string para prevenir SQL injection básico
 */
function sanitizeSqlString(value: string): string {
  return (value ?? "").replace(/'/g, "''");
}

/**
 * Cria resposta JSON padronizada
 */
function createJsonResponse(
  data: unknown,
  status: number = STATUS_CODES.OK
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

/**
 * Busca o range de anos disponível para um grupo/detalhado específico
 */
async function getYearRange(
  supabase: ReturnType<typeof createClient>,
  grupo: string,
  detalhado: string
): Promise<{ minAno: number | null; maxAno: number | null }> {
  const safeGrupo = sanitizeSqlString(grupo);
  const safeDetalhado = sanitizeSqlString(detalhado);

  const query = `
    SELECT
      MIN("Ano")::int AS "minAno",
      MAX("Ano")::int AS "maxAno"
    FROM sumer.balanco_epi_cons
    WHERE "Grupo" = '${safeGrupo}'
      AND "Detalhado" = '${safeDetalhado}'
      AND "Valor da Energia" IS NOT NULL
      AND "Valor da Energia" != 0
  `;

  const { data, error } = await supabase.rpc("exec_sql", { query });
  if (error) throw error;

  const result = data?.[0] || null;
  return result ?? { minAno: null, maxAno: null };
}

/**
 * Valida se grupo e detalhado foram fornecidos
 */
function validateRequiredFields(
  grupo: string | undefined,
  detalhado: string | undefined
): { valid: boolean; error?: Response } {
  if (!grupo || !detalhado) {
    return {
      valid: false,
      error: createJsonResponse(
        { error: ERROR_MESSAGES.REQUIRED_FIELDS },
        STATUS_CODES.BAD_REQUEST
      ),
    };
  }
  return { valid: true };
}

// ========== ACTION HANDLERS ==========

/**
 * Retorna a estrutura hierárquica de Grupo e Detalhado
 */
async function handleGetStructure(
  supabase: ReturnType<typeof createClient>
): Promise<Response> {
  const query = `
  SELECT
    "Grupo",
    "Detalhado",
    MIN("Índice - Grupo")::int     AS "Índice - Grupo",
    MIN("Índice - Detalhado")::int AS "Índice - Detalhado"
  FROM sumer.balanco_epi_cons
  WHERE "Grupo" IS NOT NULL
    AND "Detalhado" IS NOT NULL
  GROUP BY "Grupo", "Detalhado"
  ORDER BY
    MIN("Índice - Grupo"),
    MIN("Índice - Detalhado")
  `;

  const { data, error } = await supabase.rpc("exec_sql", { query });
  if (error) throw error;

  return createJsonResponse(data || []);
}

/**
 * Retorna o range de anos disponível para um grupo/detalhado
 */
async function handleGetYearRange(
  supabase: ReturnType<typeof createClient>,
  grupo: string | undefined,
  detalhado: string | undefined
): Promise<Response> {
  const validation = validateRequiredFields(grupo, detalhado);
  if (!validation.valid) return validation.error!;

  const yearRange = await getYearRange(supabase, grupo!, detalhado!);
  return createJsonResponse(yearRange);
}

/**
 * Retorna os dados de energia para um grupo/detalhado e range de anos
 */
async function handleGetData(
  supabase: ReturnType<typeof createClient>,
  grupo: string | undefined,
  detalhado: string | undefined,
  anoMin: string | number | undefined,
  anoMax: string | number | undefined
): Promise<Response> {
  const validation = validateRequiredFields(grupo, detalhado);
  if (!validation.valid) return validation.error!;

  const safeGrupo = sanitizeSqlString(grupo!);
  const safeDetalhado = sanitizeSqlString(detalhado!);

  let minYear = Number.isFinite(Number(anoMin)) ? parseInt(String(anoMin), 10) : NaN;
  let maxYear = Number.isFinite(Number(anoMax)) ? parseInt(String(anoMax), 10) : NaN;

  // Se não veio anoMin/anoMax, busca do banco
  if (!Number.isFinite(minYear) || !Number.isFinite(maxYear)) {
    const yearRange = await getYearRange(supabase, grupo!, detalhado!);
    minYear = Number(yearRange.minAno);
    maxYear = Number(yearRange.maxAno);
  }

  // Validação final do range de anos
  if (!Number.isFinite(minYear) || !Number.isFinite(maxYear)) {
    return createJsonResponse(
      { error: ERROR_MESSAGES.YEAR_RANGE_NOT_FOUND },
      STATUS_CODES.UNPROCESSABLE_ENTITY
    );
  }

  const query = `
    SELECT "Ano", "Agregação", "Origem da Energia", "Tipo de fonte", "Valor da Energia"
    FROM sumer.balanco_epi_cons
    WHERE "Grupo" = '${safeGrupo}'
      AND "Detalhado" = '${safeDetalhado}'
      AND "Ano" >= ${minYear}
      AND "Ano" <= ${maxYear}
      AND "Valor da Energia" IS NOT NULL
      AND "Valor da Energia" != 0
    ORDER BY "Ano"
  `;

  const { data, error } = await supabase.rpc("exec_sql", { query });
  if (error) throw error;

  return createJsonResponse(data || []);
}

// ========== MAIN HANDLER ==========

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("PROJECT_URL")!;
    const supabaseKey = Deno.env.get("SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body
    const { action, grupo, detalhado, anoMin, anoMax } = await req.json();

    // Validate action exists
    if (!action) {
      return createJsonResponse(
        { error: ERROR_MESSAGES.UNKNOWN_ACTION },
        STATUS_CODES.BAD_REQUEST
      );
    }

    // Route to appropriate handler
    switch (action) {
      case ACTIONS.GET_STRUCTURE:
        return await handleGetStructure(supabase);

      case ACTIONS.GET_YEAR_RANGE:
        return await handleGetYearRange(supabase, grupo, detalhado);

      case ACTIONS.GET_DATA:
        return await handleGetData(supabase, grupo, detalhado, anoMin, anoMax);

      default:
        return createJsonResponse(
          { error: ERROR_MESSAGES.UNKNOWN_ACTION },
          STATUS_CODES.BAD_REQUEST
        );
    }
  } catch (error) {
    return createJsonResponse(
      { error: error?.message ?? String(error) },
      STATUS_CODES.INTERNAL_SERVER_ERROR
    );
  }
});