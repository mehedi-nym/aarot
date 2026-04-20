import { useMemo, useState } from 'react';
import { SELL_TYPES } from '../../lib/constants';

const initialForm = {
  id: '',
  name_bn: '',
  slug: '',
  image_url: '',
  category_id: '',
  origin_bn: '',
  sell_type: 'kg',
  price: 0,
  stock_quantity: 0,
  quantity_step: 0.5,
  minimum_quantity: 0.5,
  is_available: true,
  available_today: true,
};

function ProductManager({ categories, products, onSave, submitting }) {
  const [form, setForm] = useState(initialForm);

  const groupedProducts = useMemo(
    () =>
      products.map((product) => ({
        ...product,
        categoryName:
          categories.find((category) => category.id === product.category_id)?.name_bn || 'অনির্ধারিত',
      })),
    [categories, products],
  );

  const handleSellTypeChange = (sellType) => {
    const meta = SELL_TYPES[sellType];
    setForm((prev) => ({
      ...prev,
      sell_type: sellType,
      quantity_step: meta.step,
      minimum_quantity: meta.min,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSave({
      ...form,
      price: Number(form.price),
      stock_quantity: Number(form.stock_quantity),
      quantity_step: Number(form.quantity_step),
      minimum_quantity: Number(form.minimum_quantity),
    });
    setForm(initialForm);
  };

  return (
    <section className="grid gap-5 xl:grid-cols-[1.05fr,0.95fr]">
      <form className="section-shell p-5" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <input
            className="field-base md:col-span-2"
            placeholder="পণ্যের নাম"
            value={form.name_bn}
            onChange={(event) => setForm((prev) => ({ ...prev, name_bn: event.target.value }))}
          />
          <input
            className="field-base md:col-span-2"
            placeholder="slug"
            value={form.slug}
            onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))}
          />
          <input
            className="field-base md:col-span-2"
            placeholder="ইমেজ URL"
            value={form.image_url}
            onChange={(event) => setForm((prev) => ({ ...prev, image_url: event.target.value }))}
          />
          <select
            className="field-base"
            value={form.category_id}
            onChange={(event) => setForm((prev) => ({ ...prev, category_id: event.target.value }))}
          >
            <option value="">ক্যাটাগরি নির্বাচন করুন</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name_bn}
              </option>
            ))}
          </select>
          <input
            className="field-base"
            placeholder="উৎপত্তিস্থল"
            value={form.origin_bn}
            onChange={(event) => setForm((prev) => ({ ...prev, origin_bn: event.target.value }))}
          />
          <select
            className="field-base"
            value={form.sell_type}
            onChange={(event) => handleSellTypeChange(event.target.value)}
          >
            {Object.entries(SELL_TYPES).map(([value, meta]) => (
              <option key={value} value={value}>
                {meta.label}
              </option>
            ))}
          </select>
          <input
            type="number"
            className="field-base"
            placeholder="দাম"
            value={form.price}
            onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
          />
          <input
            type="number"
            className="field-base"
            placeholder="স্টক"
            value={form.stock_quantity}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, stock_quantity: event.target.value }))
            }
          />
          <input
            type="number"
            className="field-base"
            placeholder="স্টেপ"
            value={form.quantity_step}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, quantity_step: event.target.value }))
            }
          />
          <input
            type="number"
            className="field-base"
            placeholder="সর্বনিম্ন পরিমাণ"
            value={form.minimum_quantity}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, minimum_quantity: event.target.value }))
            }
          />
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="flex items-center gap-3 rounded-2xl bg-brand-50 px-4 py-3 text-sm">
            <input
              type="checkbox"
              checked={form.is_available}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, is_available: event.target.checked }))
              }
            />
            স্টকে আছে
          </label>
          <label className="flex items-center gap-3 rounded-2xl bg-brand-50 px-4 py-3 text-sm">
            <input
              type="checkbox"
              checked={form.available_today}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, available_today: event.target.checked }))
              }
            />
            আজ দেখাবে
          </label>
        </div>

        <button className="btn-primary mt-5 w-full" type="submit" disabled={submitting}>
          {submitting ? 'সেভ হচ্ছে...' : 'পণ্য সেভ করুন'}
        </button>
      </form>

      <div className="section-shell p-5">
        <h3 className="text-xl font-bold text-ink">পণ্যের তালিকা</h3>
        <div className="mt-4 max-h-[760px] space-y-3 overflow-y-auto pr-1">
          {groupedProducts.map((product) => (
            <button
              type="button"
              key={product.id}
              className="flex w-full items-center gap-3 rounded-3xl border border-brand-100 p-3 text-left transition hover:border-brand-300"
              onClick={() => setForm(product)}
            >
              <img
                src={product.image_url}
                alt={product.name_bn}
                className="h-20 w-20 rounded-2xl object-cover"
              />
              <div className="flex-1">
                <p className="font-semibold text-ink">{product.name_bn}</p>
                <p className="text-sm text-brand-700">{product.categoryName}</p>
                <p className="text-xs text-brand-500">{product.origin_bn}</p>
              </div>
              <span className="text-xs font-bold text-brand-700">
                {product.available_today ? 'আজ সক্রিয়' : 'হিডেন'}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ProductManager;
