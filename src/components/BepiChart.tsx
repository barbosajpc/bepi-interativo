import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { BepiDataPoint } from "@/lib/bepi-api";

function niceCeil(n: number) {
  // arredonda pra 1 / 2 / 5 / 10 * 10^k (ticks ficam “humanos”)
  const x = Number(n);
  if (!Number.isFinite(x) || x <= 0) return 1;

  const p = Math.pow(10, Math.floor(Math.log10(x)));
  const d = x / p;

  const m = d <= 1 ? 1 : d <= 2 ? 2 : d <= 5 ? 5 : 10;
  return m * p;
}

const COLORS = [
  "#254194",
  "#006835",
  "#F4B900",
  "#DC391F",
  "#0088CC",
  "#8B5CF6",
  "#E67E22",
  "#16A085",
  "#E74C8B",
  "#5D8C3E",
  "#7B68EE",
  "#CD853F",
  "#20B2AA",
  "#DC143C",
  "#4682B4",
  "#DAA520",
  "#2E8B57",
  "#FF6347",
  "#6A5ACD",
  "#3CB371",
  "#FF8C00",
  "#4169E1",
  "#B22222",
  "#32CD32",
  "#8B0000",
  "#00CED1",
];

interface BepiChartProps {
  data: BepiDataPoint[];

  // Título do grupo (ex.: "Perdas")
  groupTitle: string;
  // Número do grupo (ex.: "6")
  groupNumber?: string | number | null;

  // Subtítulo do item (ex.: "PERDAS DISTRIB. ARMAZENAGEM")
  subtitle: string;
  // Número do item (ex.: "6.1")
  subtitleNumber?: string | number | null;

  // (Opcional) label do eixo Y
  yAxisLabel?: string;
}

export function BepiChart({
  data,
  groupTitle,
  groupNumber,
  subtitle,
  subtitleNumber,
  yAxisLabel = "Energia (10³ tep)",
}: BepiChartProps) {
  const { chartData, seriesKeys, yMin, yMax } = useMemo(() => {
    const byYear = new Map<number, Record<string, number>>();
    const allSeries = new Set<string>();

    for (const d of data) {
      const key = String(d["Origem da Energia"] ?? "").trim();
      if (!key) continue;
      allSeries.add(key);
      if (!byYear.has(d.Ano)) byYear.set(d.Ano, {});
      const row = byYear.get(d.Ano)!;
      row[key] = (row[key] || 0) + d["Valor da Energia"];
    }

    const years = Array.from(byYear.keys()).sort((a, b) => a - b);
    const chartData = years.map((year) => ({
      Ano: year,
      ...byYear.get(year),
    }));

    const seriesKeys = Array.from(allSeries).sort();

    let minVal = 0;
    let maxVal = 0;

    for (const row of chartData) {
      for (const k of seriesKeys) {
        const v = Number((row as any)[k]);
        if (!Number.isFinite(v)) continue;

        minVal = Math.min(minVal, v);
        maxVal = Math.max(maxVal, v);
      }
    }

    // margem visual
    const paddedMin = minVal * 1.08;
    const paddedMax = maxVal * 1.08;

    // arredondamento bonito
    const yMin = paddedMin < 0 ? -niceCeil(Math.abs(paddedMin)) : 0;
    const yMax = paddedMax > 0 ? niceCeil(paddedMax) : 1;

    return { chartData, seriesKeys, yMin, yMax };
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-muted-foreground">
        <p>Nenhum dado disponível para esta seleção.</p>
      </div>
    );
  }

  const groupPrefix =
    groupNumber !== undefined &&
    groupNumber !== null &&
    String(groupNumber).trim() !== ""
      ? `${groupNumber}. `
      : "";

  const subtitlePrefix =
    subtitleNumber !== undefined &&
    subtitleNumber !== null &&
    String(subtitleNumber).trim() !== ""
      ? `${subtitleNumber} `
      : "";

  return (
    <div className="w-full -mt-10">
      {/* TÍTULO DO GRUPO (maior) */}
      <h1 className="text-3xl md:text-4xl font-heading font-semibold text-foreground mb-10">
        {groupPrefix}
        {groupTitle}
      </h1>

      {/* SUBTÍTULO CENTRALIZADO (menor) */}
      <h2 className="text-lg md:text-xl font-heading font-semibold text-foreground text-center mb-2">
        {subtitlePrefix}
        {subtitle}
      </h2>

      <div className="h-[500px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="Ano"
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={{ stroke: "hsl(var(--border))" }}
              label={{
                value: "Ano",
                position: "insideBottom",
                offset: -5,
                style: {
                  fontSize: 12,
                  fill: "hsl(var(--muted-foreground))",
                },
              }}
            />
            <YAxis
              domain={[yMin, yMax]}
              allowDecimals={false}
              tickCount={6}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={{ stroke: "hsl(var(--border))" }}
              label={{
                value: yAxisLabel,
                angle: -90,
                position: "insideLeft",
                offset: -5,
                style: {
                  fontSize: 12,
                  fill: "hsl(var(--muted-foreground))",
                  textAnchor: "middle",
                },
              }}
            />
            <Tooltip
              formatter={(value: number) =>
                value.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              }
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
                fontSize: 12,
              }}
              labelStyle={{ fontWeight: 600 }}
            />
            <Legend
              verticalAlign="top"
              wrapperStyle={{ paddingBottom: 16, fontSize: 11 }}
            />
            {seriesKeys.map((key, i) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={2}
                dot={{ r: 2, fill: COLORS[i % COLORS.length] }}
                activeDot={{ r: 4 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
