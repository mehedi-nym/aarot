import { useMemo, useState } from 'react';
import { useCart } from '../hooks/useCart.jsx';
import {
  formatBanglaCurrency,
  formatBanglaNumber,
  getProductPrice,
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

const getMixUnitMeta = (product) => {
  const price = getProductPrice(product);
  const sellType = product.sell_type;

  if (sellType === 'piece') {
    return {
      mode: 'piece',
      unitPrice: price,
      unitLabel: 'টি',
      min: 1,
      step: 1,
    };
  }

  if (sellType === 'gram') {
    return {
      mode: 'gram',
      unitPrice: price,
      unitLabel: 'গ্রাম',
      min: MIN_ITEM_GRAMS,
      step: 100,
    };
  }

  return {
    mode: 'gram',
    unitPrice: price,
    unitLabel: 'গ্রাম',
    min: MIN_ITEM_GRAMS,
    step: 100,
  };
};

function MixPackBuilder({ products = [], settings, onFly }) {
  const { addItem } = useCart();
  const [selected, setSelected] = useState({});
  const [cutSize, setCutSize] = useState(CUT_OPTIONS[0].id);
  const isMixPackEnabled = settings?.mix_pack_enabled !== false;

  const vegetableProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          product.is_available &&
          product.available_today &&
          product.include_in_mix_pack === true &&
          (product.category_id === 'cat-veg' || product.categories?.slug === 'sobji')
      ),
    [products]
  );

  const selectedLines = useMemo(
    () =>
      vegetableProducts
        .map((product) => {
          const quantity = Number(selected[product.id] || 0);
          const unitMeta = getMixUnitMeta(product);
          if (quantity < unitMeta.min) return null;

          const lineTotal =
            unitMeta.mode === 'piece'
              ? unitMeta.unitPrice * quantity
              : (unitMeta.unitPrice * quantity) / 1000;

          return {
            product,
            quantity,
            unitMeta,
            lineTotal,
          };
        })
        .filter(Boolean),
    [selected, vegetableProducts]
  );

  const selectedCut = CUT_OPTIONS.find((option) => option.id === cutSize) || CUT_OPTIONS[0];
  const totalGrams = selectedLines.reduce(
    (sum, line) => (line.unitMeta.mode === 'gram' ? sum + line.quantity : sum),
    0
  );
  const totalPieces = selectedLines.reduce(
    (sum, line) => (line.unitMeta.mode === 'piece' ? sum + line.quantity : sum),
    0
  );
  const vegetableTotal = selectedLines.reduce((sum, line) => sum + line.lineTotal, 0);
  const totalPrice = Math.round(vegetableTotal + selectedCut.fee);
  const canAdd =
    isMixPackEnabled && selectedLines.length > 0 && totalGrams <= MAX_TOTAL_GRAMS;
  const totalSummary = [
    totalGrams ? `${formatBanglaNumber(totalGrams)} গ্রাম` : '',
    totalPieces ? `${formatBanglaNumber(totalPieces)} টি` : '',
  ]
    .filter(Boolean)
    .join(' + ');

  const updateQuantity = (productId, quantity, min) => {
    setSelected((current) => {
      const next = { ...current };

      if (quantity < min) {
        delete next[productId];
        return next;
      }

      next[productId] = quantity;
      return next;
    });
  };

  const handleAddMix = (event) => {
    if (!canAdd) return;

    const description = selectedLines
      .map((line) => `${line.product.name_bn} ${line.quantity} ${line.unitMeta.unitLabel}`)
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
      mix_details_bn: `${description} | কাট: ${selectedCut.label} | মোট: ${totalSummary}`,
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
              <p className="text-lg font-black">২০০g/১টি</p>
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

        <div className="flex max-h-[760px] flex-col p-5 md:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black text-slate-900">সবজি বাছাই করুন</p>
              <p className="text-xs font-bold text-slate-500">
                {formatBanglaNumber(vegetableProducts.length)}টি পণ্য থেকে পছন্দ করুন
              </p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
              {formatBanglaNumber(selectedLines.length)}টি নির্বাচিত
            </span>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto pr-1 custom-scrollbar">
            <div className="grid gap-3 sm:grid-cols-2">
            {vegetableProducts.map((product) => {
              const quantity = Number(selected[product.id] || 0);
              const unitMeta = getMixUnitMeta(product);
              const isSelected = quantity >= unitMeta.min;
              const unitText = unitMeta.mode === 'piece' ? 'পিস' : 'কেজি';
              const valueText = quantity
                ? `${formatBanglaNumber(quantity)} ${unitMeta.unitLabel}`
                : 'নিন';
              const lineTotal = Math.round(
                unitMeta.mode === 'piece'
                  ? unitMeta.unitPrice * quantity
                  : (unitMeta.unitPrice * quantity) / 1000
              );

              return (
                <div
                  key={product.id}
                  className={`rounded-2xl border p-3 transition ${
                    isSelected
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
                        {formatBanglaCurrency(unitMeta.unitPrice)} / {unitText}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2">
                    <div className="inline-flex items-center rounded-full border border-slate-200 bg-white">
                      <button
                        type="button"
                        className="px-3 py-2 text-base font-black text-slate-600"
                        onClick={() =>
                          updateQuantity(
                            product.id,
                            Math.max(0, quantity - unitMeta.step),
                            unitMeta.min
                          )
                        }
                      >
                        -
                      </button>
                      <span className="min-w-20 text-center text-xs font-black text-slate-900">
                        {valueText}
                      </span>
                      <button
                        type="button"
                        className="px-3 py-2 text-base font-black text-slate-600"
                        onClick={() =>
                          updateQuantity(
                            product.id,
                            quantity ? quantity + unitMeta.step : unitMeta.min,
                            unitMeta.min
                          )
                        }
                      >
                        +
                      </button>
                    </div>
                    <p className="text-xs font-black text-emerald-700">
                      {formatBanglaCurrency(lineTotal)}
                    </p>
                  </div>
                  {unitMeta.mode === 'piece' && (
                    <p className="mt-2 text-[10px] font-bold text-amber-600">
                      এই পণ্যটি পিস হিসেবে যোগ হবে, গ্রাম হিসেবে নয়।
                    </p>
                  )}
                </div>
              );
            })}
            </div>
          </div>

          <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
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
              <br />
          <div className="rounded-2xl bg-slate-900 p-4 text-white">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-slate-400">
                  মোট {totalSummary || '০ গ্রাম'}
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
                {isMixPackEnabled ? 'ব্যাগে রাখুন' : 'সার্ভিসটি সাময়িকভাবে বন্ধ'}
              </button>
            </div>
            {!isMixPackEnabled && (
              <p className="mt-3 rounded-2xl bg-amber-500/10 px-4 py-3 text-xs font-bold leading-5 text-amber-200">
                রেডি টু কুক মিক্স প্যাক সার্ভিসটি এখন সাময়িকভাবে বন্ধ আছে। খুব শিগগিরই আবার চালু হবে।
              </p>
            )}
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
