import { NextResponse } from "next/server";
import { getProducts } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getProducts());
}
