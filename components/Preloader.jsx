"use client";
import { useEffect, useState } from "react";

const WORDMARK = "Ankara Show Room";

export default function Preloader() {
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    const content = document.getElementById("site-content");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      if (content) content.inert = false;
      setFinished(true);
      return;
    }

    if (content) content.inert = true;
    const complete = window.setTimeout(() => {
      if (content) content.inert = false;
      setFinished(true);
    }, 6000);
    return () => {
      window.clearTimeout(complete);
      if (content) content.inert = false;
    };
  }, []);

  if (finished) return null;

  return (
    <div
      role="status"
      aria-label="Loading Ankara Show Room"
      className="site-preloader fixed inset-0 z-[2147483648] grid place-items-center"
    >
      <div className="flex flex-col items-center px-6 text-center">
        <p aria-hidden="true" className="preloader-wordmark font-display text-3xl font-semibold tracking-tight sm:text-5xl">
          {WORDMARK.split("").map((character, index) => (
            <span
              key={`${character}-${index}`}
              className="preloader-character"
              style={{ "--type-delay": `${index * 65}ms` }}
            >
              {character === " " ? "\u00a0" : character}
            </span>
          ))}
          <span className="preloader-caret" aria-hidden="true" />
        </p>
        <span className="mt-4 h-px w-20 overflow-hidden bg-white/15" aria-hidden="true">
          <span className="preloader-rule block h-full w-full origin-left" />
        </span>
      </div>
    </div>
  );
}
