import React, { useState } from 'react';
import { ShoppingBag, Search, Menu, Shield, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface NavbarProps {
  onViewChange: (view: 'shop' | 'admin') => void;
  currentView: string;
  onSearchChange: (query: string) => void;
  onCategoryChange: (category: string) => void;
  activeCategory: string;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onViewChange, 
  currentView, 
  onSearchChange,
  onCategoryChange,
  activeCategory
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="bg-white text-black sticky top-0 z-[100] border-b-[3px] border-black px-4 py-6 flex flex-col items-center w-full">
      <div className="flex justify-between items-center w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-6">
          <button 
            className="hover:text-neon-lime transition-colors lg:hidden"
            onClick={() => {
              const drawer = document.getElementById('drawer');
              if (drawer) drawer.classList.remove('hidden');
            }}
          >
            <Menu className="w-8 h-8" />
          </button>
          <div 
             className="flex items-center gap-3 cursor-pointer group"
             onClick={() => {
               onViewChange('shop');
               onCategoryChange('All');
             }}
          >
            <div className="w-10 h-10 bg-black text-neon-lime neo-border flex items-center justify-center font-black text-2xl group-hover:bg-neon-lime group-hover:text-black transition-colors rotate-[-3deg]">V</div>
            <h1 className="text-3xl font-black tracking-tighter italic hidden sm:block">
              VIBE<span className="text-neon-violet">CHECK</span>
            </h1>
          </div>
        </div>

        <div className="hidden lg:flex gap-8">
          {['New Arrivals', 'Techwear', 'Limited', 'Archives', 'Men', 'Women', 'Accessories', 'Unisex'].map((cat) => (
            <button 
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={cn(
                "font-bold uppercase tracking-widest text-[10px] transition-all hover:underline underline-offset-[8px] decoration-[2px]",
                activeCategory === cat ? "text-neon-lime underline" : "hover:text-neon-cyan text-slate-500"
              )}
            >
              {cat === 'Archives' ? 'Archive' : cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => onViewChange(currentView === 'admin' ? 'shop' : 'admin')}
            className={cn(
              "neo-button h-12 flex items-center justify-center px-4",
              currentView === 'admin' && "bg-neon-lime"
            )}
          >
            <Shield className="w-5 h-5 sm:mr-2" />
            <span className="hidden sm:inline">{currentView === 'admin' ? 'Exit Studio' : 'Studio'}</span>
          </button>
          
          <div className="flex items-center gap-4 border-l-[3px] border-black pl-6">
            <button onClick={() => setIsSearchOpen(!isSearchOpen)}>
              <Search className="w-6 h-6 cursor-pointer hover:text-neon-cyan transition-colors" />
            </button>
            <div className="relative cursor-pointer group">
              <ShoppingBag className="w-6 h-6 group-hover:text-neon-violet transition-colors" />
              <span className="absolute -top-3 -right-3 bg-neon-lime border-[2px] border-black text-black text-[10px] w-6 h-6 rounded-full flex items-center justify-center font-black">
                0
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar Overlay */}
      {isSearchOpen && (
        <div className="w-full max-w-7xl mx-auto mt-6 relative animate-in fade-in slide-in-from-top-4 duration-300">
           <input 
             autoFocus
             type="text" 
             placeholder="SEARCH THE VAULT..."
             className="w-full bg-slate-50 neo-border p-4 pr-16 font-black italic tracking-tighter text-xl uppercase outline-none focus:bg-white"
             onChange={(e) => onSearchChange(e.target.value)}
           />
           <button 
             onClick={() => {
               setIsSearchOpen(false);
               onSearchChange('');
             }}
             className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-neon-orange neo-border transition-colors bg-white"
           >
             <X className="w-6 h-6" />
           </button>
        </div>
      )}
    </header>
  );
};
