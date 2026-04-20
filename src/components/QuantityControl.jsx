import { getSellTypeMeta } from '../lib/utils';

function QuantityControl({ sellType, value, onChange, min, step }) {
  const meta = getSellTypeMeta(sellType);
  const resolvedMin = Number(min || meta.min);
  const resolvedStep = Number(step || meta.step);

  return (
    <div className="inline-flex items-center rounded-full border border-brand-100 bg-white">
      <button
        type="button"
        className="px-4 py-2 text-lg font-bold text-brand-700"
        onClick={() => onChange(Math.max(resolvedMin, Number(value) - resolvedStep))}
      >
        -
      </button>
      <span className="min-w-20 px-3 text-center text-sm font-semibold text-ink">
        {value} {meta.shortLabel}
      </span>
      <button
        type="button"
        className="px-4 py-2 text-lg font-bold text-brand-700"
        onClick={() => onChange(Number(value) + resolvedStep)}
      >
        +
      </button>
    </div>
  );
}

export default QuantityControl;
