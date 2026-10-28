import { DEFAULT_BACKDROP, hexToRgba } from "@/lib/theme";

/** The shape that sits behind the garment. Configured per colourway in the admin. */
export default function Backdrop({ backdrop }) {
  const b = { ...DEFAULT_BACKDROP, ...backdrop };
  if (b.shape === "none") return null;
  const shape = {
    circle: "aspect-square w-[78%] max-w-[460px] rounded-full",
    arch: "h-[88%] w-[66%] max-w-[380px] rounded-t-full rounded-b-[2rem]",
    square: "aspect-square w-[74%] max-w-[440px] rounded-[2.5rem]",
  }[b.shape];
  return (
    <div
      aria-hidden="true"
      className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border border-white/15 ${shape}`}
      style={{ background: hexToRgba(b.color, b.opacity) }}
    />
  );
}
