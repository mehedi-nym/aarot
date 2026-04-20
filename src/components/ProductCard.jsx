import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../hooks/useCart.jsx';
import { formatBanglaCurrency, formatBanglaNumber, getSellTypeMeta } from '../lib/utils';
import QuantityControl from './QuantityControl';
import { createPortal } from 'react-dom';

function ProductCard({ product, onFly }) {
  const { addItem } = useCart();
  const meta = getSellTypeMeta(product.sell_type);
  const [quantity, setQuantity] = useState(Number(product.minimum_quantity || meta.min));

  const isAvailable = product.is_available;
  const stockText = isAvailable ? "অর্ডার নেওয়া হচ্ছে" : "আজকের মতো শেষ";

  const handleAddToBag = (e) => {
  if (!isAvailable) return;

  const rect = e.currentTarget.getBoundingClientRect();

  onFly({
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
    image: product.image_url
  });

  addItem(product, quantity);
};



  return (
    <article className="group flex flex-col bg-white border border-gray-100 rounded-[2rem] overflow-hidden transition-all duration-300 ease-out hover:shadow-2xl hover:shadow-emerald-100/50 hover:border-emerald-200 transform-gpu">
      
      {/* 1. Image Container */}
      <div className="relative aspect-square w-full bg-gray-50 overflow-hidden">
        <img
          src={product.image_url}
          alt={product.name_bn}
          className={`h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 will-change-transform ${
            !isAvailable ? 'opacity-40 grayscale' : ''
          }`}
        />
        
        {/* Origin Badge */}
        <div className="absolute top-4 left-4 z-10">
          <span className="bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-gray-700 shadow-sm border border-white/50">
            {product.origin_bn}
          </span>
        </div>

        {/* Stock Status */}
        <div className="absolute bottom-4 left-4 z-10">
          <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight shadow-sm transition-colors duration-300 ${
            isAvailable ? 'bg-emerald-500 text-white' : 'bg-gray-400 text-white'
          }`}>
            {stockText}
          </span>
        </div>
      </div>

      {/* 2. Content Section */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="mb-4">
          <h3 className="text-lg font-black text-slate-800 leading-tight group-hover:text-emerald-700 transition-colors">
            {product.name_bn}
          </h3>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-2xl font-black text-slate-900 tracking-tighter">
              {formatBanglaCurrency(product.price)}
            </span>
            <span className="text-xs font-bold text-slate-400">
              / {meta.label}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            বাকি আছে: {formatBanglaNumber(product.stock_quantity)} {meta.shortLabel}
          </p>
        </div>

        {/* 3. Interaction Section */}
        <div className="mt-auto space-y-3">
          <div className="bg-slate-50 rounded-2xl p-1 transition-colors group-hover:bg-emerald-50/50">
             <QuantityControl
                sellType={product.sell_type}
                value={quantity}
                min={product.minimum_quantity}
                step={product.quantity_step}
                onChange={setQuantity}
              />
          </div>
          
          <button
            type="button"
            disabled={!isAvailable}
            onClick={handleAddToBag}
            className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all duration-300 active:scale-95 z-20 relative ${
              isAvailable 
                ? 'bg-slate-900 text-white hover:bg-emerald-600 shadow-lg shadow-slate-200 hover:shadow-emerald-200' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span className="text-xl transform group-hover:rotate-12 transition-transform">🛍️</span>
            ব্যাগে রাখুন
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;