import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Setting from "@/models/Setting";
import { getSettings } from "@/lib/data";
import { sanitizeSettings } from "@/lib/validate";
import { defaultSettings } from "@/lib/defaultSettings";

export const dynamic = "force-dynamic";
const noDb = () => NextResponse.json({ error: "MongoDB is not connected. Set MONGODB_URI to save changes." }, { status: 503 });

export async function GET() {
  return NextResponse.json({ settings: await getSettings() });
}

export async function PUT(req) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  let db;
  try {
    db = await connectDB();
  } catch {
    return noDb();
  }
  if (!db) return noDb();
  const { value: clean, error } = sanitizeSettings(body);
  if (error) return NextResponse.json({ error }, { status: 400 });
  for (const k of ["brandName", "headline1", "headline2", "description"]) if (!clean[k]) clean[k] = defaultSettings[k];
  await Setting.findOneAndUpdate({ key: "site" }, { $set: clean, $setOnInsert: { key: "site" } }, { upsert: true });
  return NextResponse.json({ settings: await getSettings() });
}
