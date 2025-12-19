// lib/contentful.js
import { createClient } from 'contentful';

const client = createClient({
  space: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID,
  accessToken: process.env.NEXT_PUBLIC_CONTENTFUL_DELIVERY_TOKEN,
});

// TODO: set this to your actual content type ID in Contentful
// e.g. "thingsForSale" or "product"
const CONTENT_TYPE_ID = 'NVpVj8LwkehFy7TfbDiCu';

function mapProduct(entry) {
  const f = entry.fields;

  return {
    id: entry.sys.id,
    slug: f.slug,
    name: f.productName, // ID for "Product Name"
    description: f.productDescription, // ID for "Product Description"
    price: f.price,
    stripePriceId: f.stripePriceId,
    category: f.category,
    subcategory: f.subcategory || null,
    attributes: f.attributes || [],
    materials: f.materials || '',
    dimensions: f.dimensions || '',
    seoDescription: f.seoDescription || '',
    seoKeywords: f.seoKeywords || '',
    tags: f.productTags || [],
    sku: f.sku || '',
    altText: f.altText || f.productName,
    image: f.productImages || null,
  };
}

export async function fetchAllProducts() {
  const res = await client.getEntries({
    content_type: CONTENT_TYPE_ID,
    order: ['fields.category', 'fields.productName'],
  });

  return res.items.map(mapProduct);
}

export async function fetchProductBySlug(slug) {
  const res = await client.getEntries({
    content_type: CONTENT_TYPE_ID,
    limit: 1,
    'fields.slug': slug,
  });

  if (!res.items.length) return null;
  return mapProduct(res.items[0]);
}

export async function fetchAllProductSlugs() {
  const res = await client.getEntries({
    content_type: CONTENT_TYPE_ID,
    select: ['fields.slug'],
  });

  return res.items
    .map(item => item.fields.slug)
    .filter(Boolean);
}
