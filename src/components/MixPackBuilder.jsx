import { useMemo, useState } from 'react';
import { useCart } from '../hooks/useCart.jsx';
import {
  formatBanglaCurrency,
  formatBanglaNumber,
  getSellTypeMeta,
} from '../lib/utils';

const MIN_ITEM_GRAMS = 200;
const MAX_TOTAL_GRAMS = 2000;

const CUT_OPTIONS = [
  {
    id: 'medium',
    label: 'স্ট্যান্ডার্ড মিডিয়াম কাট',
    shortLabel: 'মিডিয়াম',
    fee: 0,
  },
  {
    id: 'small',
    label: 'ভাজি সাইজ ছোট কাট',
    shortLabel: 'ছোট কাট',
    fee: 5,
  },
  {
    id: 'large',
    label: 'বড় টুকরা',
    shortLabel: 'বড় কাট',
    fee: 0,
  },
];

const getPricePerKg = (product) => {
  const price = Number(product.price || 0);
  const sellType = product.sell_type;

  if (sellType === 'gram') {
    const baseGrams = Number(product.minimum_quantity || getSellTypeMeta('gram').min);
    return baseGrams > 0 ? (price / baseGrams) * 1000 : price;
  }

  return price;
};

function MixPackBuilder({ products = [], onFly }) {
  const { addItem } = useCart();
  const [selected, setSelected] = useState({});
  const [cutSize, setCutSize] = useState(CUT_OPTIONS[0].id);

  const vegetableProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          product.is_available &&
          product.available_today &&
          (product.category_id === 'cat-veg' || product.categories?.slug === 'sobji')
      ),
    [products]
  );

  const selectedLines = useMemo(
    () =>
      vegetableProducts
        .map((product) => {
          const grams = Number(selected[product.id] || 0);
          if (grams < MIN_ITEM_GRAMS) return null;

          const pricePerKg = getPricePerKg(product);
          const lineTotal = (pricePerKg * grams) / 1000;

          return {
            product,
            grams,
            pricePerKg,
            lineTotal,
          };
        })
        .filter(Boolean),
    [selected, vegetableProducts]
  );

  const selectedCut = CUT_OPTIONS.find((option) => option.id === cutSize) || CUT_OPTIONS[0];
  const totalGrams = selectedLines.reduce((sum, line) => sum + line.grams, 0);
  const vegetableTotal = selectedLines.reduce((sum, line) => sum + line.lineTotal, 0);
  const totalPrice = Math.round(vegetableTotal + selectedCut.fee);
  const canAdd = selectedLines.length > 0 && totalGrams <= MAX_TOTAL_GRAMS;

  const updateGrams = (productId, grams) => {
    setSelected((current) => {
      const next = { ...current };

      if (grams < MIN_ITEM_GRAMS) {
        delete next[productId];
        return next;
      }

      next[productId] = grams;
      return next;
    });
  };

  const handleAddMix = (event) => {
    if (!canAdd) return;

    const description = selectedLines
      .map((line) => `${line.product.name_bn} ${line.grams} গ্রাম`)
      .join(', ');

    const mixItem = {
      id: `mix-pack-${Date.now()}`,
      name_bn: 'রেডি টু কুক সবজি মিক্স প্যাক',
      image_url:
        selectedLines[0]?.product.image_url ||
        'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=80',
      origin_bn: 'আড়ৎ ফ্রেশ কাট',
      sell_type: 'piece',
      price: totalPrice,
      quantity: 1,
      is_custom_mix: true,
      mix_details_bn: `${description} | কাট: ${selectedCut.label} | মোট: ${totalGrams} গ্রাম`,
    };

    const rect = event.currentTarget.getBoundingClientRect();
    onFly?.({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      image: mixItem.image_url,
    });

    addItem(mixItem, 1);
    setSelected({});
    setCutSize(CUT_OPTIONS[0].id);
  };

  if (!vegetableProducts.length) return null;

  return (
    <section className="overflow-hidden rounded-[2rem] border border-emerald-100 bg-white shadow-sm">
      <div className="grid gap-0 lg:grid-cols-[0.95fr,1.05fr]">
        <div className="bg-emerald-950 p-6 text-white md:p-8">
          <p className="text-xs font-black uppercase tracking-widest text-emerald-300">
            নতুন সার্ভিস
          </p>
          <h2 className="mt-3 text-2xl font-black leading-tight md:text-3xl">
            রেডি টু কুক সবজি মিক্স
          </h2>
          <p className="mt-4 text-sm font-semibold leading-7 text-emerald-50/85">
            পছন্দের সবজি, দরকারি ওজন আর কাট সাইজ বেছে নিন। আমরা পরিষ্কার করে
            একদম ঠিক ওজনে কেটে প্যাক করে দেব।
          </p>

          <div className="mt-6 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-2xl bg-white/10 p-3">
              <p className="text-lg font-black">২০০g</p>
              <p className="text-[10px] font-bold text-emerald-100">মিনিমাম</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-3">
              <p className="text-lg font-black">২kg</p>
              <p className="text-[10px] font-bold text-emerald-100">সর্বোচ্চ</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-3">
              <p className="text-lg font-black">৳৫</p>
              <p className="text-[10px] font-bold text-emerald-100">ছোট কাট</p>
            </div>
          </div>
        </div>

        <div className="space-y-5 p-5 md:p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            {vegetableProducts.map((product) => {
              const grams = Number(selected[product.id] || 0);
              const pricePerKg = getPricePerKg(product);
              const lineTotal = Math.round((pricePerKg * grams) / 1000);

              return (
                <div
                  key={product.id}
                  className={`rounded-2xl border p-3 transition ${
                    grams >= MIN_ITEM_GRAMS
                      ? 'border-emerald-300 bg-emerald-50/70'
                      : 'border-slate-100 bg-slate-50/60'
                  }`}
                >
                  <div className="flex gap-3">
                    <img
                      src={product.image_url}
                      alt={product.name_bn}
                      className="h-14 w-14 rounded-xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black text-slate-900">
                        {product.name_bn}
                      </p>
                      <p className="text-xs font-bold text-slate-500">
                        {formatBanglaCurrency(pricePerKg)} / কেজি
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2">
                    <div className="inline-flex items-center rounded-full border border-slate-200 bg-white">
                      <button
                        type="button"
                        className="px-3 py-2 text-base font-black text-slate-600"
                        onClick={() => updateGrams(product.id, Math.max(0, grams - 100))}
                      >
                        -
                      </button>
                      <span className="min-w-20 text-center text-xs font-black text-slate-900">
                        {grams ? `${formatBanglaNumber(grams)} গ্রাম` : 'নিন'}
                      </span>
                      <button
                        type="button"
                        className="px-3 py-2 text-base font-black text-slate-600"
                        onClick={() => updateGrams(product.id, grams ? grams + 100 : MIN_ITEM_GRAMS)}
                      >
                        +
                      </button>
                    </div>
                    <p className="text-xs font-black text-emerald-700">
                      {formatBanglaCurrency(lineTotal)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-3">
            <p className="text-sm font-black text-slate-900">কাট সাইজ</p>
            <div className="grid gap-2 sm:grid-cols-3">
              {CUT_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setCutSize(option.id)}
                  className={`rounded-2xl border px-4 py-3 text-left text-xs font-black transition ${
                    cutSize === option.id
                      ? 'border-emerald-500 bg-emerald-600 text-white'
                      : 'border-slate-100 bg-white text-slate-700'
                  }`}
                >
                  <span className="block">{option.shortLabel}</span>
                  <span className="mt-1 block opacity-75">
                    {option.fee ? `+${formatBanglaCurrency(option.fee)}` : 'ফ্রি'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-slate-900 p-4 text-white">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-slate-400">
                  মোট {formatBanglaNumber(totalGrams)} গ্রাম
                </p>
                <p className="mt-1 text-2xl font-black text-emerald-300">
                  {formatBanglaCurrency(totalPrice)}
                </p>
              </div>
              <button
                type="button"
                disabled={!canAdd}
                onClick={handleAddMix}
                className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-900 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
              >
                ব্যাগে রাখুন
              </button>
            </div>
            {totalGrams > MAX_TOTAL_GRAMS && (
              <p className="mt-3 text-xs font-bold text-red-300">
                একটি মিক্স প্যাকে সর্বোচ্চ ২ কেজি নেয়া যাবে।
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default MixPackBuilder;
