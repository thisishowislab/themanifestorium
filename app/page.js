'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Menu, X, Zap, Cpu, Sparkles, ChevronRight, Instagram, Mail } from 'lucide-react';

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
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [formStatus, setFormStatus] = useState('');

  const CONTENTFUL_SPACE_ID = 'nfc5otagjk9d';
  const CONTENTFUL_ACCESS_TOKEN = 'pNY83Bj4SI3qeOlhInXguFQBN8cqE1dT0VBr1mpAB7k';
  const STRIPE_KEY = 'pk_live_51SJAagC2WMzoC8yUOEzNRf6XW4Q37cT5qkpklTSxo9vc3ukunfD7kArwq7NsaEelliZZDiv656iX9Iqgw2RRtMn900IT9qGL8H';

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.async = true;
    document.head.appendChild(script);
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
    console.log('FULL CONTENTFUL DATA:', data); // Debug log
    
    const assetMap = {};
    if (data.includes?.Asset) {
      data.includes.Asset.forEach(asset => assetMap[asset.sys.id] = asset);
    }
    
    const prods = [], port = [], trs = [], tiers = [];
    
    data.items.forEach(item => {
      const type = item.sys.contentType?.sys?.id;
      const f = item.fields;
      
      console.log('Processing item:', type, f); // Debug log
      
      // Get image - try ALL possible field names
      const imgField = f.productImage || f.ProductImage || f['Product Image'] || 
                       f.tourImage || f.TourImage || f['Tour Image'] ||
                       f.image || f.Image;
      const img = imgField?.sys ? getImageUrl(assetMap[imgField.sys.id]) : null;
      
      // MARKETPLACE PRODUCT
      if (type === 'marketplaceProduct') {
        const product = {
          id: item.sys.id,
          name: f.productName || f.ProductName || f['Product Name'] || f.name || f.Name || 'Untitled Product',
          price: Number(f.price || f.Price || 0),
          description: f.productDescription || f.ProductDescription || f['Product Description'] || f.description || f.Description || '',
          image: img,
          stripePriceId: f.stripePriceId || f.stripePriceID || f['Stripe Price ID'] || f.StripePriceID || f.StripePriceId
        };
        console.log('Found product:', product);
        prods.push(product);
      } 
      // TOUR
      else if (type === 'tour') {
        const tour = {
          id: item.sys.id,
          name: f.tourName || f.TourName || f['Tour Name'] || f.name || f.Name || 'Untitled Tour',
          price: Number(f.price || f.Price || 25),
          description: f.tourDescription || f.TourDescription || f['Tour Description'] || f.description || f.Description || '',
          image: img,
          stripePriceId: f.stripePriceId || f.stripePriceID || f['Stripe Price ID']
        };
        console.log('Found tour:', tour);
        trs.push(tour);
      } 
      // DONATION TIER
      else if (type === 'donationTier') {
        const tier = {
          id: item.sys.id,
          name: f.tierName || f.TierName || f['Tier Name'] || f.name || f.Name || 'Support',
          price: Number(f.price || f.Price || 10),
          description: f.tierDescription || f.TierDescription || f['Tier Description'] || f.description || f.Description || '',
          stripePriceId: f.stripePriceId || f.stripePriceID || f['Stripe Price ID']
        };
        console.log('Found donation tier:', tier);
        tiers.push(tier);
      } 
      // PORTFOLIO (anything else with an image or title)
      else {
        const portfolio = {
          id: item.sys.id,
          title: f.title || f.Title || f.name || f.Name || 'Untitled',
          desc: f.description || f.Description || '',
          tech: f.technologies || f.Technologies || f.tech || f.Tech || '',
          image: img
        };
        console.log('Found portfolio item:', portfolio);
        port.push(portfolio);
      }
    });
    
    console.log('FINAL RESULTS:');
    console.log('Products:', prods);
    console.log('Tours:', trs);
    console.log('Donation Tiers:', tiers);
    console.log('Portfolio:', port);
    
    setProducts(prods);
    setTours(trs);
    setDonationTiers(tiers);
    setPortfolioItems(port);
    setLoading(false);
  } catch (error) {
    console.error('Error fetching Contentful data:', error);
    setLoading(false);
  }
};


  const handleCheckout = async (priceId) => {
    if (!priceId) {
      alert('Contact us to purchase!');
      setActiveSection('contact');
      return;
    }
    const stripe = window.Stripe?.(STRIPE_KEY);
    if (!stripe) {
      alert('Loading payment...');
      return;
    }
    await stripe.redirectToCheckout({
      lineItems: [{ price: priceId, quantity: 1 }],
      mode: 'payment',
      successUrl: window.location.origin + '?success=true',
      cancelUrl: window.location.origin
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const subj = encodeURIComponent(`Message from ${formData.name}`);
    const body = encodeURIComponent(`From: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`);
    window.location.href = `mailto:thisishowislab@gmail.com?subject=${subj}&body=${body}`;
    setFormData({ name: '', email: '', message: '' });
  };

  const Nav = ({ section, children }) => (
    <button
      onClick={() => { setActiveSection(section); setMenuOpen(false); }}
      className={`px-4 py-2 transition ${activeSection === section ? 'text-cyan-400 font-bold' : 'text-gray-300 hover:text-white'}`}
    >
      {children}
    </button>
  );

  return (
    <div className="bg-black text-white min-h-screen">
      <nav className={`fixed w-full z-50 transition ${scrollY > 50 ? 'bg-black/90 backdrop-blur-lg' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => setActiveSection('home')} className="flex items-center gap-3">
            <Sparkles className="text-cyan-400" size={28} />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              THE MANIFESTORIUM
            </h1>
          </button>
          <div className="hidden md:flex gap-2">
            <Nav section="home">Home</Nav>
            <Nav section="portfolio">Portfolio</Nav>
            <Nav section="shop">Shop</Nav>
            <Nav section="tours">Tours</Nav>
            <Nav section="support">Support</Nav>
            <Nav section="contact">Contact</Nav>
          </div>
          <button className="md:hidden text-cyan-400" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-black/95 border-t border-cyan-500/30 p-6 flex flex-col gap-2">
            <Nav section="home">Home</Nav>
            <Nav section="portfolio">Portfolio</Nav>
            <Nav section="shop">Shop</Nav>
            <Nav section="tours">Tours</Nav>
            <Nav section="support">Support</Nav>
            <Nav section="contact">Contact</Nav>
          </div>
        )}
      </nav>

      {activeSection === 'home' && (
        <section className="min-h-screen flex items-center justify-center relative pt-20">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10" />
          <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
            <div className="mb-8 flex justify-center gap-4">
              <Cpu className="text-cyan-400 animate-pulse" size={48} />
              <Zap className="text-purple-400 animate-pulse" size={48} />
              <Sparkles className="text-pink-400 animate-pulse" size={48} />
            </div>
            <h2 className="text-5xl md:text-7xl font-black mb-6">
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Your Imagination
              </span>
              <br />
              <span>Fabrication Station</span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Where off-grid tech, desert salvage, and handmade myth collide to prove that 
              <span className="text-cyan-400 font-bold"> creation doesn't belong to the rich</span>
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button 
                onClick={() => setActiveSection('portfolio')}
                className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-bold hover:scale-105 transition"
              >
                Explore Portfolio <ChevronRight className="inline" />
              </button>
              <button 
                onClick={() => setActiveSection('shop')}
                className="px-8 py-4 border-2 border-cyan-400 rounded-lg font-bold hover:bg-cyan-400/20 transition"
              >
                Shop Art Tech
              </button>
            </div>
            <div className="mt-16 p-8 bg-gradient-to-r from-purple-900/30 to-cyan-900/30 rounded-2xl border border-cyan-500/30">
              <p className="text-lg">
                <span className="text-cyan-400 font-bold">Everything is an experiment.</span> You're invited to participate, not spectate.
              </p>
            </div>
          </div>
        </section>
      )}

      {activeSection === 'portfolio' && (
        <section className="min-h-screen pt-32 pb-20 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-5xl font-black mb-12 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Portfolio</h2>
            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
              </div>
            ) : portfolioItems.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-8">
                {portfolioItems.map((item, i) => (
                  <div key={i} className="group bg-gradient-to-br from-gray-900 to-black p-8 rounded-2xl border border-cyan-500/30 hover:border-cyan-400 transition hover:scale-105">
                    {item.image && (
                      <div className="absolute inset-0 opacity-10">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="relative">
                      <h3 className="text-2xl font-bold text-cyan-400 mb-3">{item.title}</h3>
                      <p className="text-gray-300 mb-4">{item.desc}</p>
                      {item.tech && (
                        <div className="flex flex-wrap gap-2">
                          {item.tech.split(',').map((t, j) => (
                            <span key={j} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">{t.trim()}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-gradient-to-br from-cyan-900/20 to-purple-900/20 rounded-2xl border border-cyan-500/30">
                <p className="text-gray-300">Add content in Contentful to showcase your work!</p>
              </div>
            )}
          </div>
        </section>
      )}

      {activeSection === 'shop' && (
        <section className="min-h-screen pt-32 pb-20 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-5xl font-black mb-12 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Shop</h2>
            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
              </div>
            ) : products.length > 0 ? (
              <div className="grid md:grid-cols-3 gap-6">
                {products.map((p) => (
                  <div key={p.id} className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-purple-500/30 hover:border-purple-400 transition overflow-hidden hover:scale-105">
                    <div className="h-48 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
                      {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : <div className="text-7xl">🎴</div>}
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2">{p.name}</h3>
                      {p.description && <p className="text-gray-400 text-sm mb-3">{p.description}</p>}
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-purple-400">${p.price}</span>
                        <button 
                          onClick={() => handleCheckout(p.stripePriceId)}
                          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-semibold hover:scale-105 transition"
                        >
                          Buy Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-2xl border border-purple-500/30">
                <p className="text-gray-300 mb-4">Add your Tarot Deck in Contentful → Marketplace Product</p>
                <button onClick={() => setActiveSection('contact')} className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-bold hover:scale-105 transition">
                  Contact Us
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {activeSection === 'tours' && (
        <section className="min-h-screen pt-32 pb-20 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-5xl font-black mb-12 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Local Tours</h2>
            {tours.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {tours.map((t) => (
                  <div key={t.id} className="bg-gradient-to-br from-cyan-900/30 to-purple-900/30 rounded-2xl border border-cyan-500/30 overflow-hidden hover:scale-105 transition">
                    {t.image && <img src={t.image} alt={t.name} className="w-full h-48 object-cover" />}
                    <div className="p-6">
                      <h3 className="text-2xl font-bold text-cyan-400 mb-3">{t.name}</h3>
                      <p className="text-gray-300 mb-4">{t.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-3xl font-bold text-purple-400">${t.price}</span>
                        <button 
                          onClick={() => t.stripePriceId ? handleCheckout(t.stripePriceId) : setActiveSection('contact')}
                          className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-semibold hover:scale-105 transition"
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gradient-to-br from-cyan-900/30 to-purple-900/30 p-8 rounded-2xl border border-cyan-500/30">
                <h3 className="text-3xl font-bold text-cyan-400 mb-4">Desert Creation Station</h3>
                <p className="text-gray-300 mb-6">Step into our art tech makerspace - live demonstrations, ongoing projects, off-grid tech!</p>
                <button onClick={() => setActiveSection('contact')} className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-bold hover:scale-105 transition">
                  Book Tour <ChevronRight className="inline" />
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {activeSection === 'support' && (
        <section className="min-h-screen pt-32 pb-20 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl font-black mb-12 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Support The Magic</h2>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {(donationTiers.length > 0 ? donationTiers : [
                { id: 1, name: 'Coffee', price: 10 },
                { id: 2, name: 'Materials', price: 25 },
                { id: 3, name: 'Tools', price: 50 }
              ]).map((tier, i) => (
                <button
                  key={tier.id}
                  onClick={() => tier.stripePriceId ? handleCheckout(tier.stripePriceId) : setDonationAmount(tier.price.toString())}
                  className="p-6 rounded-xl border-2 border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-500/10 transition"
                >
                  <div className="text-3xl mb-2">{['☕', '⚡', '🚀'][i]}</div>
                  <div className="text-2xl font-bold text-cyan-400">${tier.price}</div>
                  <div className="text-sm text-gray-400 mt-2">{tier.name}</div>
                </button>
              ))}
            </div>
            <div className="p-6 bg-black/50 rounded-xl border border-cyan-500/30">
              <label className="block text-sm font-semibold text-cyan-400 mb-3">Custom Amount</label>
              <div className="flex gap-4">
                <input
                  type="number"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="flex-1 px-4 py-3 bg-black/50 border border-cyan-500/30 rounded-lg focus:border-cyan-400 focus:outline-none text-white"
                />
                <button className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-bold hover:scale-105 transition">
                  Contribute
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {activeSection === 'contact' && (
        <section className="min-h-screen pt-32 pb-20 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl font-black mb-12 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Get In Touch</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-8 bg-gradient-to-br from-cyan-900/20 to-purple-900/20 rounded-2xl border border-cyan-500/30">
                <h3 className="text-2xl font-bold text-cyan-400 mb-4">Let's Create Together</h3>
                <p className="text-gray-300 mb-6">Have a wild idea? Want to collaborate or book a tour? We're here for it all.</p>
                <div className="space-y-4">
                  <a href="mailto:thisishowislab@gmail.com" className="flex items-center gap-3 text-purple-300 hover:text-purple-400">
                    <Mail size={24} />
                    <span className="text-sm">thisishowislab@gmail.com</span>
                  </a>
                  <a href="https://instagram.com/themanifestorium" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-purple-300 hover:text-purple-400">
                    <Instagram size={24} />
                    <span>@themanifestorium</span>
                  </a>
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
                    className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-bold hover:scale-105 transition"
                  >
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      )}

      <footer className="border-t border-cyan-500/30 py-8 px-6 bg-black/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <Sparkles className="text-cyan-400" size={24} />
            <span className="font-bold">The Manifestorium</span>
          </div>
          <p className="text-gray-400 text-sm">© 2024 For Magical Use Only</p>
          <div className="flex gap-4">
            <a href="https://instagram.com/themanifestorium" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-cyan-400">
              <Instagram size={20} />
            </a>
            <a href="mailto:thisishowislab@gmail.com" className="text-gray-400 hover:text-cyan-400">
              <Mail size={20} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
            }
