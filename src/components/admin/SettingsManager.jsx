import { useEffect, useState } from 'react';

function SettingsManager({ settings, onSave, submitting }) {
  const [form, setForm] = useState(settings);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  if (!form) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSave({
      ...form,
      delivery_radius_km: Number(form.delivery_radius_km),
      base_delivery_charge: Number(form.base_delivery_charge),
      per_km_delivery_charge: Number(form.per_km_delivery_charge),
    });
  };

  return (
    <section className="section-shell p-5">
      <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
        <div className="md:col-span-2">
          <h3 className="text-xl font-bold text-ink">সাইট সেটিংস</h3>
        </div>
        <textarea
          rows="4"
          className="field-base resize-none md:col-span-2"
          value={form.delivery_notice_bn}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, delivery_notice_bn: event.target.value }))
          }
        />
        <input
          type="number"
          className="field-base"
          value={form.delivery_radius_km}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, delivery_radius_km: event.target.value }))
          }
          placeholder="ডেলিভারি রেডিয়াস"
        />
        <input
          type="time"
          className="field-base"
          value={(form.delivery_start_time_time || '14:00:00').slice(0, 5)}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, delivery_start_time_time: `${event.target.value}:00` }))
          }
        />
        <input
          type="number"
          className="field-base"
          value={form.base_delivery_charge}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, base_delivery_charge: event.target.value }))
          }
          placeholder="বেস ডেলিভারি চার্জ"
        />
        <input
          type="number"
          className="field-base"
          value={form.per_km_delivery_charge}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, per_km_delivery_charge: event.target.value }))
          }
          placeholder="প্রতি কিমি চার্জ"
        />
        <input
          className="field-base md:col-span-2"
          value={form.bkash_number}
          onChange={(event) => setForm((prev) => ({ ...prev, bkash_number: event.target.value }))}
          placeholder="bKash নম্বর"
        />
        <button type="submit" className="btn-primary md:col-span-2" disabled={submitting}>
          {submitting ? 'সেভ হচ্ছে...' : 'সেটিংস আপডেট করুন'}
        </button>
      </form>
    </section>
  );
}

export default SettingsManager;
