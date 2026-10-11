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

interface MonthData {
  bs_month: number;
  month_name_ne: string;
  median_price: number;
  spi: number | null;
  delta_spi_pct: number | null;
}

export default function SeasonalChart({ data }: { data: MonthData[] }) {
  const { t, lang, formatPrice, formatNum } = useLanguage();

  if (!data || data.length === 0) {
    return (
      <div className="py-12 text-center text-slate-400 text-sm">
        {t("chart_seasonal_no_data")}
      </div>
    );
  }

  // Build chart data with translated month names as X-axis labels
  const chartData = data.map((d) => ({
    ...d,
    month_label: t(`bs_month_${d.bs_month}` as Parameters<typeof t>[0]),
  }));

  return (
    <div className="w-full" style={{ height: "300px", minHeight: "300px" }}>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="month_label"
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
            formatter={(value) => [`${t("currency")} ${formatPrice(Number(value))}/kg`, t("chart_avg_price")]}
            labelFormatter={(label) => `${t("chart_month_label")} ${label}`}
            contentStyle={{ backgroundColor: "#1e293b", color: "#fff", borderRadius: "8px", border: "none" }}
          />
          <Line
            type="monotone"
            dataKey="median_price"
            stroke="#059669"
            strokeWidth={3}
            dot={{ r: 4, fill: "#059669", strokeWidth: 2, stroke: "#fff" }}
            activeDot={{ r: 7, fill: "#047857" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}