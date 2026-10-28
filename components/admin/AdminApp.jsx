"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp, Copy, ExternalLink, Globe, Loader2, LogOut, Package, Palette, Plus, SlidersHorizontal, Tags } from "lucide-react";
import VariantEditor from "@/components/admin/VariantEditor";
import CategoryManager from "@/components/admin/CategoryManager";
import SeoPanel from "@/components/admin/SeoPanel";
import SettingsPanel from "@/components/admin/SettingsPanel";
import OrdersPanel from "@/components/admin/OrdersPanel";
import { Btn } from "@/components/admin/ui";
import ProductArt from "@/components/ProductArt";

const TABS = [
  ["colourways", "Colourways", Palette],
  ["categories", "Categories", Tags],
  ["seo", "SEO", Globe],
  ["site", "Hero & site", SlidersHorizontal],
  ["orders", "Orders", Package],
];
const uid = () => (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Math.random()));
const withCids = (p) => {
  const categories = Array.isArray(p.categories) && p.categories.length ? p.categories : [{ id: "kaftans", name: "Kaftans" }];
  const categoryIds = new Set(categories.map((category) => category.id));
  return {
    ...p,
    categories,
    variants: p.variants.map((v) => ({
      ...v,
      categoryId: categoryIds.has(v.categoryId) ? v.categoryId : categories[0].id,
      backdrop: { shape: "circle", color: "#ffffff", opacity: 0.1, ...v.backdrop },
      imageScale: v.imageScale ?? 100,
      inStock: v.inStock !== false,
      cid: v.cid || uid(),
    })),
  };
};
const blankVariant = (categoryId) => ({
  cid: uid(), key: "", name: "New colourway", categoryId, tagline: "", price: 48500, pattern: "rings", image: "", imageScale: 100, inStock: true,
  palette: ["#e8a317", "#c2410c", "#1f2a44", "#fff3d6"],
  theme: { from: "#1a1210", via: "#5b2a1a", to: "#c2751f", glow: "#e08a2b" },
  backdrop: { shape: "circle", color: "#ffffff", opacity: 0.1 },
});

export default function AdminApp() {
  const router = useRouter();
  const [tab, setTab] = useState("colourways");
  const [state, setState] = useState(null); // {product, settings}
  const [saved, setSaved] = useState(null);
  const [meta, setMeta] = useState({ dbReady: false });
  const [sel, setSel] = useState(0);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const notify = useCallback((text, bad = false) => {
    setToast({ text, bad });
    setTimeout(() => setToast(null), 3500);
  }, []);

  useEffect(() => {
    Promise.all([fetch("/api/admin/product"), fetch("/api/admin/settings")])
      .then(async ([p, s]) => {
        if (p.status === 401 || s.status === 401) return router.replace("/admin/login");
        const pd = await p.json();
        const sd = await s.json();
        const next = { product: withCids(pd.product), settings: sd.settings };
        setState(next);
        setSaved(JSON.stringify(next));
        setMeta({ dbReady: pd.dbReady, hasUri: pd.hasUri });
      })
      .catch(() => notify("Could not load the admin data.", true));
  }, [router, notify]);

  const dirty = useMemo(() => state && saved && JSON.stringify(state) !== saved, [state, saved]);
  useEffect(() => {
    if (!dirty) return;
    const h = (e) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  if (!state) return <div className="grid min-h-screen place-items-center text-white/60"><Loader2 className="animate-spin" /></div>;

  const { product, settings } = state;
  const variants = product.variants;
  const categories = product.categories;
  const cur = variants[Math.min(sel, variants.length - 1)];
  const setProduct = (p) => setState((s) => ({ ...s, product: p }));
  const setVariants = (vs) => setProduct({ ...product, variants: vs });
  const patchVariant = (patch) => setVariants(variants.map((v) => (v.cid === cur.cid ? { ...v, ...patch } : v)));
  const move = (i, d) => {
    const j = i + d;
    if (j < 0 || j >= variants.length) return;
    const vs = [...variants];
    [vs[i], vs[j]] = [vs[j], vs[i]];
    setVariants(vs);
    setSel(j);
  };

  async function save() {
    setSaving(true);
    try {
      const [p, s] = await Promise.all([
        fetch("/api/admin/product", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(product) }),
        fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings) }),
      ]);
      if (p.status === 401 || s.status === 401) return router.replace("/admin/login");
      const pd = await p.json();
      const sd = await s.json();
      if (!p.ok || !s.ok) throw new Error(pd.error || sd.error || "Could not save.");
      const next = { product: withCids(pd.product), settings: sd.settings };
      setState(next);
      setSaved(JSON.stringify(next));
      notify("Saved. Your site is updated.");
    } catch (e) {
      notify(e.message, true);
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.replace("/admin/login");
  }

  return (
    <div className="min-h-screen bg-[#0d0b0a] text-white">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0d0b0a]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1300px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <p className="min-w-0 truncate font-display text-lg font-semibold">{settings.brandName} <span className="ml-1 text-sm font-normal text-white/45">Admin</span></p>
          <nav aria-label="Admin sections" className="hidden gap-1 md:flex">
            {TABS.map(([id, label, Icon]) => (
              <button key={id} onClick={() => setTab(id)} aria-current={tab === id ? "page" : undefined} className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm transition-colors ${tab === id ? "bg-white text-black" : "text-white/70 hover:bg-white/10"}`}>
                <Icon size={15} /> {label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <a href="/" target="_blank" rel="noreferrer" aria-label="View site" className="flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-white/15 p-2.5 text-sm text-white/80 hover:bg-white/10 sm:px-3 sm:py-2"><span className="hidden sm:inline">View site</span> <ExternalLink size={14} /></a>
            <button onClick={logout} aria-label="Log out" className="rounded-lg border border-white/15 p-2.5 text-white/80 hover:bg-white/10"><LogOut size={15} /></button>
          </div>
        </div>
        <nav aria-label="Admin sections" className="flex gap-1 overflow-x-auto px-4 pb-3 md:hidden">
          {TABS.map(([id, label, Icon]) => (
            <button key={id} onClick={() => setTab(id)} aria-current={tab === id ? "page" : undefined} className={`flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2 text-sm ${tab === id ? "bg-white text-black" : "text-white/70"}`}>
              <Icon size={15} /> {label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-[1300px] px-4 pb-32 pt-6 sm:px-6">
        {!meta.dbReady && (
          <p className="mb-6 rounded-xl border border-amber-300/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
            {meta.hasUri ? "MongoDB is not reachable right now." : "MongoDB is not connected."} You can look around, but saving and uploading are off until <code className="font-mono">MONGODB_URI</code> is set in <code className="font-mono">.env.local</code>.
          </p>
        )}

        {tab === "colourways" && (
          <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
            <aside className="space-y-2 lg:sticky lg:top-24 lg:self-start">
              {variants.map((v, i) => (
                <div key={v.cid} className={`flex items-center gap-3 rounded-xl border p-2 transition-colors ${v.cid === cur.cid ? "border-white/60 bg-white/10" : "border-white/10 hover:bg-white/5"}`}>
                  <button onClick={() => setSel(i)} className="flex min-w-0 flex-1 items-center gap-3 text-left" aria-current={v.cid === cur.cid}>
                    <span className="size-12 shrink-0 rounded-lg p-1" style={{ background: v.theme.via }}><ProductArt variant={v} className="h-full w-full" /></span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{v.name}</span>
                      <span className="block text-xs text-white/50">₦{Number(v.price).toLocaleString("en-NG")}{v.inStock ? "" : " · Sold out"}</span>
                    </span>
                  </button>
                  <span className="flex shrink-0 flex-col">
                    <button aria-label={`Move ${v.name} up`} onClick={() => move(i, -1)} disabled={i === 0} className="rounded p-0.5 text-white/60 hover:text-white disabled:opacity-25"><ChevronUp size={16} /></button>
                    <button aria-label={`Move ${v.name} down`} onClick={() => move(i, 1)} disabled={i === variants.length - 1} className="rounded p-0.5 text-white/60 hover:text-white disabled:opacity-25"><ChevronDown size={16} /></button>
                  </span>
                </div>
              ))}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Btn variant="ghost" disabled={variants.length >= 12} onClick={() => { setVariants([...variants, blankVariant(categories[0].id)]); setSel(variants.length); }}><Plus size={15} /> Add</Btn>
                <Btn variant="ghost" disabled={variants.length >= 12} onClick={() => { setVariants([...variants, { ...cur, cid: uid(), key: "", name: `${cur.name} copy` }]); setSel(variants.length); }}><Copy size={15} /> Duplicate</Btn>
              </div>
            </aside>
            <VariantEditor
              key={cur.cid}
              variant={cur}
              categories={categories}
              onChange={patchVariant}
              canSave={meta.dbReady}
              canDelete={variants.length > 1}
              onDelete={() => {
                if (!window.confirm(`Delete “${cur.name}”? This applies when you save.`)) return;
                setVariants(variants.filter((v) => v.cid !== cur.cid));
                setSel(0);
              }}
            />
          </div>
        )}
        {tab === "categories" && (
          <CategoryManager
            categories={categories}
            variants={variants}
            onChange={(nextCategories, nextVariants) => setProduct({ ...product, categories: nextCategories, variants: nextVariants })}
          />
        )}
        {tab === "seo" && <SeoPanel settings={settings} product={product} onSettings={(nextSettings) => setState((current) => ({ ...current, settings: nextSettings }))} />}
        {tab === "site" && <SettingsPanel settings={settings} product={product} onSettings={(s) => setState((x) => ({ ...x, settings: s }))} onProduct={setProduct} />}
        {tab === "orders" && <OrdersPanel notify={notify} />}
      </main>

      <AnimatePresence>
        {dirty && tab !== "orders" && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed inset-x-0 bottom-4 z-40 mx-auto flex w-[calc(100%-2rem)] max-w-md items-center justify-between gap-3 rounded-2xl border border-white/15 bg-[#1a1613]/95 p-3 pl-5 shadow-2xl backdrop-blur-md"
          >
            <span className="text-sm text-white/80">Unsaved changes</span>
            <span className="flex gap-2">
              <Btn variant="ghost" onClick={() => setState(JSON.parse(saved))} disabled={saving}>Discard</Btn>
              <Btn busy={saving} disabled={!meta.dbReady} onClick={save} title={meta.dbReady ? "" : "Connect MongoDB to save"}>Save changes</Btn>
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-20 z-50 flex justify-center px-4">
        <AnimatePresence>
          {toast && (
            <motion.p initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} className={`rounded-xl px-4 py-2.5 text-sm font-medium shadow-xl ${toast.bad ? "bg-red-500 text-white" : "bg-white text-black"}`}>
              {toast.text}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
