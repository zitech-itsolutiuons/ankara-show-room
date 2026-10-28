import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import Setting from "@/models/Setting";
import { mockProducts } from "@/lib/mockProducts";
import { defaultSettings } from "@/lib/defaultSettings";

const plain = (x) => JSON.parse(JSON.stringify(x));
const DEFAULT_CATEGORIES = [{ id: "kaftans", name: "Kaftans" }];

function withCategories(product) {
  const categories = Array.isArray(product.categories) && product.categories.length
    ? product.categories
    : DEFAULT_CATEGORIES;
  const categoryIds = new Set(categories.map((category) => category.id));
  return {
    ...product,
    categories,
    variants: product.variants.map((variant) => ({
      ...variant,
      categoryId: categoryIds.has(variant.categoryId) ? variant.categoryId : categories[0].id,
    })),
  };
}

export async function getProducts() {
  try {
    const db = await connectDB();
    if (db) {
      let products = await Product.find({}).sort({ createdAt: 1 }).lean();
      if (products.length === 0) {
        await Product.insertMany(mockProducts);
        products = await Product.find({}).sort({ createdAt: 1 }).lean();
      }
      return { source: "mongodb", products: plain(products).map(withCategories) };
    }
  } catch (err) {
    console.error("[data] products: MongoDB unavailable, using mock data:", err.message);
  }
  return { source: "mock", products: mockProducts.map(withCategories) };
}

export async function getSettings() {
  try {
    const db = await connectDB();
    if (db) {
      const doc = await Setting.findOne({ key: "site" }).lean();
      if (doc) {
        const { _id, __v, createdAt, updatedAt, key, ...rest } = plain(doc);
        const clean = Object.fromEntries(Object.entries(rest).filter(([, v]) => v !== null && v !== undefined && v !== ""));
        return { ...defaultSettings, ...clean };
      }
    }
  } catch (err) {
    console.error("[data] settings: MongoDB unavailable, using defaults:", err.message);
  }
  return { ...defaultSettings };
}
