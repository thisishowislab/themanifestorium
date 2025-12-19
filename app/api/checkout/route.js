
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const { priceId, quantity = 1 } = await req.json();

    if (!priceId) {
      return new Response("Missing priceId", { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity }],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/marketplace?success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/marketplace?canceled=1`,
    });

    return Response.json({ url: session.url });
  } catch (err) {
    console.error(err);
    return new Response("Checkout error", { status: 500 });
  }
}
