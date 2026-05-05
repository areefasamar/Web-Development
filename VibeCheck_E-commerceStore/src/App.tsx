import React, { useState, useEffect } from 'react';
import { cn } from './lib/utils';
import { Navbar } from './components/Navbar';
import { ProductCard } from './components/ProductCard';
import { InventoryPanel } from './components/InventoryPanel';
import { AddProductModal } from './components/AddProductModal';
import { store } from './lib/store';
import { Product } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Sparkles, X, Zap, Cpu, ShoppingBag, Heart, User, Flame } from 'lucide-react';

export default function App() {
  const [view, setView] = useState<'shop' | 'admin'>('shop');
  const [products, setProducts] = useState<Product[]>(store.getProducts());
  const [inventoryRefreshKey, setInventoryRefreshKey] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');

  useEffect(() => {
    setProducts(store.getProducts());
  }, [view]);

  const refreshProducts = () => {
    const data = store.getProducts();
    setProducts([...data]); // Force re-render with new array copy
    setInventoryRefreshKey(prev => prev + 1);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesCategory = categoryFilter === 'All' || product.category === categoryFilter;
    
    // Neural Insight: "New Arrivals" shows specifically tagged items 
    // OR items added in the last 7 days for a dynamic feel
    if (categoryFilter === 'New Arrivals') {
      const windowTime = 7 * 24 * 60 * 60 * 1000;
      const isRecent = (Date.now() - product.createdAt) < windowTime;
      matchesCategory = product.category === 'New Arrivals' || isRecent;
    }

    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    return b.createdAt - a.createdAt; // newest arrivals
  });

  const topPick = filteredProducts[0] || null;
  // Neural Adjustment: Display all products in the grid to ensure visibility
  const gridProducts = filteredProducts;

  const [recommendedProduct, setRecommendedProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (products.length > 0) {
      const isAvailable = recommendedProduct && products.some(p => p.id === recommendedProduct.id);
      const isNotTopPick = !topPick || !recommendedProduct || recommendedProduct.id !== topPick.id;

      if (!isAvailable || !isNotTopPick) {
        const candidates = products.filter(p => !topPick || p.id !== topPick.id);
        if (candidates.length > 0) {
          const randomIndex = Math.floor(Math.random() * candidates.length);
          setRecommendedProduct(candidates[randomIndex]);
        } else if (!isAvailable) {
          setRecommendedProduct(null);
        }
      }
    } else if (recommendedProduct) {
      setRecommendedProduct(null);
    }
  }, [products, topPick?.id]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [categoryFilter, view]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar 
        onViewChange={setView} 
        currentView={view} 
        onSearchChange={setSearchQuery}
        onCategoryChange={(cat) => {
          setCategoryFilter(cat);
          setView('shop');
        }}
        activeCategory={categoryFilter}
      />
      
      {/* Drawer Overlay */}
      <div id="drawer" className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] hidden">
        <motion.div 
          initial={{ x: -320 }}
          animate={{ x: 0 }}
          className="h-full w-80 bg-white border-r-[3px] border-black shadow-hard-lg flex flex-col"
        >
          <div className="p-8 border-b-[3px] border-black flex justify-between items-center bg-neon-lime">
            <h2 className="text-black font-black text-4xl italic">VAULT</h2>
            <button onClick={() => document.getElementById('drawer')?.classList.add('hidden')}>
              <X className="w-8 h-8 text-black" />
            </button>
          </div>
          <div className="flex flex-col divide-y-[3px] divide-black overflow-y-auto">
            {['All', 'New Arrivals', 'Techwear', 'Limited', 'Archives', 'Men', 'Women', 'Accessories', 'Unisex'].map((item) => (
              <button 
                key={item} 
                onClick={() => {
                  setCategoryFilter(item);
                  setView('shop');
                  document.getElementById('drawer')?.classList.add('hidden');
                }}
                className={cn(
                  "px-6 py-8 font-black uppercase text-xl transition-colors flex items-center gap-4 text-left w-full",
                  categoryFilter === item ? "bg-neon-lime" : "hover:bg-neon-cyan"
                )}
              >
                <Zap className="w-6 h-6" /> {item === 'Archives' ? 'Archive' : item}
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      <main className="pb-32">
        {view === 'shop' ? (
          <div className="space-y-0">
            {/* Hero Section */}
            <section className="relative w-full border-b-[3px] border-black overflow-hidden">
               <div className="marquee bg-neon-lime py-3 border-b-[3px] border-black">
                 <div className="marquee-content">
                    <span className="text-xl md:text-4xl font-black text-black px-8 italic uppercase">ULTRA DROP AVAILABLE NOW • </span>
                    <span className="text-xl md:text-4xl font-black text-black px-8 italic uppercase">ULTRA DROP AVAILABLE NOW • </span>
                 </div>
               </div>
               
               <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
                 <div className="p-10 md:p-16 flex flex-col justify-center border-r-[3px] border-black bg-white">
                    <div className="inline-block bg-neon-orange text-black font-black px-3 py-1 mb-4 self-start border-[2px] border-black shadow-hard-sm uppercase italic text-xs">Limited Edition</div>
                    <h2 className="text-4xl md:text-6xl font-black text-black mb-6 uppercase leading-[0.9] italic tracking-tighter">
                      VIBE <br /> HEAVY
                    </h2>
                    <p className="text-sm text-slate-500 max-w-sm mb-8 font-bold uppercase leading-relaxed">
                      The pinnacle of digital street couture. Water-resistant structural membranes meet neon high-vis accents.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button className="bg-neon-lime text-black font-black px-8 py-4 neo-border hover:shadow-hard-md hover:translate-y-[-2px] transition-all text-lg italic uppercase">
                        Secure Access
                      </button>
                    </div>
                 </div>
                 <div className="relative bg-slate-100 group overflow-hidden">
                    <img 
                      alt="Cyber Mantle" 
                      className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100" 
                      src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1600&q=80"
                    />
                    <div className="absolute inset-0 bg-neon-violet/10 mix-blend-overlay group-hover:opacity-0 transition-opacity" />
                 </div>
               </div>
            </section>

            {/* Top Pick Section */}
            {topPick && (
              <section className="px-6 md:px-12 py-20 bg-neon-cyan border-b-[3px] border-black overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-neon-lime rotate-45 translate-x-32 translate-y-[-100px] border-l-[3px] border-b-[3px] border-black hidden lg:block" />
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
                  <div className="lg:w-1/2 space-y-6 relative z-10">
                    <div className="inline-block bg-black text-white font-black px-4 py-1 neo-border rotate-[-1deg] uppercase italic text-xs">Most Wanted Grail</div>
                    <h2 className="text-5xl lg:text-7xl font-black text-black leading-none uppercase italic tracking-tighter">
                      {topPick.name}
                    </h2>
                    <p className="text-base text-black font-bold uppercase leading-tight max-w-md">
                      Featured release of the season. Neural synchronization at historical highs. Vibe checked and verified.
                    </p>
                    <div className="flex items-center gap-6">
                       <span className="text-4xl font-black italic tracking-tighter">
                         ${topPick.price}
                       </span>
                       <button className="bg-black text-neon-lime px-8 py-4 neo-border text-lg font-black uppercase italic tracking-widest hover:bg-white hover:text-black hover:shadow-hard-md transition-all active:translate-y-[2px]">
                         Secure Now
                       </button>
                    </div>
                  </div>
                  <div className="lg:w-1/2 relative">
                    <motion.div 
                      whileHover={{ scale: 1.05, rotate: 2 }}
                      className="neo-card p-4 bg-white relative z-10 overflow-hidden"
                    >
                      <img 
                        src={topPick.imageUrl} 
                        alt={topPick.name}
                        className="w-full aspect-square object-cover grayscale brightness-95 group-hover:grayscale-0 transition-all duration-700"
                      />
                      <div className="absolute top-8 left-8 bg-neon-lime text-black px-4 py-2 neo-border font-black text-xs uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                        POP_AUTHENTIC
                      </div>
                    </motion.div>
                    <div className="absolute -inset-10 bg-neon-violet blur-3xl opacity-0 group-hover:opacity-30 transition-opacity rounded-full" />
                  </div>
                </div>
              </section>
            )}

            {/* Active Drops Section */}
            <section className="px-6 md:px-12 py-16">
               <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                 <div>
                   <h3 className="text-4xl md:text-5xl font-black text-black uppercase italic tracking-tighter">
                     {categoryFilter === 'All' ? 'Active_Drops' : `${categoryFilter.replace(' ', '_')}_Drops`}
                   </h3>
                   <p className="text-neon-violet font-black text-sm mt-2">LIVE UPDATES FROM THE VAULT</p>
                 </div>
                 <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black uppercase text-slate-400 italic">Sort_By:</span>
                    <select 
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="bg-transparent font-black uppercase italic tracking-tighter text-sm outline-none border-b-[2px] border-black cursor-pointer hover:text-neon-lime transition-colors"
                    >
                      <option value="newest">Newest arrivals</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                    </select>
                 </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                 {gridProducts.map(product => (
                   <ProductCard key={product.id} product={product} />
                 ))}
                 {filteredProducts.length === 0 && (
                   <div className="col-span-full py-20 text-center neo-border bg-slate-50 border-dashed">
                      <p className="font-black italic text-2xl uppercase tracking-tighter text-slate-300">The Vault is currently empty in this sector.</p>
                      <button 
                        onClick={() => setCategoryFilter('All')}
                        className="mt-4 text-neon-violet font-black uppercase text-sm hover:underline"
                      >
                        Scan all sectors
                      </button>
                   </div>
                 )}
               </div>
            </section>

            {/* AI Recommendation Section */}
            {recommendedProduct && (
              <section className="px-6 md:px-12 py-24 border-y-[3px] border-black bg-white">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
                  <div className="w-full lg:w-1/3 relative group">
                    <div className="absolute -inset-4 bg-neon-cyan/20 blur-2xl group-hover:bg-neon-cyan/40 transition-all"></div>
                    <div className="relative neo-card p-4 bg-white rotate-[-3deg] group-hover:rotate-0 transition-transform">
                      <img 
                        src={recommendedProduct.imageUrl} 
                        alt="AI Pick" 
                        className="w-full aspect-[3/4] object-cover grayscale brightness-95 group-hover:grayscale-0 transition-all border-[3px] border-black"
                      />
                      <div className="absolute top-8 left-8 bg-black text-neon-lime px-4 py-2 neo-border font-black text-xs uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                        NEURAL_RECOM
                      </div>
                      <div className="absolute bottom-10 right-10 w-24 h-24 bg-neon-violet text-white neo-border flex items-center justify-center font-black text-2xl rotate-12 group-hover:rotate-0 transition-transform shadow-hard-sm">98%</div>
                    </div>
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-black text-neon-lime neo-border flex items-center justify-center">
                        <Cpu className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest text-slate-400 italic">Neural_Sync_Active</span>
                    </div>
                    <h3 className="text-4xl md:text-5xl font-black text-black uppercase leading-[0.9] mb-4 italic">AI_Curated <br />For_You</h3>
                    <div className="mb-8 max-w-2xl space-y-4">
                      <p className="text-lg font-black text-black uppercase tracking-tight italic">
                        {recommendedProduct.name} — ${recommendedProduct.price}
                      </p>
                      <p className="text-base text-slate-500 font-bold leading-relaxed">
                        Our neural engine analyzed your preference for <span className="bg-neon-cyan px-2 neo-border mx-1">{recommendedProduct.category}</span> garments. This piece matches your recent interaction patterns with higher than 98% fidelity.
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="p-4 bg-white neo-border flex items-center gap-4 shadow-hard-sm">
                        <Flame className="w-6 h-6 text-neon-violet" />
                        <div>
                          <p className="text-black font-black uppercase text-[10px]">Predicted Match</p>
                          <p className="text-neon-violet font-black text-sm">98% SYNC</p>
                        </div>
                      </div>
                      <button className="bg-neon-violet text-white font-black px-8 py-5 neo-border hover:shadow-hard-md hover:translate-y-[-2px] transition-all text-base italic uppercase">
                        Unveil Grail
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        ) : (
          <InventoryPanel 
            products={products}
            refreshKey={inventoryRefreshKey}
            onAddProduct={() => setShowAddModal(true)} 
            onProductsChange={refreshProducts}
          />
        )}
      </main>

      <AnimatePresence>
        {showAddModal && (
          <AddProductModal 
            onClose={() => setShowAddModal(false)} 
            onSuccess={refreshProducts}
          />
        )}
      </AnimatePresence>

      <footer className="bg-white border-t-[3px] border-black py-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col gap-20">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12">
            <div className="space-y-6 max-w-md">
              <h2 className="text-4xl font-black tracking-tighter italic">VIBE<span className="text-neon-violet">CHECK</span></h2>
              <p className="text-base font-bold uppercase leading-tight border-l-[3px] border-neon-cyan pl-6 italic">
                Not a brand. A digital legacy. Streetwear for the decentralized generation. Verified by the network.
              </p>
            </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-16">
                   <div className="space-y-6">
                     <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Navigation</h4>
                     <div className="flex flex-col gap-4 font-bold uppercase text-sm">
                       <button onClick={() => { setCategoryFilter('New Arrivals'); setView('shop'); }} className="hover:text-neon-lime transition-colors text-left uppercase">New Arrivals</button>
                       <button onClick={() => { setCategoryFilter('Techwear'); setView('shop'); }} className="hover:text-neon-cyan transition-colors text-left uppercase">Techwear</button>
                       <button onClick={() => { setCategoryFilter('Limited'); setView('shop'); }} className="hover:text-neon-violet transition-colors text-left uppercase">Limited</button>
                       <button onClick={() => { setCategoryFilter('Archives'); setView('shop'); }} className="hover:text-neon-orange transition-colors text-left uppercase">Archive</button>
                     </div>
                   </div>
                   <div className="space-y-6">
                     <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Categories</h4>
                     <div className="flex flex-col gap-4 font-bold uppercase text-sm">
                       <button onClick={() => { setCategoryFilter('Men'); setView('shop'); }} className="hover:text-neon-lime transition-colors text-left uppercase">Men</button>
                       <button onClick={() => { setCategoryFilter('Women'); setView('shop'); }} className="hover:text-neon-cyan transition-colors text-left uppercase">Women</button>
                       <button onClick={() => { setCategoryFilter('Accessories'); setView('shop'); }} className="hover:text-neon-violet transition-colors text-left uppercase">Accessories</button>
                       <button onClick={() => { setCategoryFilter('Unisex'); setView('shop'); }} className="hover:text-neon-orange transition-colors text-left uppercase">Unisex</button>
                     </div>
                   </div>
                   <div className="space-y-6">
                     <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Social</h4>
                 <div className="flex flex-col gap-4 font-bold uppercase text-sm">
                   <a href="#" className="hover:text-neon-lime transition-colors">Archive Log</a>
                   <a href="#" className="hover:text-neon-cyan transition-colors">Vibe Report</a>
                   <a href="#" className="hover:text-neon-violet transition-colors">Discord</a>
                 </div>
               </div>
            </div>
          </div>
          
          <div className="pt-12 border-t-[3px] border-black flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="font-black uppercase tracking-tighter text-xl italic">© 2026 VibeCheck // All Vibes Verified</p>
            <div className="flex gap-8 font-black uppercase text-xs tracking-widest">
              <a href="#" className="hover:text-neon-lime transition-colors decoration-2 underline underline-offset-8">Privacy</a>
              <a href="#" className="hover:text-neon-lime transition-colors decoration-2 underline underline-offset-8">Terms</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full h-20 bg-white flex justify-around items-stretch border-t-[3px] border-black z-[150] md:hidden">
        <button 
          onClick={() => { setView('shop'); setCategoryFilter('All'); }}
          className={cn("flex-1 flex flex-col items-center justify-center border-r-[3px] border-black", view === 'shop' && categoryFilter === 'All' ? "bg-neon-lime" : "hover:bg-neon-lime")}
        >
          <Zap className="w-6 h-6 mb-1 font-black" />
          <span className="text-[10px] font-black uppercase tracking-widest">Shop</span>
        </button>
        <button 
          onClick={() => { setView('shop'); setCategoryFilter('Techwear'); }}
          className={cn("flex-1 flex flex-col items-center justify-center border-r-[3px] border-black", view === 'shop' && categoryFilter === 'Techwear' ? "bg-neon-cyan" : "hover:bg-neon-cyan")}
        >
          <Flame className="w-6 h-6 mb-1 font-black" />
          <span className="text-[10px] font-black uppercase tracking-widest">Tech</span>
        </button>
        <button 
          onClick={() => setView('admin')}
          className={cn("flex-1 flex flex-col items-center justify-center transition-colors", view === 'admin' ? "bg-neon-violet text-white" : "hover:bg-neon-violet")}
        >
          <User className="w-6 h-6 mb-1 font-black" />
          <span className="text-[10px] font-black uppercase tracking-widest">Studio</span>
        </button>
      </nav>
    </div>
  );
}
