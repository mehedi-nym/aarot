import {
  formatBanglaCurrency,
  formatBanglaNumber,
  getProductPrice,
  getSellTypeMeta,
  hasActiveOffer,
} from '../../lib/utils';

function OrderSummaryCard({
  items = [],
  subtotal = 0,
  deliveryCharge = 0,
  discount = 0,
  totalAmount = 0,
  settings, // 👈 needed for free delivery threshold
}) {
  const freeDeliveryThreshold = settings?.free_delivery_on || 1000;

  const isFreeDelivery = subtotal >= freeDeliveryThreshold;
  const remainingForFreeDelivery = Math.max(
    freeDeliveryThreshold - subtotal,
    0
  );
  const progress = Math.min((subtotal / freeDeliveryThreshold) * 100, 100);

  return (
    <aside className="section-shell p-4 sm:p-5 md:p-6 lg:sticky lg:top-24">
      <div className="space-y-5">

        {/* Header */}
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            অর্ডার সারাংশ
          </h3>
          <p className="mt-1 text-sm text-slate-500 font-bold">
            মোট {formatBanglaNumber(items.length)} ধরনের পণ্য
          </p>
        </div>

        {/* Item List */}
        <div className="max-h-[360px] space-y-3 overflow-y-auto pr-1 custom-scrollbar sm:max-h-[400px] sm:pr-2">
          {items.map((item) => {
            const itemPrice = getProductPrice(item);
            const itemHasOffer = hasActiveOffer(item);

            return (
            <div
              key={item.id}
              className="grid grid-cols-[auto,minmax(0,1fr)] gap-3 rounded-2xl border border-brand-50 bg-white/70 px-3 py-3 sm:flex sm:items-center sm:gap-4"
            >
              <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl border border-white bg-white shadow-sm sm:h-16 sm:w-16">
                <img
                  src={item.image_url || '/placeholder-product.png'}
                  alt={item.name_bn}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.target.src =
                      'https://via.placeholder.com/150?text=No+Image';
                  }}
                />
              </div>

              <div className="min-w-0 sm:flex-grow">
                <p className="break-words text-sm font-bold leading-tight text-slate-800">
                  {item.name_bn}
                </p>
                {item.mix_details_bn && (
                  <p className="mt-1 text-[10px] font-semibold leading-4 text-slate-500">
                    {item.mix_details_bn}
                  </p>
                )}
                <p className="mt-1 text-xs font-bold text-slate-500">
                  {item.quantity}{' '}
                  {getSellTypeMeta(item.sell_type).shortLabel} x{' '}
                  {formatBanglaCurrency(itemPrice)}
                </p>
                {itemHasOffer && (
                  <p className="mt-1 text-[10px] font-bold text-red-500">
                    অফার মূল্য, আগের দাম <span className="line-through">{formatBanglaCurrency(item.regular_price || item.price)}</span>
                  </p>
                )}
              </div>

              <div className="col-span-2 border-t border-brand-50 pt-2 text-right sm:col-span-1 sm:border-0 sm:pt-0">
                <p className="font-black text-slate-900 text-sm">
                  {formatBanglaCurrency(
                    Number(itemPrice) * Number(item.quantity)
                  )}
                </p>
              </div>
            </div>
          );
          })}
        </div>

        {/* 🔥 FREE DELIVERY PROGRESS (NEW FEATURE) */}
        <div className="space-y-3 rounded-[1.5rem] border border-brand-100 bg-brand-50/70 p-4 sm:rounded-[2rem] sm:p-5">
          
          <div className="flex items-center justify-between">
            <p className="text-sm font-black text-slate-900">
              ফ্রি ডেলিভারি অফার
            </p>

            {isFreeDelivery ? (
              <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">
                অর্জিত 🎉
              </span>
            ) : (
              <span className="text-xs font-bold text-slate-500">
                আরও কিনুন
              </span>
            )}
          </div>

          {/* Progress Bar */}
          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                isFreeDelivery ? 'bg-emerald-500' : 'bg-slate-900'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Message */}
          {isFreeDelivery ? (
            <p className="text-xs font-semibold text-emerald-600">
              🎉 আপনি ফ্রি ডেলিভারি পেয়েছেন
            </p>
          ) : (
            <p className="text-xs font-semibold text-slate-600">
              আরও{' '}
              <span className="font-black text-slate-900">
                {formatBanglaCurrency(remainingForFreeDelivery)}
              </span>{' '}
              কিনলে ফ্রি ডেলিভারি পাবেন
            </p>
          )}
        </div>

        {/* Calculation Box */}
        <div className="space-y-3 rounded-[1.5rem] bg-ink p-5 text-slate-300 sm:rounded-[2rem] sm:p-6">
          
          <div className="flex items-center justify-between text-sm font-medium">
            <span>পণ্যের মূল্য</span>
            <span className="text-white font-bold">
              {formatBanglaCurrency(subtotal)}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm font-medium">
            <span>ডেলিভারি চার্জ</span>
            <span className="text-white font-bold">
              {isFreeDelivery
                ? 'ফ্রি'
                : formatBanglaCurrency(deliveryCharge)}
            </span>
          </div>

          {discount > 0 && (
            <div className="flex items-center justify-between text-sm font-black text-emerald-400">
              <span>ডিসকাউন্ট (-)</span>
              <span>- {formatBanglaCurrency(discount)}</span>
            </div>
          )}

          <div className="mt-2 flex items-center justify-between gap-4 border-t border-white/10 pt-4 text-lg font-black text-white sm:text-xl">
            <span>সর্বমোট</span>
            <span className="text-brand-300">
              {formatBanglaCurrency(totalAmount)}
            </span>
          </div>
        </div>

        {/* Gift Section (UNCHANGED) */}
        <div className="flex flex-col gap-4 rounded-[1.5rem] border border-brand-100 bg-brand-50/70 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:rounded-[2rem] sm:p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-emerald-50">
              🛍️
            </div>
            <div>
              <p className="text-sm font-black text-emerald-900">
                বাজারের ব্যাগ (Eco-Friendly)
              </p>
              <p className="text-xs text-emerald-600 font-bold">
                প্রথম ৫টি অর্ডারের জন্য উপহার
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400 line-through block font-bold">
              ৳১০
            </span>
            <span className="text-sm font-black text-emerald-700 bg-emerald-100 px-3 py-1 rounded-lg">
              ফ্রি
            </span>
          </div>
        </div>

      </div>
    </aside>
  );
}

export default OrderSummaryCard;
