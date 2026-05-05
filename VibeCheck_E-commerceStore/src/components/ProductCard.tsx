import React from 'react';
import { Product } from '../types';
import { motion } from 'motion/react';
import { Plus, Zap } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="group neo-card p-4 hover:shadow-hard-lg hover:bg-white transition-all cursor-pointer"
    >
      <div className="relative aspect-[4/5] overflow-hidden neo-border bg-slate-50 mb-6 group-hover:bg-neon-lime transition-colors">
        <img 
          src={product.imageUrl} 
          alt={product.name}
          className="w-full h-full object-cover grayscale brightness-95 group-hover:grayscale-0 group-hover:scale-110 group-hover:rotate-1 transition-transform duration-700"
        />
        <div className="absolute top-4 left-4 flex flex-col gap-2">
           <span className="neo-border bg-neon-cyan text-black px-3 py-1 font-black text-[10px] uppercase shadow-hard-sm">
             {product.category}
           </span>
           {product.stock < 5 && (
             <span className="neo-border bg-neon-orange text-black px-3 py-1 font-black text-[10px] uppercase shadow-hard-sm flex items-center gap-1">
               <Zap className="w-3 h-3 fill-black" /> LOW VIBE
             </span>
           )}
        </div>
        <button className="absolute bottom-4 left-4 right-4 bg-black text-neon-lime neo-border py-4 font-black text-xs uppercase tracking-widest opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-neon-lime hover:text-black flex items-center justify-center gap-3">
          <Plus className="w-4 h-4" /> SECURE GRAIL
        </button>
      </div>
      
      <div className="space-y-3 px-1 pb-2">
        <div className="flex justify-between items-start gap-4">
          <h3 className="text-xl font-black leading-[0.9] group-hover:text-neon-violet transition-colors">
            {product.name}
          </h3>
          <span className="text-xl font-black bg-neon-lime px-2 neo-border rotate-3 group-hover:rotate-0 transition-transform">
            ${product.price}
          </span>
        </div>
        
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <span className="w-2 h-2 bg-black rounded-full" /> Genuine Article
        </p>
      </div>
    </motion.div>
  );
};
