import { getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function robots() {
  const settings = await getSettings();
  const sitemapUrl = settings.canonicalUrl && settings.allowIndexing !== false
    ? new URL("/sitemap.xml", settings.canonicalUrl).toString()
    : undefined;

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api"],
    },
    ...(sitemapUrl ? { sitemap: sitemapUrl } : {}),
  };
}
