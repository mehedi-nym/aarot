import { getAreaName } from '../../lib/utils';

const PAYMENT_METHODS = [
  {
    id: 'cod',
    label: 'ক্যাশ অন ডেলিভারি',
    hint: 'হাতে পেয়ে টাকা দিন',
    icon: 'https://bmqsgrrrravkziwbmyll.supabase.co/storage/v1/object/public/asset/cash-on-delivery.png',
  },
  {
    id: 'bkash',
    label: 'বিকাশ / নগদ',
    hint: 'সেন্ড মানি করে অর্ডার করুন',
    icon: 'https://bmqsgrrrravkziwbmyll.supabase.co/storage/v1/object/public/asset/online-payment.png',
  },
];

function FieldError({ message }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 text-xs font-bold text-red-600" data-field-error="true">
      {message}
    </p>
  );
}

function CheckoutForm({
  form,
  onChange,
  onSubmit,
  submitting,
  settings,
  isEligible,
  orderError,
  fieldErrors = {},
  deliveryAreas = [],
  totalAmount = 0,
}) {
  const inputClass = (field) =>
    `field-base ${fieldErrors[field] ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : ''}`;

  return (
    <form className="section-shell p-4 pb-24 sm:p-5 sm:pb-24 md:p-6 lg:pb-6" onSubmit={onSubmit}>
      <div className="space-y-6 sm:space-y-7">

        {/* Header */}
        <div>
          <h2 className="text-2xl font-extrabold text-ink tracking-tight">
            চেকআউট
          </h2>
          <p className="mt-2 text-sm leading-7 text-brand-700">
            আপনার তথ্য সঠিকভাবে দিন। অর্ডার দ্রুত প্রসেস করা হবে।
          </p>
        </div>

        {/* Step 1: Delivery details */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-xs font-black text-white">
              ১
            </span>
            <h3 className="text-sm font-black uppercase tracking-wide text-slate-700">
              ডেলিভারি তথ্য
            </h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-brand-700">নাম</span>
              <input
                className={inputClass('name')}
                value={form.name}
                onChange={(e) => onChange('name', e.target.value)}
                placeholder="আপনার নাম"
                aria-invalid={Boolean(fieldErrors.name)}
              />
              <FieldError message={fieldErrors.name} />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-brand-700">ফোন</span>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={11}
                className={inputClass('phone')}
                value={form.phone}
                onChange={(e) => onChange('phone', e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="01XXXXXXXXX"
                aria-invalid={Boolean(fieldErrors.phone)}
              />
              <FieldError message={fieldErrors.phone} />
            </label>
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-brand-700">
              সম্পূর্ণ ঠিকানা
            </span>
            <textarea
              rows="3"
              className={`${inputClass('address')} resize-none`}
              value={form.address}
              onChange={(e) => onChange('address', e.target.value)}
              placeholder="বাড়ি / রোড / এলাকা"
              aria-invalid={Boolean(fieldErrors.address)}
            />
            <FieldError message={fieldErrors.address} />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-brand-700">
              ডেলিভারি এরিয়া
            </span>
            <select
              className={inputClass('area')}
              value={form.area}
              onChange={(e) => onChange('area', e.target.value)}
              aria-invalid={Boolean(fieldErrors.area)}
            >
              <option value="">এরিয়া নির্বাচন করুন</option>
              {deliveryAreas.map((area) => (
                <option key={area.slug} value={area.slug}>
                  {getAreaName(area)}
                </option>
              ))}
            </select>
            <FieldError message={fieldErrors.area} />
            {!isEligible && (
              <p className="mt-1.5 text-xs font-bold text-red-600">
                এই এরিয়াটি এখনও ডেলিভারির বাইরে
              </p>
            )}
          </label>
        </div>

        {/* Step 2: Payment */}
        <div className="space-y-3 border-t border-brand-50 pt-6">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-xs font-black text-white">
              ২
            </span>
            <h3 className="text-sm font-black uppercase tracking-wide text-slate-700">
              পেমেন্ট মেথড
            </h3>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
  {PAYMENT_METHODS.map((m) => (
    <button
      key={m.id}
      type="button"
      onClick={() => onChange('paymentMethod', m.id)}
      className={`flex min-h-[3.75rem] items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${
        form.paymentMethod === m.id
          ? 'border-ink bg-ink text-white'
          : 'border-slate-200 bg-white text-brand-700 hover:border-slate-300'
      }`}
    >
      <img
        src={m.icon}
        alt={m.label}
        className="h-10 w-10 shrink-0 object-contain"
      />
      <div>
        <span className="block text-sm font-bold">{m.label}</span>
        <span
          className={`block text-[11px] font-semibold ${
            form.paymentMethod === m.id ? 'text-white/70' : 'text-slate-400'
          }`}
        >
          {m.hint}
        </span>
      </div>
    </button>
  ))}
</div>

          {form.paymentMethod === 'bkash' && (
            <div className="rounded-[1.5rem] border border-brand-100 bg-brand-50/70 p-4 space-y-4 sm:p-5">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-semibold text-brand-700">
                  বিকাশ নাম্বার (Send Money)
                </p>
                <button
                  type="button"
                  onClick={() =>
                    navigator.clipboard.writeText(settings?.bkash_number || '')
                  }
                  className="text-xs font-bold text-ink hover:underline"
                >
                  কপি
                </button>
              </div>

              <p className="break-words text-lg font-extrabold text-ink tracking-wider">
                {settings?.bkash_number || '017XXXXXXXX'}
              </p>

              <label className="block space-y-2">
                <span className="text-sm font-semibold text-brand-700">
                  Transaction ID
                </span>
                <input
                  className={inputClass('transactionId')}
                  value={form.transactionId}
                  onChange={(e) => onChange('transactionId', e.target.value)}
                  placeholder="TXN ID"
                  aria-invalid={Boolean(fieldErrors.transactionId)}
                />
                <FieldError message={fieldErrors.transactionId} />
              </label>
            </div>
          )}
        </div>

        {orderError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            {orderError}
          </div>
        )}

        {/* Desktop submit — hidden below lg, wrapper controls visibility so btn-primary's own display never conflicts */}
<div className="hidden lg:block">
  <button
    type="submit"
    disabled={submitting || !isEligible}
    className="btn-primary w-full rounded-2xl py-4 text-base font-bold"
  >
    {submitting ? 'অর্ডার প্রসেস হচ্ছে...' : `অর্ডার কনফার্ম করুন - ${totalAmount ? '৳' + Math.round(totalAmount) : ''}`}
  </button>
</div>

      {/* Mobile sticky bar — total + CTA always reachable, no scrolling to the bottom */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-brand-100 bg-white/95 px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] backdrop-blur lg:hidden"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
        <div className="leading-tight">
          <p className="text-[11px] font-bold text-slate-400">সর্বমোট</p>
          <p className="text-lg font-black text-ink">৳{Math.round(totalAmount)}</p>
        </div>
        <button
          type="submit"
          disabled={submitting || !isEligible}
          className="btn-primary flex-1 rounded-2xl py-3.5 text-sm font-bold disabled:opacity-60"
        >
          {submitting ? 'প্রসেস হচ্ছে...' : 'অর্ডার কনফার্ম করুন'}
        </button>
      </div>
      </div>
    </form>
  );
}

export default CheckoutForm;