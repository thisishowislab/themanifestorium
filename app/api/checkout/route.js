// app/api/checkout/route.js
import { NextResponse } from "next/server";
import Stripe from "stripe";
export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const ALLOWED_COUNTRIES = ["US", "CA", "DE"];

// Helper to decide if a product needs shipping
function needsShippingMode(productType) {
  // physical stuff → true; everything else → false
  const physical = ["product", "merch", "artifact", "object"];
  return physical.includes(productType);
}

export async function POST(req) {
  try {
    const { priceId, quantity = 1, productType = "product", mode = "payment" } =
      await req.json();

    if (!priceId)
      return NextResponse.json({ error: "Missing priceId" }, { status: 400 });

    const shipping_options = [];
    if (process.env.STRIPE_SHIPPING_RATE_LOCAL_PICKUP)
      shipping_options.push({ shipping_rate: process.env.STRIPE_SHIPPING_RATE_LOCAL_PICKUP });
    if (process.env.STRIPE_SHIPPING_RATE_US_GROUND)
      shipping_options.push({ shipping_rate: process.env.STRIPE_SHIPPING_RATE_US_GROUND });
    if (process.env.STRIPE_SHIPPING_RATE_US_PRIORITY)
      shipping_options.push({ shipping_rate: process.env.STRIPE_SHIPPING_RATE_US_PRIORITY });
    if (process.env.STRIPE_SHIPPING_RATE_INTL)
      shipping_options.push({ shipping_rate: process.env.STRIPE_SHIPPING_RATE_INTL });

    const needsShipping = mode === "payment" && needsShippingMode(productType);

    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: [{ price: priceId, quantity: Number(quantity) }],
      billing_address_collection: "auto",
      ...(needsShipping
        ? {
            shipping_address_collection: { allowed_countries: ALLOWED_COUNTRIES },
            shipping_options,
          }
        : {}),
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/?success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/?canceled=1`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
