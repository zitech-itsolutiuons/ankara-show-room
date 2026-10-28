function absoluteUrl(path, baseUrl) {
  if (!path) return undefined;
  try {
    return new URL(path, baseUrl).toString();
  } catch {
    return undefined;
  }
}

export function getSeoValues(settings, product) {
  const title = settings.seoTitle || `${settings.brandName} | ${product.name}`;
  const description = settings.seoDescription || product.description || settings.description;
  const canonicalUrl = settings.canonicalUrl || "";
  const image = absoluteUrl(settings.seoSocialImage, canonicalUrl || undefined);
  return { title, description, canonicalUrl, image };
}

export function getProductStructuredData(settings, product) {
  const { title, description, canonicalUrl } = getSeoValues(settings, product);
  const variants = product.variants.map((variant) => {
    const image = absoluteUrl(variant.image || "", canonicalUrl || undefined);
    return {
      "@type": "Product",
      name: `${product.name} - ${variant.name}`,
      description: variant.tagline || description,
      sku: variant.key,
      ...(image ? { image } : {}),
      offers: {
        "@type": "Offer",
        priceCurrency: product.currency || "NGN",
        price: variant.price,
        availability: `https://schema.org/${variant.inStock === false ? "OutOfStock" : "InStock"}`,
        ...(canonicalUrl ? { url: canonicalUrl } : {}),
      },
    };
  });

  return {
    "@context": "https://schema.org",
    "@type": "ProductGroup",
    name: product.name || title,
    description,
    productGroupID: product.slug,
    brand: { "@type": "Brand", name: settings.brandName },
    variesBy: "https://schema.org/color",
    hasVariant: variants,
    ...(canonicalUrl ? { url: canonicalUrl } : {}),
  };
}
