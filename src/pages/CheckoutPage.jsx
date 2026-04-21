import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CheckoutForm from '../components/checkout/CheckoutForm';
import OrderSummaryCard from '../components/checkout/OrderSummaryCard';
import { useCart } from '../hooks/useCart';
import { useOrders } from '../hooks/useOrders';
import { useProducts } from '../hooks/useProducts';
import { supabase } from '../lib/supabase';
import {
  buildOrderCode,
  calculateDeliveryCharge,
  formatBanglaCurrency,
  getAreaMeta,
  getOrderDeliveryInfo,
  isAreaEligible,
} from '../lib/utils';

const INITIAL_FORM = {
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
  const { submitOrder, submitting, error: orderError } = useOrders();

  // ✅ Load cached form (without transactionId)
  const [form, setForm] = useState(() => {
    const saved = localStorage.getItem('checkout_form');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...INITIAL_FORM,
        ...parsed,
        transactionId: '',
      };
    }
    return INITIAL_FORM;
  });

  const [successOrder, setSuccessOrder] = useState(null);

  // Coupon
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  // ✅ Auto-save form (excluding transactionId)
  useEffect(() => {
    const { transactionId, ...rest } = form;
    localStorage.setItem('checkout_form', JSON.stringify(rest));
  }, [form]);

  // ✅ Handle change
  const handleChange = (field, value) => {
    setForm((prev) => {
      if (field === 'paymentMethod' && value !== 'bkash') {
        return {
          ...prev,
          paymentMethod: value,
          transactionId: '',
        };
      }

      return {
        ...prev,
        [field]: value,
      };
    });
  };

  // --- Calculations ---
  const numericSubtotal = Number(subtotal) || 0;

  const freeDeliveryThreshold = useMemo(() => {
    const val = Number(settings?.free_delivery_on);
    return isNaN(val) || val <= 0 ? 1000 : val;
  }, [settings]);

  const isFreeDelivery = numericSubtotal >= freeDeliveryThreshold;

  const deliveryCharge = useMemo(() => {
    if (isFreeDelivery) return 0;
    return calculateDeliveryCharge(settings, form.area);
  }, [settings, form.area, isFreeDelivery]);

  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;

    if (appliedCoupon.discount_type === 'percent') {
      return (numericSubtotal * appliedCoupon.value) / 100;
    }

    return appliedCoupon.value;
  }, [appliedCoupon, numericSubtotal]);

  const safeDiscount = Math.min(discountAmount, numericSubtotal);
  const totalAmount = numericSubtotal + deliveryCharge - safeDiscount;

  const eligible = isAreaEligible(settings, form.area);

  // --- Coupon ---
  const handleApplyCoupon = async () => {
    setCouponError('');
    if (!couponCode) return;

    try {
      const { data } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.trim().toUpperCase())
        .eq('is_active', true)
        .maybeSingle();

      if (!data) throw new Error('কুপনটি সঠিক নয়');

      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        throw new Error('কুপনটির মেয়াদ শেষ');
      }

      if (numericSubtotal < data.min_order_amount) {
        throw new Error(
          `ন্যূনতম ${formatBanglaCurrency(data.min_order_amount)} টাকার অর্ডার প্রয়োজন`
        );
      }

      setAppliedCoupon(data);
    } catch (err) {
      setCouponError(err.message);
      setAppliedCoupon(null);
    }
  };

  // --- Submit ---
  const handleSubmit = async (event) => {
    event.preventDefault();

    // ✅ Validation
    if (!form.name || !form.phone || !form.address || !form.area) {
      return;
    }

    if (form.paymentMethod === 'bkash' && !form.transactionId) {
      return;
    }

    const deliveryInfo = getOrderDeliveryInfo(settings);
    const orderCode = buildOrderCode();

    const payload = {
      customer_name: form.name,
      phone: form.phone,
      address_bn: form.address,
      area: form.area,
      area_name_bn: getAreaMeta(form.area).name,
      payment_method: form.paymentMethod,
      bkash_transaction_id:
        form.paymentMethod === 'bkash' ? form.transactionId : null,
      subtotal: numericSubtotal,
      discount_amount: safeDiscount,
      coupon_used: appliedCoupon?.code || null,
      delivery_charge: deliveryCharge,
      total_amount: totalAmount,
      delivery_date: deliveryInfo.deliveryDate.toISOString(),
      delivery_type: deliveryInfo.deliveryType,
      order_code: orderCode,
      status: 'pending',
      status_message_bn: 'আপনার অর্ডার গ্রহণ করা হয়েছে।',
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

    if (createdOrder) {
      setSuccessOrder(createdOrder);
      clearCart();

      // ✅ keep user info, only clear transaction ID
setForm((prev) => ({
  ...prev,
  transactionId: '',
}));

    }
  };

  // --- Empty Cart ---
  if (!items.length && !successOrder) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <h2 className="text-3xl font-black text-slate-900">ব্যাগটি খালি!</h2>
        <Link
          to="/"
          className="mt-6 inline-block bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold"
        >
          বাজারে ফিরুন
        </Link>
      </div>
    );
  }

  // --- Success ---
  if (successOrder) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl">
          <div className="text-5xl mb-6">🎉</div>
          <h2 className="text-3xl font-black text-slate-900">
            অর্ডার সফল হয়েছে!
          </h2>
          <p className="mt-4 text-slate-500 font-bold">
            অর্ডার কোড:{' '}
            <span className="text-emerald-600">
              #{successOrder.order_code}
            </span>
          </p>
          <div className="mt-8 flex gap-4 justify-center">
            <Link
              to="/track"
              className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold"
            >
              ট্র্যাক করুন
            </Link>
            <Link
              to="/"
              className="bg-slate-100 text-slate-900 px-8 py-4 rounded-2xl font-bold"
            >
              আবার বাজার করুন
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --- Main UI ---
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 bg-slate-50 min-h-screen">
      <div className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">

        {/* Left */}
        <CheckoutForm
          form={form}
          onChange={handleChange}
          onSubmit={handleSubmit}
          submitting={submitting}
          settings={settings}
          isEligible={eligible}
          error={orderError}
        />

        {/* Right */}
        <div className="space-y-6">

          {/* Coupon */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <h4 className="font-black text-slate-900 mb-4">
              ডিসকাউন্ট কুপন
            </h4>

            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="কুপন কোড লিখুন"
                className="flex-grow bg-slate-50 rounded-xl px-5 font-bold uppercase"
              />

              <button
                onClick={handleApplyCoupon}
                className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-black"
              >
                Apply
              </button>
            </div>

            {couponError && (
              <p className="text-red-500 text-xs mt-3 font-black">
                ❌ {couponError}
              </p>
            )}

            {appliedCoupon && (
              <p className="text-emerald-600 text-xs mt-3 font-black italic">
                ✓ {appliedCoupon.code} কুপন যুক্ত হয়েছে!
              </p>
            )}
          </div>

          <OrderSummaryCard
            items={items}
            subtotal={numericSubtotal}
            deliveryCharge={deliveryCharge}
            discount={safeDiscount}
            totalAmount={totalAmount}
          />
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;