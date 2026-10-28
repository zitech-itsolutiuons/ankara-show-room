import { getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function sitemap() {
  const settings = await getSettings();
  if (!settings.canonicalUrl || settings.allowIndexing === false) return [];

  return [{
    url: settings.canonicalUrl,
    changeFrequency: "weekly",
    priority: 1,
  }];
}
