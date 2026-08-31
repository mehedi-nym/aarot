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
  getAreaName,
  getOrderDeliveryInfo,
  getProductPrice,
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
  const { deliveryAreas, settings } = useProducts();
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

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  
  // Featured Coupons State
  const [featuredCoupons, setFeaturedCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);

  // ✅ Auto-save form (excluding transactionId)
  useEffect(() => {
    const { transactionId, ...rest } = form;
    localStorage.setItem('checkout_form', JSON.stringify(rest));
  }, [form]);

  useEffect(() => {
    if (!deliveryAreas.length) return;

    const hasSelectedArea = deliveryAreas.some((area) => area.slug === form.area);
    if (!hasSelectedArea) {
      setForm((current) => ({
        ...current,
        area: deliveryAreas[0].slug,
      }));
    }
  }, [deliveryAreas, form.area]);

  // ✅ Fetch Featured Coupons on mount
  useEffect(() => {
    const fetchFeaturedCoupons = async () => {
      setLoadingCoupons(true);
      try {
        const { data, error } = await supabase
          .from('coupons')
          .select('*')
          .eq('is_active', true)
          .eq('is_featured', true);

        if (error) throw error;

        // Filter out expired coupons on client side
        const now = new Date();
        const validCoupons = (data || []).filter((coupon) => {
          if (!coupon.expiry_date && !coupon.expires_at) return true;
          const expiry = new Date(coupon.expiry_date || coupon.expires_at);
          return expiry > now;
        });

        setFeaturedCoupons(validCoupons);
      } catch (err) {
        console.error('Error fetching featured coupons:', err);
      } finally {
        setLoadingCoupons(false);
      }
    };

    fetchFeaturedCoupons();
  }, []);

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
    return calculateDeliveryCharge(settings, form.area, deliveryAreas);
  }, [deliveryAreas, settings, form.area, isFreeDelivery]);

  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;

    if (appliedCoupon.discount_type === 'percent') {
      return (numericSubtotal * appliedCoupon.value) / 100;
    }

    return appliedCoupon.value;
  }, [appliedCoupon, numericSubtotal]);

  const safeDiscount = Math.min(discountAmount, numericSubtotal);
  const totalAmount = numericSubtotal + deliveryCharge - safeDiscount;

  const eligible = isAreaEligible(settings, form.area, deliveryAreas);

  // --- Coupon Logic ---
  const handleApplyCoupon = async (codeToApply) => {
    setCouponError('');
    const code = (typeof codeToApply === 'string' ? codeToApply : couponCode).trim().toUpperCase();

    if (!code) return;

    try {
      const { data } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code)
        .eq('is_active', true)
        .maybeSingle();

      if (!data) throw new Error('কুপনটি সঠিক নয়');

      const expiryDate = data.expiry_date || data.expires_at;
      if (expiryDate && new Date(expiryDate) < new Date()) {
        throw new Error('কুপনটির মেয়াদ শেষ');
      }

      if (numericSubtotal < Number(data.min_order_amount || 0)) {
        throw new Error(
          `ন্যূনতম ${formatBanglaCurrency(data.min_order_amount)} টাকার অর্ডার প্রয়োজন`
        );
      }

      setAppliedCoupon(data);
      setCouponCode(code);
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
    const selectedArea = getAreaMeta(form.area, deliveryAreas);

    const payload = {
      customer_name: form.name,
      phone: form.phone,
      address_bn: form.address,
      area: form.area,
      area_name_bn: getAreaName(selectedArea),
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
      items: items.map((item) => {
        const itemPrice = getProductPrice(item);

        return {
          product_id: item.is_custom_mix ? null : item.id,
          product_name_bn: item.mix_details_bn
            ? `${item.name_bn} - ${item.mix_details_bn}`
            : item.name_bn,
          product_image_url: item.image_url || '',
          regular_price: item.regular_price || item.price,
          sell_type: item.sell_type,
          unit_price: itemPrice,
          quantity: item.quantity,
          line_total: Number(itemPrice) * Number(item.quantity),
        };
      }),
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
      <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:py-20">
        <div className="section-shell px-5 py-12 sm:px-8">
          <h2 className="text-3xl font-black text-slate-900">ব্যাগটি খালি!</h2>
          <p className="mx-auto mt-3 max-w-md text-sm font-bold leading-7 text-brand-700">
            পছন্দের তাজা পণ্য ব্যাগে যোগ করে আবার চেকআউট করুন।
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex rounded-2xl bg-brand-600 px-8 py-4 font-bold text-white transition hover:bg-brand-700"
          >
            বাজারে ফিরুন
          </Link>
        </div>
      </div>
    );
  }

  // --- Success ---
  if (successOrder) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center sm:py-16">
        <div className="section-shell p-6 shadow-soft sm:p-10">
          <div className="mb-6 text-5xl">🎉</div>
          <h2 className="text-3xl font-black text-slate-900">
            অর্ডার সফল হয়েছে!
          </h2>
          <p className="mt-4 font-bold text-slate-500">
            অর্ডার কোড:{' '}
            <span className="text-emerald-600">
              #{successOrder.order_code}
            </span>
          </p>
          <div className="mt-8 grid gap-3 sm:flex sm:justify-center">
            <Link
              to="/track"
              className="rounded-2xl bg-brand-600 px-8 py-4 font-bold text-white transition hover:bg-brand-700"
            >
              ট্র্যাক করুন
            </Link>
            <Link
              to="/"
              className="rounded-2xl border border-brand-100 bg-white px-8 py-4 font-bold text-brand-800 transition hover:bg-brand-50"
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
    <div className="mx-auto w-full max-w-7xl px-3 py-5 sm:px-6 sm:py-8 lg:px-8">
      <div className="mb-5 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-brand-600">
            Checkout
          </p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-ink sm:text-3xl">
            অর্ডার কনফার্ম করুন
          </h1>
        </div>
        <Link
          to="/"
          className="inline-flex w-fit rounded-full border border-brand-100 bg-white/80 px-4 py-2 text-xs font-black text-brand-700 transition hover:bg-white"
        >
          বাজারে ফিরুন
        </Link>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr),minmax(340px,0.95fr)] lg:items-start lg:gap-8">
        {/* Left */}
        <CheckoutForm
          form={form}
          onChange={handleChange}
          onSubmit={handleSubmit}
          submitting={submitting}
          settings={settings}
          isEligible={eligible}
          error={orderError}
          deliveryAreas={deliveryAreas}
        />

        {/* Right */}
        <div className="space-y-5 lg:space-y-6">
          {/* Coupon */}
<div className="section-shell p-4 sm:p-5 md:p-6 space-y-4">
  <h2 className="text-2xl font-extrabold text-ink tracking-tight">
                 ডিসকাউন্ট কুপন
           </h2>
           
           <p className="mt-2 text-sm leading-7 text-brand-700">
  বিশেষ অফার (কুপনে ক্লিক করে ব্যবহার করুন):
  </p>

  {/* Featured Coupons Pill Cards */}
  {featuredCoupons.length > 0 && (
    <div className="flex flex-wrap gap-3">
      {featuredCoupons.map((coupon) => {
        const isSelected = appliedCoupon?.code === coupon.code;
        return (
          <button
            key={coupon.id}
            type="button"
            onClick={() => handleApplyCoupon(coupon.code)}
            className={`group flex items-center gap-3 rounded-2xl p-3 text-left transition-all ${
              isSelected
                ? 'bg-emerald-50 ring-2 ring-emerald-500'
                : 'bg-slate-100/70 hover:bg-slate-200/70'
            }`}
          >
            {/* Tag Icon Bubble */}
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition ${
                isSelected
                  ? 'bg-emerald-100 text-emerald-600'
                  : 'bg-white text-rose-500 shadow-sm'
              }`}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
            </div>

            {/* Code & Discount Info Stack */}
            <div className="pr-2 leading-tight">
              <p className="text-xs font-black uppercase tracking-wide text-slate-900">
                {coupon.code}
              </p>
              <p className="text-[11px] font-bold text-slate-400">
                {coupon.discount_type === 'percent'
                  ? `${coupon.value}% OFF`
                  : `${formatBanglaCurrency(coupon.value)} OFF`}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  )}

  {/* Coupon Input Field */}
  <div className="grid gap-3 sm:grid-cols-[1fr,auto]">
    <input
      type="text"
      value={couponCode}
      onChange={(e) => setCouponCode(e.target.value)}
      placeholder="কুপন কোড লিখুন"
      className="field-base font-bold uppercase"
    />

    <button
      type="button"
      onClick={() => handleApplyCoupon()}
      className="h-12 min-h-12 rounded-xl bg-ink px-6 text-sm font-semibold text-white transition hover:opacity-90"
    >
      প্রয়োগ করুন
    </button>
  </div>

  {/* Error Alert */}
  {couponError && (
    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
      {couponError}
    </div>
  )}

  {/* Applied Success Message */}
  {appliedCoupon && (
    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
      <span>✔</span>
      <span>{appliedCoupon.code} কুপনটি সফলভাবে যুক্ত হয়েছে!</span>
    </div>
  )}
</div>

          <OrderSummaryCard
            items={items}
            subtotal={numericSubtotal}
            deliveryCharge={deliveryCharge}
            discount={safeDiscount}
            totalAmount={totalAmount}
            settings={settings}
          />
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;