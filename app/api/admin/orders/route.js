import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";

export const dynamic = "force-dynamic";
const STATUSES = ["pending", "confirmed", "shipped", "cancelled"];

async function db() {
  try {
    return await connectDB();
  } catch {
    return null;
  }
}

export async function GET() {
  if (!(await db())) return NextResponse.json({ orders: [], dbReady: false });
  const orders = await Order.find({}).sort({ createdAt: -1 }).limit(200).lean();
  return NextResponse.json({ orders: JSON.parse(JSON.stringify(orders)), dbReady: true });
}

export async function PATCH(req) {
  const { id, status } = (await req.json().catch(() => ({}))) || {};
  if (!mongoose.isValidObjectId(id) || !STATUSES.includes(status)) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  if (!(await db())) return NextResponse.json({ error: "MongoDB is not connected." }, { status: 503 });
  await Order.updateOne({ _id: id }, { $set: { status } });
  return NextResponse.json({ ok: true });
}
