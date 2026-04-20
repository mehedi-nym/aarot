import { useCart } from '../../hooks/useCart';
import {
  calculateDeliveryCharge,
  formatBanglaCurrency,
  formatBanglaNumber,
  getSellTypeMeta,
} from '../../lib/utils';

function OrderSummaryCard({ settings, selectedArea }) {
  const { items, subtotal } = useCart();
  const deliveryCharge = calculateDeliveryCharge(settings, selectedArea);
  const total = subtotal + deliveryCharge;

  return (
    <aside className="section-shell p-5 md:p-6">
      <div className="space-y-5">
        <div>
          <h3 className="text-xl font-bold text-ink">অর্ডার সারাংশ</h3>
          <p className="mt-1 text-sm text-brand-700">
            মোট {formatBanglaNumber(items.length)} ধরনের পণ্য
          </p>
        </div>

        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-brand-100 px-4 py-3"
            >
              <div>
                <p className="font-semibold text-ink">{item.name_bn}</p>
                <p className="text-sm text-brand-700">
                  {item.quantity} {getSellTypeMeta(item.sell_type).shortLabel} x{' '}
                  {formatBanglaCurrency(item.price)}
                </p>
              </div>
              <p className="font-bold text-ink">
                {formatBanglaCurrency(Number(item.price) * Number(item.quantity))}
              </p>
            </div>
          ))}
        </div>

        <div className="space-y-3 rounded-3xl bg-brand-50 p-4">
          <div className="flex items-center justify-between text-sm">
            <span>পণ্যের মূল্য</span>
            <span>{formatBanglaCurrency(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>ডেলিভারি চার্জ</span>
            <span>{formatBanglaCurrency(deliveryCharge)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-brand-100 pt-3 text-lg font-bold">
            <span>সর্বমোট</span>
            <span>{formatBanglaCurrency(total)}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default OrderSummaryCard;
