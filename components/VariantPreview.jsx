import Backdrop from "@/components/Backdrop";
import ProductArt from "@/components/ProductArt";
import { bgOf } from "@/lib/theme";

/** Static miniature of the hero stage: background, glow, backdrop shape and garment. */
export default function VariantPreview({ variant, className = "" }) {
  return (
    <div className={`relative isolate overflow-hidden ${className}`} style={{ background: bgOf(variant.theme) }}>
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 size-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-[50px]"
        style={{ backgroundColor: variant.theme.glow }}
      />
      <Backdrop backdrop={variant.backdrop} />
      <div className="absolute inset-0 flex items-center justify-center p-[3%]">
        <ProductArt variant={variant} className="h-full w-full" />
      </div>
    </div>
  );
}
