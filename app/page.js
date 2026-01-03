'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart,
  Menu,
  X,
  Zap,
  Cpu,
  Sparkles,
  ChevronRight,
  Instagram,
  Mail,
  Home,
  Briefcase,
  Store,
  MapPin,
  Heart,
  MessageCircle,
  Search,
  Bus,
  Tent,
  Archive,
} from 'lucide-react';
import DiscoveryIntro from '../components/ui/DiscoveryIntro';
import { AnimatePresence } from 'framer-motion';

export default function ManifestoriumSite() {
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [scrollY, setScrollY] = useState(0);
  const [donationAmount, setDonationAmount] = useState('');
  const [products, setProducts] = useState([]);
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [tours, setTours] = useState([]);
  const [donationTiers, setDonationTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [formStatus, setFormStatus] = useState('');
  const [showIntro, setShowIntro] = useState(true);

  // Shop search
  const [productQuery, setProductQuery] = useState('');

  // Shop category filters
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubcategory, setSelectedSubcategory] = useState('All');

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);

    // Optional Stripe script (safe)
    if (!document.querySelector('script[src="https://js.stripe.com/v3/"]')) {
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.async = true;
      document.head.appendChild(script);
    }

    fetchCatalogData();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Open specific section from URL query: /?section=shop
  // (Avoids useSearchParams deopt warning)
  useEffect(() => {
    const section = new URLSearchParams(window.location.search).get('section');
    if (section && ['home', 'portfolio', 'shop', 'tours', 'support', 'contact'].includes(section)) {
      setActiveSection(section);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
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
      setLoading(false);
    } catch (error) {
      console.error('❌ Catalog load error:', error);
      setLoading(false);
    }
  };

  const handleCheckout = async (
    priceId,
    itemName,
    itemPrice,
    mode = 'payment',
    quantity = 1,
    requireShipping = false
  ) => {
    if (!priceId) {
      alert(`Missing Price ID for "${itemName}"`);
      return;
    }

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, mode, quantity, requireShipping }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data.error || 'Checkout failed';
        alert(`❌ STRIPE ERROR\n\n${msg}\n\nItem: ${itemName}\nPrice ID: ${priceId}`);
        console.error('Stripe error:', msg, 'for price:', priceId);
        return;
      }

      if (!data.url) {
        alert('Stripe did not return a checkout URL.');
        console.error('No checkout URL in response:', data);
        return;
      }

      window.location.href = data.url;
    } catch (error) {
      const msg = error?.message || String(error);
      alert(`❌ NETWORK / SERVER ERROR\n\n${msg}`);
      console.error('Checkout exception:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const subj = encodeURIComponent(`Message from ${formData.name}`);
    const body = encodeURIComponent(
      `From: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`
    );
    window.location.href = `mailto:thisishowislab@gmail.com?subject=${subj}&body=${body}`;
    setFormData({ name: '', email: '', message: '' });
  };

  const Nav = ({ section, icon: Icon, children }) => (
    <button
      onClick={() => {
        setActiveSection(section);
        setMenuOpen(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
      className={`flex flex-col items-center gap-1 px-4 py-2 transition ${
        activeSection === section ? 'text-cyan-400' : 'text-gray-300 hover:text-white'
      }`}
    >
      <Icon size={24} />
      <span className="text-xs">{children}</span>
    </button>
  );

  // Build category + subcategory lists from products (supports both category/subcategory and Category/Subcategory)
  const { categories, subcategoriesByCategory } = useMemo(() => {
    const catSet = new Set();
    const subMap = new Map(); // category -> Set(subcat)

    for (const p of products || []) {
      const catRaw = p?.category ?? p?.Category ?? p?.productCategory ?? '';
      const subRaw = p?.subcategory ?? p?.Subcategory ?? p?.subCategory ?? p?.productSubcategory ?? '';

      const category = typeof catRaw === 'string' ? catRaw.trim() : '';
      const subcategory = typeof subRaw === 'string' ? subRaw.trim() : '';

      if (category) {
        catSet.add(category);
        if (!subMap.has(category)) subMap.set(category, new Set());
        if (subcategory) subMap.get(category).add(subcategory);
      }
    }

    const categories = Array.from(catSet).sort((a, b) => a.localeCompare(b));
    const subcategoriesByCategory = {};
    for (const c of categories) {
      subcategoriesByCategory[c] = Array.from(subMap.get(c) || []).sort((a, b) => a.localeCompare(b));
    }

    return { categories, subcategoriesByCategory };
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = productQuery.trim().toLowerCase();

    return (products || []).filter((p) => {
      const hay = `${p?.name || ''} ${p?.description || ''}`.toLowerCase();
      const matchesQuery = !q || hay.includes(q);

      const catRaw = p?.category ?? p?.Category ?? p?.productCategory ?? '';
      const subRaw = p?.subcategory ?? p?.Subcategory ?? p?.subCategory ?? p?.productSubcategory ?? '';

      const cat = typeof catRaw === 'string' ? catRaw.trim() : '';
      const sub = typeof subRaw === 'string' ? subRaw.trim() : '';

      const matchesCategory = selectedCategory === 'All' || cat === selectedCategory;
      const matchesSubcategory = selectedSubcategory === 'All' || sub === selectedSubcategory;

      return matchesQuery && matchesCategory && matchesSubcategory;
    });
  }, [products, productQuery, selectedCategory, selectedSubcategory]);

  const openProduct = (product) => {
    if (!product?.slug) return;
    router.push(`/products/${product.slug}`);
  };

  return (
    <>
      <AnimatePresence>
        {showIntro && <DiscoveryIntro onComplete={() => setShowIntro(false)} />}
      </AnimatePresence>

      <div
        className={`bg-black text-white min-h-screen selection:bg-cyan-500/30 ${
          showIntro ? 'h-screen overflow-hidden' : ''
        }`}
      >
        {/* Navigation */}
        <nav
          className={`fixed w-full z-50 transition ${
            scrollY > 50 ? 'bg-black/90 backdrop-blur-lg shadow-lg shadow-cyan-500/20' : ''
          }`}
        >
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => setActiveSection('home')}
              className="flex items-center gap-3 hover:opacity-80 transition"
            >
              <Sparkles className="text-cyan-400" size={28} />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                THE MANIFESTORIUM
              </h1>
            </button>
            <div className="hidden md:flex gap-2">
              <Nav section="home" icon={Home}>
                Home
              </Nav>
              <Nav section="portfolio" icon={Briefcase}>
                Portfolio
              </Nav>
              <Nav section="shop" icon={Store}>
                Shop
              </Nav>
              <Nav section="tours" icon={MapPin}>
                Tours
              </Nav>
              <Nav section="support" icon={Heart}>
                Support
              </Nav>
              <Nav section="contact" icon={MessageCircle}>
                Contact
              </Nav>
            </div>
            <button className="md:hidden text-cyan-400" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
          {menuOpen && (
            <div className="md:hidden bg-black/95 backdrop-blur-lg border-t border-cyan-500/30 p-6 flex flex-col gap-2">
              <Nav section="home" icon={Home}>
                Home
              </Nav>
              <Nav section="portfolio" icon={Briefcase}>
                Portfolio
              </Nav>
              <Nav section="shop" icon={Store}>
                Shop
              </Nav>
              <Nav section="tours" icon={MapPin}>
                Tours
              </Nav>
              <Nav section="support" icon={Heart}>
                Support
              </Nav>
              <Nav section="contact" icon={MessageCircle}>
                Contact
              </Nav>
            </div>
          )}
        </nav>

        {/* HOME SECTION */}
        {activeSection === 'home' && (
          <section className="min-h-screen flex items-center justify-center relative pt-20">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10" />
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, cyan 1px, transparent 0)',
                backgroundSize: '50px 50px',
              }}
            />
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
                <span className="text-cyan-400 font-bold"> creation doesn't belong to the rich</span>, the plugged-in,
                or the polished.
              </p>

              <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                “For Magical Use Only” means these objects are not optimized, mass-produced, or pretending to be
                perfect. They are experiments. They are companions. They are proof that meaning can be fabricated
                from almost nothing.
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
                  Shop Art Tech
                </button>
              </div>

              <div className="mt-16 p-8 bg-gradient-to-r from-purple-900/30 to-cyan-900/30 rounded-2xl border border-cyan-500/30 backdrop-blur-sm">
                <p className="text-lg leading-relaxed">
                  <span className="text-cyan-400 font-bold">Everything is an experiment.</span> You're invited to
                  participate, not spectate. With improvisation as law and tech as a paintbrush, your weirdest
                  ideas are suddenly fair game.
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
              <p className="text-xl text-gray-400 mb-12">Art at the intersection of code, craft, and chaos</p>

              {loading ? (
                <div className="text-center py-20">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400" />
                  <p className="text-gray-400 mt-4">Loading portfolio...</p>
                </div>
              ) : portfolioItems.length === 0 ? (
                <div className="text-center py-20 bg-gradient-to-br from-cyan-900/20 to-purple-900/20 rounded-2xl border border-cyan-500/30">
                  <p className="text-gray-300 text-lg mb-4">Portfolio items coming soon!</p>
                  <p className="text-gray-400">Add content in your Contentful space to showcase your work here.</p>
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
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            decoding="async"
                          />
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

              <p className="text-xl text-gray-400 mb-8">
                Objects here are grouped by temperament, not by product. Line browsed by category, follow what pulls
                at you and don't worry about choosing correctly. Most items exist in limited runs, small batches or
                single incarnations.
              </p>

              {/* Search bar */}
              <div className="mb-10">
                <div className="flex items-center gap-3 bg-black/50 border border-cyan-500/30 rounded-xl px-4 py-3">
                  <Search className="text-cyan-400" />
                  <input
                    value={productQuery}
                    onChange={(e) => setProductQuery(e.target.value)}
                    placeholder="Search products…"
                    className="w-full bg-transparent outline-none text-white placeholder:text-gray-500"
                  />
                </div>

                {/* Category + Subcategory filters */}
                {categories.length > 0 && (
                  <div className="mt-4 space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCategory('All');
                          setSelectedSubcategory('All');
                        }}
                        className={`px-3 py-2 rounded-lg border text-sm transition ${
                          selectedCategory === 'All'
                            ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                            : 'border-cyan-500/30 text-gray-300 hover:text-white hover:border-cyan-400'
                        }`}
                      >
                        All
                      </button>

                      {categories.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            setSelectedCategory(cat);
                            setSelectedSubcategory('All');
                          }}
                          className={`px-3 py-2 rounded-lg border text-sm transition ${
                            selectedCategory === cat
                              ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                              : 'border-cyan-500/30 text-gray-300 hover:text-white hover:border-cyan-400'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {selectedCategory !== 'All' && subcategoriesByCategory[selectedCategory]?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedSubcategory('All')}
                          className={`px-3 py-2 rounded-lg border text-sm transition ${
                            selectedSubcategory === 'All'
                              ? 'border-purple-400 text-purple-300 bg-purple-500/10'
                              : 'border-purple-500/30 text-gray-300 hover:text-white hover:border-purple-400'
                          }`}
                        >
                          All
                        </button>

                        {subcategoriesByCategory[selectedCategory].map((sub) => (
                          <button
                            key={sub}
                            type="button"
                            onClick={() => setSelectedSubcategory(sub)}
                            className={`px-3 py-2 rounded-lg border text-sm transition ${
                              selectedSubcategory === sub
                                ? 'border-purple-400 text-purple-300 bg-purple-500/10'
                                : 'border-purple-500/30 text-gray-300 hover:text-white hover:border-purple-400'
                            }`}
                          >
                            {sub}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {loading ? (
                <div className="text-center py-20">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400" />
                  <p className="text-gray-400 mt-4">Loading products...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-20 bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-2xl border border-purple-500/30">
                  <p className="text-gray-300 text-lg mb-4">
                    {products.length === 0 ? 'No products found in Contentful' : 'No products match your filters'}
                  </p>
                  <p className="text-gray-400 mb-6">Make sure your products are Published in Contentful → Content</p>
                  <button
                    onClick={() => setActiveSection('contact')}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-bold hover:scale-105 transition-transform"
                  >
                    Contact Us About Custom Orders
                  </button>
                </div>
              ) : (
                <div className="grid md:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => {
                    const clickable = Boolean(product.slug);

                    return (
                      <div
                        key={product.id}
                        role={clickable ? 'button' : undefined}
                        tabIndex={clickable ? 0 : undefined}
                        onClick={() => clickable && openProduct(product)}
                        onKeyDown={(e) => {
                          if (!clickable) return;
                          if (e.key === 'Enter' || e.key === ' ') openProduct(product);
                        }}
                        className={`bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-purple-500/30 hover:border-purple-400 transition-all duration-300 overflow-hidden group hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/30 ${
                          clickable ? 'cursor-pointer' : 'opacity-95'
                        }`}
                      >
                        <div className="h-48 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center overflow-hidden">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                              loading="lazy"
                              decoding="async"
                            />
                          ) : (
                            <div className="text-7xl">🎴</div>
                          )}
                        </div>

                        <div className="p-6">
                          <h3 className="text-xl font-bold text-white mb-2">{product.name}</h3>

                          {product.description && (
                            <p className="text-gray-400 text-sm mb-3 line-clamp-2">{product.description}</p>
                          )}

                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold text-purple-400">${product.price}</span>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openProduct(product);
                              }}
                              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-semibold hover:scale-105 transition-transform"
                              title="View details"
                            >
                              View Details
                            </button>
                          </div>

                          {!product.slug && (
                            <p className="text-xs text-gray-500 mt-3">
                              (No slug yet — add it in Contentful to enable product page.)
                            </p>
                          )}

                          {!product.stripePriceId && (
                            <p className="text-xs text-pink-300 mt-2">(Missing Stripe Price ID in variantUx)</p>
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

        {/* TOURS SECTION */}
        {activeSection === 'tours' && (
          <section className="min-h-screen pt-32 pb-20 px-6">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-5xl font-black mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Local Tours
              </h2>

              <p className="text-xl text-gray-400 mb-12">
                Experience creation in action just a hundred feet from Salvation Mountain. Step into our art tech
                makerspace, where salvaged desert materials meet fabrication. See printers, lasers, prototypes, and
                art.
              </p>

              {loading ? (
                <div className="text-center py-20">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400" />
                  <p className="text-gray-400 mt-4">Loading tours...</p>
                </div>
              ) : tours.length === 0 ? (
                <div className="bg-gradient-to-br from-cyan-900/30 to-purple-900/30 p-8 rounded-2xl border border-cyan-500/30">
                  <h3 className="text-3xl font-bold text-cyan-400 mb-4">Desert Creation Station Tours</h3>
                  <p className="text-gray-300 mb-6 leading-relaxed">
                    Experience creation in action just a hundred feet from Salvation Mountain. Step into our art tech
                    makerspace, where salvaged desert materials meet fabrication. See printers, lasers, prototypes,
                    and art.
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
                            decoding="async"
                          />
                        </div>
                      ) : (
                        <div className="h-48 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center text-7xl">
                          🏜️
                        </div>
                      )}
                      <div className="p-6">
                        <h3 className="text-2xl font-bold text-cyan-400 mb-3">{tour.name}</h3>
                        <p className="text-gray-300 mb-4 leading-relaxed">{tour.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-3xl font-bold text-purple-400">${tour.price}</span>
                          <button
                            onClick={() =>
                              tour.stripePriceId
                                ? handleCheckout(tour.stripePriceId, tour.name, tour.price, 'payment', 1, false)
                                : setActiveSection('contact')
                            }
                            className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-semibold hover:scale-105 transition-transform"
                          >
                            Book Now
                          </button>
                        </div>
                        {!tour.stripePriceId && (
                          <p className="text-xs text-pink-300 mt-3">
                            (This tour is missing a Stripe Price ID in pricing JSON: variantUx)
                          </p>
                        )}
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
              <p className="text-xl text-gray-400 mb-12">Keep the creative chaos alive</p>

              <div className="mb-12 p-8 bg-gradient-to-br from-purple-900/30 to-cyan-900/30 rounded-2xl border border-cyan-500/30">
                <h3 className="text-2xl font-bold text-cyan-400 mb-4">Why Support Us?</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Every 3D print, every laser cut, every experimental installation runs on materials, electricity, and
                  the sheer will to keep making weird things in the desert.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  Your support keeps the machines humming and the ideas flowing. Think of it as funding the most
                  interesting rest stop on your way through the desert.
                </p>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400" />
                  <p className="text-gray-400 mt-4">Loading donation options...</p>
                </div>
              ) : donationTiers.length > 0 ? (
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  {donationTiers.map((tier, idx) => {
                    const colors = [
                      'border-cyan-400 hover:bg-cyan-500/10',
                      'border-purple-400 hover:bg-purple-500/10',
                      'border-pink-400 hover:bg-pink-500/10',
                    ];

                    return (
                      <button
                        key={tier.id}
                        onClick={() =>
                          tier.stripePriceId
                            ? handleCheckout(tier.stripePriceId, tier.name, tier.price, 'payment', 1, false)
                            : alert('Add Stripe Price ID in pricing JSON (variantUx)')
                        }
                        className={`p-6 rounded-xl border-2 transition-all hover:scale-105 ${
                          colors[idx % 3]
                        } min-h-[200px] flex flex-col justify-between`}
                      >
                        <div>
                          <div className="text-4xl font-bold text-cyan-400 mb-2">${tier.price}</div>
                          <div className="text-base font-semibold text-white mt-2 mb-3">{tier.name}</div>
                          {tier.description && (
                            <div className="text-xs text-gray-400 leading-relaxed">{tier.description}</div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <button
                    onClick={() => setDonationAmount('10')}
                    className="p-6 rounded-xl border-2 border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-500/10 transition-all hover:scale-105"
                  >
                    <div className="text-3xl mb-2">☕</div>
                    <div className="text-2xl font-bold text-cyan-400">$10</div>
                    <div className="text-sm text-gray-400 mt-2">Coffee for the makers</div>
                  </button>

                  <button
                    onClick={() => setDonationAmount('25')}
                    className="p-6 rounded-xl border-2 border-purple-500/30 hover:border-purple-400 hover:bg-purple-500/10 transition-all hover:scale-105"
                  >
                    <div className="text-3xl mb-2">⚡</div>
                    <div className="text-2xl font-bold text-purple-400">$25</div>
                    <div className="text-sm text-gray-400 mt-2">Materials fund</div>
                  </button>

                  <button
                    onClick={() => setDonationAmount('50')}
                    className="p-6 rounded-xl border-2 border-pink-500/30 hover:border-pink-400 hover:bg-pink-500/10 transition-all hover:scale-105"
                  >
                    <div className="text-3xl mb-2">🚀</div>
                    <div className="text-2xl font-bold text-pink-400">$50</div>
                    <div className="text-sm text-gray-400 mt-2">Tool maintenance</div>
                  </button>
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
                    onClick={() => alert('Custom donations coming soon! Please contact us or choose a preset tier.')}
                    className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-bold hover:scale-105 transition-transform shadow-lg shadow-cyan-500/50 whitespace-nowrap"
                  >
                    Contribute
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 bg-gradient-to-br from-cyan-900/20 to-purple-900/20 rounded-xl border border-cyan-500/30">
                  <h4 className="text-lg font-bold text-cyan-400 mb-3">What Your Support Funds</h4>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li>• 3D printer filament & maintenance</li>
                    <li>• Laser cutter supplies</li>
                    <li>• Salvaged material processing</li>
                    <li>• Off-grid power systems</li>
                    <li>• Workshop tools & safety equipment</li>
                    <li>• Community art programs</li>
                  </ul>
                </div>

                <div className="p-6 bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-xl border border-purple-500/30">
                  <h4 className="text-lg font-bold text-purple-400 mb-3">Other Ways to Support</h4>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li>• Buy art from our shop</li>
                    <li>• Book a local tour</li>
                    <li>• Share our work on social media</li>
                    <li>• Donate materials or equipment</li>
                    <li>• Volunteer your skills</li>
                    <li>• Commission custom pieces</li>
                  </ul>
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
                      Have a wild idea? Need custom tech art? Want to collaborate or book a tour? We're here for it
                      all.
                    </p>

                    <div className="space-y-4">
                      <a
                        href="mailto:thisishowislab@gmail.com"
                        className="flex items-center gap-3 text-purple-300 hover:text-purple-400 transition-colors"
                      >
                        <Mail size={24} />
                        <span className="text-sm">thisishowislab@gmail.com</span>
                    </div>
                  </div>

                  <div className="p-6 bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-2xl border border-purple-500/30">
                    <h4 className="text-lg font-bold text-purple-400 mb-3">Location</h4>
                    <p className="text-gray-300 text-sm">
                      Slab City, California
                      <br />
                      Near Salvation Mountain
                      <br />
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
                      {formStatus === 'sending' ? 'Sending...' : 'Send Message'}
                    </button>
                    {formStatus === 'success' && (
                      <p className="text-green-400 text-center text-sm">Opening your email client...</p>
                    )}
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
            </div>
        </footer>
      </div>
    </>
  );
                }
