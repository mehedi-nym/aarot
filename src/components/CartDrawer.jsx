import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../hooks/useCart';
import { formatBanglaCurrency } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

function CartDrawer({ isOpen, onClose }) {
  const { items, removeItem, subtotal } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 1. Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[110] bg-slate-900/40 backdrop-blur-sm"
          />

          {/* 2. 3D Bag Container */}
          <div className="fixed inset-0 pointer-events-none z-[120] flex items-end justify-center overflow-hidden">
            <motion.div
              initial={{ y: "100%", rotateX: 12, scale: 0.9 }}
              animate={{ y: 0, rotateX: 0, scale: 1 }}
              exit={{ y: "100%", rotateX: 10 }}
              transition={{ type: "spring", damping: 28, stiffness: 200 }}
              className="relative w-full max-w-xl pointer-events-auto origin-bottom mb-[-2px]" 
              style={{ perspective: "1200px" }}
            >
              
              {/* --- 3D RIBBON HANDLES --- */}
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-32 flex justify-center z-0">
                {/* Back Handle Layer */}
                <div className="absolute top-2 w-28 h-20 border-[10px] border-slate-800/30 rounded-[2.5rem]" />
                {/* Front Ribbon Handle */}
                <div className="relative w-32 h-24 border-[12px] border-slate-900 rounded-[3rem] shadow-xl flex justify-between px-3 items-end pb-1.5">
                  <div className="w-3 h-3 bg-slate-600 rounded-full border border-slate-400 shadow-inner" />
                  <div className="w-3 h-3 bg-slate-600 rounded-full border border-slate-400 shadow-inner" />
                </div>
              </div>

              {/* --- THE TRAPEZOID BODY --- */}
              <div 
                style={{ 
                  clipPath: 'polygon(6% 0%, 94% 0%, 100% 100%, 0% 100%)',
                  background: 'linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)'
                }}
                className="relative flex flex-col h-[85vh] md:h-[75vh] shadow-[0_-25px_60px_-15px_rgba(0,0,0,0.4)] overflow-hidden"
              >
                {/* Visual Depth Accents */}
                <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-black/[0.03] to-transparent pointer-events-none" />
                <div className="absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-black/[0.04] to-transparent" />
                <div className="absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-black/[0.04] to-transparent" />

                {/* --- CONTENT WRAPPER (This keeps layout stable) --- */}
                <div className="flex flex-col h-full w-[82%] mx-auto pt-10 pb-8 z-10">
                  
                  {/* FIXED HEADER */}
                  <div className="flex items-center justify-between mb-4 flex-shrink-0">
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none">আপনার বাজারের ব্যাগ</h3>
                      <div className="h-1 w-16 bg-emerald-500 rounded-full mt-1" />
                      <p className="text-[10px] uppercase tracking-widest font-bold text-emerald-600 mt-1">
                        {items.length} টি পণ্য
                      </p>
                    </div>
                    <button 
                      onClick={onClose}
                      className="group bg-slate-100 p-2 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all"
                    >
                      <span className="text-xs font-bold px-2">বন্ধ করুন</span>
                    </button>
                  </div>

                  {/* SCROLLABLE ITEM AREA (The "flex-grow" and "overflow-y-auto" is key here) */}
                  <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar space-y-3 py-2">
                    {items.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center opacity-20">
                        <span className="text-6xl">🛍️</span>
                        <p className="font-bold mt-2 text-slate-900">ব্যাগটি একদম খালি</p>
                      </div>
                    ) : (
                      items.map((item) => (
                        <motion.div 
                          layout
                          key={item.id} 
                          className="flex items-center gap-3 bg-white/80 backdrop-blur-sm p-2.5 rounded-2xl border border-slate-100 shadow-sm"
                        >
                          <img src={item.image_url} className="h-14 w-14 rounded-xl object-cover bg-slate-50" alt={item.name_bn} />
                          
                          <div className="flex-grow min-w-0">
                            <h4 className="font-bold text-slate-800 text-sm truncate">{item.name_bn}</h4>
                            <p className="text-emerald-600 font-black text-base">
                              {formatBanglaCurrency(item.price)} 
                              <span className="text-slate-400 text-[10px] font-medium ml-1">x{item.quantity}</span>
                            </p>
                          </div>

                          <button 
                            onClick={() => removeItem(item.id)}
                            className="w-10 h-10 flex items-center justify-center rounded-full text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                          >
                            ✕
                          </button>
                        </motion.div>
                      ))
                    )}
                  </div>

                  {/* FIXED FOOTER (This will never hide) */}
                  {items.length > 0 && (
                    <div className="mt-4 pt-4 border-t-2 border-dashed border-slate-200 flex-shrink-0">
                      <div className="flex justify-between items-center mb-4 px-1">
                        <span className="text-slate-500 font-bold text-xs uppercase">মোট পণ্য মূল্য </span>
                        <span className="text-3xl font-black text-slate-900 tracking-tighter">
                          {formatBanglaCurrency(subtotal)}
                        </span>
                      </div>
                      
                      <button 
                        onClick={handleCheckout}
                        className="w-full bg-slate-900 hover:bg-emerald-600 text-white py-4 rounded-[1.3rem] font-black text-lg shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
                      >
                         অর্ডার কনফার্ম করুন
                         <span className="text-xl">→</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

export default CartDrawer;