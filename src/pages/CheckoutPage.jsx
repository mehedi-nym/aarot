import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CheckoutForm from '../components/checkout/CheckoutForm';
import OrderSummaryCard from '../components/checkout/OrderSummaryCard';
import OrderProcessingModal from '../components/checkout/OrderProcessingModal';
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
  getLinePrice,
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

function CouponTicket({ coupon, onApply }) {
  const isFreeDelivery = coupon.discount_type === 'free_delivery';

  return (
    <button
      type="button"
      onClick={onApply}
      className="flex w-64 shrink-0 overflow-hidden rounded-2xl border border-amber-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div
        className={`flex w-20 shrink-0 flex-col items-center justify-center gap-1 px-2 py-4 text-center text-white ${
          isFreeDelivery
            ? 'bg-gradient-to-b from-brand-600 to-brand-700'
            : 'bg-gradient-to-b from-amber-500 to-amber-600'
        }`}
      >
        {isFreeDelivery ? (
          <>
            <span className="text-2xl leading-none">🚚</span>
            <span className="text-[9px] font-black uppercase tracking-wide">ফ্রি ডেলিভারি</span>
          </>
        ) : (
          <>
            <span className="text-lg font-black leading-none">
              {coupon.discount_type === 'percent' ? `${coupon.value}%` : `৳${coupon.value}`}
            </span>
            <span className="text-[9px] font-black uppercase tracking-wide">ছাড়</span>
          </>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-center gap-1 border-l-2 border-dashed border-amber-200 px-3 py-3">
        <p className="text-xs font-black uppercase tracking-wide text-slate-900">{coupon.code}</p>
        <p className="text-[10px] font-semibold text-slate-400">
          {coupon.min_order_amount
            ? `ন্যূনতম ${formatBanglaCurrency(coupon.min_order_amount)}`
            : 'কোনো শর্ত নেই'}
        </p>
        <span className="mt-1 inline-block w-fit rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-bold text-white">
          প্রয়োগ করুন
        </span>
      </div>
    </button>
  );
}

function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { deliveryAreas, settings } = useProducts();
  const { submitOrder, submitting, error: orderError } = useOrders();

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

  const [fieldErrors, setFieldErrors] = useState({});
  const [successOrder, setSuccessOrder] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [featuredCoupons, setFeaturedCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

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

    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const numericSubtotal = Number(subtotal) || 0;

  const freeDeliveryThreshold = useMemo(() => {
    const val = Number(settings?.free_delivery_on);
    return isNaN(val) || val <= 0 ? 1000 : val;
  }, [settings]);

  const isFreeDeliveryByThreshold = numericSubtotal >= freeDeliveryThreshold;
  const isFreeDeliveryByCoupon = appliedCoupon?.discount_type === 'free_delivery';

  const baseDeliveryCharge = useMemo(() => {
    if (isFreeDeliveryByThreshold) return 0;
    return calculateDeliveryCharge(settings, form.area, deliveryAreas);
  }, [deliveryAreas, settings, form.area, isFreeDeliveryByThreshold]);

  const effectiveDeliveryCharge = isFreeDeliveryByCoupon ? 0 : baseDeliveryCharge;

  const discountAmount = useMemo(() => {
    if (!appliedCoupon || isFreeDeliveryByCoupon) return 0;

    if (appliedCoupon.discount_type === 'percent') {
      return (numericSubtotal * appliedCoupon.value) / 100;
    }

    return appliedCoupon.value;
  }, [appliedCoupon, numericSubtotal, isFreeDeliveryByCoupon]);

  const safeDiscount = Math.min(discountAmount, numericSubtotal);
  const totalAmount = numericSubtotal + effectiveDeliveryCharge - safeDiscount;

  const eligible = isAreaEligible(settings, form.area, deliveryAreas);

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

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'নাম আবশ্যক';
    if (!/^01[0-9]{9}$/.test(form.phone.trim())) {
      next.phone = 'সঠিক নাম্বার দিন, যেমন: 01XXXXXXXXX';
    }
    if (!form.address.trim()) next.address = 'সম্পূর্ণ ঠিকানা লিখুন';
    if (!form.area) next.area = 'এরিয়া নির্বাচন করুন';
    if (form.paymentMethod === 'bkash' && !form.transactionId.trim()) {
      next.transactionId = 'বিকাশ ট্রানজেকশন আইডি আবশ্যক';
    }
    return next;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validate();
    setFieldErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      const firstErrorField = document.querySelector('[data-field-error="true"]');
      firstErrorField?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setIsProcessing(true);

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
      delivery_charge: effectiveDeliveryCharge,
      total_amount: totalAmount,
      delivery_date: deliveryInfo.deliveryDate.toISOString(),
      delivery_type: deliveryInfo.deliveryType,
      order_code: orderCode,
      status: 'pending',
      status_message_bn: 'আপনার অর্ডার গ্রহণ করা হয়েছে।',
      items: items.map((item) => {
        const itemPrice = getProductPrice(item);
        const linePrice = getLinePrice(item);

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
          line_total: linePrice,
        };
      }),
    };

    const startTime = Date.now();

    try {
      const createdOrder = await submitOrder(payload);

      if (createdOrder) {
        const elapsedTime = Date.now() - startTime;
        const remainingDelay = Math.max(0, 3000 - elapsedTime);

        setTimeout(() => {
          setSuccessOrder(createdOrder);
          clearCart();
          setForm((prev) => ({
            ...prev,
            transactionId: '',
          }));
          setIsProcessing(false);
        }, remainingDelay);
      } else {
        setIsProcessing(false);
      }
    } catch (err) {
      console.error('Order submission failed:', err);
      setIsProcessing(false);
    }
  };

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

  if (successOrder) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center sm:py-16">
        <div className="section-shell p-6 shadow-soft sm:p-10">
          <div className="mb-6 flex justify-center">
            <img 
              src="https://bmqsgrrrravkziwbmyll.supabase.co/storage/v1/object/public/asset/stars.png" 
              alt="Success" 
              className="h-16 w-16 object-contain" 
            />
          </div>
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

  return (
    <div className="mx-auto w-full max-w-7xl px-3 py-5 pb-28 sm:px-6 sm:py-8 lg:px-8 lg:pb-8">
      <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
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

      <div className="section-shell mb-5 p-4 sm:mb-8 sm:p-5 md:p-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base font-black text-ink sm:text-lg">
            <img 
              src="https://bmqsgrrrravkziwbmyll.supabase.co/storage/v1/object/public/asset/promo%20(1).png" 
              alt="Promo Icon" 
              className="h-6 w-6 object-contain"
            />
            আপনার জন্য অফার
          </h2>
          {appliedCoupon && (
            <button
              type="button"
              onClick={handleRemoveCoupon}
              className="text-xs font-bold text-slate-400 underline underline-offset-2"
            >
              কুপন সরান
            </button>
          )}
        </div>

        {appliedCoupon ? (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <img 
              src="https://bmqsgrrrravkziwbmyll.supabase.co/storage/v1/object/public/asset/checked.png" 
              alt="Checked" 
              className="h-6 w-6 shrink-0 object-contain" 
            />
            <div>
              <p className="text-sm font-black text-emerald-700">
                {appliedCoupon.code} প্রয়োগ করা হয়েছে
              </p>
              <p className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                {isFreeDeliveryByCoupon ? (
                  <>
                    <span>ডেলিভারি চার্জ ফ্রি হয়ে গেছে</span>
                    <img
                      src="https://bmqsgrrrravkziwbmyll.supabase.co/storage/v1/object/public/asset/fast-delivery.png"
                      alt="Delivery"
                      className="h-4 w-4 shrink-0 object-contain"
                    />
                  </>
                ) : (
                  `${formatBanglaCurrency(safeDiscount)} বাঁচলো`
                )}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {featuredCoupons.length > 0 && (
              <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
                {featuredCoupons.map((coupon) => (
                  <CouponTicket
                    key={coupon.id}
                    coupon={coupon}
                    onApply={() => handleApplyCoupon(coupon.code)}
                  />
                ))}
              </div>
            )}

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
                প্রয়োগ করুন
              </button>
            </div>

            {couponError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                {couponError}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[minmax(0,1.05fr),minmax(340px,0.95fr)] lg:items-start lg:gap-8">
        <div className="order-1 lg:order-1 lg:col-start-1">
          <CheckoutForm
            form={form}
            onChange={handleChange}
            onSubmit={handleSubmit}
            submitting={submitting || isProcessing}
            settings={settings}
            isEligible={eligible}
            orderError={orderError}
            fieldErrors={fieldErrors}
            deliveryAreas={deliveryAreas}
            totalAmount={totalAmount}
          />
        </div>

        <div className="order-2 lg:order-2 lg:col-start-2">
          <OrderSummaryCard
            items={items}
            subtotal={numericSubtotal}
            deliveryCharge={effectiveDeliveryCharge}
            discount={safeDiscount}
            totalAmount={totalAmount}
            settings={settings}
            freeDeliveryReason={
              isFreeDeliveryByCoupon ? 'coupon' : isFreeDeliveryByThreshold ? 'threshold' : null
            }
          />
        </div>
      </div>

      <OrderProcessingModal isOpen={isProcessing || submitting} />
    </div>
  );
}

export default CheckoutPage;