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

  const stockQuantity = Number(product.stock_quantity || 0);
  const isOutOfStock = stockQuantity <= 0;
  const isUnavailableToday = product.available_today === false;
  const isInactive = product.is_available === false;
  const canOrder = !isInactive && !isUnavailableToday && !isOutOfStock;
  const stockText = isOutOfStock
    ? 'স্টক শেষ'
    : isUnavailableToday
      ? 'আজ অর্ডার বন্ধ'
      : isInactive
        ? 'সাময়িক বন্ধ'
        : 'অর্ডার নেওয়া হচ্ছে';
  const buttonText = isOutOfStock
    ? 'স্টক শেষ'
    : isUnavailableToday
      ? 'আজকের জন্য বন্ধ'
      : isInactive
        ? 'সাময়িকভাবে বন্ধ'
        : 'ব্যাগে রাখুন';
  const helperText = isOutOfStock
    ? 'এই পণ্যটি আপাতত স্টকে নেই।'
    : isUnavailableToday
      ? 'আজ এই পণ্যটি অর্ডার নেওয়া হচ্ছে না।'
      : isInactive
        ? 'পণ্যটি সাময়িকভাবে বন্ধ আছে।'
        : '';

  const handleAddToBag = (e) => {
  if (!canOrder) return;

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
            !canOrder ? 'opacity-40 grayscale' : ''
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
            canOrder ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
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
          {helperText && (
            <p className="rounded-2xl bg-amber-50 px-3 py-2 text-xs font-bold leading-5 text-amber-700">
              {helperText}
            </p>
          )}

          <div className={`rounded-2xl p-1 transition-colors ${
            canOrder ? 'bg-slate-50 group-hover:bg-emerald-50/50' : 'bg-slate-100 opacity-60'
          }`}>
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
            disabled={!canOrder}
            onClick={handleAddToBag}
            className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all duration-300 active:scale-95 z-20 relative ${
              canOrder 
                ? 'bg-slate-900 text-white hover:bg-emerald-600 shadow-lg shadow-slate-200 hover:shadow-emerald-200' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
             <span className="relative inline-block w-5 h-5">
    {/* Normal icon */}
    <img
      src="https://bmqsgrrrravkziwbmyll.supabase.co/storage/v1/object/public/asset/shopping-bag%20(4).png"
      alt="Shopping bag"
      className="absolute inset-0 w-full h-full object-contain opacity-100 group-hover:opacity-0 transition-opacity duration-200"
    />

    {/* Hover icon */}
    <img
      src="https://bmqsgrrrravkziwbmyll.supabase.co/storage/v1/object/public/asset/shopping-bag%20(2).png"
      alt=""
      className="absolute inset-0 w-full h-full object-contain opacity-0 group-hover:opacity-100 transition-opacity duration-200"
    />
  </span>
            {buttonText}
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
