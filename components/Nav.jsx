"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Moon, Sun, X } from "lucide-react";

const LINKS = [["Collection", "collection"], ["Our story", "story"], ["Size guide", "size"], ["Contact", "contact"]];

export default function Nav({ brand, onOrder }) {
  const [active, setActive] = useState("Collection");
  const [menu, setMenu] = useState(false);
  const [theme, setTheme] = useState("dark");

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem("ankara-theme", nextTheme);
    setTheme(nextTheme);
  };

  const pick = (e, l, id) => {
    e.preventDefault();
    setActive(l);
    setMenu(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme || "dark");
  }, []);

  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-[2147483647] mx-auto w-full max-w-[1400px] px-5 pt-5 sm:px-8 lg:px-12"
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 18 }}
    >
      <div className="flex items-center justify-between gap-4 rounded-full border border-white/20 bg-black/25 py-2.5 pl-6 pr-2.5 backdrop-blur-md">
        <a href="#" onClick={(e) => pick(e, "Collection", "top")} className="whitespace-nowrap font-display text-lg font-semibold tracking-tight sm:text-xl">
          {brand}
        </a>

        <nav aria-label="Main" className="hidden gap-8 md:flex">
          {LINKS.map(([l, id]) => (
            <a
              key={l}
              href={`#${id}`}
              onClick={(e) => pick(e, l, id)}
              aria-current={active === l ? "page" : undefined}
              className={`relative py-1 text-sm transition-colors ${active === l ? "text-white" : "text-white/70 hover:text-white"}`}
            >
              {l}
              {active === l && (
                <motion.span
                  layoutId="nav-underline"
                  className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded bg-white"
                  transition={{ type: "spring", stiffness: 420, damping: 30 }}
                />
              )}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            className="hidden size-10 items-center justify-center rounded-full border border-white/20 transition-colors hover:bg-white/10 md:flex"
          >
            {theme === "dark" ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}
          </button>
          <motion.button
            onClick={onOrder}
            whileTap={{ scale: 0.96 }}
            className="whitespace-nowrap rounded-full bg-white px-4 py-2 text-sm font-medium text-black sm:px-5"
          >
            Order now
          </motion.button>
          <button
            onClick={() => setMenu((m) => !m)}
            aria-label={menu ? "Close menu" : "Open menu"}
            aria-expanded={menu}
            className="flex size-10 items-center justify-center rounded-full border border-white/20 md:hidden"
          >
            {menu ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menu && (
          <motion.nav
            aria-label="Mobile"
            className="mt-2 overflow-hidden rounded-3xl border border-white/20 bg-black/45 p-2 backdrop-blur-xl md:hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            {LINKS.map(([l, id]) => (
              <a key={l} href={`#${id}`} onClick={(e) => pick(e, l, id)} className="block rounded-2xl px-4 py-3 hover:bg-white/10">
                {l}
              </a>
            ))}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              className="flex w-full items-center gap-3 rounded-2xl border-t border-white/15 px-4 py-3 text-left"
            >
              {theme === "dark" ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}
              Switch to {theme === "dark" ? "light" : "dark"} mode
            </button>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
