import { useState } from 'react';
import OrderStatusBadge from '../components/OrderStatusBadge';
import { useOrders } from '../hooks/useOrders';
import {
  formatBanglaCurrency,
  formatBanglaDate,
  formatBanglaDateTime,
  formatBanglaNumber,
} from '../lib/utils';

function TrackOrderPage() {
  const { findOrder, submitting, error } = useOrders();
  const [form, setForm] = useState({
    orderCode: '',
    phone: '',
  });
  const [order, setOrder] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await findOrder({
      orderCode: form.orderCode,
      phone: form.phone,
    });
    setOrder(result);
    setNotFound(!result);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <section className="section-shell p-6 md:p-8">
        <div className="grid gap-6 md:grid-cols-[1fr,1.15fr]">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600">
              অর্ডার ট্র্যাকিং
            </p>
            <h2 className="text-3xl font-extrabold leading-tight text-ink">
              আপনার অর্ডারের বর্তমান অবস্থা দেখুন
            </h2>
            <p className="text-sm leading-7 text-brand-700">
              অর্ডার কোড আর ফোন নম্বর দিলে status, custom message, delivery date সব দেখাবে।
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <input
              required
              className="field-base"
              placeholder="অর্ডার কোড"
              value={form.orderCode}
              onChange={(event) => setForm((prev) => ({ ...prev, orderCode: event.target.value }))}
            />
            <input
              required
              className="field-base"
              placeholder="ফোন নম্বর"
              value={form.phone}
              onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
            />
            <button type="submit" className="btn-primary w-full" disabled={submitting}>
              {submitting ? 'খোঁজা হচ্ছে...' : 'অর্ডার দেখুন'}
            </button>
          </form>
        </div>
      </section>

      {error && (
        <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {notFound && !order && (
        <div className="section-shell p-8 text-center text-brand-700">
          মিলিয়ে কোনো অর্ডার পাওয়া যায়নি।
        </div>
      )}

      {order && (
        <section className="section-shell p-6 md:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-2xl font-bold text-ink">{order.order_code}</h3>
                <OrderStatusBadge status={order.status} />
              </div>
              <p className="text-sm text-brand-700">
                অর্ডারের সময়: {formatBanglaDateTime(order.created_at)}
              </p>
              <p className="text-sm text-brand-700">
                ডেলিভারি তারিখ: {formatBanglaDate(order.delivery_date)}
              </p>
            </div>

            <div className="rounded-3xl bg-brand-50 px-5 py-4">
              <p className="text-sm text-brand-700">মোট পরিশোধযোগ্য</p>
              <p className="mt-1 text-3xl font-extrabold text-ink">
                {formatBanglaCurrency(order.total_amount)}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
            <div className="surface-muted p-5">
              <p className="text-sm font-semibold text-brand-700">অর্ডার আইটেম</p>
              <div className="mt-4 space-y-3">
                {(order.order_items || order.items || []).map((item) => (
                  <div
                    key={item.id || `${item.product_name_bn}-${item.quantity}`}
                    className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm"
                  >
                    <span>
                      {item.product_name_bn} x {formatBanglaNumber(item.quantity)}
                    </span>
                    <span>{formatBanglaCurrency(item.line_total)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="surface-muted p-5">
                <p className="text-sm font-semibold text-brand-700">ডেলিভারি ঠিকানা</p>
                <p className="mt-2 leading-7 text-ink">{order.address_bn}</p>
              </div>
              <div className="surface-muted p-5">
                <p className="text-sm font-semibold text-brand-700">অ্যাডমিন মেসেজ</p>
                <p className="mt-2 leading-7 text-ink">
                  {order.status_message_bn || 'এখনও কোনো অতিরিক্ত মেসেজ দেওয়া হয়নি।'}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default TrackOrderPage;
