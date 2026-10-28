"use client";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/format";

const STATUSES = ["pending", "confirmed", "shipped", "cancelled"];

export default function OrdersPanel({ notify }) {
  const [orders, setOrders] = useState(null);
  const [dbReady, setDbReady] = useState(true);

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((r) => r.json())
      .then((d) => {
        setOrders(d.orders || []);
        setDbReady(d.dbReady !== false);
      })
      .catch(() => setOrders([]));
  }, []);

  async function setStatus(id, status) {
    const prev = orders;
    setOrders(orders.map((o) => (o._id === id ? { ...o, status } : o)));
    const res = await fetch("/api/admin/orders", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    if (!res.ok) {
      setOrders(prev);
      notify("Could not update that order.", true);
    }
  }

  if (!orders) return <div className="flex justify-center py-20 text-white/50"><Loader2 className="animate-spin" /></div>;
  if (!dbReady) return <p className="rounded-2xl border border-white/10 p-8 text-center text-white/60">Connect MongoDB to see real orders here.</p>;
  if (orders.length === 0) return <p className="rounded-2xl border border-white/10 p-8 text-center text-white/60">No orders yet. They will appear here as customers check out.</p>;

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10">
      <table className="w-full min-w-[820px] border-collapse text-sm">
        <thead>
          <tr className="text-left text-white/55">
            {["Order", "Customer", "Item", "Total", "Placed", "Status"].map((h) => (
              <th key={h} className="border-b border-white/10 px-4 py-3 font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o._id} className="align-top">
              <td className="border-b border-white/10 px-4 py-3 font-semibold">{o.orderRef}</td>
              <td className="border-b border-white/10 px-4 py-3">
                <p>{o.customer.name}</p>
                <p className="text-white/55">{o.customer.phone} · {o.customer.email}</p>
                <p className="text-white/55">{o.customer.address}, {o.customer.city}</p>
              </td>
              <td className="border-b border-white/10 px-4 py-3">
                <p>{o.variantName}</p>
                <p className="text-white/55">Size {o.size}{o.customSize ? `: ${o.customSize}` : ""}{o.quantity > 1 ? ` × ${o.quantity}` : ""}</p>
                {o.notes && <p className="text-white/55">Note: {o.notes}</p>}
              </td>
              <td className="border-b border-white/10 px-4 py-3">{formatPrice(o.total, o.currency)}</td>
              <td className="whitespace-nowrap border-b border-white/10 px-4 py-3 text-white/70">{new Date(o.createdAt).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}</td>
              <td className="border-b border-white/10 px-4 py-3">
                <select
                  value={o.status}
                  onChange={(e) => setStatus(o._id, e.target.value)}
                  aria-label={`Status for ${o.orderRef}`}
                  className="rounded-lg border border-white/15 bg-[#14110f] px-2.5 py-1.5 capitalize"
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
