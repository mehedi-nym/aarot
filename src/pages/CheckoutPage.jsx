import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import CheckoutForm from '../components/checkout/CheckoutForm';
import OrderSummaryCard from '../components/checkout/OrderSummaryCard';
import { useCart } from '../hooks/useCart';
import { useOrders } from '../hooks/useOrders';
import { useProducts } from '../hooks/useProducts';
import {
  buildOrderCode,
  calculateDeliveryCharge,
  formatBanglaCurrency,
  formatBanglaDate,
  getAreaMeta,
  getOrderDeliveryInfo,
  isAreaEligible,
} from '../lib/utils';

const initialForm = {
  name: '',
  phone: '',
  address: '',
  area: 'dhanmondi',
  paymentMethod: 'cod',
  transactionId: '',
};

function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { settings } = useProducts();
  const { submitOrder, submitting, error } = useOrders();
  const [form, setForm] = useState(initialForm);
  const [successOrder, setSuccessOrder] = useState(null);

  const deliveryCharge = useMemo(
    () => calculateDeliveryCharge(settings, form.area),
    [settings, form.area],
  );
  const eligible = isAreaEligible(settings, form.area);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const deliveryInfo = getOrderDeliveryInfo(settings);
    const orderCode = buildOrderCode();

    const payload = {
      customer_name: form.name,
      phone: form.phone,
      address_bn: form.address,
      area: form.area,
      area_name_bn: getAreaMeta(form.area).name,
      payment_method: form.paymentMethod,
      bkash_transaction_id: form.paymentMethod === 'bkash' ? form.transactionId : null,
      subtotal,
      delivery_charge: deliveryCharge,
      total_amount: subtotal + deliveryCharge,
      delivery_date: deliveryInfo.deliveryDate.toISOString(),
      delivery_type: deliveryInfo.deliveryType,
      order_code: orderCode,
      status: 'pending',
      status_message_bn: 'আপনার অর্ডার গ্রহণ করা হয়েছে।',
      items: items.map((item) => ({
        product_id: item.id,
        product_name_bn: item.name_bn,
        sell_type: item.sell_type,
        unit_price: item.price,
        quantity: item.quantity,
        line_total: Number(item.price) * Number(item.quantity),
      })),
    };

    const createdOrder = await submitOrder(payload);
    setSuccessOrder(createdOrder);
    clearCart();
    setForm(initialForm);
  };

  if (!items.length && !successOrder) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="section-shell p-10 text-center">
          <h2 className="text-3xl font-extrabold text-ink">আপনার কার্ট এখন খালি</h2>
          <p className="mt-3 text-sm text-brand-700">
            আজকের fresh পণ্য দেখে অর্ডার দিতে হোমপেজে ফিরে যান।
          </p>
          <Link to="/" className="btn-primary mt-6">
            বাজারে ফিরুন
          </Link>
        </div>
      </div>
    );
  }

  if (successOrder) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="section-shell p-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-brand-600">
            অর্ডার সফল
          </p>
          <h2 className="mt-3 text-3xl font-extrabold text-ink">অর্ডার কনফার্ম হয়েছে</h2>
          <p className="mt-4 text-sm leading-7 text-brand-700">
            অর্ডার কোড <span className="font-bold text-ink">{successOrder.order_code}</span>। ডেলিভারি
            তারিখ {formatBanglaDate(successOrder.delivery_date || successOrder.created_at)}।
          </p>
          <p className="mt-2 text-sm text-brand-700">
            মোট বিল: {formatBanglaCurrency(successOrder.total_amount)}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link to="/track" className="btn-primary">
              অর্ডার ট্র্যাক করুন
            </Link>
            <Link to="/" className="btn-secondary">
              আবার কেনাকাটা
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <CheckoutForm
          form={form}
          onChange={handleChange}
          onSubmit={handleSubmit}
          submitting={submitting}
          settings={settings}
          isEligible={eligible}
          error={error}
        />
        <OrderSummaryCard settings={settings} selectedArea={form.area} />
      </div>
    </div>
  );
}

export default CheckoutPage;
