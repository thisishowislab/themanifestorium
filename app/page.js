'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Menu, X, Zap, Cpu, Sparkles, ChevronRight, Instagram, Mail, Home, Briefcase, Store, MapPin, Heart, MessageCircle } from 'lucide-react';

export default function ManifestoriumSite() {
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

  const CONTENTFUL_SPACE_ID = 'nfc5otagjk9d';
  const CONTENTFUL_ACCESS_TOKEN = 'pNY83Bj4SI3qeOlhInXguFQBN8cqE1dT0VBr1mpAB7k';
  const STRIPE_KEY = 'pk_live_51SJAagC2WMzoC8yUOEzNRf6XW4Q37cT5qkpklTSxo9vc3ukunfD7kArwq7NsaEelliZZDiv656iX9Iqgw2RRtMn900IT9qGL8H';

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    
    // Load Stripe script
    if (!document.querySelector('script[src="https://js.stripe.com/v3/"]')) {
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.async = true;
      script.onload = () => console.log('✅ Stripe.js loaded');
      script.onerror = () => console.error('❌ Failed to load Stripe.js');
      document.head.appendChild(script);
    }
    
    fetchContentfulData();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getImageUrl = (asset) => {
    if (!asset?.fields?.file) return null;
    const url = asset.fields.file.url;
    return url.startsWith('//') ? `https:${url}` : url;
  };

  const fetchContentfulData = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(
        `https://cdn.contentful.com/spaces/${CONTENTFUL_SPACE_ID}/environments/master/entries?access_token=${CONTENTFUL_ACCESS_TOKEN}&include=10`
      );
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      console.log('=== CONTENTFUL DATA ===', data);
      
      // Build asset map
      const assetMap = {};
      if (data.includes?.Asset) {
        data.includes.Asset.forEach(asset => {
          assetMap[asset.sys.id] = asset;
        });
      }
      
      const prods = [], port = [], trs = [], tiers = [];
      
      data.items.forEach(item => {
        const contentTypeId = item.sys.contentType?.sys?.id;
        const f = item.fields;
        
        // Get image from any possible field
        const imgField = f.productImage || f.tourImage || f.image;
        const img = imgField?.sys?.id ? getImageUrl(assetMap[imgField.sys.id]) : null;
        
        console.log('Processing:', {
          contentTypeId,
          name: f.productName || f.tourName || f.tierName || f.title,
          fields: Object.keys(f)
        });
        
        // MARKETPLACE PRODUCT - ID: NVpVj8LwkehFy7TfbDiCu
        if (contentTypeId === 'NVpVj8LwkehFy7TfbDiCu') {
          const product = {
            id: item.sys.id,
            name: f.productName || 'Untitled Product',
            price: Number(f.price || 0),
            description: f.productDescription || '',
            image: img,
            stripePriceId: f.stripePriceId || null
          };
          console.log('✅ PRODUCT FOUND:', product);
          prods.push(product);
        } 
        // TOUR - ID: 70oPrCNwUtqI05YuxYLW9D
        else if (contentTypeId === '70oPrCNwUtqI05YuxYLW9D') {
          const tour = {
            id: item.sys.id,
            name: f.tourName || f.name || 'Untitled Tour',
            price: Number(f.price || 25),
            description: f.tourDescription || f.description || '',
            image: img,
            stripePriceId: f.stripePriceId || null
          };
          console.log('✅ TOUR FOUND:', tour);
          trs.push(tour);
        } 
        // DONATION TIER - ID: 5YmWnOsbaqjCb367hRLpST
        else if (contentTypeId === '5YmWnOsbaqjCb367hRLpST') {
          const tier = {
            id: item.sys.id,
            name: f.tierName || f.name || 'Support',
            price: Number(f.price || 10),
            description: f.tierDescription || f.description || '',
            stripePriceId: f.stripePriceId || null
          };
          console.log('✅ DONATION TIER FOUND:', tier);
          tiers.push(tier);
        } 
        // PORTFOLIO - everything else
        else {
          if (f.title || f.name || img) {
            const portfolioItem = {
              id: item.sys.id,
              title: f.title || f.name || 'Untitled',
              desc: f.description || '',
              tech: f.technologies || f.tech || '',
              image: img
            };
            console.log('✅ PORTFOLIO FOUND:', portfolioItem);
            port.push(portfolioItem);
          }
        }
      });
      
      console.log('=== FINAL RESULTS ===');
      console.log('Products:', prods.length, prods);
      console.log('Tours:', trs.length, trs);
      console.log('Donation Tiers:', tiers.length, tiers);
      console.log('Portfolio:', port.length, port);
      
      setProducts(prods);
      setTours(trs);
      setDonationTiers(tiers);
      setPortfolioItems(port);
      setLoading(false);
    } catch (error) {
      console.error('❌ Contentful Error:', error);
      setLoading(false);
    }
  };

  const handleCheckout = async (priceId, itemName, itemPrice) => {
    // Show ALL the debug info
    const debugInfo = `
🛒 CHECKOUT DEBUG INFO:
━━━━━━━━━━━━━━━━━━━━━━
Item: ${itemName}
Price: $${itemPrice}
Price ID: ${priceId}
━━━━━━━━━━━━━━━━━━━━━━
Stripe Key (first 20): ${STRIPE_KEY ? STRIPE_KEY.substring(0, 20) : 'MISSING'}
Stripe Key exists: ${!!STRIPE_KEY}
window.Stripe exists: ${!!window.Stripe}
━━━━━━━━━━━━━━━━━━━━━━
    `;
    
    console.log(debugInfo);
    alert(debugInfo);
    
    if (!priceId) {
      alert(`Missing Price ID for "${itemName}"`);
      return;
    }
    
    if (!STRIPE_KEY) {
      alert('❌ STRIPE KEY IS MISSING!\n\nCheck Vercel environment variables.');
      return;
    }
    
    try {
      if (!window.Stripe) {
        alert('Stripe.js not loaded. Refresh the page.');
        return;
      }
      
      const stripe = window.Stripe(STRIPE_KEY);
      
      alert('About to redirect to Stripe...\n\nIf nothing happens, check the browser console for errors.');
      
      const result = await stripe.redirectToCheckout({
        lineItems: [{ price: priceId, quantity: 1 }],
        mode: 'payment',
        successUrl: `${window.location.origin}?success=true`,
        cancelUrl: window.location.origin,
      });
      
      if (result.error) {
        const errorMsg = `
❌ STRIPE ERROR:
━━━━━━━━━━━━━━━━━━━━━━
${result.error.message}
━━━━━━━━━━━━━━━━━━━━━━
Type: ${result.error.type}
Code: ${result.error.code || 'none'}
━━━━━━━━━━━━━━━━━━━━━━
Price ID used: ${priceId}
        `;
        console.error(errorMsg);
        alert(errorMsg);
      }
    } catch (error) {
      const errorMsg = `
❌ JAVASCRIPT ERROR:
━━━━━━━━━━━━━━━━━━━━━━
${error.message}
━━━━━━━━━━━━━━━━━━━━━━
Full error: ${error}
      `;
      console.error(errorMsg);
      alert(errorMsg);
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
            <Nav section="contact" icon={MessageCircle}>Contact</Nav>
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
                Your Imagination
              </span>
              <br />
              <span>Fabrication Station</span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Where off-grid tech, desert salvage, and handmade myth collide to prove that 
              <span className="text-cyan-400 font-bold"> creation doesn't belong to the rich</span>, the plugged-in, or the polished.
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
                <span className="text-cyan-400 font-bold">Everything is an experiment.</span> 
                {' '}You're invited to participate, not spectate. Improvisation is law, tech is a paintbrush, 
                and your weirdest ideas are suddenly fair game.
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
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
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

      {/* SHOP SECTION */}
      {activeSection === 'shop' && (
        <section className="min-h-screen pt-32 pb-20 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-5xl font-black mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Shop
            </h2>
            <p className="text-xl text-gray-400 mb-12">Own a piece of the weird and wonderful</p>
            
            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
                <p className="text-gray-400 mt-4">Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-2xl border border-purple-500/30">
                <p className="text-gray-300 text-lg mb-4">No products found in Contentful</p>
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
                {products.map((product) => (
                  <div 
                    key={product.id}
                    className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-purple-500/30 hover:border-purple-400 transition-all duration-300 overflow-hidden group hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/30"
                  >
                    <div className="h-48 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center overflow-hidden">
                      {product.image ? (
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
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
                          onClick={() => handleCheckout(product.stripePriceId, product.name, product.price)}
                          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-semibold hover:scale-105 transition-transform"
                        >
                          Buy Now
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

      {/* TOURS SECTION */}
      {activeSection === 'tours' && (
        <section className="min-h-screen pt-32 pb-20 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-5xl font-black mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Local Tours
            </h2>
            <p className="text-xl text-gray-400 mb-12">
              Experience creation in action - just 100 feet from Salvation Mountain
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
                  Step into our art tech makerspace where salvaged desert materials meet cutting-edge fabrication. 
                  See 3D printers, laser cutters, and CNC machines bringing wild ideas to life in real-time.
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
                          onClick={() => tour.stripePriceId ? handleCheckout(tour.stripePriceId, tour.name, tour.price) : setActiveSection('contact')}
                          className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-semibold hover:scale-105 transition-transform"
                        >
                          Book Now
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
            <p className="text-xl text-gray-400 mb-12">Keep the creative chaos alive</p>

            <div className="mb-12 p-8 bg-gradient-to-br from-purple-900/30 to-cyan-900/30 rounded-2xl border border-cyan-500/30">
              <h3 className="text-2xl font-bold text-cyan-400 mb-4">Why Support Us?</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                Every 3D print, every laser cut, every experimental installation runs on materials, electricity, 
                and the sheer will to keep making weird things in the desert.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Your support keeps the machines humming and the ideas flowing. Think of it as funding 
                the most interesting rest stop on your way through the desert.
              </p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
                <p className="text-gray-400 mt-4">Loading donation options...</p>
              </div>
            ) : donationTiers.length > 0 ? (
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {donationTiers.map((tier, idx) => {
                  const colors = [
                    'border-cyan-400 hover:bg-cyan-500/10',
                    'border-purple-400 hover:bg-purple-500/10',
                    'border-pink-400 hover:bg-pink-500/10'
                  ];
                  
                  return (
                    <button
                      key={tier.id}
                      onClick={() => tier.stripePriceId ? handleCheckout(tier.stripePriceId, tier.name, tier.price) : alert('Add Stripe Price ID in Contentful')}
                      className={`p-6 rounded-xl border-2 transition-all hover:scale-105 ${colors[idx % 3]} min-h-[200px] flex flex-col justify-between`}
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
                    Have a wild idea? Need custom tech art? Want to collaborate or book a tour? 
                    We're here for it all.
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
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
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
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
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
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
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
