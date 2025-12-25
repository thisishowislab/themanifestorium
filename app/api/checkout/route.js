// app/api/checkout/route.js
import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

function getBaseUrl(req) {
  const proto = req.headers.get("x-forwarded-proto") || "https";
  const host = req.headers.get("host");
  return `${proto}://${host}`;
}

export async function POST(req) {
  try {
    const { priceId, quantity = 1, mode = "payment" } = await req.json();

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Missing STRIPE_SECRET_KEY" }, { status: 500 });
    }

    if (!priceId) {
      return NextResponse.json({ error: "Missing priceId" }, { status: 400 });
    }

    const baseUrl = getBaseUrl(req);

    // Pull shipping rate IDs from env (recommended)
    const shippingRateStandard = process.env.STRIPE_SHIPPING_RATE_STANDARD || null;
    const shippingRateExpress = process.env.STRIPE_SHIPPING_RATE_EXPRESS || null;

    // Build shipping options list
    const shipping_options = [];
    if (shippingRateStandard) shipping_options.push({ shipping_rate: shippingRateStandard });
    if (shippingRateExpress) shipping_options.push({ shipping_rate: shippingRateExpress });

    const session = await stripe.checkout.sessions.create({
      mode, // "payment" for products, "subscription" for donation tiers if you use that
      line_items: [
        {
          price: priceId,
          quantity: Math.max(1, Number(quantity) || 1),
        },
      ],

      // ✅ This is the big one: collect shipping address
      shipping_address_collection: {
        // Add whatever you want here. Germany = "DE"
        allowed_countries: ["US", "CA", "DE"],
      },

      // ✅ Show shipping choices (only works if you pass shipping_options)
      ...(shipping_options.length ? { shipping_options } : {}),

      // Optional but useful: capture phone for delivery issues
      phone_number_collection: { enabled: true },

      // Where Stripe sends them back
      success_url: `${baseUrl}/?success=1`,
      cancel_url: `${baseUrl}/?canceled=1`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const msg = err?.message || String(err);
    console.error("Checkout error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
