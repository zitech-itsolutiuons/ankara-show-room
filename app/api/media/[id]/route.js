import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Media from "@/models/Media";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_req, { params }) {
  if (!mongoose.isValidObjectId(params.id)) return new Response("Not found", { status: 404 });
  try {
    if (!(await connectDB())) return new Response("Not found", { status: 404 });
    const m = await Media.findById(params.id);
    if (!m) return new Response("Not found", { status: 404 });
    return new Response(m.data, {
      headers: { "Content-Type": m.contentType, "Cache-Control": "public, max-age=31536000, immutable" },
    });
  } catch {
    return new Response("Unavailable", { status: 503 });
  }
}
