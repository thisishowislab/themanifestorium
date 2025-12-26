'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ShoppingCart, Menu, X, Zap, Cpu, Sparkles, ChevronRight,
  Mail, Home, Briefcase, Store, MapPin, Heart, MessageCircle
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

  // Shop UX
  const [shopQuery, setShopQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const [donationAmount, setDonationAmount] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [formStatus, setFormStatus] = useState('');

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);

    // Load Stripe.js (optional)
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

      if (!res.ok) {
        console.error('❌ Catalog API error:', data);
        throw new Error(data?.error || 'Failed to load catalog');
      }

      setProducts(Array.isArray(data.products) ? data.products : []);
      setTours(Array.isArray(data.tours) ? data.tours : []);
      setDonationTiers(Array.isArray(data.donationTiers) ? data.donationTiers : []);
      setPortfolioItems(Array.isArray(data.portfolioItems) ? data.portfolioItems : []);
    } catch (error) {
      console.error('❌ Catalog load error:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Added productType so checkout route can decide shipping correctly
  // productType: "product" | "tour" | "donation" | etc.
  const handleCheckout = async (priceId, itemName, { mode = "payment", quantity = 1, productType = "product" } = {}) => {
    if (!priceId) {
      alert(`Missing Price ID for "${itemName}"`);
      return;
    }

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, mode, quantity, productType }),
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
      className={`flex flex-col items-center gap-1 px-4 py-2 transition ${activeSection === section ? 'text-cyan-400' : 'text-gray-300 hover:text-white'}`}
    >
      <Icon size={24} />
      <span className="text-xs">{children}</span>
    </button>
  );

  // Categories: expects product.categories (array) OR product.category (string). We support both.
  const allCategories = useMemo(() => {
    const set = new Set();
    for (const p of products) {
      const cats = Array.isArray(p.categories) ? p.categories : (p.category ? [p.category] : []);
      for (const c of cats) if (c) set.add(String(c));
    }
    return ['All', ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = shopQuery.trim().toLowerCase();
    return products.filter(p => {
      const name = (p.name || '').toLowerCase();
      const desc = (p.description || '').toLowerCase();
      const cats = Array.isArray(p.categories) ? p.categories : (p.category ? [p.category] : []);
      const catOk = (activeCategory === 'All') || cats.map(String).includes(activeCategory);

      const qOk = !q || name.includes(q) || desc.includes(q) || cats.join(' ').toLowerCase().includes(q);
      return catOk && qOk;
    });
  }, [products, shopQuery, activeCategory]);

  return (
    <div className="bg-black text-white min-h-screen">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition ${scrollY > 50 ? 'bg-black/90 backdrop-blur-lg shadow-lg shadow-cyan-500/20' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => setActiveSection('home')} className="flex items-center gap-3 hover:opacity-80 transition">
            <Sparkles className="text-cyan-400 animate-pulse" size={28} />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              THE MANIFESTORIUM
            </h1>
          </button>

          <div className="hidden md:flex gap-2 items-center">
            <Nav section="home" icon={Home}>Home</Nav>
            <Nav section="portfolio" icon={Briefcase}>Portfolio</Nav>
            <Nav section="shop" icon={Store}>Shop</Nav>
            <Nav section="tours" icon={MapPin}>Tours</Nav>
            <Nav section="support" icon={Heart}>Support</Nav>
            <Nav section="contact" icon={MessageCircle}>Contact</Nav>

            {/* ✅ Real route link to your existing page */}
            <Link
              href="/community"
              className="ml-2 px-4 py-2 rounded-lg border border-cyan-500/30 hover:border-cyan-400 text-gray-200 hover:text-white transition"
              onClick={() => setMenuOpen(false)}
            >
              Community
            </Link>
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
            <Nav section="contact" icon={MessageCircle}>Contact</Nav>

            <Link
              href="/community"
              className="mt-2 px-4 py-3 rounded-lg border border-cyan-500/30 hover:border-cyan-400 text-gray-200 hover:text-white transition text-center"
              onClick={() => setMenuOpen(false)}
            >
              Community
            </Link>
          </div>
        )}
      </nav>

      {/* HOME SECTION */}
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
                For Magical Use Only
              </span>
              <br />
              <span>Desert Art Tech Makerspace</span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Off-grid creation, desert salvage, and handmade myth.
              <span className="text-cyan-400 font-bold"> Participation is encouraged.</span>
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
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
                Enter the Shop
              </button>
            </div>

            <div className="mt-16 p-8 bg-gradient-to-r from-purple-900/30 to-cyan-900/30 rounded-2xl border border-cyan-500/30 backdrop-blur-sm">
              <p className="text-lg leading-relaxed">
                <span className="text-cyan-400 font-bold">Everything is an experiment.</span>
                {' '}You’re not here to spectate. You’re here to touch the weird thing and become part of the story.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* PORTFOLIO SECTION */}
      {activeSection === 'portfolio' && (
        <section className="min-h-screen pt-32 pb-20 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-5xl font-black mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Portfolio
            </h2>
            <p className="text-xl text-gray-400 mb-12">Proof of work. Proof of weird.</p>

            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
                <p className="text-gray-400 mt-4">Loading portfolio...</p>
              </div>
            ) : portfolioItems.length === 0 ? (
              <div className="text-center py-20 bg-gradient-to-br from-cyan-900/20 to-purple-900/20 rounded-2xl border border-cyan-500/30">
                <p className="text-gray-300 text-lg mb-4">Portfolio items coming soon!</p>
                <p className="text-gray-400">Add content in Contentful to showcase your work here.</p>
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
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
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

      {/* SHOP SECTION */}
      {activeSection === 'shop' && (
        <section className="min-h-screen pt-32 pb-20 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-5xl font-black mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Shop
            </h2>
            <p className="text-xl text-gray-400 mb-8">Tap a relic. Open the listing. Choose your fate.</p>

            {/* Search + Categories */}
            <div className="mb-8 grid gap-4">
              <input
                value={shopQuery}
                onChange={(e) => setShopQuery(e.target.value)}
                placeholder="Search products, categories, keywords..."
                className="w-full px-4 py-3 bg-black/50 border border-cyan-500/30 rounded-lg focus:border-cyan-400 focus:outline-none text-white"
              />

              <div className="flex gap-2 overflow-x-auto pb-2">
                {allCategories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setActiveCategory(c)}
                    className={`px-4 py-2 rounded-full border text-sm whitespace-nowrap transition ${
                      activeCategory === c
                        ? 'border-cyan-400 text-cyan-200 bg-cyan-500/10'
                        : 'border-purple-500/30 text-gray-300 hover:border-purple-400'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
                <p className="text-gray-400 mt-4">Loading products...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-2xl border border-purple-500/30">
                <p className="text-gray-300 text-lg mb-2">No matches.</p>
                <p className="text-gray-400">Try a different category or search term.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => {
                  const CardInner = (
                    <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-purple-500/30 hover:border-purple-400 transition-all duration-300 overflow-hidden group hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/30 h-full">
                      <div className="h-48 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center overflow-hidden">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                            loading="lazy"
                          />
                        ) : (
                          <div className="text-7xl">🎴</div>
                        )}
                      </div>
                      <div className="p-6 flex flex-col gap-3">
                        <h3 className="text-xl font-bold text-white">{product.name}</h3>
                        {product.description && (
                          <p className="text-gray-400 text-sm line-clamp-2">{product.description}</p>
                        )}
                        <div className="flex items-center justify-between mt-auto">
                          <span className="text-2xl font-bold text-purple-400">${product.price}</span>

                          {product.slug ? (
                            <span className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-semibold">
                              View
                            </span>
                          ) : (
                            <span className="px-4 py-2 bg-gray-700/50 rounded-lg font-semibold text-gray-300">
                              Needs slug
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );

                  return product.slug ? (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      className="block"
                      aria-label={`Open ${product.name}`}
                    >
                      {CardInner}
                    </Link>
                  ) : (
                    <div key={product.id}>
                      {CardInner}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* TOURS SECTION */}
      {activeSection === 'tours' && (
        <section className="min-h-screen pt-32 pb-20 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-5xl font-black mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Local Tours
            </h2>
            <p className="text-xl text-gray-400 mb-12">
              Guided desert weirdness. Pick a tour. Book it. Show up curious.
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
                  Step into the workshop where salvaged desert materials meet fabrication tools.
                </p>
                <button
                  onClick={() => setActiveSection('contact')}
                  className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-bold text-lg hover:scale-105 transition-transform shadow-lg shadow-cyan-500/50"
                >
                  Ask About Tours <ChevronRight className="inline ml-2" />
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
                        <span className="text-3xl font-bold text-purple-400">${tour.price}</span>
                        <button
                          onClick={() =>
                            tour.stripePriceId
                              ? handleCheckout(tour.stripePriceId, tour.name, { mode: "payment", productType: "tour" })
                              : setActiveSection('contact')
                          }
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

      {/* SUPPORT SECTION */}
      {activeSection === 'support' && (
        <section className="min-h-screen pt-32 pb-20 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl font-black mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Support The Magic
            </h2>
            <p className="text-xl text-gray-400 mb-12">Keep the machines humming and the myth alive.</p>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
                <p className="text-gray-400 mt-4">Loading donation options...</p>
              </div>
            ) : donationTiers.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {donationTiers.map((tier) => (
                  <button
                    key={tier.id}
                    onClick={() =>
                      tier.stripePriceId
                        ? handleCheckout(tier.stripePriceId, tier.name, { mode: "subscription", productType: "donation" })
                        : alert('Add Stripe Price ID in variantUx')
                    }
                    className="p-6 rounded-xl border-2 border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-500/10 transition-all hover:scale-105 min-h-[200px] flex flex-col justify-between"
                  >
                    <div>
                      <div className="text-4xl font-bold text-cyan-400 mb-2">${tier.price}</div>
                      <div className="text-base font-semibold text-white mt-2 mb-3">{tier.name}</div>
                      {tier.description && (
                        <div className="text-xs text-gray-400 leading-relaxed">{tier.description}</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-gradient-to-br from-purple-900/20 to-cyan-900/20 rounded-2xl border border-cyan-500/30">
                <p className="text-gray-300">No donation tiers published yet.</p>
              </div>
            )}

            <div className="p-6 bg-black/50 rounded-xl border border-cyan-500/30 mb-6">
              <label className="block text-sm font-semibold text-cyan-400 mb-3">Custom Amount</label>
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">$</span>
                  <input
                    type="number"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full pl-10 pr-4 py-3 bg-black/50 border border-cyan-500/30 rounded-lg focus:border-cyan-400 focus:outline-none text-white text-lg"
                  />
                </div>
                <button
                  onClick={() => alert('Custom donations coming soon. Pick a tier or message us.')}
                  className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-bold hover:scale-105 transition-transform shadow-lg shadow-cyan-500/50 whitespace-nowrap"
                >
                  Contribute
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CONTACT SECTION */}
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
                    Commissions, trades, tours, or “I found something cursed in my garage”—send it.
                  </p>

                  <div className="space-y-4">
                    <a href="mailto:thisishowislab@gmail.com" className="flex items-center gap-3 text-purple-300 hover:text-purple-400 transition-colors">
                      <Mail size={24} />
                      <span className="text-sm">thisishowislab@gmail.com</span>
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
          <p className="text-gray-400 text-sm">© 2025 For Magical Use Only • Slab City, CA</p>
          <div className="flex gap-4">
            <a href="mailto:thisishowislab@gmail.com" className="text-gray-400 hover:text-cyan-400 transition-colors">
              <Mail size={20} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
        }
