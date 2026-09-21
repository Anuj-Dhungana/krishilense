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

interface MonthData {
  bs_month: number;
  month_name_ne: string;
  median_price: number;
  spi: number | null;
  delta_spi_pct: number | null;
}

export default function SeasonalChart({ data }: { data: MonthData[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="py-12 text-center text-slate-400 text-sm">
        मौसमी तथ्याङ्क उपलब्ध छैन।
      </div>
    );
  }

  return (
    <div className="w-full h-72 sm:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis 
            dataKey="month_name_ne" 
            tick={{ fill: "#64748b", fontSize: 12 }} 
            tickLine={false}
          />
          <YAxis 
            tick={{ fill: "#64748b", fontSize: 12 }} 
            tickFormatter={(value) => `रु.${value}`}
            domain={["dataMin - 10", "dataMax + 10"]}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip 
            formatter={(value) => [`रु. ${value}/kg`, "औसत मूल्य"]}
            labelFormatter={(label) => `महिना: ${label}`}
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