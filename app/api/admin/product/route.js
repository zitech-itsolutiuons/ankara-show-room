import { NextResponse } from "next/server";
import { connectDB, hasMongoUri } from "@/lib/mongodb";
import Product from "@/models/Product";
import { getProducts } from "@/lib/data";
import { sanitizeProduct } from "@/lib/validate";

export const dynamic = "force-dynamic";

export async function GET() {
  const { source, products } = await getProducts();
  return NextResponse.json({ product: products[0], dbReady: source === "mongodb", hasUri: hasMongoUri });
}

export async function PUT(req) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  let db;
  try {
    db = await connectDB();
  } catch {
    db = null;
  }
  if (!db) return NextResponse.json({ error: "MongoDB is not connected. Set MONGODB_URI to save changes." }, { status: 503 });

  const { products } = await getProducts();
  const slug = products[0]?.slug || "ankara-kaftan";
  const { value, error } = sanitizeProduct(body, slug);
  if (error) return NextResponse.json({ error }, { status: 400 });
  await Product.findOneAndUpdate({ slug }, { $set: value }, { upsert: true });
  const fresh = await getProducts();
  return NextResponse.json({ product: fresh.products[0] });
}
