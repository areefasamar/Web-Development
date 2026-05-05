import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Upload, Sparkles, Loader2, Cpu } from 'lucide-react';
import { aiService } from '../services/aiService';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { store } from '../lib/store';

interface AddProductModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({ onClose, onSuccess }) => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'New Arrivals',
    stock: '10'
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
    multiple: false 
  } as any);

  const handleAiAutoFill = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const base64 = image.split(',')[1];
      const result = await aiService.analyzeProductImage(base64);
      
      const parsed = JSON.parse(result);

      setFormData({
        name: parsed.name || formData.name,
        description: parsed.description || formData.description,
        price: (parsed.price || 0).toString(),
        category: parsed.category || 'Women',
        stock: (parsed.stock || 20).toString()
      });
    } catch (err) {
      console.error('Failed to parse AI response:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) {
      const container = document.getElementById('dropzone-container');
      if (container) {
        container.classList.add('animate-shake', 'border-neon-orange');
        setTimeout(() => container.classList.remove('animate-shake', 'border-neon-orange'), 500);
      }
      return;
    }

    const priceValue = parseFloat(formData.price);
    if (isNaN(priceValue)) return;

    // Compress before saving
    const compressedImage = await store.compressImage(image);

    store.saveProduct({
      id: "GRAIL_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
      name: formData.name,
      description: formData.description,
      price: priceValue,
      category: formData.category as any,
      stock: parseInt(formData.stock) || 0,
      imageUrl: compressedImage,
      createdAt: Date.now()
    });

    store.addLog({
      productId: "NEW", // Using a placeholder as it's a new item
      changeType: 'restock',
      quantity: parseInt(formData.stock) || 0,
      note: `New Grail Series: ${formData.name}`
    });

    setIsSuccess(true);
    onSuccess();
    
    // Auto-close after 1.5 seconds of showing success
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 40 }}
        className="relative bg-white w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col md:flex-row neo-border shadow-hard-lg"
      >
        {isSuccess ? (
          <div className="w-full flex flex-col items-center justify-center p-20 text-center space-y-6">
            <div className="w-24 h-24 bg-neon-lime neo-border flex items-center justify-center rotate-[10deg] animate-bounce">
              <Sparkles className="w-12 h-12 text-black" />
            </div>
            <h2 className="text-4xl font-black italic uppercase tracking-tighter">Grail_Committed</h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">The Digital Archive has been updated.</p>
          </div>
        ) : (
          <>
            <button onClick={onClose} className="absolute top-6 right-6 z-10 p-2 hover:bg-neon-orange neo-border transition-colors bg-white">
              <X className="w-6 h-6 text-black" />
            </button>

            {/* Left: Image Upload */}
            <div className="w-full md:w-5/12 p-10 border-b-[3px] md:border-b-0 md:border-r-[3px] border-black bg-slate-50 flex flex-col">
              <h3 className="text-xl font-black italic uppercase tracking-tighter mb-8">Visual_Proof</h3>
              <div 
                {...getRootProps()} 
                id="dropzone-container"
                className={cn(
                  "flex-1 neo-border border-dashed flex flex-col items-center justify-center cursor-pointer transition-all min-h-[350px] bg-white",
                  isDragActive ? "bg-neon-lime" : "hover:bg-slate-50 shadow-inner",
                  image ? "border-solid p-0 overflow-hidden" : "p-10"
                )}
              >
                <input {...getInputProps()} />
                {image ? (
                  <div className="relative w-full h-full group">
                    <img src={image} alt="Upload" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <p className="text-neon-lime text-xs font-black uppercase tracking-widest neo-border bg-black px-4 py-2">Replace Visual</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-neon-lime neo-border flex items-center justify-center mx-auto rotate-[-5deg]">
                      <Upload className="w-8 h-8 text-black" />
                    </div>
                    <div>
                      <p className="font-black italic text-lg uppercase tracking-tight">Drop Garment Here</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Verified Vibe Standard</p>
                    </div>
                  </div>
                )}
              </div>

              {image && (
                <button 
                  onClick={handleAiAutoFill}
                  disabled={loading}
                  className="mt-8 w-full py-5 bg-neon-violet text-white neo-border text-xs uppercase tracking-widest font-black flex items-center justify-center gap-4 hover:shadow-hard-md hover:translate-y-[-2px] transition-all"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Cpu className="w-5 h-5" />}
                  {loading ? 'Analyzing Neural Patterns...' : 'Run Vibe Analysis'}
                </button>
              )}
            </div>

            {/* Right: Form */}
            <div className="w-full md:w-7/12 p-12 overflow-y-auto bg-white">
              <h3 className="text-xl font-black italic uppercase tracking-tighter mb-10">Neural_Mapping</h3>
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-xs uppercase tracking-widest font-black text-slate-400 flex items-center gap-2">
                    <span className="w-2 h-2 bg-black rounded-full" /> Garment Identity
                  </label>
                  <input 
                    required
                    className="w-full px-6 py-5 bg-white neo-border focus:bg-neon-cyan focus:shadow-hard-sm outline-none transition-all text-lg font-black uppercase italic"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Product Name"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-xs uppercase tracking-widest font-black text-slate-400 flex items-center gap-2">
                      <span className="w-2 h-2 bg-black rounded-full" /> Department
                    </label>
                    <select 
                      className="w-full px-6 py-5 bg-white neo-border outline-none transition-all text-sm font-black uppercase italic appearance-none"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                        <option value="New Arrivals">New Arrivals</option>
                        <option value="Techwear">Techwear</option>
                        <option value="Limited">Limited Edition</option>
                        <option value="Archives">Digital Archive</option>
                        <option value="Men">Street Male</option>
                        <option value="Women">Trend Female</option>
                        <option value="Accessories">Extras</option>
                        <option value="Unisex">All Vibes (Unisex)</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs uppercase tracking-widest font-black text-slate-400 flex items-center gap-2">
                      <span className="w-2 h-2 bg-black rounded-full" /> Valuation ($)
                    </label>
                    <input 
                      required
                      type="number"
                      className="w-full px-6 py-5 bg-white neo-border focus:bg-neon-orange outline-none transition-all text-sm font-black italic"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="Price"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs uppercase tracking-widest font-black text-slate-400 flex items-center gap-2">
                      <span className="w-2 h-2 bg-black rounded-full" /> Initial Supply
                    </label>
                    <input 
                      required
                      type="number"
                      className="w-full px-6 py-5 bg-white neo-border focus:bg-neon-lime outline-none transition-all text-sm font-black italic"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      placeholder="Quantity"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs uppercase tracking-widest font-black text-slate-400 flex items-center gap-2">
                    <span className="w-2 h-2 bg-black rounded-full" /> Editorial Narrative
                  </label>
                  <textarea 
                    rows={4}
                    className="w-full px-6 py-5 bg-white neo-border focus:bg-neon-lime outline-none transition-all text-sm font-bold resize-none"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Garment story..."
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-6 bg-black text-neon-lime neo-border text-base font-black uppercase tracking-widest hover:bg-neon-lime hover:text-black hover:shadow-hard-md transition-all active:translate-y-[2px] mt-4"
                >
                  Commit to Archive // Secure
                </button>
              </form>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};
