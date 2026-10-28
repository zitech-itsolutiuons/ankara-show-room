"use client";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export const inputCls =
  "w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-white/50 focus:outline-none disabled:opacity-50";

export function Field({ label, hint, children, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-medium text-white/80">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-xs leading-snug text-white/50">{hint}</span>}
    </label>
  );
}

export function Card({ title, desc, children, action }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-lg font-semibold">{title}</h3>
          {desc && <p className="mt-1 max-w-xl text-sm leading-snug text-white/55">{desc}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Toggle({ checked, onChange, label, desc }) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div>
        <p className="text-sm font-medium text-white/90">{label}</p>
        {desc && <p className="mt-1 max-w-md text-xs leading-snug text-white/50">{desc}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? "bg-white" : "bg-white/20"}`}
      >
        <span className={`absolute top-0.5 size-5 rounded-full transition-all ${checked ? "left-[22px] bg-black" : "left-0.5 bg-white"}`} />
      </button>
    </div>
  );
}

export function Segmented({ value, onChange, options, label }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-lg border border-white/15 bg-white/5 p-1">
      {options.map(([v, text]) => (
        <button
          key={v}
          type="button"
          role="radio"
          aria-checked={value === v}
          onClick={() => onChange(v)}
          className={`rounded-md px-3.5 py-1.5 text-sm transition-colors ${value === v ? "bg-white text-black" : "text-white/70 hover:text-white"}`}
        >
          {text}
        </button>
      ))}
    </div>
  );
}

export function ColorField({ label, value, onChange }) {
  const [txt, setTxt] = useState(value);
  useEffect(() => setTxt(value), [value]);
  const commit = (v) => {
    const x = v.startsWith("#") ? v : "#" + v;
    if (/^#[0-9a-f]{6}$/i.test(x)) onChange(x.toLowerCase());
    else setTxt(value);
  };
  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium text-white/80">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
          className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-white/15 bg-transparent p-1"
        />
        <input
          value={txt}
          onChange={(e) => setTxt(e.target.value)}
          onBlur={(e) => commit(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && commit(e.currentTarget.value)}
          maxLength={7}
          aria-label={`${label} hex value`}
          className={`${inputCls} font-mono`}
        />
      </div>
    </div>
  );
}

export function Btn({ variant = "primary", busy, className = "", children, ...rest }) {
  const v = {
    primary: "bg-white text-black hover:bg-white/90",
    ghost: "border border-white/20 text-white hover:bg-white/10",
    danger: "border border-red-400/40 text-red-200 hover:bg-red-500/15",
  }[variant];
  return (
    <button
      {...rest}
      disabled={busy || rest.disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${v} ${className}`}
    >
      {busy && <Loader2 size={15} className="animate-spin" />}
      {children}
    </button>
  );
}
