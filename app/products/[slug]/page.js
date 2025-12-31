'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, X, Sparkles, Hand, Boxes } from 'lucide-react';

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
        aria-label="Return to Portal"
      >
        <ChevronLeft />
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
          <div className="flex items-center gap-2 text-cyan-500/50 mb-2 font-mono text-xs uppercase tracking-widest">
            <Sparkles size={12} /> Encountered in the Manifestorium
          </div>
          <h1 className="text-4xl font-black text-white mb-4">
            {product.name}
          </h1>

          {product.description && (
            <p className="text-gray-300 mt-4 leading-relaxed whitespace-pre-line border-l-2 border-cyan-500/20 pl-4">
              {product.description}
            </p>
          )}

          <div className="mt-6 text-3xl font-bold text-white font-mono">
            ${Number(displayPrice || 0)}
          </div>

          {/* Variant selector */}
          {variants && (
            <div className="mt-8">
              <label className="block text-[10px] font-bold text-cyan-400 mb-3 uppercase tracking-[0.2em]">Select a Form</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(variants).map(([key, v]) => (
                  <button
                    key={key}
                    onClick={() => onVariantChange(key)}
                    className={`px-4 py-3 rounded-md border text-xs font-bold transition-all ${
                      variantKey === key 
                        ? 'bg-cyan-500 border-cyan-400 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]' 
                        : 'bg-black border-cyan-500/30 text-cyan-500/50 hover:border-cyan-400'
                    }`}
                  >
                    {v?.label || key}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleCheckout}
            disabled={checkoutLoading || !displayPriceId}
            className="mt-8 w-full group relative overflow-hidden px-6 py-4 bg-white text-black rounded-lg font-black text-lg hover:bg-cyan-400 transition-colors disabled:opacity-50"
          >
            <div className="relative z-10 flex items-center justify-center gap-2">
              <Hand size={20} className="group-hover:rotate-12 transition-transform" />
              {checkoutLoading ? 'Preparing Signal...' : (displayPriceId ? 'Acquire This Form' : 'Signal Lost')}
            </div>
          </button>

          {!displayPriceId && (
            <p className="text-xs text-pink-300 mt-3">
              Missing Stripe Price ID for this variant. Check variantUx JSON on the product entry.
            </p>
          )}

          {/* Extra fields */}
          {(product.careInstructions || product.disclaimer) && (
            <div className="mt-12 space-y-4">
              {product.careInstructions && (
                <details className="group border-b border-white/10 pb-4">
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                    <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">Care Instructions</span>
                    <ChevronRight size={16} className="group-open:rotate-90 transition-transform" />
                  </summary>
                  <p className="mt-4 text-sm text-gray-400 leading-relaxed whitespace-pre-line">
                    {product.careInstructions}
                  </p>
                </details>
              )}

              {product.disclaimer && (
                <details className="group border-b border-white/10 pb-4">
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                    <span className="text-xs font-bold uppercase tracking-widest text-purple-400">Disclaimer</span>
                    <ChevronRight size={16} className="group-open:rotate-90 transition-transform" />
                  </summary>
                  <p className="mt-4 text-sm text-gray-400 leading-relaxed italic opacity-80">
                    {product.disclaimer}
                  </p>
                </details>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

