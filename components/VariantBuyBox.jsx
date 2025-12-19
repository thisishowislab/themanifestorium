"use client";

import { useMemo, useState } from "react";

export default function VariantBuyBox({ variants = [], productName }) {
  const [selectedKey, setSelectedKey] = useState(variants[0]?.key || "");

  const selected = useMemo(
    () => variants.find(v => v.key === selectedKey) || variants[0],
    [variants, selectedKey]
  );

  async function onBuy() {
    if (!selected?.priceId) return alert("No Stripe Price ID for this option.");

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        priceId: selected.priceId,
        quantity: 1,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(text);
      return alert("Checkout error. Check console.");
    }

    const data = await res.json();
    // Redirect to Stripe Checkout:
    window.location.href = data.url;
  }

  if (!variants.length) {
    return (
      <div className="mt-4 p-3 rounded border border-gray-600">
        <div className="text-sm opacity-80">No variants configured yet.</div>
      </div>
    );
  }

  return (
    <div className="mt-4 p-3 rounded border border-gray-600 bg-black/30">
      <div className="text-sm opacity-80 mb-2">Choose an option</div>

      <select
        className="w-full bg-black/60 border border-gray-600 rounded px-2 py-2 text-white"
        value={selectedKey}
        onChange={(e) => setSelectedKey(e.target.value)}
      >
        {variants.map(v => (
          <option key={v.key} value={v.key}>
            {v.label} — {typeof v.amount === "number" ? `$${v.amount.toFixed(2)}` : ""}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={onBuy}
        className="mt-3 w-full rounded bg-purple-600 px-4 py-2 font-semibold hover:bg-purple-500"
      >
        Adopt {productName ? `“${productName}”` : "this item"}
      </button>
    </div>
  );
}
