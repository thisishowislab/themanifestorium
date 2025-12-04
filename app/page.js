

'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Menu, X, Zap, Cpu, Sparkles, ChevronRight, Instagram, Mail, ExternalLink } from 'lucide-react';

export default function ManifestoriumSite() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [cart, setCart] = useState([]);
  const [scrollY, setScrollY] = useState(0);
  const [donationAmount, setDonationAmount] = useState('');
  const [products, setProducts] = useState([]);
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [tours, setTours] = useState([]);
  const [donationTiers, setDonationTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [formStatus, setFormStatus] = useState('');

  // These will come from environment variables in production
  const CONTENTFUL_SPACE_ID = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID || 'nfc5otagjk9d';
  const CONTENTFUL_ACCESS_TOKEN = process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN || 'pNY83Bj4SI3qeOlhInXguFQBN8cqE1dT0VBr1mpAB7k';
  const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_KEY || 'pk_live_51SJAagC2WMzoC8yUOEzNRf6XW4Q37cT5qkpklTSxo9vc3ukunfD7kArwq7NsaEelliZZDiv656iX9Iqgw2RRtMn900IT9qGL8H';

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetchContentfulData();
  }, []);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.async = true;
    document.head.appendChild(script);
  }, []);

  const getImageUrl = (asset) => {
    if (!asset || !asset.fields || !asset.fields.file) return null;
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
    console.log('Contentful Response:', data);
    
    // Build asset map
    const assetMap = {};
    if (data.includes?.Asset) {
      data.includes.Asset.forEach(asset => assetMap[asset.sys.id] = asset);
    }
    
    // Build content type map (to get the names)
    const contentTypeMap = {};
    if (data.includes?.Entry) {
      data.includes.Entry.forEach(entry => {
        if (entry.sys.contentType) {
          contentTypeMap[entry.sys.id] = entry;
        }
      });
    }
    
    const prods = [], port = [], trs = [], tiers = [];
    
    data.items.forEach(item => {
      const contentTypeId = item.sys.contentType?.sys?.id;
      const f = item.fields;
      
      // Get image
      const imgField = f.productImage || f.tourImage || f.image;
      const img = imgField?.sys?.id ? getImageUrl(assetMap[imgField.sys.id]) : null;
      
      console.log('Item:', {
        name: f.productName || f.tourName || f.tierName || f.title || f.name,
        contentTypeId: contentTypeId,
        fields: Object.keys(f)
      });
      
      // Check by content type ID OR by checking which fields exist
      const hasProductFields = f.productName && f.price !== undefined;
      const hasTourFields = f.tourName && !f.productName;
      const hasTierFields = f.tierName && !f.tourName && !f.productName;
      
      if (hasProductFields || contentTypeId === 'NVpVj8LwkehFy7TfbDiCu') {
        // MARKETPLACE PRODUCT
        prods.push({
          id: item.sys.id,
          name: f.productName || 'Untitled Product',
          price: Number(f.price || 0),
          description: f.productDescription || '',
          image: img,
          stripePriceId: f.stripePriceId || null
        });
      } else if (hasTourFields) {
        // TOUR
        trs.push({
          id: item.sys.id,
          name: f.tourName || 'Untitled Tour',
          price: Number(f.price || 25),
          description: f.tourDescription || '',
          image: img,
          stripePriceId: f.stripePriceId || null
        });
      } else if (hasTierFields) {
        // DONATION TIER
        tiers.push({
          id: item.sys.id,
          name: f.tierName || 'Support',
          price: Number(f.price || 10),
          description: f.tierDescription || '',
          stripePriceId: f.stripePriceId || null
        });
      } else {
        // PORTFOLIO or other content
        if (f.title || f.name || img) {
          port.push({
            id: item.sys.id,
            title: f.title || f.name || 'Untitled',
            desc: f.description || '',
            tech: f.technologies || f.tech || '',
            image: img
          });
        }
      }
    });
    
    console.log('Final counts:', {
      products: prods.length,
      tours: trs.length,
      tiers: tiers.length,
      portfolio: port.length
    });
    
    setProducts(prods);
    setTours(trs);
    setDonationTiers(tiers);
    setPortfolioItems(port);
    setLoading(false);
  } catch (error) {
    console.error('Contentful Error:', error);
    setLoading(false);
  }
};

  const handleStripeCheckout = async (stripePriceId, itemName) => {
    if (!stripePriceId) {
      alert('This item needs a Stripe Price ID. Please add one in Contentful or contact us to purchase!');
      setActiveSection('contact');
      return;
    }

    try {
      const stripe = window.Stripe ? window.Stripe(STRIPE_PUBLISHABLE_KEY) : null;
      
      if (!stripe) {
        alert('Loading payment system... Please try again in a moment.');
        return;
      }

      const { error } = await stripe.redirectToCheckout({
        lineItems: [{ price: stripePriceId, quantity: 1 }],
        mode: 'payment',
        successUrl: `${window.location.origin}?success=true`,
        cancelUrl: `${window.location.origin}?canceled=true`,
      });

      if (error) {
        console.error('Stripe error:', error);
        alert('Payment error. Please contact us directly to complete your purchase.');
        setActiveSection('contact');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Unable to process payment. Please contact us directly!');
      setActiveSection('contact');
    }
  };

  const handleDonation = () => {
    const amount = parseFloat(donationAmount);
    if (!amount || amount < 1) {
      alert('Please enter a donation amount of at least $1');
      return;
    }
    alert('Thank you! Custom donation amounts coming soon. Please contact us or choose a preset tier.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus('sending');
    
    const subject = encodeURIComponent(`Message from ${formData.name}`);
    const body = encodeURIComponent(`From: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`);
    window.location.href = `mailto:thisishowislab@gmail.com?subject=${subject}&body=${body}`;
    
    setFormStatus('success');
    setFormData({ name: '', email: '', message: '' });
    setTimeout(() => setFormStatus(''), 2000);
  };

  const NavLink = ({ section, children }) => (
    <button
      onClick={() => { 
        setActiveSection(section); 
        setMenuOpen(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
      className={`px-4 py-2 transition-all duration-300 ${
        activeSection === section 
          ? 'text-cyan-400 font-bold' 
          : 'text-gray-300 hover:text-white'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="bg-black text-white min-h-screen font-sans">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${
        scrollY > 50 ? 'bg-black/90 backdrop-blur-lg shadow-lg shadow-cyan-500/20' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button 
            onClick={() => setActiveSection('home')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <Sparkles className="text-cyan-400" size={28} />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              THE MANIFESTORIUM
            </h1>
          </button>
          
          <div className="hidden md:flex items-center gap-2">
            <NavLink section="home">Home</NavLink>
            <NavLink section="portfolio">Portfolio</NavLink>
            <NavLink section="shop">Shop</NavLink>
            <NavLink section="tours">Tours</NavLink>
            <NavLink section="support">Support</NavLink>
            <NavLink section="contact">Contact</NavLink>
          </div>

          <button 
            className="md:hidden text-cyan-400"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-black/95 backdrop-blur-lg border-t border-cyan-500/30">
            <div className="flex flex-col p-6 gap-2">
              <NavLink section="home">Home</NavLink>
              <NavLink section="portfolio">Portfolio</NavLink>
              <NavLink section="shop">Shop</NavLink>
              <NavLink section="tours">Tours</NavLink>
              <NavLink section="support">Support</NavLink>
              <NavLink section="contact">Contact</NavLink>
            </div>
          </div>
        )}
      </nav>

{/* Hero Section */}
      {activeSection === 'home' && (
        <section className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20">
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
              <span className="text-white">Fabrication Station</span>
            </h2>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Where off-grid tech, desert salvage, and handmade myth collide to prove that 
              <span className="text-cyan-400 font-bold"> creation doesn't belong to the rich</span>, 
              the plugged-in, or the polished.
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

      {/* Portfolio Section */}
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
                {portfolioItems.map((item, idx) => (
                  <div 
                    key={item.id || idx}
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

      {/* Shop Section */}
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
                <p className="text-gray-300 text-lg mb-4">Products coming soon!</p>
                <p className="text-gray-400 mb-6">Add your Tarot Deck and other products in Contentful → Marketplace Product</p>
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
                          onClick={() => handleStripeCheckout(product.stripePriceId, product.name)}
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
