const CATEGORY_ICONS: Array<{ matches: string[]; icon: string; color: string }> = [
  { matches: ["फल", "fruit"], icon: "🍎", color: "#fee2e2" },
  { matches: ["तरकारी", "vegetable"], icon: "🥬", color: "#dcfce7" },
  { matches: ["अनाज", "cereal", "grain"], icon: "🌾", color: "#fef3c7" },
  { matches: ["दलहन", "pulse", "legume"], icon: "🫘", color: "#f3e8ff" },
  { matches: ["मसला", "spice"], icon: "🌶️", color: "#ffedd5" },
];

function getCategoryIcon(category: string): { icon: string; color: string } {
  const normalizedCategory = category.toLocaleLowerCase();
  const match = CATEGORY_ICONS.find(({ matches }) =>
    matches.some((value) => normalizedCategory.includes(value))
  );

  return match ? { icon: match.icon, color: match.color } : { icon: "🌱", color: "#dbeafe" };
}

export function getCropIconUrl(name: string, category: string, code: string): string {
  const { icon, color } = getCategoryIcon(category);
  const label = name.trim().slice(0, 12);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
      <rect width="160" height="160" rx="24" fill="${color}"/>
      <text x="80" y="82" text-anchor="middle" dominant-baseline="middle" font-size="64">${icon}</text>
      <text x="80" y="130" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#334155">${label}</text>
      <title>${name} (${code})</title>
    </svg>
  `;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
