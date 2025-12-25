'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [variantKey, setVariantKey] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const run = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/catalog');
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || 'Failed to load catalog');

        const p = (data.products || []).find(x => x.slug === slug);
        setProduct(p || null);

        // Initialize default variant selection
        const vx = p?.variantUx;
        if (vx?.variants && typeof vx.variants === 'object') {
          const dk = vx.defaultKey || 'default';
          const firstKey = vx.variants[dk] ? dk : Object.keys(vx.variants)[0];
          setVariantKey(firstKey || null);

          // If default variant has imageIndex, use it
          const chosen = firstKey ? vx.variants[firstKey] : null;
          const idx = Number(chosen?.imageIndex);
          if (Number.isFinite(idx)) setActiveImageIdx(idx);
          else setActiveImageIdx(0);
        } else {
          setVariantKey(null);
          setActiveImageIdx(0);
        }
      } catch (e) {
        console.error('Product load error:', e);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [slug]);

  const variants = useMemo(() => {
    const vx = product?.variantUx;
    if (vx?.variants && typeof vx.variants === 'object') return vx.variants;
    return null;
  }, [product]);

  const chosenVariant = useMemo(() => {
    if (!variants || !variantKey) return null;
    return variants[variantKey] || null;
  }, [variants, variantKey]);

  const displayPrice = chosenVariant?.price ?? product?.price ?? 0;
  const displayPriceId = chosenVariant?.stripePriceId ?? product?.stripePriceId ?? null;

  // images are now array of sets: { original, grid, main, thumb }
  const images = product?.images?.length ? product.images : [];
  const activeSet = images[activeImageIdx] || null;

  const activeMain = activeSet?.main || activeSet?.original || null;

  const prevImage = () => {
    if (!images.length) return;
    setActiveImageIdx((i) => (i - 1 + images.length) % images.length);
  };

  const nextImage = () => {
    if (!images.length) return;
    setActiveImageIdx((i) => (i + 1) % images.length);
  };

  const onVariantChange = (newKey) => {
    setVariantKey(newKey);

    const v = variants?.[newKey];
    const idx = Number(v?.imageIndex);
    if (Number.isFinite(idx)) setActiveImageIdx(idx);
  };

  const handleCheckout = async () => {
    if (!displayPriceId) {
      alert('Missing Stripe Price ID for this selection.');
      return;
    }

    try {
      setCheckoutLoading(true);

      // Physical product? default true unless Contentful field says otherwise
      const requireShipping = product?.isShippable !== false;

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: displayPriceId,
          mode: 'payment',
          quantity: 1,
          requireShipping,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Checkout failed');
      if (!data?.url) throw new Error('No checkout URL returned');

      window.location.href = data.url;
    } catch (e) {
      alert(e?.message || String(e));
      console.error('Checkout error:', e);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const backToShop = () => {
    router.push('/?section=shop');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white pt-28 px-6">
        <div className="max-w-4xl mx-auto text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
          <p className="text-gray-400 mt-4">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-black text-white pt-28 px-6">
        <div className="max-w-4xl mx-auto py-20">
          <button
            onClick={backToShop}
            className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-cyan-500/30 hover:border-cyan-400"
          >
            <X size={18} /> Back to Shop
          </button>
          <h1 className="text-3xl font-black text-cyan-400 mb-4">Product not found</h1>
          <p className="text-gray-400">This product slug doesn’t match anything in Contentful.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-28 px-6">
      {/* Fixed X/back */}
      <button
        onClick={backToShop}
        className="fixed top-4 left-4 z-50 p-3 rounded-full bg-black/70 border border-cyan-500/30 hover:border-cyan-400 backdrop-blur"
        aria-label="Back to Shop"
      >
        <X />
      </button>

      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10">
        {/* Images */}
        <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-purple-500/30 overflow-hidden">
          <div className="relative h-[360px] bg-gradient-to-br from-cyan-500/10 to-purple-500/10 flex items-center justify-center">
            {activeMain ? (
              <img
                src={activeMain}
                alt={product.name}
                className="w-full h-full object-cover"
                loading="eager"
                decoding="async"
              />
            ) : (
              <div className="text-7xl">🎴</div>
            )}

            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 border border-cyan-500/30 hover:border-cyan-400"
                  aria-label="Previous image"
                >
                  <ChevronLeft />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 border border-cyan-500/30 hover:border-cyan-400"
                  aria-label="Next image"
                >
                  <ChevronRight />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="p-3 flex gap-2 overflow-x-auto">
              {images.map((set, idx) => {
                const thumb = set?.thumb || set?.grid || set?.original || '';
                return (
                  <button
                    key={(thumb || 'img') + idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden border ${
                      idx === activeImageIdx ? 'border-cyan-400' : 'border-purple-500/30'
                    }`}
                    aria-label={`Image ${idx + 1}`}
                  >
                    <img
                      src={thumb}
                      alt={`${product.name} thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            {product.name}
          </h1>

          {product.description && (
            <p className="text-gray-300 mt-4 leading-relaxed">{product.description}</p>
          )}

          <div className="mt-6 text-3xl font-bold text-purple-400">
            ${Number(displayPrice || 0)}
          </div>

          {/* Variant selector */}
          {variants && (
            <div className="mt-6">
              <label className="block text-sm font-semibold text-cyan-400 mb-2">Choose a variant</label>
              <select
                value={variantKey || ''}
                onChange={(e) => onVariantChange(e.target.value)}
                className="w-full px-4 py-3 bg-black/50 border border-cyan-500/30 rounded-lg focus:border-cyan-400 focus:outline-none text-white"
              >
                {Object.entries(variants).map(([key, v]) => (
                  <option key={key} value={key}>
                    {v?.label || key} — ${Number(v?.price || 0)}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={handleCheckout}
            disabled={checkoutLoading || !displayPriceId}
            className="mt-8 w-full px-6 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-bold text-lg hover:scale-105 transition-transform shadow-lg shadow-cyan-500/30 disabled:opacity-50 disabled:hover:scale-100"
          >
            {checkoutLoading ? 'Loading Checkout...' : (displayPriceId ? 'Buy Now' : 'Unavailable')}
          </button>

          {!displayPriceId && (
            <p className="text-xs text-pink-300 mt-3">
              Missing Stripe Price ID for this variant. Check variantUx JSON on the product entry.
            </p>
          )}

          {/* Extra fields */}
          {(product.careInstructions || product.disclaimer) && (
            <div className="mt-10 space-y-6">
              {product.careInstructions && (
                <div className="p-5 rounded-xl border border-cyan-500/20 bg-black/40">
                  <h3 className="text-cyan-400 font-bold mb-2">Care Instructions</h3>
                  <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {product.careInstructions}
                  </p>
                </div>
              )}

              {product.disclaimer && (
                <div className="p-5 rounded-xl border border-purple-500/20 bg-black/40">
                  <h3 className="text-purple-300 font-bold mb-2">Disclaimer</h3>
                  <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {product.disclaimer}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
