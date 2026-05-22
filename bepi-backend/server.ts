import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import { Pool } from "pg";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

const PORT = Number(process.env.PORT ?? 3000);
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN ?? "*";

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

const pool = new Pool({
  host: process.env.PGHOST!,
  port: Number(process.env.PGPORT ?? 5432),
  user: process.env.PGUSER!,
  password: process.env.PGPASSWORD!,
  database: process.env.PGDATABASE!,
  ssl: { rejectUnauthorized: false },
  max: 5,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

type QuerySql = (query: string, params?: unknown[]) => Promise<unknown[]>;

function makeQuerySql(client: { query: Function }): QuerySql {
  return async (query: string, params: unknown[] = []) => {
    const result = await client.query(query, params);
    return result.rows;
  };
}

function validateRequiredFields(grupo: string | undefined, detalhado: string | undefined): string | null {
  if (!grupo || !detalhado) return ERROR_MESSAGES.REQUIRED_FIELDS;
  return null;
}

async function getYearRange(querySql: QuerySql, grupo: string, detalhado: string) {
  const data = await querySql(
    `SELECT MIN("Ano")::int AS "minAno", MAX("Ano")::int AS "maxAno"
     FROM public.balanco_epi_cons
     WHERE "Grupo" = $1 AND "Detalhado" = $2
       AND "Valor da Energia" IS NOT NULL AND "Valor da Energia" != 0`,
    [grupo, detalhado]
  );
  return (data as Array<Record<string, unknown>>)[0] ?? { minAno: null, maxAno: null };
}

async function handleGetStructure(querySql: QuerySql) {
  return await querySql(
    `SELECT "Grupo", "Detalhado",
       MIN("Índice - Grupo")::int AS "Índice - Grupo",
       MIN("Índice - Detalhado")::int AS "Índice - Detalhado"
     FROM public.balanco_epi_cons
     WHERE "Grupo" IS NOT NULL AND "Detalhado" IS NOT NULL
     GROUP BY "Grupo", "Detalhado"
     ORDER BY MIN("Índice - Grupo"), MIN("Índice - Detalhado")`
  );
}

async function handleGetYearRange(querySql: QuerySql, grupo: string, detalhado: string) {
  return await getYearRange(querySql, grupo, detalhado);
}

async function handleGetData(querySql: QuerySql, grupo: string, detalhado: string, anoMin: unknown, anoMax: unknown) {
  let minYear = Number.isFinite(Number(anoMin)) ? parseInt(String(anoMin), 10) : NaN;
  let maxYear = Number.isFinite(Number(anoMax)) ? parseInt(String(anoMax), 10) : NaN;

  if (!Number.isFinite(minYear) || !Number.isFinite(maxYear)) {
    const yr = await getYearRange(querySql, grupo, detalhado) as any;
    minYear = Number(yr.minAno);
    maxYear = Number(yr.maxAno);
  }

  if (!Number.isFinite(minYear) || !Number.isFinite(maxYear)) {
    throw { status: STATUS_CODES.UNPROCESSABLE_ENTITY, message: ERROR_MESSAGES.YEAR_RANGE_NOT_FOUND };
  }

  return await querySql(
    `SELECT "Ano", "Agregação", "Origem da Energia", "Tipo de fonte", "Valor da Energia"
     FROM public.balanco_epi_cons
     WHERE "Grupo" = $1 AND "Detalhado" = $2
       AND "Ano" >= $3 AND "Ano" <= $4
       AND "Valor da Energia" IS NOT NULL AND "Valor da Energia" != 0
     ORDER BY "Ano"`,
    [grupo, detalhado, minYear, maxYear]
  );
}

const app = express();

app.use(helmet());
app.use(express.json({ limit: "10kb" }));

app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.setHeader("Access-Control-Allow-Headers", "content-type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.use(rateLimit({
  windowMs: 60_000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, slow down." },
}));

app.post("/bepi-data", async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { action, grupo, detalhado, anoMin, anoMax } = req.body ?? {};
    const querySql = makeQuerySql(client);

    if (!action) return res.status(STATUS_CODES.BAD_REQUEST).json({ error: ERROR_MESSAGES.UNKNOWN_ACTION });

    switch (action) {
      case ACTIONS.GET_STRUCTURE:
        return res.json(await handleGetStructure(querySql) ?? []);
      case ACTIONS.GET_YEAR_RANGE: {
        const err = validateRequiredFields(grupo, detalhado);
        if (err) return res.status(STATUS_CODES.BAD_REQUEST).json({ error: err });
        return res.json(await handleGetYearRange(querySql, grupo!, detalhado!));
      }
      case ACTIONS.GET_DATA: {
        const err = validateRequiredFields(grupo, detalhado);
        if (err) return res.status(STATUS_CODES.BAD_REQUEST).json({ error: err });
        return res.json(await handleGetData(querySql, grupo!, detalhado!, anoMin, anoMax) ?? []);
      }
      default:
        return res.status(STATUS_CODES.BAD_REQUEST).json({ error: ERROR_MESSAGES.UNKNOWN_ACTION });
    }
  } catch (error: any) {
    const status = error?.status ?? STATUS_CODES.INTERNAL_SERVER_ERROR;
    const message = error?.message ?? String(error);
    console.error(`[${new Date().toISOString()}] ERROR:`, message);
    return res.status(status).json({ error: message });
  } finally {
    client.release();
  }
});

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
