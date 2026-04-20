import { useState } from 'react';
import { ORDER_STATUSES } from '../../lib/constants';
import {
  formatBanglaCurrency,
  formatBanglaDate,
  formatBanglaDateTime,
  formatBanglaNumber,
} from '../../lib/utils';
import OrderStatusBadge from '../OrderStatusBadge';

function OrderManager({ orders, onUpdateStatus, submitting }) {
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [statusText, setStatusText] = useState('');

  return (
    <section className="section-shell p-5">
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-bold text-ink">অর্ডার ম্যানেজমেন্ট</h3>
          <p className="text-sm text-brand-700">স্ট্যাটাস ও কাস্টম মেসেজ আপডেট করুন</p>
        </div>

        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-[28px] border border-brand-100 p-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h4 className="text-lg font-bold text-ink">{order.customer_name}</h4>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <p className="text-sm text-brand-700">
                    কোড: <span className="font-semibold">{order.order_code}</span> • {order.phone}
                  </p>
                  <p className="text-sm text-brand-700">
                    ডেলিভারি: {formatBanglaDate(order.delivery_date)} • {order.area_name_bn}
                  </p>
                  <p className="text-sm text-brand-700">{order.address_bn}</p>
                </div>

                <div className="rounded-2xl bg-brand-50 px-4 py-3 text-right">
                  <p className="text-xs text-brand-700">মোট বিল</p>
                  <p className="text-2xl font-extrabold text-ink">
                    {formatBanglaCurrency(order.total_amount)}
                  </p>
                  <p className="text-xs text-brand-500">{formatBanglaDateTime(order.created_at)}</p>
                </div>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-[1fr,1.25fr]">
                <div className="surface-muted p-4">
                  <p className="text-sm font-semibold text-brand-700">অর্ডার আইটেম</p>
                  <div className="mt-3 space-y-2">
                    {(order.order_items || order.items || []).map((item) => (
                      <div
                        key={item.id || `${item.product_name_bn}-${item.quantity}`}
                        className="flex items-center justify-between text-sm text-ink"
                      >
                        <span>
                          {item.product_name_bn} x {formatBanglaNumber(item.quantity)}
                        </span>
                        <span>{formatBanglaCurrency(item.line_total)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <form
                  className="space-y-3"
                  onSubmit={async (event) => {
                    event.preventDefault();
                    const formData = new FormData(event.currentTarget);
                    const status = formData.get('status');
                    const message = formData.get('message');
                    setSelectedOrderId(order.id);
                    await onUpdateStatus({
                      orderId: order.id,
                      status,
                      status_message_bn: message,
                    });
                    setSelectedOrderId(null);
                    setStatusText('');
                  }}
                >
                  <select name="status" className="field-base" defaultValue={order.status}>
                    {ORDER_STATUSES.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                  <textarea
                    name="message"
                    rows="4"
                    className="field-base resize-none"
                    placeholder="গ্রাহককে দেখানোর কাস্টম মেসেজ"
                    defaultValue={order.status_message_bn || ''}
                    onChange={(event) => setStatusText(event.target.value)}
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-brand-600">
                      {statusText ? 'নতুন মেসেজ আপডেট হবে' : 'কোনো কাস্টম মেসেজ নেই'}
                    </p>
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={submitting && selectedOrderId === order.id}
                    >
                      {submitting && selectedOrderId === order.id
                        ? 'আপডেট হচ্ছে...'
                        : 'স্ট্যাটাস সেভ'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default OrderManager;
