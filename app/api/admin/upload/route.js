import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Media from "@/models/Media";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const TYPES = ["image/webp", "image/png", "image/jpeg", "image/avif"];
const MAX = 4 * 1024 * 1024;

export async function POST(req) {
  let db;
  try {
    db = await connectDB();
  } catch {
    db = null;
  }
  if (!db) return NextResponse.json({ error: "MongoDB is not connected. Set MONGODB_URI to upload images." }, { status: 503 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!file || typeof file === "string") return NextResponse.json({ error: "No file received." }, { status: 400 });
  if (!TYPES.includes(file.type)) return NextResponse.json({ error: "Use a PNG, JPG, WebP or AVIF image." }, { status: 415 });
  if (file.size > MAX) return NextResponse.json({ error: "That image is over 4 MB. Try a smaller one." }, { status: 413 });

  const doc = await Media.create({
    filename: String(file.name || "upload").slice(0, 100),
    contentType: file.type,
    size: file.size,
    data: Buffer.from(await file.arrayBuffer()),
  });
  return NextResponse.json({ url: `/api/media/${doc._id}` }, { status: 201 });
}
