"use client";
import { useRef, useState } from "react";
import { AlertTriangle, ImagePlus, Loader2, Trash2, Wand2 } from "lucide-react";
import VariantPreview from "@/components/VariantPreview";
import { Btn, Card, ColorField, Field, Segmented, Toggle, inputCls } from "@/components/admin/ui";
import { prepareImage, themeFromImage } from "@/lib/imageTools";
import { luminance } from "@/lib/theme";

const PRESETS = [
  ["Harmattan", "#2b1405", "#7c2d12", "#f59e0b", "#f59e0b"],
  ["Indigo", "#050929", "#1b2670", "#4c6ef5", "#5c7cfa"],
  ["Emerald", "#02150d", "#0b4f33", "#1f9d63", "#2ecc71"],
  ["Hibiscus", "#260510", "#8f0f33", "#ff5d8f", "#ff5d8f"],
  ["Midnight", "#06070d", "#1d2233", "#5b6b99", "#7d8fc4"],
  ["Terracotta", "#1c0d08", "#6b2c17", "#d9764a", "#ee8f63"],
  ["Plum", "#150a1d", "#4b1c66", "#a855f7", "#c084fc"],
  ["Ink", "#08090a", "#1a1c1f", "#4a4f57", "#8a929e"],
];
const PATTERNS = [["rings", "Rings"], ["diamonds", "Diamonds"], ["bars", "Bars"], ["fans", "Fans"]];
const SHAPES = [["none", "None"], ["circle", "Circle"], ["arch", "Arch"], ["square", "Square"]];

export default function VariantEditor({ variant, categories, onChange, onDelete, canDelete, canSave }) {
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [theming, setTheming] = useState(false);
  const [error, setError] = useState("");
  const [autoBg, setAutoBg] = useState(true);
  const [drag, setDrag] = useState(false);

  const setTheme = (patch) => onChange({ theme: { ...variant.theme, ...patch } });
  const setBackdrop = (patch) => onChange({ backdrop: { ...variant.backdrop, ...patch } });
  const lightBg = luminance(variant.theme.from) > 0.35 || luminance(variant.theme.via) > 0.45;

  async function upload(file) {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const blob = await prepareImage(file);
      const fd = new FormData();
      fd.append("file", blob, "upload.webp");
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Upload failed.");
      const patch = { image: data.url };
      if (autoBg) patch.theme = await themeFromImage(blob).catch(() => variant.theme);
      onChange(patch);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function autoTheme() {
    setTheming(true);
    setError("");
    try {
      onChange({ theme: await themeFromImage(variant.image) });
    } catch (e) {
      setError(e.message);
    } finally {
      setTheming(false);
    }
  }

  return (
    <div className="space-y-5">
      <VariantPreview variant={variant} className="h-72 rounded-2xl border border-white/10 sm:h-80" />

      <Card title="Details">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name">
            <input className={inputCls} value={variant.name} maxLength={60} onChange={(e) => onChange({ name: e.target.value })} />
          </Field>
          <Field label="Price (₦)">
            <input className={inputCls} type="number" min={0} step={500} value={variant.price} onChange={(e) => onChange({ price: Number(e.target.value) })} />
          </Field>
          <Field label="Tagline" className="sm:col-span-2">
            <input className={inputCls} value={variant.tagline} maxLength={120} onChange={(e) => onChange({ tagline: e.target.value })} />
          </Field>
          <Field label="Category">
            <select className={inputCls} value={variant.categoryId} onChange={(e) => onChange({ categoryId: e.target.value })}>
              {categories.map((category) => <option key={category.id} value={category.id} className="bg-[#171311]">{category.name}</option>)}
            </select>
          </Field>
        </div>
        <div className="mt-5 border-t border-white/10 pt-5">
          <Toggle label="In stock" desc="Turn off to show “Sold out” and block new orders for this colourway." checked={variant.inStock} onChange={(v) => onChange({ inStock: v })} />
        </div>
      </Card>

      <Card title="Image" desc="Upload a photo or cut-out of the garment. A PNG or WebP with a transparent background looks best. Images are resized and compressed automatically.">
        <div
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); upload(e.dataTransfer.files?.[0]); }}
          className={`flex flex-col items-center gap-3 rounded-xl border border-dashed p-6 text-center transition-colors ${drag ? "border-white bg-white/10" : "border-white/20"}`}
        >
          {variant.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={variant.image} alt="" className="h-28 w-auto rounded-lg bg-white/5 object-contain" />
          ) : (
            <ImagePlus size={28} className="text-white/50" />
          )}
          <p className="text-sm text-white/70">{variant.image ? "Drop a new image to replace this one" : "Drag an image here, or choose a file"}</p>
          <div className="flex flex-wrap justify-center gap-2">
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/avif" className="sr-only" id="img-file" onChange={(e) => upload(e.target.files?.[0])} />
            <Btn type="button" busy={busy} disabled={!canSave} onClick={() => fileRef.current?.click()}>
              {busy ? "Uploading" : variant.image ? "Replace image" : "Upload image"}
            </Btn>
            {variant.image && (
              <Btn type="button" variant="ghost" onClick={() => onChange({ image: "" })}>
                <Trash2 size={15} /> Remove
              </Btn>
            )}
          </div>
          {!canSave && <p className="text-xs text-amber-200/80">Connect MongoDB to upload images.</p>}
        </div>
        <div className="mt-4">
          <Toggle label="Match the background to each new image" desc="After an upload, pick background colours from the image automatically. You can still adjust them below." checked={autoBg} onChange={setAutoBg} />
        </div>
        {variant.image && (
          <div className="mt-5 border-t border-white/10 pt-5">
            <Field label={`Displayed image size: ${variant.imageScale ?? 100}%`} hint="Increase the garment size across the hero and colourway previews.">
              <input
                type="range"
                min={100}
                max={175}
                step={5}
                value={variant.imageScale ?? 100}
                onChange={(e) => onChange({ imageScale: Number(e.target.value) })}
                className="w-full accent-white"
              />
            </Field>
          </div>
        )}
        {error && <p role="alert" className="mt-4 rounded-lg border border-red-400/40 bg-red-500/15 px-3 py-2 text-sm text-red-100">{error}</p>}

        {!variant.image && (
          <div className="mt-5 border-t border-white/10 pt-5">
            <p className="mb-3 text-sm font-medium text-white/80">Generated artwork (used until you upload an image)</p>
            <Segmented label="Pattern" value={variant.pattern} onChange={(v) => onChange({ pattern: v })} options={PATTERNS} />
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {variant.palette.map((c, i) => (
                <ColorField key={i} label={`Colour ${i + 1}`} value={c} onChange={(v) => onChange({ palette: variant.palette.map((p, j) => (j === i ? v : p)) })} />
              ))}
            </div>
          </div>
        )}
      </Card>

      <Card
        title="Background behind the image"
        desc="Colours of the hero background for this colourway. Keep them dark so the white text stays readable."
        action={
          <Btn type="button" variant="ghost" busy={theming} disabled={!variant.image} onClick={autoTheme} title={variant.image ? "" : "Upload an image first"}>
            <Wand2 size={15} /> Auto from image
          </Btn>
        }
      >
        <div className="mb-5">
          <p className="mb-2 text-sm font-medium text-white/80">Presets</p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map(([name, from, via, to, glow]) => (
              <button
                key={name}
                type="button"
                title={name}
                aria-label={`Use ${name} preset`}
                onClick={() => setTheme({ from, via, to, glow })}
                className="size-10 rounded-full border-2 border-white/20 transition-transform hover:scale-110"
                style={{ background: `linear-gradient(135deg, ${from}, ${via} 55%, ${to})` }}
              />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <ColorField label="Edge" value={variant.theme.from} onChange={(v) => setTheme({ from: v })} />
          <ColorField label="Middle" value={variant.theme.via} onChange={(v) => setTheme({ via: v })} />
          <ColorField label="Centre light" value={variant.theme.to} onChange={(v) => setTheme({ to: v })} />
          <ColorField label="Glow" value={variant.theme.glow} onChange={(v) => setTheme({ glow: v })} />
        </div>
        {lightBg && (
          <p className="mt-4 flex items-start gap-2 rounded-lg border border-amber-300/30 bg-amber-400/10 px-3 py-2 text-sm text-amber-100">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" /> These edge colours are quite light. The white headline may be hard to read.
          </p>
        )}

        <div className="mt-6 border-t border-white/10 pt-5">
          <p className="mb-3 text-sm font-medium text-white/80">Shape behind the garment</p>
          <Segmented label="Backdrop shape" value={variant.backdrop.shape} onChange={(v) => setBackdrop({ shape: v })} options={SHAPES} />
          {variant.backdrop.shape !== "none" && (
            <div className="mt-4 grid items-end gap-4 sm:grid-cols-2">
              <ColorField label="Shape colour" value={variant.backdrop.color} onChange={(v) => setBackdrop({ color: v })} />
              <Field label={`Opacity ${Math.round(variant.backdrop.opacity * 100)}%`}>
                <input type="range" min={0} max={0.6} step={0.02} value={variant.backdrop.opacity} onChange={(e) => setBackdrop({ opacity: Number(e.target.value) })} className="w-full accent-white" />
              </Field>
            </div>
          )}
        </div>
      </Card>

      <div className="flex justify-end">
        <Btn type="button" variant="danger" disabled={!canDelete} onClick={onDelete}>
          <Trash2 size={15} /> Delete colourway
        </Btn>
      </div>
    </div>
  );
}
