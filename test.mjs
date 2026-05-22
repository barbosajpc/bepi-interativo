import { config } from "dotenv";
import pg from "pg";

config();

const { Client } = pg;

const client = new Client({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT ?? 5432),
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  ssl: { rejectUnauthorized: false },
});

client
  .connect()
  .then(() => {
    console.log("✅ Conectou com sucesso!");
    client.end();
  })
  .catch((err) => console.error("❌ Erro:", err.message));