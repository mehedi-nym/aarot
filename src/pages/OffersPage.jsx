import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useProducts } from '../hooks/useProducts';
import { formatBanglaNumber } from '../lib/utils';

function OffersPage() {
  const { offerProducts, loading } = useProducts();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-red-500">
            Special Offers
          </p>
          <h1 className="mt-1 text-3xl font-black text-ink">সব অফার পণ্য</h1>
          <p className="mt-2 text-sm font-bold text-slate-500">
            বড় ডিসকাউন্টের পণ্যগুলো আগে দেখানো হচ্ছে
          </p>
        </div>
        <Link
          to="/"
          className="w-fit rounded-full border border-brand-100 bg-white px-4 py-2 text-xs font-black text-brand-700 transition hover:bg-brand-50"
        >
          বাজারে ফিরুন
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="h-64 animate-pulse rounded-2xl bg-brand-50" />
          ))}
        </div>
      ) : offerProducts.length ? (
        <>
          <p className="mb-4 text-sm font-bold text-slate-500">
            মোট {formatBanglaNumber(offerProducts.length)}টি অফার চলছে
          </p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {offerProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      ) : (
        <div className="section-shell px-6 py-14 text-center">
          <h2 className="text-2xl font-black text-ink">এখন কোনো অফার নেই</h2>
          <p className="mx-auto mt-3 max-w-md text-sm font-bold leading-7 text-slate-500">
            নতুন অফার শুরু হলে এখানে সব পণ্য দেখা যাবে।
          </p>
        </div>
      )}
    </div>
  );
}

export default OffersPage;
