// app/api/checkout/route.js
import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const ALLOWED_COUNTRIES = [
  "US",
  "CA",
  "DE", // Germany
  // add more later if you want
];

export async function POST(req) {
  try {
    const { priceId, quantity = 1, mode = "payment" } = await req.json();

    if (!priceId) {
      return NextResponse.json({ error: "Missing priceId" }, { status: 400 });
    }

    const shippingUS = process.env.STRIPE_SHIPPING_RATE_US || null;
    const shippingIntl = process.env.STRIPE_SHIPPING_RATE_INTL || null;

    // Build shipping options list (Stripe will only show options valid for the entered address)
    const shipping_options = [];
    if (shippingUS) shipping_options.push({ shipping_rate: shippingUS });
    if (shippingIntl) shipping_options.push({ shipping_rate: shippingIntl });

    // If you want shipping required for physical products, keep this ON:
    const needsShipping = true;

    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: [
        {
          price: priceId,
          quantity: Number(quantity || 1),
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/?success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/?canceled=1`,

      ...(needsShipping
        ? {
            shipping_address_collection: { allowed_countries: ALLOWED_COUNTRIES },
            shipping_options: shipping_options.length ? shipping_options : undefined,
          }
        : {}),

      // Optional: lets you view address in Stripe dashboard
      billing_address_collection: "auto",

      // Optional: collect phone
      // phone_number_collection: { enabled: true },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    return NextResponse.json(
      { error: err?.message || "Checkout error" },
      { status: 500 }
    );
  }
}
