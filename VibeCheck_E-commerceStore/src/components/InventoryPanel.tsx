import React, { useState, useEffect } from 'react';
import { store } from '../lib/store';
import { Product, InventoryLog } from '../types';
import { 
  BarChart3, 
  Package, 
  ArrowUpRight, 
  ArrowDownRight, 
  Sparkles,
  RefreshCw,
  Plus,
  Trash2
} from 'lucide-react';
import { aiService } from '../services/aiService';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface InventoryPanelProps {
  products: Product[];
  refreshKey?: number;
  onAddProduct: () => void;
  onProductsChange?: () => void;
}

export const InventoryPanel: React.FC<InventoryPanelProps> = ({ products, refreshKey, onAddProduct, onProductsChange }) => {
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [threshold, setThreshold] = useState(5);
  const [activeAlerts, setActiveAlerts] = useState<Product[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setLogs(store.getLogs());
    setActiveAlerts(products.filter(p => p.stock < threshold));
  }, [products, threshold, refreshKey]);

  const handleAiAnalyze = async () => {
    setIsAnalyzing(true);
    setAiReport(null);
    try {
      const report = await aiService.analyzeInventory(products);
      setAiReport(report);
    } catch (err) {
      console.error(err);
      setAiReport("UNABLE TO ACCESS NEURAL NETWORK. CHECK API CONFIGURATION.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUpdateStock = (id: string, delta: number) => {
    const product = products.find(p => p.id === id);
    if (!product) return;

    const newStock = Math.max(0, product.stock + delta);
    const updated = { ...product, stock: newStock };
    
    store.saveProduct(updated);
    store.addLog({
      productId: id,
      changeType: delta > 0 ? 'restock' : 'sale',
      quantity: Math.abs(delta),
      note: `Stock ${delta > 0 ? 'increased' : 'decreased'} manually`
    });

    if (onProductsChange) onProductsChange();
    setLogs(store.getLogs());
  };

  const handleDelete = (id: string) => {
    store.deleteProduct(id);
    if (onProductsChange) onProductsChange();
    setLogs(store.getLogs());
    setDeletingId(null);
    // Visual feedback for logs
    store.addLog({
      productId: id,
      changeType: 'correction',
      quantity: 0,
      note: 'Object purged from Archive'
    });
    setLogs(store.getLogs());
  };

  const chartData = products.map(p => ({
    name: p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name,
    stock: p.stock
  }));

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-12 space-y-10 selection:bg-neon-lime">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 bg-white p-8 neo-border shadow-hard-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-neon-lime rotate-45 translate-x-12 translate-y-[-48px] border-l-[3px] border-b-[3px] border-black"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-black tracking-tighter uppercase italic">Vault_Manager</h2>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2 border-l-[3px] border-neon-cyan pl-4 italic">Neural oversight of the drop ecosystem</p>
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-4">
          <div className="hidden md:flex flex-col items-end mr-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Storage_Utilization</span>
            <span className="text-xs font-mono font-bold text-slate-600">
              {Math.round(JSON.stringify(products).length / 1024)} KB / 5000 KB
            </span>
          </div>
          <button 
            onClick={() => {
              if (confirm("DANGER: WIPE ALL LOCAL ARCHIVE DATA? THIS CANNOT BE UNDONE.")) {
                store.purgeArchive();
              }
            }}
            className="bg-white text-rose-500 border-[3px] border-rose-500 px-6 py-4 text-xs font-black uppercase italic tracking-widest hover:bg-rose-500 hover:text-white transition-all active:translate-y-[2px] neo-border"
          >
            Purge Archive
          </button>
          <button 
            onClick={onAddProduct}
            className="bg-black text-neon-lime px-8 py-4 neo-border text-sm font-black uppercase italic tracking-widest hover:bg-neon-lime hover:text-black transition-all flex items-center justify-center gap-3 active:translate-y-[2px]"
          >
            <Plus className="w-5 h-5" /> Upload New Grail
          </button>
        </div>
      </div>

      {/* Stats Grid - Neobrutalist Style */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-8">
        <div className="md:col-span-2 neo-card p-8 flex items-center gap-6 bg-white shrink-0">
          <div className="w-16 h-16 bg-neon-cyan flex items-center justify-center neo-border rotate-[-6deg]">
            <Package className="w-8 h-8 text-black font-black" />
          </div>
          <div className="flex gap-8">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-1 italic">Total Stock</p>
              <p className="text-3xl font-black text-black italic tracking-tighter">{products.reduce((acc, p) => acc + p.stock, 0)}</p>
            </div>
            <div className="border-l-2 border-slate-100 pl-8">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-1 italic">Total Grails</p>
              <p className="text-3xl font-black text-black italic tracking-tighter">{products.length}</p>
            </div>
          </div>
        </div>
        
        <div className="md:col-span-2 neo-card p-8 flex items-center justify-between gap-6 bg-white group">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-neon-orange flex items-center justify-center neo-border rotate-[3deg]">
              <ArrowDownRight className="w-8 h-8 text-black font-black" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-1 italic">Neural Threshold</p>
              <p className="text-3xl font-black text-neon-orange italic tracking-tighter">{threshold}</p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => setThreshold(prev => prev + 1)}
              className="w-10 h-10 neo-border bg-white hover:bg-neon-lime flex items-center justify-center transition-all active:translate-x-[2px] active:translate-y-[2px]"
            >
              <ArrowUpRight className="w-5 h-5 text-black" />
            </button>
            <button 
              onClick={() => setThreshold(prev => Math.max(1, prev - 1))}
              className="w-10 h-10 neo-border bg-white hover:bg-neon-orange flex items-center justify-center transition-all active:translate-x-[2px] active:translate-y-[2px]"
            >
              <ArrowDownRight className="w-5 h-5 text-black" />
            </button>
          </div>
        </div>

        <div className="md:col-span-2 neo-card p-8 flex flex-col justify-center bg-black">
          <button 
            onClick={handleAiAnalyze}
            disabled={isAnalyzing}
            className="flex items-center justify-between w-full group"
          >
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-1 text-left italic">Model: GEMINI_3</p>
              <p className="text-xl font-black flex items-center gap-3 text-neon-lime italic uppercase tracking-tighter">
                <Sparkles className="w-5 h-5" />
                {isAnalyzing ? 'Analyzing...' : 'Neural Audit'}
              </p>
            </div>
            <div className={cn("w-12 h-12 neo-border bg-neon-lime flex items-center justify-center transition-all group-hover:rotate-45", isAnalyzing && "animate-spin")}>
              <RefreshCw className="w-6 h-6 text-black" />
            </div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
        {/* Inventory List - Bento Box */}
        <div className="lg:col-span-4 space-y-6">
          {activeAlerts.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-8 bg-neon-orange neo-border shadow-hard-md flex flex-col md:flex-row items-center justify-between gap-10"
            >
              <div className="flex items-center gap-8">
                <div className="w-16 h-16 bg-black text-neon-orange neo-border flex items-center justify-center animate-pulse rotate-[-5deg]">
                  <Sparkles className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-black font-black uppercase text-2xl italic tracking-tighter">Critical_Neural_Alert</h4>
                  <p className="text-black font-bold uppercase text-[10px] tracking-widest mt-1">
                    {activeAlerts.length} {activeAlerts.length === 1 ? 'item' : 'items'} breached the {threshold} point limit.
                  </p>
                </div>
              </div>
              <button 
                onClick={handleAiAnalyze}
                className="px-10 py-5 bg-black text-white neo-border text-xs font-black uppercase tracking-widest hover:bg-neon-lime hover:text-black transition-all active:translate-y-[2px]"
              >
                Neural Restock Strategy
              </button>
            </motion.div>
          )}

          <div className="neo-card bg-white overflow-hidden shadow-hard-md">
            <div className="p-8 border-b-[3px] border-black flex items-center justify-between bg-white">
              <h3 className="font-black uppercase text-2xl italic tracking-tighter">Grail_Inventory</h3>
              <div className="text-xs bg-neon-cyan px-4 py-1 neo-border font-black uppercase italic">{products.length} Series</div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-xs uppercase tracking-[0.2em] font-black text-slate-400 border-b-[3px] border-black">
                  <tr>
                    <th className="px-8 py-6">Identity</th>
                    <th className="px-8 py-6">Neural Status</th>
                    <th className="px-8 py-6 text-right">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y-[3px] divide-black">
                  {products.map((product) => (
                    <tr key={product.id} className="group hover:bg-neon-cyan/5 transition-colors">
                      <td className="px-8 py-8 flex items-center gap-6">
                        <div className="w-16 h-20 neo-border overflow-hidden bg-slate-100 shrink-0 rotate-[-2deg] group-hover:rotate-0 transition-transform">
                          <img src={product.imageUrl} className="w-full h-full object-cover grayscale brightness-95 group-hover:grayscale-0 group-hover:scale-110 transition-all" />
                        </div>
                        <div>
                          <p className="text-xl font-black text-black italic uppercase leading-none">{product.name}</p>
                          <p className="text-[10px] text-neon-violet font-black uppercase tracking-widest mt-2">{product.category}</p>
                        </div>
                      </td>
                      <td className="px-8 py-8">
                        <div className="flex items-center gap-6">
                          <button 
                            onClick={() => handleUpdateStock(product.id, -1)}
                            className="w-12 h-12 neo-border bg-white flex items-center justify-center font-black text-xl hover:bg-neon-lime transition-all active:translate-y-[2px]"
                          >
                            -
                          </button>
                          <div className="flex flex-col items-center">
                            <span className={cn("text-3xl font-black italic tracking-tighter", product.stock < threshold ? "text-neon-orange" : "text-black")}>
                                {product.stock}
                            </span>
                          </div>
                          <button 
                            onClick={() => handleUpdateStock(product.id, 1)}
                            className="w-12 h-12 neo-border bg-white flex items-center justify-center font-black text-xl hover:bg-neon-lime transition-all active:translate-y-[2px]"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="px-8 py-8 text-right">
                        {deletingId === product.id ? (
                          <div className="flex items-center justify-end gap-2">
                             <button 
                              onClick={() => handleDelete(product.id)}
                              className="px-4 py-2 bg-neon-orange text-white neo-border font-black text-[10px] uppercase italic"
                            >
                              Confirm
                            </button>
                            <button 
                              onClick={() => setDeletingId(null)}
                              className="px-4 py-2 bg-slate-100 text-black neo-border font-black text-[10px] uppercase italic"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setDeletingId(product.id)}
                            className="w-12 h-12 neo-border bg-white text-slate-300 hover:text-white hover:bg-neon-orange transition-all active:translate-y-[2px] flex items-center justify-center ml-auto"
                          >
                            <Trash2 className="w-6 h-6" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bento-card p-8">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" /> Inventory Architecture
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} 
                    dy={10}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(79, 70, 229, 0.05)', radius: 10 }}
                    contentStyle={{ border: 'none', borderRadius: '1.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', padding: '1rem' }}
                  />
                  <Bar dataKey="stock" radius={[10, 10, 10, 10]} barSize={24}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.stock < threshold ? '#ef4444' : '#4f46e5'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* AI Column */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence>
            {aiReport && (
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                className="neo-card p-10 bg-black text-white shadow-hard-lg"
              >
                <div className="flex items-center justify-between mb-8">
                  <h3 className="font-black text-2xl italic flex items-center gap-4 uppercase tracking-tighter">
                    <Sparkles className="w-8 h-8 text-neon-lime" /> Neural Insights
                  </h3>
                  <button onClick={() => setAiReport(null)} className="text-xs font-black text-neon-lime uppercase tracking-widest underline underline-offset-4 decoration-2">Dismiss</button>
                </div>
                <div className="text-sm border-l-[3px] border-neon-lime pl-8 leading-loose text-slate-300 font-bold uppercase italic tracking-wider">
                  {aiReport}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="neo-card p-10 bg-white">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-10 italic">Neural_Flux_Log</h3>
            <div className="space-y-6 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
              {logs.map((log) => (
                <div key={log.id} className="flex gap-6 p-6 neo-border bg-slate-50 hover:bg-white transition-all shadow-hard-sm">
                  <div className={cn(
                    "w-14 h-14 neo-border flex items-center justify-center",
                    log.changeType === 'restock' ? "bg-neon-lime" : "bg-neon-orange"
                  )}>
                    {log.changeType === 'restock' ? <ArrowUpRight className="w-8 h-8 font-black" /> : <ArrowDownRight className="w-8 h-8 font-black" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-black text-black italic uppercase leading-tight truncate">
                      {products.find(p => p.id === log.productId)?.name || 'Garment'}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{log.changeType}</span>
                       <span className="w-1 h-1 bg-slate-300 rounded-full" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                  <div className={cn(
                    "text-2xl font-black italic",
                    log.changeType === 'restock' ? "text-neon-lime" : "text-black"
                  )}>
                    {log.changeType === 'restock' ? '+' : '-'}{log.quantity}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
