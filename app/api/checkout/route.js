// app/api/checkout/route.js

export async function POST(req) {
  try {
    const body = await req.json();
    const priceId = body.priceId;

    if (!priceId) {
      return new Response(
        JSON.stringify({ error: "Missing priceId" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return new Response(
        JSON.stringify({ error: "Stripe secret key not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Call Stripe's Checkout Session API directly via fetch
    const params = new URLSearchParams();
    params.append("mode", "payment");
    params.append("success_url", "https://themanifestorium.vercel.app/success");
    params.append("cancel_url", "https://themanifestorium.vercel.app/cancel");
    params.append("line_items[0][price]", priceId);
    params.append("line_items[0][quantity]", "1");

    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const data = await stripeRes.json();

    if (!stripeRes.ok) {
      return new Response(
        JSON.stringify({ error: data.error?.message || "Stripe error" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ url: data.url }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Unexpected server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
