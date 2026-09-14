import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAppSelector } from "../../types/hooks.types";
import type { Product } from "../../types/product.types";

const SITE_URL = "https://www.minifygadgets.com";
const SITE_NAME = "MINIFY GADGETS";
const LOGO_URL = "https://ik.imagekit.io/minifypics/Projects/mini_logo.png?updatedAt=1761233228777";
const DEFAULT_DESCRIPTION =
  "MINIFY GADGETS is a Ugandan phone and electronics retailer. Shop iPhones, Samsung, smartphones, accessories and more online from Kampala, Uganda.";

function upsertMeta(attribute: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector(`meta[${attribute}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attribute, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

function upsertJsonLd(id: string, data: unknown) {
  let el = document.head.querySelector(`script[data-seo-id="${id}"]`) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement("script");
    el.type = "application/ld+json";
    el.dataset.seoId = id;
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

function removeJsonLd(id: string) {
  document.head.querySelector(`script[data-seo-id="${id}"]`)?.remove();
}

function firstString(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (Array.isArray(value)) {
    const item = value.find((entry) => typeof entry === "string" && entry.trim());
    return typeof item === "string" ? item.trim() : undefined;
  }
  return undefined;
}

function getBrand(product: Product): string {
  return (
    firstString(product.brand) ||
    firstString(product.brands) ||
    ""
  );
}

function getProductImage(product: Product): string[] {
  const candidates = [
    ...(Array.isArray(product.images) ? product.images : []),
    product.source_image_url,
    product.image_url,
  ];
  return candidates
    .filter((value): value is string => typeof value === "string" && /^https?:\/\//i.test(value))
    .filter((value, index, array) => array.indexOf(value) === index)
    .slice(0, 8);
}

function getAvailability(product: Product): string {
  const stock = Number(product.stock ?? product.quantity ?? product.inventory ?? NaN);
  if (Number.isFinite(stock)) {
    return stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock";
  }
  const status = String(product.status ?? "").toLowerCase();
  if (status.includes("out") || status.includes("sold")) return "https://schema.org/OutOfStock";
  return "https://schema.org/InStock";
}

function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness"],
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    alternateName: ["Minify Gadgets", "MINIFY", "Minify"],
    url: `${SITE_URL}/`,
    logo: LOGO_URL,
    image: LOGO_URL,
    description: DEFAULT_DESCRIPTION,
    telephone: "+256787808501",
    email: "laubenwalukagga256@gmail.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Pioneer Mall, Shop No. PA07, Basement Floor, Opp. Mabiriizi Complex",
      addressLocality: "Kampala",
      addressCountry: "UG",
    },
    areaServed: { "@type": "Country", name: "Uganda" },
    sameAs: ["https://www.tiktok.com/@reuben2560"],
  };
}

function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: `${SITE_URL}/`,
    name: SITE_NAME,
    alternateName: ["Minify Gadgets", "MINIFY", "Minify"],
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

function productSchema(product: Product, canonicalUrl: string) {
  const price = Number(product.price);
  const brand = getBrand(product);
  const images = getProductImage(product);
  const description = String(product.description || `${product.name || "Phone"} available from MINIFY GADGETS in Uganda.`).replace(/<[^>]*>/g, " ").replace(/\\s+/g, " ").trim().slice(0, 1000);

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${canonicalUrl}#product`,
    name: product.name || "MINIFY GADGETS product",
    description,
    sku: String(product.id),
    url: canonicalUrl,
    brand: { "@type": "Brand", name: brand || "MINIFY GADGETS" },
    offers: {
      "@type": "Offer",
      url: canonicalUrl,
      priceCurrency: "UGX",
      ...(Number.isFinite(price) && price >= 0 ? { price } : {}),
      availability: getAvailability(product),
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  if (images.length) schema.image = images;
  return schema;
}

export default function SeoManager() {
  const location = useLocation();
  const products = useAppSelector((state) => state.products.products) || [];

  useEffect(() => {
    const pathname = location.pathname.replace(/\/+$/, "") || "/";
    const productMatch = pathname.match(/^\/product-details\/([^/]+)$/);
    const product = productMatch
      ? products.find((item) => String(item.id) === decodeURIComponent(productMatch[1]))
      : undefined;

    let title = SITE_NAME;
    let description = DEFAULT_DESCRIPTION;
    let canonical = `${SITE_URL}${pathname === "/" ? "/" : pathname}`;

    if (pathname === "/" || pathname === "/shop") {
      title = "MINIFY GADGETS | Phones, iPhones & Electronics in Uganda";
      description = "Shop phones, iPhones, Samsung, accessories and electronics from MINIFY GADGETS, a Ugandan retailer in Kampala. Browse prices, products and deals online.";
    } else if (pathname === "/iphone-18-series") {
      title = "iPhone 18 Series Uganda | MINIFY GADGETS";
      description = "Explore the iPhone 18 series at MINIFY GADGETS in Uganda. View available models, preorder information and product details.";
    } else if (product) {
      const brand = getBrand(product);
      title = `${product.name || "Phone"} | ${SITE_NAME}`;
      description = String(product.description || `Buy ${product.name || "this phone"} from ${SITE_NAME} in Uganda. View price, availability and product details.`).replace(/<[^>]*>/g, " ").replace(/\\s+/g, " ").trim().slice(0, 160);
      canonical = `${SITE_URL}/product-details/${encodeURIComponent(String(product.id))}`;
      if (brand) description = `${product.name} — ${brand} phone available from ${SITE_NAME} in Uganda. View price, availability and details.`.slice(0, 160);
    } else if (productMatch) {
      title = `Phone Product | ${SITE_NAME}`;
      description = `View phone and electronics products from ${SITE_NAME}, a Ugandan retailer in Kampala.`;
    } else if (pathname === "/cart") {
      title = `Shopping Cart | ${SITE_NAME}`;
    } else if (pathname === "/compare") {
      title = `Compare Phones & Electronics | ${SITE_NAME}`;
    }

    document.title = title;
    upsertMeta("name", "description", description);
    upsertMeta("name", "robots", "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1");
    upsertMeta("name", "author", SITE_NAME);
    upsertMeta("name", "application-name", SITE_NAME);
    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:type", product ? "product" : "website");
    upsertMeta("property", "og:url", canonical);
    upsertMeta("property", "og:site_name", SITE_NAME);
    upsertMeta("property", "og:locale", "en_UG");
    upsertMeta("property", "og:image", product ? (getProductImage(product)[0] || LOGO_URL) : LOGO_URL);
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:image", product ? (getProductImage(product)[0] || LOGO_URL) : LOGO_URL);
    upsertLink("canonical", canonical);

    upsertJsonLd("minify-organization", organizationSchema());
    upsertJsonLd("minify-website", websiteSchema());

    if (product) {
      upsertJsonLd("minify-product", productSchema(product, canonical));
    } else {
      removeJsonLd("minify-product");
    }
  }, [location.pathname, products]);

  return null;
}
