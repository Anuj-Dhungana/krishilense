"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useLanguage } from "../../../lib/i18n";

interface DailyPricePoint {
  date_label: string; // e.g. "6/12" (BS Month/Day)
  min_price: number;
  max_price: number;
  rep_price: number;
}

export default function DailyTrendChart({
  data,
  unit,
}: {
  data: DailyPricePoint[];
  unit: string;
}) {
  const { t, lang, formatPrice, formatNum } = useLanguage();

  if (!data || data.length === 0) {
    return (
      <div className="py-12 text-center text-slate-400 text-sm">
        {t("daily_no_data")}
      </div>
    );
  }

  const chartData = data.map((d) => ({
    ...d,
    display_date: formatNum(d.date_label),
  }));

  return (
    <div className="w-full" style={{ height: "300px", minHeight: "300px" }}>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="display_date"
            tick={{ fill: "#64748b", fontSize: 12 }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#64748b", fontSize: 12 }}
            tickFormatter={(value) => `${t("currency")}${formatNum(value)}`}
            domain={["dataMin - 10", "dataMax + 10"]}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            formatter={(value, name) => {
              const key = String(name ?? "");
              const label =
                key === "rep_price"
                  ? t("chart_avg_price")
                  : key === "max_price"
                  ? t("chart_max")
                  : t("chart_min");
              const val = formatPrice(typeof value === "number" ? value : parseFloat(String(value ?? "")));
              return [`${t("currency")} ${val}/${unit}`, label];
            }}
            labelFormatter={(label) =>
              `${t("chart_date_label")} ${label} ${t("chart_bs_suffix")}`
            }
            contentStyle={{
              backgroundColor: "#1e293b",
              color: "#fff",
              borderRadius: "8px",
              border: "none",
            }}
          />
          <Line
            type="monotone"
            dataKey="max_price"
            stroke="#94a3b8"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={false}
            name="max_price"
          />
          <Line
            type="monotone"
            dataKey="rep_price"
            stroke="#059669"
            strokeWidth={3}
            dot={{ r: 4, fill: "#059669", strokeWidth: 2, stroke: "#fff" }}
            activeDot={{ r: 7, fill: "#047857" }}
            name="rep_price"
          />
          <Line
            type="monotone"
            dataKey="min_price"
            stroke="#cbd5e1"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={false}
            name="min_price"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}