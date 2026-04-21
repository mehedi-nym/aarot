import {
  formatBanglaCurrency,
  formatBanglaNumber,
  getSellTypeMeta,
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
    <aside className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-5 md:p-6 sticky top-8">
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
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 rounded-2xl border border-slate-50 bg-slate-50/50 px-3 py-3"
            >
              <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-white shadow-sm bg-white">
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

              <div className="flex-grow">
                <p className="font-bold text-slate-800 text-sm leading-tight">
                  {item.name_bn}
                </p>
                <p className="text-xs text-slate-500 font-bold mt-1">
                  {item.quantity}{' '}
                  {getSellTypeMeta(item.sell_type).shortLabel} x{' '}
                  {formatBanglaCurrency(item.price)}
                </p>
              </div>

              <div className="text-right">
                <p className="font-black text-slate-900 text-sm">
                  {formatBanglaCurrency(
                    Number(item.price) * Number(item.quantity)
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* 🔥 FREE DELIVERY PROGRESS (NEW FEATURE) */}
        <div className="rounded-[2rem] border border-slate-100 bg-slate-50/50 p-5 space-y-3">
          
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
        <div className="space-y-3 rounded-[2rem] bg-slate-900 p-6 text-slate-300">
          
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

          <div className="flex items-center justify-between border-t border-slate-700 pt-4 mt-2 text-xl font-black text-white">
            <span>সর্বমোট</span>
            <span className="text-emerald-400">
              {formatBanglaCurrency(totalAmount)}
            </span>
          </div>
        </div>

        {/* Gift Section (UNCHANGED) */}
        <div className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 p-6 rounded-[2rem] flex items-center justify-between shadow-sm">
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

          <div className="text-right">
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