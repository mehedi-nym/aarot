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
        <div>
          <h2 className="text-2xl font-extrabold text-ink">চেকআউট</h2>
          <p className="mt-2 text-sm leading-7 text-brand-700">
            আপনার অর্ডার দ্রুত কনফার্ম করতে সঠিক তথ্য দিন। bKash পেমেন্ট করলে নিচের
            নম্বরে পাঠিয়ে ট্রানজেকশন আইডি লিখুন: {settings?.bkash_number}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-brand-700">নাম</span>
            <input
              required
              className="field-base"
              value={form.name}
              onChange={(event) => onChange('name', event.target.value)}
              placeholder="আপনার নাম"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-brand-700">ফোন</span>
            <input
              required
              className="field-base"
              value={form.phone}
              onChange={(event) => onChange('phone', event.target.value)}
              placeholder="01XXXXXXXXX"
            />
          </label>
        </div>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-brand-700">সম্পূর্ণ ঠিকানা</span>
          <textarea
            required
            rows="4"
            className="field-base resize-none"
            value={form.address}
            onChange={(event) => onChange('address', event.target.value)}
            placeholder="বাড়ি/রোড/ফ্ল্যাট তথ্য লিখুন"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-brand-700">এরিয়া</span>
            <select
              className="field-base"
              value={form.area}
              onChange={(event) => onChange('area', event.target.value)}
            >
              {AREA_OPTIONS.map((area) => (
                <option key={area.slug} value={area.slug}>
                  {area.name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-brand-700">পেমেন্ট মেথড</span>
            <select
              className="field-base"
              value={form.paymentMethod}
              onChange={(event) => onChange('paymentMethod', event.target.value)}
            >
              <option value="cod">ক্যাশ অন ডেলিভারি</option>
              <option value="bkash">bKash</option>
            </select>
          </label>
        </div>

        {form.paymentMethod === 'bkash' && (
          <label className="space-y-2">
            <span className="text-sm font-semibold text-brand-700">bKash ট্রানজেকশন আইডি</span>
            <input
              required
              className="field-base"
              value={form.transactionId}
              onChange={(event) => onChange('transactionId', event.target.value)}
              placeholder="যেমন: 8A6B2C1D"
            />
          </label>
        )}

        {!isEligible && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            দুঃখিত, এই এরিয়াটি বর্তমানে সেট করা ডেলিভারি রেডিয়াসের বাইরে।
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <button type="submit" className="btn-primary w-full" disabled={submitting || !isEligible}>
          {submitting ? 'অর্ডার পাঠানো হচ্ছে...' : 'অর্ডার নিশ্চিত করুন'}
        </button>
      </div>
    </form>
  );
}

export default CheckoutForm;
