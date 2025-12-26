// lib/manifestoriumCore.js
import React from "react";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { BLOCKS, INLINES } from "@contentful/rich-text-types";

/** ---------- URL + Assets ---------- **/
export function normalizeUrl(u) {
  if (!u) return null;
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  if (u.startsWith("//")) return `https:${u}`;
  return `https://${u.replace(/^\/+/, "")}`;
}

export function assetToUrl(asset) {
  const u =
    asset?.fields?.file?.url ||
    asset?.file?.url ||
    asset?.url ||
    null;

  return normalizeUrl(u);
}

export function productToImageUrls(product) {
  const assets = Array.isArray(product?.images)
    ? product.images
    : product?.image
      ? [product.image]
      : [];

  return assets.map(assetToUrl).filter(Boolean);
}

/** ---------- Price ---------- **/
export function getDisplayPrice(product) {
  if (typeof product?.price === "number") return product.price;

  const v = product?.variants;
  const key = v?.defaultKey;
  const chosen = key ? v?.variants?.[key] : null;

  if (chosen && typeof chosen.price === "number") return chosen.price;

  const prices = v?.variants
    ? Object.values(v.variants).map(x => x?.price).filter(p => typeof p === "number")
    : [];

  return prices.length ? Math.min(...prices) : undefined;
}

/** ---------- Text Rendering ---------- **/
export function renderPlainText(text, className = "") {
  // This preserves line breaks from long text fields:
  // "line1\nline2" becomes two lines without <br> hacks.
  if (!text) return null;
  return <div className={className} style={{ whiteSpace: "pre-line" }}>{text}</div>;
}

export function renderRichText(doc, className = "") {
  if (!doc) return null;

  const options = {
    renderNode: {
      [BLOCKS.PARAGRAPH]: (node, children) => (
        <p className="leading-relaxed mb-3 last:mb-0">{children}</p>
      ),
      [BLOCKS.HEADING_2]: (node, children) => (
        <h2 className="text-lg font-semibold mt-4 mb-2">{children}</h2>
      ),
      [BLOCKS.UL_LIST]: (node, children) => (
        <ul className="list-disc pl-5 space-y-1 my-3">{children}</ul>
      ),
      [BLOCKS.OL_LIST]: (node, children) => (
        <ol className="list-decimal pl-5 space-y-1 my-3">{children}</ol>
      ),
      [INLINES.HYPERLINK]: (node, children) => (
        <a
          href={node.data.uri}
          className="underline text-cyan-300 hover:text-cyan-200"
          target="_blank"
          rel="noreferrer"
        >
          {children}
        </a>
      ),
    },
    renderText: (text) => text,
  };

  return <div className={className}>{documentToReactComponents(doc, options)}</div>;
}

/**
 * Use Rich Text if present, otherwise fallback to long text.
 * Expected fields:
 * - product.descriptionRich (Rich Text)
 * - product.description (Long text)
 */
export function renderProductDescription(product, className = "") {
  if (product?.descriptionRich) return renderRichText(product.descriptionRich, className);
  if (product?.description) return renderPlainText(product.description, className);
  return null;
    }
