import ProductCard from './ProductCard';

function OfferSection({ products = [], onFly }) {
  if (!products.length) return null;

  return (
    <section id="offers" className="overflow-hidden rounded-[2rem] border border-red-100 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-red-50 bg-red-50/70 px-5 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-red-500">
            Special Offers
          </p>
          <h2 className="mt-1 text-2xl font-black text-ink">আজকের অফার</h2>
          <p className="mt-1 text-sm font-bold text-slate-500">
            কম দামে বাছাই করা টাটকা পণ্য
          </p>
        </div>
        <span className="w-fit rounded-full bg-white px-4 py-2 text-xs font-black text-red-600 shadow-sm">
          সীমিত সময়
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 p-4 md:grid-cols-4 md:p-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} onFly={onFly} />
        ))}
      </div>
    </section>
  );
}

export default OfferSection;
