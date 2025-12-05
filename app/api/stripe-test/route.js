export async function GET() {
  const hasKey = !!process.env.STRIPE_SECRET_KEY;

  return new Response(
    JSON.stringify({
      ok: true,
      hasKey,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}
