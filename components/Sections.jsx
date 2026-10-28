"use client";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import ProductArt, { Swatch } from "@/components/ProductArt";
import { formatPrice } from "@/lib/format";

const ease = [0.2, 0.8, 0.2, 1];

function Reveal({ children, delay = 0, className = "" }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, ease, delay }}
    >
      {children}
    </motion.div>
  );
}

const Kick = ({ children }) => (
  <span className="inline-flex items-center gap-2.5 text-sm text-white/70">
    <span className="size-2 rounded-full bg-[var(--g)] transition-colors duration-1000" />
    {children}
  </span>
);

const H2 = "mt-4 max-w-[15ch] font-display text-4xl font-semibold leading-none tracking-tight sm:text-5xl lg:text-6xl";
const Wrap = ({ id, children }) => (
  <section id={id} className="mx-auto w-full max-w-[1400px] px-5 pt-24 sm:px-8 lg:px-12 lg:pt-32">
    {children}
  </section>
);
const glass = "border border-white/15 bg-white/5 backdrop-blur-md";

const TICKER = ["Made to order", "Hand-finished", "Four colourways", "Custom sizing", "Wax-print Ankara"];
const PRINCIPLES = [
  ["01", "Wax-print cloth", "Saturated Ankara chosen for how it holds colour and drape."],
  ["02", "A sharper cut", "A clean kaftan shape with a deep neckline and a trimmed hem."],
  ["03", "Made to order", "Each piece is cut after you order, in your size or your own measurements."],
];
const SIZES = [
  ["S", "34–36", "28–30", "38–40", "46"],
  ["M", "36–38", "30–32", "40–42", "46"],
  ["L", "38–40", "32–34", "42–44", "47"],
  ["XL", "40–42", "34–36", "44–46", "47"],
];
const STEPS = [
  ["01", "Choose your piece", "Pick a colourway and a size, or send custom measurements."],
  ["02", "Place your order", "Fill in your details. Your reference appears straight away."],
  ["03", "We confirm and deliver", "We email to confirm everything, then cut and send your piece."],
];
const FAQ = [
  ["How does ordering work?", "Pick a colourway and size, then place your order. We email you to confirm your details, delivery and payment."],
  ["Can I order a custom size?", "Yes. Choose Custom, then add your measurements in the order form. We will confirm them with you."],
  ["Can I change my colourway after ordering?", "Contact us quickly with your order reference. Because each piece is cut to order, changes are easiest before cutting begins."],
  ["How do I pay?", "You pay after we confirm your order by email. Payment options are shared in that message."],
];

export default function Sections({ brand, email, product, categories, variants, onSelect, onCustom, onOrder }) {
  const [sent, setSent] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  const visibleVariants = activeCategory === "all"
    ? variants
    : variants.filter((variant) => variant.categoryId === activeCategory);

  return (
    <>
      {/* Ticker */}
      <div aria-hidden="true" className="mt-14 overflow-hidden border-y border-white/10 py-4">
        <div className="marquee flex w-max">
          {[0, 1].map((k) => (
            <span key={k} className="flex items-center gap-10 whitespace-nowrap pr-10 font-display text-2xl font-medium sm:text-3xl">
              {TICKER.map((t) => (
                <span key={t} className="flex items-center gap-10">
                  {t}
                  <span className="text-lg text-[var(--g)] transition-colors duration-1000">✦</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* Collection */}
      <Wrap id="collection">
        <Reveal>
          <Kick>The collection</Kick>
          <h2 className={H2}>{variants.length} colourways, one silhouette.</h2>
          <p className="mt-5 max-w-md leading-relaxed text-white/75">
            The same clean kaftan across {variants.length} wax-print colourways. Filter by category to find the print you want, then choose it to order.
          </p>
        </Reveal>
        <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Filter clothes by category">
          <button
            type="button"
            onClick={() => setActiveCategory("all")}
            aria-pressed={activeCategory === "all"}
            className={`rounded-full border px-4 py-2 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
              activeCategory === "all" ? "border-white bg-white text-black" : "border-white/25 text-white/75 hover:border-white/60 hover:text-white"
            }`}
          >
            All clothes <span className={activeCategory === "all" ? "ml-1 text-black/60" : "ml-1 text-white/45"}>{variants.length}</span>
          </button>
          {categories.map((category) => {
            const count = variants.filter((variant) => variant.categoryId === category.id).length;
            const active = activeCategory === category.id;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategory(category.id)}
                aria-pressed={active}
                className={`rounded-full border px-4 py-2 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                  active ? "border-white bg-white text-black" : "border-white/25 text-white/75 hover:border-white/60 hover:text-white"
                }`}
              >
                {category.name} <span className={active ? "ml-1 text-black/60" : "ml-1 text-white/45"}>{count}</span>
              </button>
            );
          })}
        </div>
        {visibleVariants.length > 0 ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {visibleVariants.map((v, i) => (
              <Reveal key={v.key} delay={i * 0.08}>
                <motion.button
                  onClick={() => onSelect(variants.findIndex((variant) => variant.key === v.key))}
                  whileHover={{ y: -8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  className="group block h-full w-full overflow-hidden rounded-[28px] border border-white/15 text-left hover:border-white/40"
                  style={{ background: `linear-gradient(160deg, ${v.theme.via}, ${v.theme.from})` }}
                >
                  <div className="aspect-[4/5] p-6">
                    <ProductArt variant={v} className="h-full w-full transition-transform duration-700 group-hover:-rotate-2 group-hover:scale-105" />
                  </div>
                  <div className="bg-black/35 p-5 backdrop-blur-md">
                    <p className="font-display text-xl font-semibold">{v.name}</p>
                    <p className="mt-1 min-h-[42px] text-sm text-white/70">{v.tagline}</p>
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <b className="font-display text-xl font-semibold">{formatPrice(v.price, product.currency)}</b>
                      <span className="text-white/80">Select →</span>
                    </div>
                  </div>
                </motion.button>
              </Reveal>
            ))}
          </div>
        ) : (
          <p className="mt-5 rounded-2xl border border-white/15 px-5 py-8 text-sm text-white/70">
            No clothes in this category yet. Choose another category to keep browsing.
          </p>
        )}
      </Wrap>

      {/* Story */}
      <Wrap id="story">
        <div className="grid items-center gap-11 md:grid-cols-2 md:gap-16 lg:gap-[72px]">
          <Reveal>
            <Kick>Our story</Kick>
            <h2 className={H2}>Heritage cloth, cut for today.</h2>
            <p className="mt-5 max-w-md leading-relaxed text-white/75">
              Ankara carries stories in every motif. We keep the cloth bold and loud, and give it a shape that works with jeans, heels or sneakers.
            </p>
            <ul className="mt-8 border-t border-white/15">
              {PRINCIPLES.map(([n, t, d]) => (
                <li key={n} className="grid grid-cols-[52px_1fr] border-b border-white/15 py-5">
                  <b className="font-display font-semibold text-[var(--g)] transition-colors duration-1000">{n}</b>
                  <div>
                    <strong className="block text-lg font-medium">{t}</strong>
                    <p className="mt-1.5 text-[15px] leading-normal text-white/70">{d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.1} className={`grid grid-cols-2 gap-3 rounded-[32px] p-3 pb-10 ${glass}`}>
            {variants.slice(0, 5).map((v, i) => (
              <Swatch key={v.key} variant={v} className={`block h-auto w-full ${i % 2 ? "translate-y-7" : ""}`} />
            ))}
          </Reveal>
        </div>
      </Wrap>

      {/* Size guide */}
      <Wrap id="size">
        <Reveal>
          <Kick>Size guide</Kick>
          <h2 className={H2}>Find your fit.</h2>
        </Reveal>
        <Reveal className="mt-11 grid gap-5 lg:grid-cols-[1.6fr_1fr]">
          <div className="min-w-0">
            <div className={`overflow-x-auto rounded-[28px] ${glass}`}>
              <table className="w-full min-w-[520px] border-collapse text-[15px]">
                <thead>
                  <tr className="text-left text-sm text-white/65">
                    {["Size", "Bust", "Waist", "Hip", "Length"].map((h) => (
                      <th key={h} className="border-b border-white/10 px-6 py-4 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SIZES.map((row, r) => (
                    <tr key={row[0]}>
                      {row.map((c, i) => (
                        <td key={i} className={`px-6 py-4 ${i === 0 ? "font-semibold" : ""} ${r < SIZES.length - 1 ? "border-b border-white/10" : ""}`}>{c}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mx-1 mt-3.5 text-[13px] text-white/55">Body measurements in inches. Sample values: replace with your own size chart.</p>
          </div>
          <div className={`flex flex-col justify-between gap-6 rounded-[28px] p-7 ${glass}`}>
            <div>
              <h3 className="font-display text-3xl font-semibold leading-tight">Between sizes?</h3>
              <p className="mt-3 leading-normal text-white/75">Choose Custom at checkout and send your bust, waist, hip, shoulder and length.</p>
            </div>
            <button
              onClick={onCustom}
              className="self-start rounded-full border border-white/40 px-6 py-3 font-medium transition-colors hover:bg-white hover:text-black"
            >
              Order a custom size
            </button>
          </div>
        </Reveal>
      </Wrap>

      {/* How it works */}
      <Wrap id="how">
        <Reveal>
          <Kick>How it works</Kick>
          <h2 className={H2}>From pick to doorstep.</h2>
        </Reveal>
        <div className="mt-11 grid gap-4 md:grid-cols-3">
          {STEPS.map(([n, t, d], i) => (
            <Reveal key={n} delay={i * 0.1}>
              <div className={`h-full rounded-[28px] p-7 ${glass}`}>
                <em className="font-display text-5xl font-semibold not-italic text-[var(--g)] transition-colors duration-1000">{n}</em>
                <h3 className="mt-4 font-display text-[22px] font-semibold">{t}</h3>
                <p className="mt-2.5 leading-relaxed text-white/70">{d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Wrap>

      {/* FAQ */}
      <Wrap id="faq">
        <div className="grid items-center gap-11 md:grid-cols-2 md:gap-16 lg:gap-[72px]">
          <Reveal>
            <Kick>Questions</Kick>
            <h2 className={H2}>Good to know.</h2>
            <p className="mt-5 max-w-md leading-relaxed text-white/75">Something missing? Message us and we will help you choose.</p>
          </Reveal>
          <Reveal delay={0.1} className="border-t border-white/15">
            {FAQ.map(([q, a]) => (
              <details key={q} className="group border-b border-white/15 py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-medium [&::-webkit-details-marker]:hidden">
                  {q}
                  <span className="text-2xl leading-none transition-transform duration-300 group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 max-w-lg leading-relaxed text-white/70">{a}</p>
              </details>
            ))}
          </Reveal>
        </div>
      </Wrap>

      {/* Contact band */}
      <Wrap id="contact">
        <Reveal>
          <div className="site-panel relative overflow-hidden rounded-[32px] border border-white/15 bg-[#14100e] px-6 py-16 text-center">
            <div aria-hidden="true" className="absolute inset-0 opacity-35 transition-colors duration-1000" style={{ background: "radial-gradient(60% 100% at 50% 0%, var(--g), transparent)" }} />
            <div className="relative">
              <h2 className="mx-auto max-w-[12ch] font-display text-5xl font-semibold leading-none tracking-tight sm:text-6xl lg:text-7xl">Wear the heritage.</h2>
              <p className="mx-auto mt-5 max-w-md leading-relaxed text-white/75">
                Your colourway is waiting. Order now, or write to {email} with any questions.
              </p>
              <motion.button
                onClick={onOrder}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="mt-8 rounded-full bg-white px-9 py-4 font-medium text-black"
              >
                Place your order
              </motion.button>
            </div>
          </div>
        </Reveal>
      </Wrap>

      {/* Footer */}
      <footer className="mx-auto grid w-full max-w-[1400px] gap-10 px-5 pb-9 pt-24 sm:px-8 lg:grid-cols-[1.4fr_1fr_1.2fr] lg:px-12 lg:pt-32">
        <div>
          <p className="font-display text-[22px] font-semibold">{brand}</p>
          <p className="mt-3 max-w-[300px] text-[15px] leading-normal text-white/65">Made-to-order Ankara pieces with a modern edge.</p>
        </div>
        <nav aria-label="Footer">
          <h4 className="mb-3.5 text-sm font-medium text-white/55">Explore</h4>
          {[["Collection", "collection"], ["Our story", "story"], ["Size guide", "size"], ["Questions", "faq"]].map(([l, id]) => (
            <a key={id} href={`#${id}`} onClick={(e) => { e.preventDefault(); go(id); }} className="block py-1.5 text-white/85 hover:text-white hover:underline">
              {l}
            </a>
          ))}
        </nav>
        <div>
          <h4 className="mb-3.5 text-sm font-medium text-white/55">Join the list</h4>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true); // wire to your email provider
              e.currentTarget.reset();
            }}
          >
            <input
              type="email"
              required
              aria-label="Email address"
              placeholder="Your email"
              className="min-w-0 flex-1 rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm placeholder:text-white/40 focus:border-white/60 focus:outline-none"
            />
            <button className="rounded-full bg-white px-6 py-3 text-sm font-medium text-black">Subscribe</button>
          </form>
          <p className="mt-3 text-[13px] text-white/55">{sent ? "Thanks, you are on the list." : "New colourways and restocks, nothing else."}</p>
        </div>
        <div className="flex flex-wrap justify-between gap-3 border-t border-white/10 pt-7 text-[13px] text-white/50 lg:col-span-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-5">
            <span>© 2026 {brand}</span>
            <span>Made in Aba</span>
            <span className="footer-credit" aria-label="Powered by ZiTechurity">
              <span aria-hidden="true">POWERED BY ZITECHURITY</span>
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
