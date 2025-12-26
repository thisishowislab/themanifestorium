// app/api/checkout/route.js
import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Countries you’re willing to ship to (only used when shipping is enabled)
const ALLOWED_COUNTRIES = ["US", "CA", "DE"];

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

function getShippingOptions() {
  // Add as many as you want. Stripe will show the ones that apply to the address.
  const opts = [];

  const localPickup = process.env.STRIPE_SHIPPING_RATE_LOCAL_PICKUP;
  const usGround = process.env.STRIPE_SHIPPING_RATE_US_GROUND;
  const usPriority = process.env.STRIPE_SHIPPING_RATE_US_PRIORITY;
  const intl = process.env.STRIPE_SHIPPING_RATE_INTL;

  if (localPickup) opts.push({ shipping_rate: localPickup });
  if (usGround) opts.push({ shipping_rate: usGround });
  if (usPriority) opts.push({ shipping_rate: usPriority });
  if (intl) opts.push({ shipping_rate: intl });

  return opts;
}

export async function POST(req) {
  try {
    const body = await req.json();

    // Required
    const priceId = body.priceId;
    if (!priceId) {
      return NextResponse.json({ error: "Missing priceId" }, { status: 400 });
    }

    // Optional inputs (frontend can pass these)
    const quantity = Number(body.quantity || 1);
    const mode = body.mode || "payment"; // "payment" (one-time) OR "subscription"
    const needsShipping = Boolean(body.needsShipping); // default false unless explicitly true

    // Make sure we NEVER attach shipping to subscription mode
    const shouldAttachShipping = mode === "payment" && needsShipping === true;

    const session = await stripe.checkout.sessions.create({
      mode,

      line_items: [
        {
          price: priceId,
          quantity,
        },
      ],

      success_url: `${siteUrl()}/?success=1`,
      cancel_url: `${siteUrl()}/?canceled=1`,

      // Billing address can stay auto for all modes
      billing_address_collection: "auto",

      ...(shouldAttachShipping
        ? {
            shipping_address_collection: { allowed_countries: ALLOWED_COUNTRIES },
            shipping_options: getShippingOptions(),
          }
        : {}),
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    return NextResponse.json(
      { error: err?.message || "Checkout error" },
      { status: 500 }
    );
  }
}
