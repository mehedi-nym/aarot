import { AREA_OPTIONS } from '../../lib/constants';

function CheckoutForm({
  form,
  onChange,
  onSubmit,
  submitting,
  settings,
  isEligible,
  error,
}) {
  return (
    <form className="section-shell p-5 md:p-6" onSubmit={onSubmit}>
      <div className="space-y-6">

        {/* Header */}
        <div>
          <h2 className="text-2xl font-extrabold text-ink tracking-tight">
            চেকআউট
          </h2>
          <p className="mt-2 text-sm leading-7 text-brand-700">
            আপনার তথ্য সঠিকভাবে দিন। অর্ডার দ্রুত প্রসেস করা হবে।
          </p>
        </div>
        {form.name && (
  <p className="text-xs text-green-600 font-bold mt-2">
    ✔ আপনার তথ্য সংরক্ষিত আছে
  </p>
)}

        {/* Name + Phone */}
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-brand-700">নাম</span>
            <input
              required
              className="field-base"
              value={form.name}
              onChange={(e) => onChange('name', e.target.value)}
              placeholder="আপনার নাম"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-brand-700">ফোন</span>
            <input
              required
              type="tel"
              pattern="01[0-9]{9}"
              className="field-base"
              value={form.phone}
              onChange={(e) => onChange('phone', e.target.value)}
              placeholder="01XXXXXXXXX"
            />
          </label>
        </div>

        {/* Address */}
        <label className="space-y-2 block">
          <span className="text-sm font-semibold text-brand-700">
            সম্পূর্ণ ঠিকানা
          </span>
          <textarea
            required
            rows="3"
            className="field-base resize-none"
            value={form.address}
            onChange={(e) => onChange('address', e.target.value)}
            placeholder="বাড়ি / রোড / এলাকা"
          />
        </label>

        {/* Area */}
        <label className="space-y-2 block">
          <span className="text-sm font-semibold text-brand-700">
            ডেলিভারি এরিয়া
          </span>
          <select
            required
            className="field-base"
            value={form.area}
            onChange={(e) => onChange('area', e.target.value)}
          >
            <option value="">এরিয়া নির্বাচন করুন</option>
            {AREA_OPTIONS.map((area) => (
              <option key={area.slug} value={area.slug}>
                {area.name}
              </option>
            ))}
          </select>
        </label>

        {/* Payment Method */}
        <div className="space-y-3">
          <span className="text-sm font-semibold text-brand-700">
            পেমেন্ট মেথড
          </span>

          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'cod', label: 'Cash on Delivery' },
              { id: 'bkash', label: 'bKash' },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => onChange('paymentMethod', m.id)}
                className={`py-3 rounded-xl border text-sm font-semibold transition ${
                  form.paymentMethod === m.id
                    ? 'bg-ink text-white border-ink'
                    : 'bg-white border-slate-200 text-brand-700 hover:border-slate-300'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* bKash Section */}
        {form.paymentMethod === 'bkash' && (
          <div className="rounded-[1.5rem] border border-slate-100 bg-slate-50/60 p-5 space-y-4">
            
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-brand-700">
                bKash Number
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

            <p className="text-lg font-extrabold text-ink tracking-wider">
              {settings?.bkash_number || '017XXXXXXXX'}
            </p>

            <label className="space-y-2 block">
              <span className="text-sm font-semibold text-brand-700">
                Transaction ID
              </span>
              <input
                required
                className="field-base"
                value={form.transactionId}
                onChange={(e) =>
                  onChange('transactionId', e.target.value)
                }
                placeholder="TXN ID"
              />
            </label>
          </div>
        )}

        {/* Eligibility + Error */}
        {!isEligible && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            এই এরিয়াটি ডেলিভারির বাইরে
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting || !isEligible}
          className="btn-primary color-emerald-600 w-full py-4 rounded-2xl text-base font-bold"
        >
          {submitting ? 'অর্ডার প্রসেস হচ্ছে...' : 'অর্ডার কনফার্ম করুন'}
        </button>
      </div>
    </form>
  );
}

export default CheckoutForm;