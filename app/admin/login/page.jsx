"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock } from "lucide-react";

export default function Login() {
  const router = useRouter();
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pw }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not sign in.");
      router.replace("/admin");
      router.refresh();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#0d0b0a] p-4 text-white">
      <form onSubmit={submit} className="w-full max-w-sm rounded-3xl border border-white/10 bg-white/[0.03] p-8">
        <span className="mb-6 grid size-12 place-items-center rounded-full bg-white text-black"><Lock size={20} /></span>
        <h1 className="font-display text-2xl font-semibold">Admin sign in</h1>
        <p className="mt-1 text-sm text-white/55">Enter the admin password to manage your site.</p>
        <label className="mt-6 block">
          <span className="mb-1.5 block text-sm font-medium text-white/80">Password</span>
          <input type="password" autoFocus required autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm focus:border-white/50 focus:outline-none" />
        </label>
        {error && <p role="alert" className="mt-4 rounded-lg border border-red-400/40 bg-red-500/15 px-3 py-2 text-sm text-red-100">{error}</p>}
        <button disabled={busy} className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-white py-2.5 text-sm font-medium text-black disabled:opacity-60">
          {busy && <Loader2 size={15} className="animate-spin" />} Sign in
        </button>
      </form>
    </main>
  );
}
