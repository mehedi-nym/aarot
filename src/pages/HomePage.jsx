import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

import CategoryTabs from '../components/CategoryTabs';
import DeliveryBanner from '../components/DeliveryBanner';
import ProductCard from '../components/ProductCard';
import OfferSection from '../components/OfferSection';
import MixPackBuilder from '../components/MixPackBuilder';
import PromotionalPopup from '../components/PromotionalPopup';
import StickyCartBar from '../components/StickyCartBar';
import FloatingBag from '../components/FloatingBag.jsx';
import CartDrawer from '../components/CartDrawer.jsx';

import { useProducts } from '../hooks/useProducts';

function HomePage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [productSearch, setProductSearch] = useState('');
  const {
    categories,
    deliveryAreas,
    todaysProducts,
    allTodaysProducts,
    offerProducts,
    promotionalBanners,
    settings,
    loading,
  } =
    useProducts(activeCategory, { searchQuery: productSearch });
  const activeCategoryName =
    activeCategory === 'all'
      ? 'পণ্য'
      : categories.find((category) => category.id === activeCategory)?.name_bn || 'এই';
  const trimmedProductSearch = productSearch.trim();

  const [isNextDay, setIsNextDay] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  const [isBagOpen, setIsBagOpen] = useState(false);

  // 🎯 GLOBAL FLY ANIMATION STATE
const [flyer, setFlyer] = useState(null);
const animRef = useRef(null);

const animateFly = (start, end, image) => {
  const duration = 900; // ms
  const startTime = performance.now();

  const animate = (time) => {
    const elapsed = time - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // 🔥 Easing (smooth acceleration + deceleration)
    const ease = 1 - Math.pow(1 - progress, 3);

    // ✈️ X movement (linear interpolation)
    const x = start.x + (end.x - start.x) * ease;

    // ✈️ Y movement (PARABOLIC ARC = airplane flight)
    const arcHeight = 150;
    const y =
      start.y +
      (end.y - start.y) * ease -
      Math.sin(progress * Math.PI) * arcHeight;

    setFlyer({
      x,
      y,
      scale: 1 - progress * 0.75,
      opacity: 1 - progress,
      image,
    });

    if (progress < 1) {
      animRef.current = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(animRef.current);
      setFlyer(null);
    }
  };

  animRef.current = requestAnimationFrame(animate);
};

  // ---------------- TIMER ----------------
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const cutoff = new Date();
      cutoff.setHours(12, 0, 0, 0);

      if (now >= cutoff) {
        setIsNextDay(true);

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(12, 0, 0, 0);

        updateCountdown(tomorrow - now);
      } else {
        setIsNextDay(false);
        updateCountdown(cutoff - now);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const updateCountdown = (diff) => {
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);

    setTimeLeft(
      `${h.toString().padStart(2, '0')}:${m
        .toString()
        .padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    );
  };

  const getCartPosition = () => {
  const el = document.getElementById('floating-bag');
  if (!el) return { x: window.innerWidth - 80, y: window.innerHeight - 80 };

  const rect = el.getBoundingClientRect();

  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
};

  // ---------------- FLY HANDLER ----------------
  const handleFly = ({ x, y, image }) => {
  const end = getCartPosition();

  animateFly(
    { x, y },
    end,
    image
  );
};

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-24 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6 space-y-10">

        {/* DELIVERY */}
        <DeliveryBanner settings={settings} deliveryAreas={deliveryAreas} />

        <PromotionalPopup banners={promotionalBanners} />

        {/* STATUS BAR */}
        <section className="flex flex-col md:flex-row justify-between items-center bg-slate-900 text-white rounded-[2rem] p-4">
          <div className={`px-8 py-4 rounded-[1.8rem] flex items-center gap-3 ${
            isNextDay ? 'bg-amber-500' : 'bg-emerald-600'
          }`}>
            <span className="flex items-center justify-center shrink-0">
  <img 
    src={
      isNextDay 
        ? "https://bmqsgrrrravkziwbmyll.supabase.co/storage/v1/object/public/asset/icons8-delivery-time-80.apng.png" 
        : "https://bmqsgrrrravkziwbmyll.supabase.co/storage/v1/object/public/asset/icons8-in-transit-80.apng.png"
    } 
    alt="Delivery Schedule Icon" 
    className="w-12 h-12 object-contain"
  />
</span>
<div>
  <p className="text-[10px] uppercase font-black tracking-widest opacity-80">ডেলিভারি শিডিউল</p>
  <p className="text-lg font-bold">{isNextDay ? "আগামীকাল ডেলিভারি" : "আজই ডেলিভারি"}</p>
</div>
          </div>

          <div className="py-4 md:py-0 text-center md:text-right"> 
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">
               {isNextDay ? "পরবর্তী ডেলিভারি শুরু হতে বাকি" : "আজকের অর্ডারের সময় বাকি"} 
               </p> 
               <p className="text-3xl font-mono font-black text-emerald-400 tracking-tighter">
                {timeLeft}
                </p>
                 </div>
        </section>

        {/* PRODUCTS */}
        <section>
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-2xl font-black">লাইভ আড়ৎ</h2>
              <p className="text-slate-500">
                সরাসরি পাইকারি বাজার থেকে
              </p>
            </div>

            <CategoryTabs
              categories={categories}
              activeCategory={activeCategory}
              onChange={setActiveCategory}
            />
          </div>

          <div className="mb-6 w-full">
  <label htmlFor="product-search" className="sr-only">
    পণ্য খুঁজুন
  </label>

  <div
    className="
      flex w-full items-center
      rounded-2xl border border-slate-200
      bg-white
      p-2
      shadow-sm
      transition-all duration-200
      hover:border-emerald-200
      focus-within:border-emerald-400
      focus-within:ring-4
      focus-within:ring-emerald-100
    "
  >
    {/* Search Icon */}
    <div
      className="
        flex h-11 w-11 shrink-0
        items-center justify-center
        rounded-xl
        bg-emerald-50
        text-emerald-600
      "
      aria-hidden="true"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="h-5 w-5"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </svg>
    </div>

    {/* Input */}
    <input
      id="product-search"
      type="text"
      value={productSearch}
      onChange={(event) => setProductSearch(event.target.value)}
      placeholder="পণ্য খুঁজুন..."
      className="
        min-w-0 flex-1
        bg-transparent
        px-3
        py-3
        text-sm
        font-semibold
        text-slate-900
        outline-none
        placeholder:text-slate-400
        sm:px-4
        sm:text-base
      "
    />

    {/* Clear */}
    {trimmedProductSearch && (
      <button
        type="button"
        onClick={() => setProductSearch('')}
        className="
          shrink-0
          rounded-xl
          bg-slate-100
          px-3
          py-2
          text-xs
          font-bold
          text-slate-600
          transition
          hover:bg-red-50
          hover:text-red-600
          active:scale-95
          sm:px-4
          sm:text-sm
        "
      >
        মুছুন
      </button>
    )}
  </div>
</div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="h-64 bg-slate-100 rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : todaysProducts.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-emerald-200 bg-emerald-50/70 px-6 py-12 text-center">
              <p className="text-sm font-black tracking-widest text-emerald-600">
  ওহো!
</p>
              {trimmedProductSearch ? (
                <>
                  <h3 className="mt-3 text-2xl font-black text-slate-900">
                    <span className="text-emerald-600">{trimmedProductSearch}</span> নামে কোনো পণ্য পাওয়া যায়নি
                  </h3>

                  <p className="mx-auto mt-3 max-w-md text-sm font-semibold leading-7 text-slate-500">
                    অন্য নামে খুঁজে দেখুন, অথবা সব ক্যাটাগরি থেকে আবার চেষ্টা করুন।
                  </p>
                </>
              ) : (
                <>
                  <h3 className="mt-3 text-2xl font-black text-slate-900">
                    এখন <span className="text-emerald-600">{activeCategoryName}</span> পাওয়া যাচ্ছে না
                  </h3>

                  <p className="mx-auto mt-3 max-w-md text-sm font-semibold leading-7 text-slate-500">
                    খুব শিগগিরই {activeCategoryName} বিভাগে নতুন আইটেম যোগ করা হবে। পরে আবার দেখে নিন।
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {todaysProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onFly={handleFly}
                />
              ))}
            </div>
          )}
        </section>

        <OfferSection products={offerProducts} onFly={handleFly} />

        <MixPackBuilder
          products={allTodaysProducts}
          settings={settings}
          onFly={handleFly}
        />

        {/* --- ABOUT / BUSINESS MODEL --- */} <section className="grid lg:grid-cols-2 gap-8 py-12 border-t border-slate-100"> <div className="bg-emerald-50 rounded-[2.5rem] p-10"> <h4 className="text-2xl font-black text-emerald-900 mb-4">আমাদের বিজনেস মডেল</h4> <p className="text-emerald-800 leading-relaxed opacity-80"> আমরা কোনো খুচরা দোকান বা প্রথাগত শপ নই। প্রতিদিন দুপুর ১২টার মধ্যে পাওয়া অর্ডারগুলো আমরা সরাসরি আড়ৎ থেকে পাইকারিভাবে সংগ্রহ করি। এরপর আপনার যতটুকু প্রয়োজন, ঠিক ততটুকু নির্ভুল পরিমাপে প্রস্তুত করে আপনার ঠিকানায় পৌঁছে দিই। ফলে আপনি পান একদম তাজা পণ্য-আর তাও পাইকারি দামে। </p> <div className="mt-8 grid grid-cols-2 gap-4"> <div className="bg-white/50 p-4 rounded-2xl font-bold text-emerald-900 text-sm italic">✓ নো মিডলম্যান</div> <div className="bg-white/50 p-4 rounded-2xl font-bold text-emerald-900 text-sm italic">✓ ডিজিটাল ওজন</div> </div> </div> <div className="bg-slate-50 rounded-[2.5rem] p-10 flex flex-col justify-center"> <h4 className="text-xl font-bold text-slate-900 mb-2">পেমেন্ট ও সাপোর্ট</h4> <p className="text-slate-500 text-sm mb-6">নিরাপদ পেমেন্ট এবং দ্রুত সাপোর্টের জন্য আমরা আছি আপনার পাশে।</p> <div className="space-y-3"> <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200"> <span className="font-bold">বিকাশ (Personal)</span> <span className="font-mono font-black text-emerald-600">{settings?.bkash_number}</span> </div> <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200"> <span className="font-bold">ডেলিভারি চার্জ</span> <span className="font-black text-slate-900">৳{settings?.base_delivery_charge}</span> </div> </div> </div> </section>
      </div>

      {/* FLOATING BAG */}
      <FloatingBag onClick={() => setIsBagOpen(true)} />

      {/* CART DRAWER */}
      <CartDrawer
        isOpen={isBagOpen}
        onClose={() => setIsBagOpen(false)}
      />

      <StickyCartBar />

      {/* ---------------- GLOBAL FLY ANIMATION ---------------- */}
      {flyer &&
  createPortal(
    <div
      style={{
        position: 'fixed',
        left: flyer.x,
        top: flyer.y,
        transform: `translate(-50%, -50%) scale(${flyer.scale})`,
        opacity: flyer.opacity,
        zIndex: 999999,
        pointerEvents: 'none',
      }}
    >
      <div className="w-14 h-14 rounded-full overflow-hidden border-4 border-white shadow-2xl">
        <img src={flyer.image} className="w-full h-full object-cover" />
      </div>
    </div>,
    document.body
  )}
    </div>
  );
}

export default HomePage;
