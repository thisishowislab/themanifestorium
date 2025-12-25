import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * POST body:
 * { priceId: "price_...", mode: "payment"|"subscription", quantity: number }
 */
export async function POST(req) {
  try {
    const { priceId, mode = "payment", quantity = 1 } = await req.json();

    if (!priceId) {
      return NextResponse.json({ error: "Missing priceId" }, { status: 400 });
    }

    // Your deployed domain for success/cancel redirects:
    // Use NEXT_PUBLIC_SITE_URL in Vercel if you want, otherwise fall back to request origin.
    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode, // "payment" or "subscription"
      line_items: [{ price: priceId, quantity: Number(quantity) || 1 }],

      // ✅ SHIPPING ADDRESS COLLECTION (this is the big one)
      shipping_address_collection: {
        allowed_countries: ["US"], // change if you ship internationally
      },

      // Optional: collect phone number
      phone_number_collection: { enabled: true },

      // Optional: enable automatic tax (only if you’ve configured it in Stripe)
      // automatic_tax: { enabled: true },

      // Optional: shipping rates (ONLY if you created them in Stripe)
      // If you haven't created shipping rates yet, leave this out.
      // shipping_options: [
      //   { shipping_rate: "shr_123..." },
      //   { shipping_rate: "shr_456..." },
      // ],

      success_url: `${origin}/?success=1`,
      cancel_url: `${origin}/?canceled=1`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: err?.message || "Checkout error" },
      { status: 500 }
    );
  }
}
