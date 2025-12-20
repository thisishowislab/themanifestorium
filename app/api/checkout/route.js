// app/api/checkout/route.js
import Stripe from "stripe";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Expects JSON:
 * { priceId, mode: "payment"|"subscription", quantity, requireShipping?: boolean }
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const priceId = body?.priceId;
    const mode = body?.mode || "payment";
    const quantity = Number(body?.quantity || 1);
    const requireShipping = Boolean(body?.requireShipping); // <— pass true for physical products

    if (!priceId) {
      return NextResponse.json({ error: "Missing priceId" }, { status: 400 });
    }

    // Base session
    const sessionParams = {
      mode,
      line_items: [{ price: priceId, quantity }],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://formagicaluseonly.com"}/?checkout=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://formagicaluseonly.com"}/?checkout=cancel`,
      allow_promotion_codes: true,
    };

    // Address collection for physical goods
    if (requireShipping && mode === "payment") {
      sessionParams.shipping_address_collection = {
        allowed_countries: ["US"], // add "CA" etc if you want
      };

      // This makes sure Stripe collects an address even if they try to skip it
      sessionParams.billing_address_collection = "required";

      // Optional: shipping rates (you can create real Shipping Rates in Stripe Dashboard later)
      // If you don't have shipping rates, you can omit this block completely.
      // sessionParams.shipping_options = [
      //   { shipping_rate: "shr_123..." }
      // ];
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const msg = err?.message || String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
