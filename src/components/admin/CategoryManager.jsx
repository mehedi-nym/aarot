import { useState } from 'react';

const initialForm = {
  id: '',
  name_bn: '',
  slug: '',
  sort_order: 1,
  is_active: true,
};

function CategoryManager({ categories, onSave, submitting }) {
  const [form, setForm] = useState(initialForm);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSave({
      ...form,
      sort_order: Number(form.sort_order),
    });
    setForm(initialForm);
  };

  return (
    <section className="grid gap-5 lg:grid-cols-[0.95fr,1.05fr]">
      <form className="section-shell p-5" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-ink">ক্যাটাগরি ম্যানেজ</h3>
          <input
            className="field-base"
            placeholder="ক্যাটাগরির নাম"
            value={form.name_bn}
            onChange={(event) => setForm((prev) => ({ ...prev, name_bn: event.target.value }))}
          />
          <input
            className="field-base"
            placeholder="slug"
            value={form.slug}
            onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))}
          />
          <input
            type="number"
            className="field-base"
            placeholder="ক্রম"
            value={form.sort_order}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, sort_order: event.target.value }))
            }
          />
          <label className="flex items-center gap-3 rounded-2xl bg-brand-50 px-4 py-3 text-sm">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, is_active: event.target.checked }))
              }
            />
            সক্রিয় থাকবে
          </label>
          <button className="btn-primary w-full" type="submit" disabled={submitting}>
            {submitting ? 'সেভ হচ্ছে...' : 'ক্যাটাগরি সেভ করুন'}
          </button>
        </div>
      </form>

      <div className="section-shell p-5">
        <h3 className="text-xl font-bold text-ink">বিদ্যমান ক্যাটাগরি</h3>
        <div className="mt-4 space-y-3">
          {categories.map((category) => (
            <button
              type="button"
              key={category.id}
              className="flex w-full items-center justify-between rounded-2xl border border-brand-100 px-4 py-3 text-left transition hover:border-brand-300"
              onClick={() => setForm(category)}
            >
              <div>
                <p className="font-semibold text-ink">{category.name_bn}</p>
                <p className="text-sm text-brand-700">{category.slug}</p>
              </div>
              <span className="text-xs font-bold text-brand-700">
                {category.is_active ? 'সক্রিয়' : 'বন্ধ'}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CategoryManager;
