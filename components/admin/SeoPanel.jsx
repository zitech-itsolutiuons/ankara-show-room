"use client";
import { Check, CircleAlert, ExternalLink, Search } from "lucide-react";
import { Card, Field, Toggle, inputCls } from "@/components/admin/ui";

const TITLE_MIN = 30;
const TITLE_MAX = 60;
const DESCRIPTION_MIN = 120;
const DESCRIPTION_MAX = 160;

function Status({ ready, children }) {
  const Icon = ready ? Check : CircleAlert;
  return (
    <li className="flex items-start gap-2 text-sm text-white/75">
      <Icon size={16} className={`mt-0.5 shrink-0 ${ready ? "text-emerald-300" : "text-amber-200"}`} aria-hidden="true" />
      <span>{children}</span>
    </li>
  );
}

export default function SeoPanel({ settings, product, onSettings }) {
  const set = (patch) => onSettings({ ...settings, ...patch });
  const title = settings.seoTitle || `${settings.brandName} | ${product.name}`;
  const description = settings.seoDescription || product.description || settings.description;
  const canonical = settings.canonicalUrl.trim();
  const socialImage = settings.seoSocialImage.trim();
  let hostname = "";
  let canonicalValid = false;
  try {
    const url = new URL(canonical);
    canonicalValid = url.protocol === "https:" && url.pathname === "/" && !url.search && !url.hash && !url.username && !url.password;
    if (canonicalValid) hostname = url.host;
  } catch {
    canonicalValid = false;
  }
  const previewImage = socialImage.startsWith("https://")
    ? socialImage
    : canonicalValid && socialImage.startsWith("/")
      ? new URL(socialImage, canonical).toString()
      : "";

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Card
        title="Search listing"
        desc="Write a clear page title and a useful description. Google may rewrite snippets, so treat this as a preview rather than a guarantee."
      >
        <div className="space-y-4">
          <Field label={`SEO title · ${settings.seoTitle.length}/70`} hint="Aim for 30–60 characters. Leave blank to use your brand and product name.">
            <input
              className={inputCls}
              value={settings.seoTitle}
              maxLength={70}
              onChange={(event) => set({ seoTitle: event.target.value })}
              placeholder={`${settings.brandName} | ${product.name}`}
            />
          </Field>
          <Field label={`Meta description · ${settings.seoDescription.length}/320`} hint="Aim for 120–160 characters. Explain what makes the collection useful to a shopper.">
            <textarea
              className={inputCls}
              rows={4}
              value={settings.seoDescription}
              maxLength={320}
              onChange={(event) => set({ seoDescription: event.target.value })}
              placeholder={product.description || settings.description}
            />
          </Field>
        </div>

        <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-4">
          <p className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-white/55">
            <Search size={14} aria-hidden="true" /> Search result preview
          </p>
          <p className="truncate text-sm text-emerald-200">{hostname || "Add your production domain"}</p>
          <p className="mt-1 line-clamp-2 text-lg leading-snug text-sky-300">{title || "Your page title"}</p>
          <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-white/65">{description || "Your page description will appear here."}</p>
        </div>
      </Card>

      <Card
        title="Technical SEO"
        desc="These settings control canonical links, search engine access, and the sitemap. Set the production URL before launch."
      >
        <div className="space-y-5">
          <Field
            label="Canonical website URL"
            hint="Use the HTTPS root of your public domain, for example https://example.com. This becomes the preferred URL and sitemap address."
          >
            <input
              className={inputCls}
              type="url"
              inputMode="url"
              autoComplete="url"
              value={settings.canonicalUrl}
              onChange={(event) => set({ canonicalUrl: event.target.value })}
              placeholder="https://yourdomain.com"
            />
          </Field>
          {canonical && !canonicalValid && (
            <p role="status" className="-mt-3 text-xs text-amber-200">
              Enter a valid HTTPS root URL to enable canonical links and the sitemap.
            </p>
          )}
          {!canonical && (
            <p className="-mt-3 text-xs text-white/55">
              Your production URL wasn’t provided, so canonical links and the sitemap will remain inactive until you add it.
            </p>
          )}

          <Toggle
            label="Allow search engines to index the site"
            desc="Turn off to add a noindex directive and remove the site from the sitemap. Robots.txt will still allow crawlers to read that directive."
            checked={settings.allowIndexing !== false}
            onChange={(value) => set({ allowIndexing: value })}
          />

          <Field label="Google Search Console verification token" hint="Optional. Paste only the token value provided by Google, not the full HTML tag.">
            <input
              className={inputCls}
              value={settings.googleVerification}
              maxLength={200}
              autoComplete="off"
              onChange={(event) => set({ googleVerification: event.target.value })}
              placeholder="Paste your verification token"
            />
          </Field>

          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm text-white/75 underline decoration-white/30 underline-offset-4 hover:text-white"
          >
            Open sitemap <ExternalLink size={14} aria-hidden="true" />
          </a>
        </div>
      </Card>

      <Card
        title="Social sharing"
        desc="The same title and description are used for link previews on social platforms. Add an image to create a large preview card."
      >
        <Field label="Social preview image URL" hint="Use an HTTPS image address or an uploaded site image path. A 1200 × 630 image is recommended.">
          <input
            className={inputCls}
            type="url"
            inputMode="url"
            value={settings.seoSocialImage}
            maxLength={500}
            onChange={(event) => set({ seoSocialImage: event.target.value })}
            placeholder="https://yourdomain.com/share-image.jpg"
          />
        </Field>
        {previewImage ? (
          <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewImage} alt="Social sharing preview" className="aspect-[1.91/1] w-full object-cover" />
          </div>
        ) : (
          <div className="mt-4 grid aspect-[1.91/1] place-items-center rounded-xl border border-dashed border-white/15 bg-white/[0.03] text-sm text-white/50">
            Add an image to preview the social card
          </div>
        )}
      </Card>

      <Card title="SEO readiness">
        <ul className="space-y-3">
          <Status ready={title.length >= TITLE_MIN && title.length <= TITLE_MAX}>
            Page title is {title.length} characters (recommended {TITLE_MIN}–{TITLE_MAX}).
          </Status>
          <Status ready={description.length >= DESCRIPTION_MIN && description.length <= DESCRIPTION_MAX}>
            Meta description is {description.length} characters (recommended {DESCRIPTION_MIN}–{DESCRIPTION_MAX}).
          </Status>
          <Status ready={canonicalValid}>Canonical production URL {canonicalValid ? "is configured" : "is not configured"}.</Status>
          <Status ready={Boolean(previewImage)}>Social preview image {previewImage ? "is configured" : "is not configured"}.</Status>
          <Status ready={Boolean(settings.googleVerification)}>Google Search Console {settings.googleVerification ? "verification is configured" : "verification token is optional and not set"}.</Status>
          <Status ready={settings.allowIndexing !== false}>
            Search engine indexing is {settings.allowIndexing === false ? "disabled" : "enabled"}.
          </Status>
        </ul>
        <p className="mt-4 border-t border-white/10 pt-4 text-xs leading-relaxed text-white/50">
          SEO changes apply when you choose Save changes. Rankings depend on your published content, site performance, links, and search engine policies; no panel can guarantee placement.
        </p>
      </Card>
    </div>
  );
}
