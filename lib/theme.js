export const bgOf = (t) =>
  `radial-gradient(60% 70% at 50% 58%, ${t.to} 0%, transparent 72%), linear-gradient(120deg, ${t.from} 0%, ${t.via} 50%, ${t.from} 100%)`;

export const DEFAULT_BACKDROP = { shape: "circle", color: "#ffffff", opacity: 0.1 };

export function hexToRgba(hex, a = 1) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

export function luminance(hex) {
  const h = hex.replace("#", "");
  const n = parseInt(h, 16);
  const f = (c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f((n >> 16) & 255) + 0.7152 * f((n >> 8) & 255) + 0.0722 * f(n & 255);
}

export function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const x = (v) => Math.round(v * 255).toString(16).padStart(2, "0");
  return `#${x(f(0))}${x(f(8))}${x(f(4))}`;
}

export function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let h = 0;
  const l = (max + min) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  if (d) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return [h, s * 100, l * 100];
}

/** Dark, readable background theme derived from one dominant colour. */
export function themeFromRgb(r, g, b) {
  const [h, s] = rgbToHsl(r, g, b);
  const sat = Math.max(45, Math.min(85, s));
  return {
    from: hslToHex(h, Math.min(sat, 60), 7),
    via: hslToHex(h, sat, 24),
    to: hslToHex(h, sat, 52),
    glow: hslToHex(h, Math.min(95, sat + 10), 58),
  };
}
