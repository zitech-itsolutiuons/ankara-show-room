"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, Lock, X } from "lucide-react";
import ProductArt from "@/components/ProductArt";
import { formatPrice } from "@/lib/format";

const field =
  "w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-white/60 focus:outline-none";

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-white/70">{label}</span>
      {children}
    </label>
  );
}

export default function CheckoutModal({ open, onClose, product, variant, size }) {
  const [status, setStatus] = useState("idle"); // idle | loading | success
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  function close() {
    onClose();
    setTimeout(() => {
      setStatus("idle");
      setError("");
      setResult(null);
    }, 300);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function onSubmit(e) {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    setError("");
    const f = new FormData(e.currentTarget);
    const payload = {
      productSlug: product.slug,
      variantKey: variant.key,
      size,
      customSize: f.get("customSize") || "",
      quantity: 1,
      notes: f.get("notes") || "",
      customer: {
        name: f.get("name"),
        email: f.get("email"),
        phone: f.get("phone"),
        address: f.get("address"),
        city: f.get("city"),
      },
    };
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      setResult(data);
      setStatus("success");
    } catch (err) {
      setError(err.message);
      setStatus("idle");
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={close} aria-hidden="true" />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Secure checkout"
            className="site-panel relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/15 bg-[#14100e]/85 p-6 shadow-2xl backdrop-blur-xl sm:p-8"
            initial={{ opacity: 0, y: 40, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
          >
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-32 opacity-40"
              style={{ background: `radial-gradient(60% 100% at 50% 0%, ${variant.theme.glow}, transparent)` }}
            />
            <button
              onClick={close}
              aria-label="Close checkout"
              className="absolute right-4 top-4 rounded-full border border-white/15 p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <X size={18} />
            </button>

            {status === "success" ? (
              <div className="relative py-6 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
                  className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-white text-black"
                >
                  <Check size={38} strokeWidth={2.5} />
                </motion.div>
                <h2 className="font-display text-3xl font-semibold">Order placed</h2>
                <p className="mt-3 text-white/70">
                  {variant.name}, size {size}. Your reference is
                </p>
                <p className="mt-1 font-display text-2xl font-semibold tracking-wide">{result?.orderRef}</p>
                <p className="mx-auto mt-4 max-w-sm text-sm text-white/60">
                  {result?.demo
                    ? "Demo mode: no database is connected, so this order was confirmed but not saved. Add MONGODB_URI to store real orders."
                    : "We'll email you to confirm your measurements, delivery and payment."}
                </p>
                <button
                  onClick={close}
                  className="mt-8 rounded-full bg-white px-8 py-3 font-medium text-black transition hover:bg-white/90"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="relative">
                <div className="mb-6 flex items-center gap-4 pr-10">
                  <div className="size-16 shrink-0 rounded-2xl bg-white/10 p-1.5">
                    <ProductArt variant={variant} className="h-full w-full" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-semibold leading-tight">{product.name}</h2>
                    <p className="text-sm text-white/70">
                      {variant.name} · Size {size} · {formatPrice(variant.price, product.currency)}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <Field label="Full name">
                    <input name="name" required autoComplete="name" className={field} placeholder="Adaeze Okafor" />
                  </Field>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Email">
                      <input name="email" type="email" required autoComplete="email" className={field} placeholder="you@example.com" />
                    </Field>
                    <Field label="Phone">
                      <input name="phone" type="tel" required autoComplete="tel" className={field} placeholder="0803 000 0000" />
                    </Field>
                  </div>
                  <Field label="Delivery address">
                    <input name="address" required autoComplete="street-address" className={field} placeholder="Street and landmark" />
                  </Field>
                  <Field label="City">
                    <input name="city" required autoComplete="address-level2" className={field} placeholder="Port Harcourt" />
                  </Field>
                  {size === "Custom" && (
                    <Field label="Your measurements">
                      <textarea
                        name="customSize"
                        required
                        rows={3}
                        className={field}
                        placeholder="Bust, waist, hip, shoulder and length in inches or cm"
                      />
                    </Field>
                  )}
                  <Field label="Notes (optional)">
                    <input name="notes" className={field} placeholder="Anything we should know" />
                  </Field>
                </div>

                {error && (
                  <p role="alert" className="mt-4 rounded-xl border border-red-400/40 bg-red-500/15 px-4 py-3 text-sm text-red-100">
                    {error}
                  </p>
                )}

                <motion.button
                  type="submit"
                  disabled={status === "loading"}
                  whileTap={{ scale: 0.98 }}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-4 font-medium text-black transition hover:bg-white/90 disabled:opacity-70"
                >
                  {status === "loading" ? <Loader2 size={18} className="animate-spin" /> : <Lock size={16} />}
                  {status === "loading" ? "Placing order" : `Place order · ${formatPrice(variant.price, product.currency)}`}
                </motion.button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
