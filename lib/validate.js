const HEX = /^#[0-9a-f]{6}$/i;
const PATTERNS = ["rings", "diamonds", "bars", "fans"];
const SHAPES = ["none", "circle", "arch", "square"];
const SCROLL_EXIT_CORNERS = ["top-left", "top-right", "bottom-left", "bottom-right"];
const str = (v, max) => String(v ?? "").trim().slice(0, max);
const hex = (v, d) => (typeof v === "string" && HEX.test(v) ? v.toLowerCase() : d);
const num = (v, min, max, d) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : d;
};
const image = (v) => {
  const s = str(v, 300);
  return s === "" || s.startsWith("/api/media/") || /^https:\/\/[^\s]+$/.test(s) ? s : "";
};
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "colourway";

export function sanitizeProduct(b, slugValue) {
  const name = str(b?.name, 100);
  if (!name) return { error: "Give the product a name." };
  const rawCategories = Array.isArray(b?.categories) ? b.categories.slice(0, 30) : [];
  if (Array.isArray(b?.categories) && b.categories.length > 30) return { error: "Keep categories to 30 or fewer." };
  const categories = rawCategories.map((category) => ({
    id: str(category?.id, 64),
    name: str(category?.name, 40),
  }));
  if (categories.some((category) => !category.id || !/^[a-zA-Z0-9_-]+$/.test(category.id) || !category.name)) {
    return { error: "Give every category a valid name and ID." };
  }
  const categoryIds = new Set();
  const categoryNames = new Set();
  for (const category of categories) {
    const normalizedName = category.name.toLowerCase();
    if (categoryIds.has(category.id) || categoryNames.has(normalizedName)) {
      return { error: "Category IDs and names must be unique." };
    }
    categoryIds.add(category.id);
    categoryNames.add(normalizedName);
  }
  if (categories.length === 0) categories.push({ id: "kaftans", name: "Kaftans" });
  const validCategoryIds = new Set(categories.map((category) => category.id));
  const raw = Array.isArray(b?.variants) ? b.variants.slice(0, 12) : [];
  if (raw.length === 0) return { error: "Keep at least one colourway." };
  const used = new Set();
  const variants = raw.map((v) => {
    const vn = str(v?.name, 60) || "Untitled colourway";
    let key = slug(str(v?.key, 60) || vn);
    while (used.has(key)) key = `${key.replace(/-\d+$/, "")}-${Math.floor(Math.random() * 900 + 100)}`;
    used.add(key);
    const pal = Array.isArray(v?.palette) ? v.palette : [];
    const t = v?.theme || {};
    const bd = v?.backdrop || {};
    return {
      key,
      name: vn,
      categoryId: validCategoryIds.has(v?.categoryId) ? v.categoryId : categories[0].id,
      tagline: str(v?.tagline, 120),
      price: Math.round(num(v?.price, 0, 10_000_000, 0)),
      pattern: PATTERNS.includes(v?.pattern) ? v.pattern : "rings",
      palette: [0, 1, 2, 3].map((i) => hex(pal[i], ["#e8a317", "#c2410c", "#1f2a44", "#fff3d6"][i])),
      theme: {
        from: hex(t.from, "#1a1210"),
        via: hex(t.via, "#5b2a1a"),
        to: hex(t.to, "#c2751f"),
        glow: hex(t.glow, "#e08a2b"),
      },
      backdrop: {
        shape: SHAPES.includes(bd.shape) ? bd.shape : "circle",
        color: hex(bd.color, "#ffffff"),
        opacity: num(bd.opacity, 0, 0.6, 0.1),
      },
      image: image(v?.image),
      imageScale: Math.round(num(v?.imageScale, 100, 175, 100)),
      inStock: v?.inStock !== false,
    };
  });
  return { value: { slug: slugValue, name, currency: "NGN", sizes: ["S", "M", "L", "XL", "Custom"], categories, variants } };
}

export function sanitizeSettings(b) {
  const canonicalUrl = str(b?.canonicalUrl, 300);
  if (canonicalUrl) {
    try {
      const parsed = new URL(canonicalUrl);
      if (parsed.protocol !== "https:" || parsed.username || parsed.password || parsed.pathname !== "/" || parsed.search || parsed.hash) {
        return { error: "Enter your website's HTTPS root URL, such as https://example.com." };
      }
    } catch {
      return { error: "Enter a valid website URL, such as https://example.com." };
    }
  }

  const seoSocialImage = str(b?.seoSocialImage, 500);
  if (seoSocialImage) {
    const localImage = /^\/api\/media\/[a-zA-Z0-9_-]+$/.test(seoSocialImage);
    let secureImage = false;
    try {
      secureImage = new URL(seoSocialImage).protocol === "https:";
    } catch {
      secureImage = false;
    }
    if (!localImage && !secureImage) return { error: "Use a secure HTTPS image URL or an uploaded site image." };
  }

  const googleVerification = str(b?.googleVerification, 200);
  if (googleVerification && !/^[a-zA-Z0-9_-]+$/.test(googleVerification)) {
    return { error: "Enter only the Google Search Console verification token value." };
  }

  return { value: {
    brandName: str(b?.brandName, 60),
    headline1: str(b?.headline1, 60),
    headline2: str(b?.headline2, 60),
    description: str(b?.description, 300),
    contactEmail: str(b?.contactEmail, 120),
    seoTitle: str(b?.seoTitle, 70),
    seoDescription: str(b?.seoDescription, 320),
    canonicalUrl,
    seoSocialImage,
    googleVerification,
    allowIndexing: b?.allowIndexing !== false,
    scrollChange: b?.scrollChange !== false,
    scrollStep: Math.round(num(b?.scrollStep, 40, 140, 70)),
    scrollExitCorner: SCROLL_EXIT_CORNERS.includes(b?.scrollExitCorner) ? b.scrollExitCorner : "top-left",
    scrollTransitionDuration: Math.round(num(b?.scrollTransitionDuration, 0.35, 2, 1.1) * 100) / 100,
  } };
}
