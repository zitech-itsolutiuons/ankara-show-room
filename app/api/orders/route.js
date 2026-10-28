import { NextResponse } from "next/server";
import { connectDB, hasMongoUri } from "@/lib/mongodb";
import Product from "@/models/Product";
import Order from "@/models/Order";
import { mockProducts } from "@/lib/mockProducts";

export const dynamic = "force-dynamic";

const SIZES = ["S", "M", "L", "XL", "Custom"];
const clean = (v, max = 200) => String(v ?? "").trim().slice(0, max);
const fail = (error, status = 400) => NextResponse.json({ ok: false, error }, { status });
const makeRef = () => "AK-" + Math.random().toString(36).slice(2, 8).toUpperCase();

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return fail("Invalid request.");
  }

  const customer = {
    name: clean(body.customer?.name, 100),
    email: clean(body.customer?.email, 150).toLowerCase(),
    phone: clean(body.customer?.phone, 30),
    address: clean(body.customer?.address, 300),
    city: clean(body.customer?.city, 100),
  };
  const size = clean(body.size, 10);
  const customSize = clean(body.customSize, 400);
  const notes = clean(body.notes, 500);
  const quantity = Math.min(Math.max(parseInt(body.quantity, 10) || 1, 1), 10);

  if (!customer.name || !customer.phone || !customer.address || !customer.city) {
    return fail("Please fill in your name, phone, address and city.");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) return fail("Enter a valid email address.");
  if (!SIZES.includes(size)) return fail("Choose a size.");
  if (size === "Custom" && !customSize) return fail("Add your measurements for a custom size.");

  // Look up the product and variant on the server so the price can't be tampered with.
  let db = null;
  let product = null;
  try {
    db = await connectDB();
    if (db) product = await Product.findOne({ slug: clean(body.productSlug, 100) }).lean();
  } catch (err) {
    console.error("[orders] MongoDB connection failed:", err.message);
    if (hasMongoUri) return fail("We couldn't reach the database. Please try again shortly.", 503);
  }
  if (!product) product = mockProducts.find((p) => p.slug === body.productSlug);
  if (!product) return fail("That product could not be found.", 404);

  const variant = product.variants.find((v) => v.key === body.variantKey);
  if (!variant) return fail("That colourway could not be found.", 404);
  if (variant.inStock === false) return fail("That colourway is currently sold out.", 409);

  const total = variant.price * quantity;
  const orderRef = makeRef();

  // Demo mode: no database configured, so confirm without saving.
  if (!db) return NextResponse.json({ ok: true, demo: true, orderRef, total }, { status: 201 });

  try {
    await Order.create({
      orderRef,
      productSlug: product.slug,
      productName: product.name,
      variantKey: variant.key,
      variantName: variant.name,
      size,
      customSize: size === "Custom" ? customSize : "",
      quantity,
      unitPrice: variant.price,
      total,
      currency: product.currency || "NGN",
      customer,
      notes,
    });
    return NextResponse.json({ ok: true, demo: false, orderRef, total }, { status: 201 });
  } catch (err) {
    console.error("[orders] save failed:", err.message);
    return fail("We couldn't save your order. Please try again.", 500);
  }
}
