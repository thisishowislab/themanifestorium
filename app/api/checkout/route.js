// app/api/checkout/route.js
import Stripe from "stripe";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://formagicaluseonly.com";

export async function POST(req) {
  try {
    const body = await req.json();
    const priceId = body?.priceId;
    const mode = body?.mode || "payment";
    const quantity = Number(body?.quantity || 1);
    const requireShipping = Boolean(body?.requireShipping);

    if (!priceId) {
      return NextResponse.json({ error: "Missing priceId" }, { status: 400 });
    }

    const sessionParams = {
      mode,
      line_items: [{ price: priceId, quantity }],
      success_url: `${SITE_URL}/?checkout=success`,
      cancel_url: `${SITE_URL}/?checkout=cancel`,
      allow_promotion_codes: true,
    };

    if (requireShipping && mode === "payment") {
      sessionParams.shipping_address_collection = {
        allowed_countries: ["US", "DE"],
      };

      sessionParams.billing_address_collection = "required";
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    return NextResponse.json({ url: session.url });
  } catch (err) {
    const msg = err?.message || String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
