import { themeFromRgb } from "@/lib/theme";

const OK = ["image/png", "image/jpeg", "image/webp", "image/avif"];

/** Resize to max 1600px and re-encode as WebP (keeps transparency) so uploads stay light. */
export async function prepareImage(file) {
  if (!OK.includes(file.type)) throw new Error("Use a PNG, JPG, WebP or AVIF image.");
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
  const w = Math.round(bmp.width * scale);
  const h = Math.round(bmp.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d").drawImage(bmp, 0, 0, w, h);
  for (const q of [0.9, 0.8, 0.65]) {
    const blob = await new Promise((r) => canvas.toBlob(r, "image/webp", q));
    if (blob && blob.size <= 3.8 * 1024 * 1024) return blob;
  }
  throw new Error("That image is too large even after compressing. Try a smaller one.");
}

/** Vibrancy-weighted average colour of the visible pixels, turned into a dark background theme. */
export async function themeFromImage(source) {
  const blob = typeof source === "string" ? await (await fetch(source)).blob() : source;
  const bmp = await createImageBitmap(blob);
  const c = document.createElement("canvas");
  c.width = c.height = 48;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(bmp, 0, 0, 48, 48);
  const px = ctx.getImageData(0, 0, 48, 48).data;
  let r = 0, g = 0, b = 0, wsum = 0;
  for (let i = 0; i < px.length; i += 4) {
    const a = px[i + 3] / 255;
    if (a < 0.5) continue;
    const mx = Math.max(px[i], px[i + 1], px[i + 2]);
    const mn = Math.min(px[i], px[i + 1], px[i + 2]);
    const sat = mx === 0 ? 0 : (mx - mn) / mx;
    const w = a * (0.1 + sat * sat);
    r += px[i] * w; g += px[i + 1] * w; b += px[i + 2] * w; wsum += w;
  }
  if (!wsum) throw new Error("Could not read colours from that image.");
  return themeFromRgb(r / wsum, g / wsum, b / wsum);
}
