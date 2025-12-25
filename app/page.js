'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Menu, X, Zap, Cpu, Sparkles, ChevronRight,
  Instagram, Mail, Home, Briefcase, Store, MapPin, Heart, MessageCircle, Users
} from 'lucide-react';

export default function ManifestoriumSite() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [scrollY, setScrollY] = useState(0);

  const [products, setProducts] = useState([]);
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [tours, setTours] = useState([]);
  const [donationTiers, setDonationTiers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [shopQuery, setShopQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [formStatus] = useState('');

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);

    if (!document.querySelector('script[src="https://js.stripe.com/v3/"]')) {
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.async = true;
      document.head.appendChild(script);
    }

    fetchCatalogData();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchCatalogData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/catalog', { method: 'GET' });
      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || 'Failed to load catalog');

      setProducts(Array.isArray(data.products) ? data.products : []);
      setTours(Array.isArray(data.tours) ? data.tours : []);
      setDonationTiers(Array.isArray(data.donationTiers) ? data.donationTiers : []);
      setPortfolioItems(Array.isArray(data.portfolioItems) ? data.portfolioItems : []);
    } catch (e) {
      console.error('Catalog load error:', e);
      setProducts([]);
      setTours([]);
      setDonationTiers([]);
      setPortfolioItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (priceId, itemName, mode = "payment", quantity = 1) => {
    if (!priceId) {
      alert(`Missing Stripe Price ID for "${itemName}"`);
      return;
    }

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, mode, quantity }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data.error || "Checkout failed";
        alert(`❌ STRIPE ERROR\n\n${msg}\n\nItem: ${itemName}\nPrice ID: ${priceId}`);
        return;
      }

      if (!data.url) {
        alert("Stripe did not return a checkout URL.");
        return;
      }

      window.location.href = data.url;
    } catch (error) {
      const msg = error?.message || String(error);
      alert(`❌ NETWORK / SERVER ERROR\n\n${msg}`);
      console.error("Checkout exception:", error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const subj = encodeURIComponent(`Message from ${formData.name}`);
    const body = encodeURIComponent(`From: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`);
    window.location.href = `mailto:thisishowislab@gmail.com?subject=${subj}&body=${body}`;
    setFormData({ name: '', email: '', message: '' });
  };

  const Nav = ({ section, icon: Icon, children }) => (
    <button
      onClick={() => { setActiveSection(section); setMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
      className={`flex flex-col items-center gap-1 px-4 py-2 transition ${
        activeSection === section ? 'text-cyan-400' : 'text-gray-300 hover:text-white'
      }`}
    >
      <Icon size={24} />
      <span className="text-xs">{children}</span>
    </button>
  );

  // ---- Shop category + search helpers ----
  const allCategories = useMemo(() => {
    const set = new Set();
    for (const p of products) (p.categories || []).forEach(c => set.add(c));
    const arr = Array.from(set).sort((a, b) => a.localeCompare(b));
    return ['All', ...arr];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = shopQuery.trim().toLowerCase();
    return (products || []).filter((p) => {
      const inCat = activeCategory === 'All' ? true : (p.categories || []).includes(activeCategory);
      const inQuery = !q
        ? true
        : (p.name || '').toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q) ||
          (p.categories || []).some(c => c.toLowerCase().includes(q));
      return inCat && inQuery;
    });
  }, [products, shopQuery, activeCategory]);

  const communityBadgeSrc = '/community-badge.png'; // <- drop your badge/logo into /public with this name

  return (
    <div className="bg-black text-white min-h-screen">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition ${scrollY > 50 ? 'bg-black/90 backdrop-blur-lg shadow-lg shadow-cyan-500/20' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => setActiveSection('home')} className="flex items-center gap-3 hover:opacity-80 transition">
            <Sparkles className="text-cyan-400" size={28} />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              THE MANIFESTORIUM
            </h1>
          </button>

          <div className="hidden md:flex gap-2">
            <Nav section="home" icon={Home}>Home</Nav>
            <Nav section="portfolio" icon={Briefcase}>Portfolio</Nav>
            <Nav section="shop" icon={Store}>Shop</Nav>
            <Nav section="tours" icon={MapPin}>Tours</Nav>
            <Nav section="support" icon={Heart}>Support</Nav>
            <Nav section="community" icon={Users}>Community</Nav>
            <Nav section="contact" icon={MessageCircle}>Contact</Nav>
          </div>

          <button className="md:hidden text-cyan-400" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-black/95 backdrop-blur-lg border-t border-cyan-500/30 p-6 flex flex-col gap-2">
            <Nav section="home" icon={Home}>Home</Nav>
            <Nav section="portfolio" icon={Briefcase}>Portfolio</Nav>
            <Nav section="shop" icon={Store}>Shop</Nav>
            <Nav section="tours" icon={MapPin}>Tours</Nav>
            <Nav section="support" icon={Heart}>Support</Nav>
            <Nav section="community" icon={Users}>Community</Nav>
            <Nav section="contact" icon={MessageCircle}>Contact</Nav>
          </div>
        )}
      </nav>

      {/* HOME */}
      {activeSection === 'home' && (
        <section className="min-h-screen flex items-center justify-center relative pt-20">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10" />
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, cyan 1px, transparent 0)',
            backgroundSize: '50px 50px'
          }} />
          <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
            <div className="mb-8 flex justify-center gap-4">
              <Cpu className="text-cyan-400 animate-pulse" size={48} />
              <Zap className="text-purple-400 animate-pulse" size={48} />
              <Sparkles className="text-pink-400 animate-pulse" size={48} />
            </div>

            <h2 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Your Imagination
              </span>
              <br />
              <span>Fabrication Station</span>
            </h2>

            <p className="text-xl md:text-2xl text-gray-300 mb-6 max-w-3xl mx-auto leading-relaxed">
              Where off-grid tech, desert salvage, and handmade myth collide to prove that
              <span className="text-cyan-400 font-bold"> creation doesn't belong to the rich</span>, the plugged-in, or the polished.
            </p>

            {/* Manifestorium + FMUO microcopy */}
            <div className="mx-auto max-w-3xl mt-6 text-left">
              <div className="p-6 bg-black/40 rounded-2xl border border-cyan-500/25">
                <p className="text-gray-200 leading-relaxed">
                  <span className="text-cyan-400 font-bold">The Manifestorium</span> is an off-grid art and fabrication studio operating at the intersection of salvaged materials, experimental technology, and desert mythology.
                  Everything here is made by hand—often from reclaimed parts—and designed to exist somewhere between functional object and quiet artifact.
                </p>
                <p className="text-gray-300 leading-relaxed mt-4">
                  <span className="text-purple-300 font-semibold">For Magical Use Only</span> means these objects are not optimized, mass-produced, or pretending to be perfect.
                  They are experiments. They are companions. They are proof that meaning can be fabricated from almost nothing.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 justify-center mt-8">
              <button
                onClick={() => setActiveSection('portfolio')}
                className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-bold text-lg hover:scale-105 transition-transform shadow-lg shadow-cyan-500/50"
              >
                Explore Portfolio <ChevronRight className="inline ml-2" />
              </button>
              <button
                onClick={() => setActiveSection('shop')}
                className="px-8 py-4 border-2 border-cyan-400 rounded-lg font-bold text-lg hover:bg-cyan-400/20 transition-all"
              >
                Shop Art Tech
              </button>
            </div>

            <div className="mt-12 p-8 bg-gradient-to-r from-purple-900/30 to-cyan-900/30 rounded-2xl border border-cyan-500/30 backdrop-blur-sm">
              <p className="text-lg leading-relaxed">
                <span className="text-cyan-400 font-bold">Everything is an experiment.</span>
                {' '}You're invited to participate, not spectate. Improvisation is law, tech is a paintbrush,
                and your weirdest ideas are suddenly fair game.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* PORTFOLIO */}
      {activeSection === 'portfolio' && (
        <section className="min-h-screen pt-32 pb-20 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-5xl font-black mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Portfolio
            </h2>

            <div className="mb-10 p-6 bg-gradient-to-br from-cyan-900/20 to-purple-900/20 rounded-2xl border border-cyan-500/30">
              <p className="text-gray-300 leading-relaxed">
                The portfolio is not a highlight reel. It’s a record of experiments, failed ideas that learned something,
                and objects that found a reason to exist along the way. Some were commissioned. Some were accidents.
                Some were built to solve a problem that no longer exists. All of them taught us something worth keeping.
              </p>
            </div>

            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
                <p className="text-gray-400 mt-4">Loading portfolio...</p>
              </div>
            ) : portfolioItems.length === 0 ? (
              <div className="text-center py-20 bg-gradient-to-br from-cyan-900/20 to-purple-900/20 rounded-2xl border border-cyan-500/30">
                <p className="text-gray-300 text-lg mb-4">Portfolio items coming soon!</p>
                <p className="text-gray-400">Add content in Contentful → Content and it will appear here.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-8">
                {portfolioItems.map((item) => (
                  <div
                    key={item.id}
                    className="group relative bg-gradient-to-br from-gray-900 to-black p-8 rounded-2xl border border-cyan-500/30 hover:border-cyan-400 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/30 overflow-hidden"
                  >
                    {item.image && (
                      <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="relative z-10">
                      <h3 className="text-2xl font-bold text-cyan-400 mb-3">{item.title}</h3>
                      <p className="text-gray-300 mb-4">{item.desc}</p>
                      {item.tech && (
                        <div className="flex flex-wrap gap-2">
                          {item.tech.split(',').map((t, i) => (
                            <span key={i} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                              {t.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* SHOP */}
      {activeSection === 'shop' && (
        <section className="min-h-screen pt-32 pb-20 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-5xl font-black mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Shop
            </h2>

            {/* Shop framing copy */}
            <div className="mb-8 p-6 bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-2xl border border-purple-500/30">
              <p className="text-gray-300 leading-relaxed">
                Objects here are grouped by temperament, not by product line. Browse by category, follow what pulls at you,
                and don’t worry about choosing correctly. Most items exist in limited runs, small batches, or single incarnations.
              </p>
              <p className="text-gray-400 mt-3 text-sm">
                Tip: Tap a card to open the full product page. Variants, photos, care notes, and checkout live there.
              </p>
            </div>

            {/* Category chips + search */}
            <div className="mb-8 flex flex-col gap-4">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {allCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 rounded-full border text-sm whitespace-nowrap transition ${
                      activeCategory === cat
                        ? 'border-cyan-400 text-cyan-200 bg-cyan-500/10'
                        : 'border-cyan-500/20 text-gray-300 hover:border-cyan-400'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <input
                  value={shopQuery}
                  onChange={(e) => setShopQuery(e.target.value)}
                  placeholder="Search products, categories…"
                  className="w-full px-4 py-3 bg-black/50 border border-cyan-500/30 rounded-lg focus:border-cyan-400 focus:outline-none text-white"
                />
                <button
                  onClick={() => { setShopQuery(''); setActiveCategory('All'); }}
                  className="px-4 py-3 border border-cyan-500/30 rounded-lg hover:border-cyan-400 text-gray-200"
                >
                  Clear
                </button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
                <p className="text-gray-400 mt-4">Loading products...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-2xl border border-purple-500/30">
                <p className="text-gray-300 text-lg mb-4">No matches found</p>
                <p className="text-gray-400">Try another category or a different search term.</p>
              </div>
            ) : (
              // ✅ Mobile 2-up, Desktop 4-up
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {filteredProducts.map((product) => {
                  const hasSlug = Boolean(product.slug);
                  const href = hasSlug ? `/product/${product.slug}` : null;

                  return (
                    <div
                      key={product.id}
                      className="relative bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-purple-500/30 hover:border-purple-400 transition-all duration-300 overflow-hidden group hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/30"
                    >
                      {/* Whole-card clickable overlay */}
                      {href && (
                        <Link
                          href={href}
                          className="absolute inset-0 z-10"
                          aria-label={`Open ${product.name}`}
                        />
                      )}

                      {/* Image */}
                      <div className="h-40 md:h-48 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center overflow-hidden">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                            loading="lazy"
                          />
                        ) : (
                          <div className="text-5xl md:text-7xl">🎴</div>
                        )}
                      </div>

                      <div className="p-4 md:p-6 relative z-20">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-base md:text-xl font-bold text-white leading-snug">
                            {product.name}
                          </h3>

                          {/* Community badge (auto uses image if you add /public/community-badge.png) */}
                          {product.communityEligible && (
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <div className="h-6 w-6 relative">
                                {/* If you add the badge file, this shows. If not, it will silently fail and still show text badge. */}
                                <Image
                                  src={communityBadgeSrc}
                                  alt="Community option"
                                  fill
                                  className="object-contain"
                                  onError={() => {}}
                                />
                              </div>
                              <span className="text-[10px] md:text-xs px-2 py-1 rounded-full border border-cyan-400/40 text-cyan-200 bg-cyan-500/10">
                                Community
                              </span>
                            </div>
                          )}
                        </div>

                        {product.description && (
                          <p className="text-gray-400 text-xs md:text-sm mt-2 line-clamp-2">
                            {product.description}
                          </p>
                        )}

                        {/* Categories */}
                        {Array.isArray(product.categories) && product.categories.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {product.categories.slice(0, 2).map((c) => (
                              <span key={c} className="text-[10px] md:text-xs px-2 py-1 rounded-full bg-purple-500/15 text-purple-200 border border-purple-500/20">
                                {c}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-4">
                          <span className="text-lg md:text-2xl font-bold text-purple-400">
                            ${Number(product.price || 0)}
                          </span>

                          {/* Buy button should still work even though whole card is clickable */}
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleCheckout(product.stripePriceId, product.name, "payment", 1);
                            }}
                            className="px-3 md:px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-semibold hover:scale-105 transition-transform"
                          >
                            Buy
                          </button>
                        </div>

                        {/* Community link CTA */}
                        {product.communityEligible && (
                          <Link
                            href={`/community?item=${encodeURIComponent(product.slug || product.name)}`}
                            onClick={(e) => e.stopPropagation()}
                            className="mt-3 inline-block text-xs text-cyan-200 hover:text-cyan-300 underline underline-offset-4"
                          >
                            Ask about Community Options
                          </Link>
                        )}

                        {!product.stripePriceId && (
                          <p className="text-xs text-pink-300 mt-3">
                            (Missing Stripe Price ID in variantUx)
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* TOURS */}
      {activeSection === 'tours' && (
        <section className="min-h-screen pt-32 pb-20 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-5xl font-black mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Local Tours
            </h2>
            <p className="text-xl text-gray-400 mb-10">
              Experience creation in action — just 100 feet from Salvation Mountain.
            </p>

            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
                <p className="text-gray-400 mt-4">Loading tours...</p>
              </div>
            ) : tours.length === 0 ? (
              <div className="bg-gradient-to-br from-cyan-900/30 to-purple-900/30 p-8 rounded-2xl border border-cyan-500/30">
                <h3 className="text-3xl font-bold text-cyan-400 mb-4">Desert Creation Station Tours</h3>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Step into our art tech makerspace where salvaged desert materials meet fabrication. See printers, lasers,
                  prototypes, and experiments in real-time.
                </p>
                <button
                  onClick={() => setActiveSection('contact')}
                  className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-bold text-lg hover:scale-105 transition-transform shadow-lg shadow-cyan-500/50"
                >
                  Book Your Tour <ChevronRight className="inline ml-2" />
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tours.map((tour) => (
                  <div
                    key={tour.id}
                    className="bg-gradient-to-br from-cyan-900/30 to-purple-900/30 rounded-2xl border border-cyan-500/30 hover:border-cyan-400 transition-all duration-300 overflow-hidden group hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/30"
                  >
                    {tour.image ? (
                      <div className="h-48 overflow-hidden">
                        <img
                          src={tour.image}
                          alt={tour.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="h-48 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center text-7xl">
                        🏜️
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="text-2xl font-bold text-cyan-400 mb-3">{tour.name}</h3>
                      <p className="text-gray-300 mb-4 leading-relaxed line-clamp-3">{tour.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-3xl font-bold text-purple-400">${Number(tour.price || 0)}</span>
                        <button
                          onClick={() => tour.stripePriceId ? handleCheckout(tour.stripePriceId, tour.name, "payment", 1) : setActiveSection('contact')}
                          className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-semibold hover:scale-105 transition-transform"
                        >
                          Book
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* SUPPORT */}
      {activeSection === 'support' && (
        <section className="min-h-screen pt-32 pb-20 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl font-black mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Support The Magic
            </h2>
            <p className="text-xl text-gray-400 mb-10">Keep the creative chaos alive</p>

            <div className="mb-10 p-8 bg-gradient-to-br from-purple-900/30 to-cyan-900/30 rounded-2xl border border-cyan-500/30">
              <h3 className="text-2xl font-bold text-cyan-400 mb-4">Why Support Us?</h3>
              <p className="text-gray-300 leading-relaxed">
                Every print, prototype, and experiment runs on materials, electricity, and stubborn imagination.
                Your support keeps the machines humming and the ideas flowing.
              </p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
                <p className="text-gray-400 mt-4">Loading donation options...</p>
              </div>
            ) : donationTiers.length > 0 ? (
              // ✅ Desktop 2x2 layout (md:grid-cols-2)
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {donationTiers.map((tier) => (
                  <button
                    key={tier.id}
                    onClick={() => tier.stripePriceId ? handleCheckout(tier.stripePriceId, tier.name, "subscription", 1) : alert('Add Stripe Price ID in variantUx')}
                    className="p-6 rounded-xl border-2 border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-500/10 transition-all hover:scale-[1.02] min-h-[180px] flex flex-col justify-between text-left"
                  >
                    <div>
                      <div className="text-4xl font-bold text-cyan-400 mb-2">${Number(tier.price || 0)}</div>
                      <div className="text-lg font-semibold text-white mt-2 mb-3">{tier.name}</div>
                      {tier.description && (
                        <div className="text-sm text-gray-300 leading-relaxed">{tier.description}</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-gray-400">No donation tiers yet.</div>
            )}

            <div className="p-6 bg-black/50 rounded-xl border border-cyan-500/30 mb-6">
              <p className="text-gray-300">
                Prefer an exchange instead of cash? Visit <span className="text-cyan-300 font-semibold">Community Supported Creations</span>.
              </p>
              <div className="mt-4">
                <Link
                  href="/community"
                  className="inline-block px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-bold hover:scale-105 transition-transform shadow-lg shadow-cyan-500/30"
                >
                  Community Options
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* COMMUNITY (section that links to the page) */}
      {activeSection === 'community' && (
        <section className="min-h-screen pt-32 pb-20 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl font-black mb-6 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Community Supported Creations
            </h2>

            <div className="p-8 bg-gradient-to-br from-cyan-900/20 to-purple-900/20 rounded-2xl border border-cyan-500/30">
              <p className="text-gray-300 leading-relaxed">
                Not everything here is meant to be bought with cash.
                Community Supported Creations exists for people who want to participate but can’t—or don’t want to—engage purely through money.
              </p>
              <p className="text-gray-300 leading-relaxed mt-4">
                This can include skill exchange, material trade, collaborative work, or partial payment combined with contribution.
                The goal isn’t “free stuff.” The goal is keeping creation accessible, relational, and human.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/community"
                  className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-bold text-lg hover:scale-105 transition-transform shadow-lg shadow-cyan-500/30 text-center"
                >
                  Start a Conversation
                </Link>
                <button
                  onClick={() => setActiveSection('contact')}
                  className="px-8 py-4 border-2 border-cyan-400 rounded-lg font-bold text-lg hover:bg-cyan-400/20 transition-all"
                >
                  Contact
                </button>
              </div>

              <p className="text-gray-400 text-sm mt-6">
                Respect, clarity, and good faith are required on all sides. Not every request will be a fit—and that’s okay.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* CONTACT */}
      {activeSection === 'contact' && (
        <section className="min-h-screen pt-32 pb-20 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl font-black mb-8 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Get In Touch
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="p-8 bg-gradient-to-br from-cyan-900/20 to-purple-900/20 rounded-2xl border border-cyan-500/30">
                  <h3 className="text-2xl font-bold text-cyan-400 mb-4">Let's Create Together</h3>
                  <p className="text-gray-300 mb-6">
                    Have a wild idea? Need custom tech art? Want to collaborate or book a tour?
                    We’re here for it.
                  </p>

                  <div className="space-y-4">
                    <a href="mailto:thisishowislab@gmail.com" className="flex items-center gap-3 text-purple-300 hover:text-purple-400 transition-colors">
                      <Mail size={24} />
                      <span className="text-sm">thisishowislab@gmail.com</span>
                    </a>
                    <a href="https://instagram.com/themanifestorium" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-purple-300 hover:text-purple-400 transition-colors">
                      <Instagram size={24} />
                      <span>@themanifestorium</span>
                    </a>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-2xl border border-purple-500/30">
                  <h4 className="text-lg font-bold text-purple-400 mb-3">Location</h4>
                  <p className="text-gray-300 text-sm">
                    Slab City, California<br />
                    Near Salvation Mountain<br />
                    Open by appointment
                  </p>
                </div>
              </div>

              <div className="p-8 bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-2xl border border-purple-500/30">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-cyan-400 mb-2">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-black/50 border border-cyan-500/30 rounded-lg focus:border-cyan-400 focus:outline-none text-white"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-cyan-400 mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-black/50 border border-cyan-500/30 rounded-lg focus:border-cyan-400 focus:outline-none text-white"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-cyan-400 mb-2">Message</label>
                    <textarea
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-black/50 border border-cyan-500/30 rounded-lg focus:border-cyan-400 focus:outline-none text-white resize-none"
                      placeholder="Tell us about your idea..."
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={formStatus === 'sending'}
                    className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-bold hover:scale-105 transition-transform shadow-lg shadow-cyan-500/50 disabled:opacity-50"
                  >
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="border-t border-cyan-500/30 py-8 px-6 bg-black/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <Sparkles className="text-cyan-400" size={24} />
            <span className="font-bold">The Manifestorium</span>
          </div>
          <p className="text-gray-400 text-sm">© 2025 The Manifestorium • Slab City, CA</p>
          <div className="flex gap-4">
            <a href="https://instagram.com/themanifestorium" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-cyan-400 transition-colors">
              <Instagram size={20} />
            </a>
            <a href="mailto:thisishowislab@gmail.com" className="text-gray-400 hover:text-cyan-400 transition-colors">
              <Mail size={20} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
    }
