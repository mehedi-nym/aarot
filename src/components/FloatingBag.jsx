import { motion } from 'framer-motion';
import { useCart } from '../hooks/useCart';
import { formatBanglaCurrency } from '../lib/utils';

function FloatingBag({ onClick }) {
  const { totalItems, subtotal } = useCart();

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <motion.button
        key={totalItems} // This forces the animation to re-run whenever an item is added
        initial={{ scale: 1 }}
        animate={totalItems > 0 ? { 
          scale: [1, 1.3, 1], // The "Jiggle" effect
          rotate: [0, -10, 10, 0] 
        } : {}}
        transition={{ duration: 0.4 }}
        onClick={onClick}
        className="relative flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-white shadow-2xl"
      >
        <span className="text-2xl">🛍️</span>
        
        {totalItems > 0 && (
  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-2 py-[2px] rounded-full flex items-center justify-center font-black min-w-[18px]">
    {formatBanglaCurrency (subtotal)}
  </div>
)}
      </motion.button>
    </div>
  );
}

export default FloatingBag;