"use client";
import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Lock } from "lucide-react";
import ProductArt from "@/components/ProductArt";
import Backdrop from "@/components/Backdrop";
import CheckoutModal from "@/components/CheckoutModal";
import Nav from "@/components/Nav";
import Sections from "@/components/Sections";
import { bgOf } from "@/lib/theme";
import { formatPrice } from "@/lib/format";

const SIZES = ["S", "M", "L", "XL", "Custom"];
const EXIT_CORNERS = {
  "top-left": { x: -100, y: -115 },
  "top-right": { x: 100, y: -115 },
  "bottom-left": { x: -100, y: 115 },
  "bottom-right": { x: 100, y: 115 },
};

function ScrollGarment({ variant, index, count, progress, exitCorner, transitionShare }) {
  const hold = 1 - transitionShare;
  const frame = useTransform(progress, (value) => {
    const position = value * count;
    const clamp = (n) => Math.min(1, Math.max(0, n));

    if (index > 0 && position < index) {
      const progressIn = clamp((position - (index - 1 + hold)) / transitionShare);
      const arrival = 1 - (1 - progressIn) ** 3;
      return {
        x: -exitCorner.x * 1.55 * (1 - arrival),
        y: -exitCorner.y * 1.55 * (1 - arrival),
        rotateX: -34 * Math.sign(exitCorner.y) * (1 - arrival),
        rotateY: -32 * Math.sign(exitCorner.x) * (1 - arrival),
        rotate: -36 * Math.sign(exitCorner.x) * (1 - arrival),
        scale: 0.62 + 0.38 * arrival,
        opacity: 1,
      };
    }

    if (index < count - 1 && position > index + hold) {
      const progressOut = clamp((position - index - hold) / transitionShare);
      const departure = progressOut ** 3;
      return {
        x: exitCorner.x * 1.85 * departure,
        y: exitCorner.y * 1.85 * departure,
        rotateX: 34 * Math.sign(exitCorner.y) * departure,
        rotateY: 32 * Math.sign(exitCorner.x) * departure,
        rotate: 36 * Math.sign(exitCorner.x) * departure,
        scale: 1 - 0.38 * departure,
        opacity: 1,
      };
    }

    return { x: 0, y: 0, rotateX: 0, rotateY: 0, rotate: 0, scale: 1, opacity: 1 };
  });

  const x = useTransform(frame, (value) => `${value.x}%`);
  const y = useTransform(frame, (value) => `${value.y}%`);
  const rotateX = useTransform(frame, (value) => value.rotateX);
  const rotateY = useTransform(frame, (value) => value.rotateY);
  const rotate = useTransform(frame, (value) => value.rotate);
  const scale = useTransform(frame, (value) => value.scale);
  const opacity = useTransform(frame, (value) => value.opacity);

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
      style={{ x, y, rotateX, rotateY, rotate, scale, opacity }}
    >
      <ProductArt variant={variant} className="h-full w-full" />
    </motion.div>
  );
}

export default function Showcase({ products, settings }) {
  const reduce = useReducedMotion();
  const product = products[0];
  const variants = product.variants;
  const n = variants.length;

  const [index, setIndex] = useState(0);
  const [size, setSize] = useState("M");
  const [open, setOpen] = useState(false);
  const [scrollDirection, setScrollDirection] = useState(1);
  const wrapRef = useRef(null);
  const previousProgress = useRef(0);

  const variant = variants[index] ?? variants[0];
  const exitCorner = EXIT_CORNERS[settings.scrollExitCorner] ?? EXIT_CORNERS["top-left"];
  const transitionShare = Math.min(0.72, Math.max(0.18, settings.scrollTransitionDuration / 2));
  const scrollOn = Boolean(settings.scrollChange) && n > 1;

  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (!scrollOn) return;
    const delta = v - previousProgress.current;
    if (Math.abs(delta) > 0.001) setScrollDirection(delta > 0 ? 1 : -1);
    previousProgress.current = v;
    setIndex(Math.min(n - 1, Math.max(0, Math.floor(v * n + transitionShare * 0.6))));
  });

  const targetFor = (i) => {
    const el = wrapRef.current;
    const top = el.getBoundingClientRect().top + window.scrollY;
    return top + ((i + 0.5) / n) * (el.offsetHeight - window.innerHeight);
  };
  const selectVariant = (i) => {
    const k = ((i % n) + n) % n;
    if (scrollOn) window.scrollTo({ top: targetFor(k), behavior: "smooth" });
    else setIndex(k);
  };
  const showHero = () => window.scrollTo({ top: scrollOn ? targetFor(index) : 0, behavior: "smooth" });

  const lines = [settings.headline1, settings.headline2].map((l) => l.split(" ").filter(Boolean));
  const soldOut = variant.inStock === false;

  return (
    <main className="min-h-screen p-3 md:p-6" style={{ "--g": variant.theme.glow }}>
      <Nav brand={settings.brandName} onOrder={() => setOpen(true)} />
      <div ref={wrapRef} style={scrollOn ? { height: `calc(100svh + ${(n - 1) * settings.scrollStep}svh)` } : undefined}>
        <section
          id="top"
          data-theme-surface="dark"
          className={`relative flex flex-col overflow-hidden rounded-[2rem] ${
            scrollOn
              ? "sticky top-3 h-[calc(100svh-1.5rem)] md:top-6 md:h-[calc(100svh-3rem)]"
              : "min-h-[calc(100vh-1.5rem)] md:min-h-[calc(100vh-3rem)]"
          }`}
        >
          {variants.map((v, i) => (
            <motion.div
              key={v.key}
              aria-hidden="true"
              className="absolute inset-0"
              style={{ background: bgOf(v.theme) }}
              animate={{ opacity: i === index ? 1 : 0 }}
              transition={{ duration: 1.1, ease: "easeInOut" }}
            />
          ))}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 size-[44rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-[130px]"
            animate={{ backgroundColor: variant.theme.glow }}
            transition={{ duration: 1.1 }}
          />

          <div className={`relative mx-auto grid w-full max-w-[1400px] flex-1 items-center ${
            scrollOn
              ? "min-h-0 gap-1 px-4 pb-10 pt-14 sm:gap-4 sm:px-6 sm:pb-12 sm:pt-20 lg:grid-cols-[1fr_1.1fr_0.9fr] lg:gap-6 lg:px-12 lg:pb-10 lg:pt-28"
              : "gap-8 px-5 pb-10 pt-28 sm:px-8 lg:grid-cols-[1fr_1.1fr_0.9fr] lg:gap-6 lg:px-12"
          }`}>
            {/* Left: headline */}
            <div className="order-1">
              <h1 className={`font-display font-semibold tracking-tight ${
                scrollOn ? "text-3xl leading-[0.92] sm:text-4xl lg:text-6xl xl:text-7xl" : "text-5xl leading-[0.95] sm:text-6xl xl:text-7xl"
              }`}>
                {lines.map((line, li) => (
                  <span key={li} className="block">
                    {line.map((word, wi) => (
                      <span key={wi} className="mr-[0.25em] inline-block overflow-hidden pb-[0.12em] align-bottom">
                        <motion.span
                          className="inline-block"
                          initial={{ y: "115%" }}
                          animate={{ y: 0 }}
                          transition={{ type: "spring", stiffness: 90, damping: 18, delay: 0.15 + (li * 2 + wi) * 0.09 }}
                        >
                          {word}
                        </motion.span>
                      </span>
                    ))}
                  </span>
                ))}
              </h1>
              <motion.p
                className={`text-white/80 ${
                  scrollOn ? "mt-2 line-clamp-2 max-w-sm text-xs leading-snug sm:text-sm lg:mt-6 lg:text-base lg:leading-relaxed" : "mt-6 max-w-sm text-base leading-relaxed"
                }`}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.7 }}
              >
                {settings.description}
              </motion.p>
              <motion.button
                onClick={() => selectVariant(index + 1)}
                className={`group inline-flex items-center gap-3 rounded-full border border-white/40 bg-white/5 font-medium backdrop-blur-md transition-colors hover:bg-white hover:text-black ${
                  scrollOn ? "mt-3 py-2 pl-4 pr-2.5 text-sm lg:mt-8 lg:py-3.5 lg:pl-7 lg:pr-4 lg:text-base" : "mt-8 py-3.5 pl-7 pr-4"
                }`}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.85, duration: 0.7 }}
                whileTap={{ scale: 0.97 }}
              >
                Show next colourway
                <span className={`flex items-center justify-center rounded-full bg-white text-black transition-colors group-hover:bg-black group-hover:text-white ${scrollOn ? "size-7 lg:size-8" : "size-8"}`}>
                  <ArrowRight size={16} />
                </span>
              </motion.button>
            </div>

            {/* Center: product (swipe left/right to change on touch screens) */}
            <div className={`relative order-2 flex w-full items-center justify-center ${
              scrollOn ? "h-[clamp(120px,23svh,230px)] sm:h-[clamp(220px,36svh,380px)] lg:h-[clamp(420px,62vh,680px)]" : "h-[480px] sm:h-[600px] lg:h-[clamp(420px,62vh,680px)]"
            }`}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={variant.key}
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45 }}
                >
                  <Backdrop backdrop={variant.backdrop} />
                </motion.div>
              </AnimatePresence>
              <motion.div
                className="relative h-full w-full max-w-[400px]"
                style={{ touchAction: "pan-y", perspective: 1200, transformStyle: "preserve-3d" }}
                drag="x"
                dragSnapToOrigin
                dragElastic={0.25}
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -60) selectVariant(index + 1);
                  else if (info.offset.x > 60) selectVariant(index - 1);
                }}
                animate={reduce || scrollOn ? undefined : { y: [0, -16, 0], rotate: [-1, 1, -1] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              >
                {scrollOn && !reduce ? (
                  variants.map((v, i) => (
                    <ScrollGarment
                      key={v.key}
                      variant={v}
                      index={i}
                      count={n}
                      progress={scrollYProgress}
                      exitCorner={exitCorner}
                      transitionShare={transitionShare}
                    />
                  ))
                ) : (
                  <AnimatePresence mode="popLayout" custom={scrollDirection} initial={!scrollOn}>
                    <motion.div
                      key={variant.key}
                      className="absolute inset-0 flex items-center justify-center"
                      initial="enter"
                      animate="center"
                      exit="exit"
                      variants={{
                        enter: { opacity: 0, scale: 0.86, y: 40, rotate: -5 },
                        center: { opacity: 1, scale: 1, x: 0, y: 0, rotateX: 0, rotateY: 0, rotate: 0 },
                        exit: { opacity: 0, scale: 1.08, y: -30, rotate: 5 },
                      }}
                      transition={{ duration: reduce ? 0.2 : settings.scrollTransitionDuration, ease: [0.16, 1, 0.3, 1] }}
                      whileHover={{ scale: 1.035 }}
                    >
                      <ProductArt variant={variant} className="h-full w-full" />
                    </motion.div>
                  </AnimatePresence>
                )}
              </motion.div>
            </div>

            {/* Right: purchase panel */}
            <div className={`order-3 rounded-3xl border border-white/20 bg-black/25 shadow-2xl backdrop-blur-md ${
              scrollOn ? "p-3 sm:p-4 lg:p-7" : "p-6 sm:p-7"
            }`}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={variant.key}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className={scrollOn ? "flex items-baseline justify-between gap-2 lg:block" : ""}>
                    <h2 className={`font-display font-semibold leading-tight ${scrollOn ? "text-lg sm:text-2xl lg:text-3xl" : "text-3xl"}`}>{variant.name}</h2>
                    <p className={`font-display font-semibold ${scrollOn ? "text-lg sm:text-2xl lg:mt-5 lg:text-4xl" : "mt-5 text-4xl"}`}>{formatPrice(variant.price, product.currency)}</p>
                  </div>
                  <p className={`text-sm text-white/70 ${scrollOn ? "mt-0.5 line-clamp-1 lg:mt-1" : "mt-1"}`}>{variant.tagline}</p>
                </motion.div>
              </AnimatePresence>

              <fieldset className={scrollOn ? "mt-2 lg:mt-7" : "mt-7"}>
                <legend className={`text-sm text-white/70 ${scrollOn ? "mb-1 lg:mb-3" : "mb-3"}`}>Size</legend>
                <div className="grid grid-cols-5 gap-2">
                  {SIZES.map((s) => {
                    const active = s === size;
                    return (
                      <motion.button
                        key={s}
                        type="button"
                        onClick={() => setSize(s)}
                        aria-pressed={active}
                        whileTap={{ scale: 0.92 }}
                        animate={{ scale: active ? 1.04 : 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 22 }}
                        className={`rounded-xl border font-medium transition-colors ${scrollOn ? "py-1.5 text-xs sm:py-2 lg:py-2.5 lg:text-sm" : "py-2.5 text-sm"} ${
                          active ? "border-white bg-white text-black" : "border-white/25 bg-white/5 text-white hover:bg-white/15"
                        } ${s === "Custom" ? "text-xs" : ""}`}
                      >
                        {s}
                      </motion.button>
                    );
                  })}
                </div>
              </fieldset>

              <div className={scrollOn ? "mt-2 lg:mt-7" : "mt-7"}>
                <p className={`text-sm text-white/70 ${scrollOn ? "mb-1 lg:mb-3" : "mb-3"}`}>Colourway</p>
                <div className="flex flex-wrap gap-3" role="group" aria-label="Colourway">
                  {variants.map((v, i) => {
                    const active = i === index;
                    return (
                      <motion.button
                        key={v.key}
                        type="button"
                        onClick={() => selectVariant(i)}
                        aria-label={v.name}
                        aria-pressed={active}
                        title={v.name}
                        whileHover={{ scale: 1.08, y: -2 }}
                        whileTap={{ scale: 0.94 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        className={`relative rounded-2xl p-1.5 ${scrollOn ? "size-10 sm:size-12 lg:size-16" : "size-16"}`}
                        style={{ background: v.theme.via }}
                      >
                        <ProductArt variant={v} className="h-full w-full" />
                        {active && (
                          <motion.span
                            layoutId="thumb-ring"
                            className="absolute -inset-1 rounded-[1.15rem] border-2 border-white"
                            transition={{ type: "spring", stiffness: 420, damping: 30 }}
                          />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              <motion.button
                type="button"
                disabled={soldOut}
                onClick={() => setOpen(true)}
                whileHover={soldOut ? undefined : { scale: 1.02 }}
                whileTap={soldOut ? undefined : { scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
                className={`flex w-full items-center justify-center gap-2.5 rounded-full bg-white font-medium text-black shadow-lg disabled:opacity-60 ${
                  scrollOn ? "mt-3 px-4 py-2.5 text-sm lg:mt-8 lg:px-6 lg:py-4 lg:text-base" : "mt-8 px-6 py-4"
                }`}
              >
                <Lock size={16} />
                {soldOut ? "Sold out" : "Place order · Secure checkout"}
              </motion.button>
            </div>
          </div>

          {scrollOn && (
            <div className="pointer-events-none absolute inset-x-0 bottom-4 z-10 flex flex-col items-center gap-2 text-xs text-white/70">
              <div className="flex gap-2" aria-hidden="true">
                {variants.map((v, i) => (
                  <span key={v.key} className={`h-1.5 rounded-full bg-white transition-all duration-500 ${i === index ? "w-8" : "w-1.5 opacity-40"}`} />
                ))}
              </div>
              <span>{index === n - 1 ? "Keep scrolling to explore" : "Scroll to change cloth"}</span>
            </div>
          )}
        </section>
      </div>

      <Sections
        brand={settings.brandName}
        email={settings.contactEmail}
        product={product}
        categories={product.categories}
        variants={variants}
        onSelect={(i) => {
          selectVariant(i);
          if (!scrollOn) window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onCustom={() => {
          setSize("Custom");
          showHero();
        }}
        onOrder={() => setOpen(true)}
      />

      <CheckoutModal open={open} onClose={() => setOpen(false)} product={product} variant={variant} size={size} />
    </main>
  );
}
