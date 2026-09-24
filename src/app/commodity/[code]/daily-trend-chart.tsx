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
  if (!data || data.length === 0) {
    return (
      <div className="py-12 text-center text-slate-400 text-sm">
        दैनिक कारोबार तथ्याङ्क उपलब्ध छैन।
      </div>
    );
  }

  return (
    <div className="w-full h-72 sm:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis 
            dataKey="date_label" 
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
  formatter={(value, name) => {
    const key = String(name ?? "");
    const label = key === "rep_price" ? "औसत मूल्य" : key === "max_price" ? "अधिकतम" : "न्यूनतम";
    const val = typeof value === "number" ? value.toFixed(2) : String(value ?? "");
    return [`रु. ${val}/${unit}`, label];
  }}
  labelFormatter={(label) => `मिति: ${label} (वि.सं.)`}
  contentStyle={{ backgroundColor: "#1e293b", color: "#fff", borderRadius: "8px", border: "none" }}
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