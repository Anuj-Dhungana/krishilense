interface MonthOpportunity {
  bs_month: number;
  month_name_ne: string;
  median_price: number;
  delta_spi_pct: number | null;
}

export default function CropCalendarCard({
  data,
  cropNameNe,
}: {
  data: MonthOpportunity[];
  cropNameNe: string;
}) {
  if (!data || data.length === 0) return null;

  // Find the highest and lowest price months
  const sorted = [...data].sort((a, b) => b.median_price - a.median_price);
  const highestMonth = sorted[0];
  const lowestMonth = sorted[sorted.length - 1];

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>📅</span> १२ महिनाको बाली तथा बजार अवसर क्यालेन्डर (Crop & Market Calendar)
          </h2>
          <p className="text-xs text-slate-500">
            कुन महिनामा मूल्य उच्च रहन्छ र कुन महिनामा बजारमा अत्यधिक आपूर्ति (सस्तो) हुन्छ?
          </p>
        </div>

        {/* Quick Summary Pill */}
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 font-medium">
            🔥 उच्चतम: {highestMonth?.month_name_ne} (रु. {highestMonth?.median_price.toFixed(2)})
          </span>
          <span className="px-2.5 py-1 bg-rose-50 text-rose-800 rounded-lg border border-rose-200 font-medium">
            📉 सस्तो: {lowestMonth?.month_name_ne} (रु. {lowestMonth?.median_price.toFixed(2)})
          </span>
        </div>
      </div>

      {/* 12-Month Calendar Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-12 gap-2">
        {data.map((item) => {
          const delta = item.delta_spi_pct ?? 0;
          const isHigh = delta > 15;
          const isLow = delta < -15;

          return (
            <div
              key={item.bs_month}
              className={`p-3 rounded-xl border text-center flex flex-col justify-between space-y-2 transition-all ${
                isHigh
                  ? "bg-emerald-50/80 border-emerald-300 ring-1 ring-emerald-400/30"
                  : isLow
                  ? "bg-rose-50/60 border-rose-200"
                  : "bg-slate-50 border-slate-200"
              }`}
            >
              {/* Month Header */}
              <span className="text-xs font-bold text-slate-800">
                {item.month_name_ne}
              </span>

              {/* Price */}
              <div className="font-mono text-xs font-bold text-slate-900">
                रु. {item.median_price.toFixed(0)}
              </div>

              {/* Status Badge */}
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full block ${
                  isHigh
                    ? "bg-emerald-600 text-white"
                    : isLow
                    ? "bg-rose-100 text-rose-800"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                {isHigh ? "🔥 उच्च मूल्य" : isLow ? "📉 सस्तो बजार" : "⚖ सामान्य"}
              </span>

              {/* Delta Percentage */}
              <span className={`text-[10px] font-mono ${delta > 0 ? "text-emerald-700" : "text-rose-600"}`}>
                {delta > 0 ? `+${delta}%` : `${delta}%`}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend & Farmer Advisory Note */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <p>
            <strong>💡 किसानका लागि सुझाव (Farmer Advisory):</strong> {cropNameNe} खेती गर्दा <strong>{highestMonth?.month_name_ne}</strong> महिनाको उच्च मूल्य समात्न करिब ६०–८० दिन अगावै रोपाइँ वा टनेल/बेमौसमी प्रविधि प्रयोग गर्न सिफारिस गरिन्छ।
          </p>
          <p className="text-[11px] text-slate-400">
            * <strong>{lowestMonth?.month_name_ne}</strong> महिनामा मुख्य उत्पादन सबै क्षेत्रबाट एकैपटक बजारमा आउने हुँदा मूल्यमा भारी गिरावट आउने गरेको छ।
          </p>
        </div>
      </div>
    </div>
  );
}