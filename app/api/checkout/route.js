// app/api/checkout/route.js
import Stripe from "stripe";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://formagicaluseonly.com";

/**
 * Expects JSON:
 * {
 *   priceId: string,
 *   mode?: "payment"|"subscription",   // optional; server will enforce correct mode based on Stripe Price type
 *   quantity?: number,
 *   requireShipping?: boolean
 * }
 */
export async function POST(req) {
  try {
    const body = await req.json();

    const priceId = body?.priceId;
    const requestedMode = body?.mode; // optional, we’ll validate/override
    const quantity = Math.max(1, Number(body?.quantity || 1));
    const requireShipping = Boolean(body?.requireShipping);

    if (!priceId) {
      return NextResponse.json({ error: "Missing priceId" }, { status: 400 });
    }

    // 🔥 Key fix: retrieve the Price to determine whether it’s recurring
    const price = await stripe.prices.retrieve(priceId);

    const isRecurring = Boolean(price?.recurring);
    const enforcedMode = isRecurring ? "subscription" : "payment";

    // If you want to be strict instead of auto-fixing, replace this with an error response.
    // For now: auto-correct mode to match the price type.
    const mode = enforcedMode;

    // Optional: if you still want to surface mismatch info for debugging:
    // (kept silent to users, but you could log it)
    // if (requestedMode && requestedMode !== enforcedMode) console.warn("Mode overridden", { requestedMode, enforcedMode, priceId });

    const sessionParams = {
      mode,
      line_items: [{ price: priceId, quantity }],
      success_url: `${SITE_URL}/?checkout=success`,
      cancel_url: `${SITE_URL}/?checkout=cancel`,
      allow_promotion_codes: true,
    };

    // Address collection (works fine for payment; and Stripe supports it for subscription too)
    if (requireShipping) {
      sessionParams.shipping_address_collection = {
        allowed_countries: ["US"],
      };
      sessionParams.billing_address_collection = "required";
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({
      url: session.url,
      mode, // helpful for debugging on the frontend
    });
  } catch (err) {
    const msg = err?.message || String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
