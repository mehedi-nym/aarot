import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';

function OfferSection({ products = [], onFly }) {
  if (!products.length) return null;

  // Randomize offer products on every component mount (page refresh)
  const previewProducts = useMemo(() => {
    const shuffled = [...products].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4);
  }, [products]);

  const remainingCount = Math.max(0, products.length - previewProducts.length);

  return (
    <section 
      id="offers" 
      className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-white py-8 border-y border-[rgba(40,111,58,0.15)] shadow-sm"
    >
      {/* Full-width container with edge padding instead of max-width constraining */}
      <div className="w-full px-4 sm:px-6 lg:px-8">
        
        {/* Header with #286F3A Brand Color */}
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-[#286F3A]/20 bg-[#286F3A]/5 p-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-[#286F3A]">
              Special Offers
            </p>
            <h2 className="mt-1 text-2xl font-black text-ink">আজকের অফার</h2>
            <p className="mt-1 text-sm font-bold text-slate-500">
              কম দামে বাছাই করা টাটকা পণ্য
            </p>
          </div>
          <Link
            to="/offers"
            className="w-fit rounded-full bg-white px-5 py-2 text-xs font-black text-[#286F3A] shadow-sm transition hover:bg-[#286F3A] hover:text-white"
          >
            {remainingCount > 0 ? `আরও ${remainingCount}টি অফার দেখুন` : 'সব অফার দেখুন'}
          </Link>
        </div>

        {/* 5 Cards Grid across 100% width */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {previewProducts.map((product) => (
            <ProductCard key={product.id} product={product} onFly={onFly} />
          ))}

          {/* 5th Card: See More Offers */}
          <Link
            to="/offers"
            className="group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#286F3A]/30 bg-[#286F3A]/5 p-5 text-center transition hover:border-[#286F3A] hover:bg-[#286F3A]/10"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#286F3A] text-white shadow-md transition group-hover:scale-110">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 transform transition group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
            
            <h3 className="mt-3 text-base font-black text-slate-800">
              {remainingCount > 0 ? `আরও ${remainingCount}টি অফার পণ্য দেখুন` : 'সব অফার দেখুন'}
            </h3>
            <p className="mt-1 text-xs font-semibold text-slate-500">
              সব অফার এক সাথে দেখতে ক্লিক করুন
            </p>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default OfferSection;