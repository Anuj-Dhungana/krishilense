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

/**
 * Constrains external thumbnail URLs (Unsplash, Cloudinary, etc.) to small 96x96 representations
 * so 48x48 thumbnail elements do not download multi-megabyte unconstrained original images.
 */
export function optimizeThumbnailUrl(url: string | null | undefined, size = 96): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // Data URLs and internal paths don't need external CDN query transforms
  if (trimmed.startsWith("data:") || trimmed.startsWith("/")) {
    return trimmed;
  }

  try {
    // 1. Unsplash: Enforce w=96&h=96&fit=crop&q=80
    if (trimmed.includes("images.unsplash.com")) {
      const parsed = new URL(trimmed);
      parsed.searchParams.set("w", String(size));
      parsed.searchParams.set("h", String(size));
      parsed.searchParams.set("fit", "crop");
      parsed.searchParams.set("q", "80");
      parsed.searchParams.set("auto", "format");
      return parsed.toString();
    }

    // 2. Cloudinary: Inject transformation w_96,h_96,c_fill,f_auto,q_auto
    if (trimmed.includes("res.cloudinary.com") && trimmed.includes("/upload/")) {
      const transform = `w_${size},h_${size},c_fill,f_auto,q_auto`;
      if (!trimmed.includes(transform)) {
        return trimmed.replace("/upload/", `/upload/${transform}/`);
      }
    }
  } catch {
    return trimmed;
  }

  return trimmed;
}

/**
 * Returns either an optimized image URL or a lightweight category SVG icon.
 */
export function getCommodityThumbnail(
  imageUrl: string | null | undefined,
  nameNe: string,
  categoryNe: string,
  code: string,
  size = 96
): string {
  if (imageUrl && imageUrl.trim()) {
    const optimized = optimizeThumbnailUrl(imageUrl, size);
    if (optimized) return optimized;
  }
  return getCropIconUrl(nameNe, categoryNe, code);
}

