import Showcase from "@/components/Showcase";
import { getProducts, getSettings } from "@/lib/data";
import { getProductStructuredData, getSeoValues } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const [{ products }, settings] = await Promise.all([getProducts(), getSettings()]);
  const product = products[0];
  const { title, description, canonicalUrl, image } = getSeoValues(settings, product);
  const metadataBase = canonicalUrl ? new URL(canonicalUrl) : undefined;

  return {
    metadataBase,
    title,
    description,
    alternates: canonicalUrl ? { canonical: canonicalUrl } : undefined,
    robots: settings.allowIndexing === false
      ? { index: false, follow: false }
      : { index: true, follow: true },
    verification: settings.googleVerification ? { google: settings.googleVerification } : undefined,
    openGraph: {
      type: "website",
      siteName: settings.brandName,
      locale: "en_NG",
      title,
      description,
      ...(canonicalUrl ? { url: canonicalUrl } : {}),
      ...(image ? { images: [{ url: image }] } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default async function Page() {
  const [{ products }, settings] = await Promise.all([getProducts(), getSettings()]);
  const product = products[0];
  const structuredData = settings.allowIndexing === false ? null : getProductStructuredData(settings, product);
  return (
    <>
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
        />
      )}
      <Showcase products={products} settings={settings} />
    </>
  );
}
