import { getSellTypeMeta } from '../lib/utils';

function QuantityControl({ sellType, value, onChange, min, step, disabled = false }) {
  const meta = getSellTypeMeta(sellType);
  const resolvedMin = Number(min || meta.min);
  const resolvedStep = Number(step || meta.step);

  const numericValue = Number(value);
  const isMinusDisabled = disabled || numericValue <= resolvedMin;

  return (
    <div className="grid w-full grid-cols-[2.25rem_minmax(0,1fr)_2.25rem] items-center rounded-full border border-brand-100 bg-white sm:inline-grid sm:w-auto sm:grid-cols-[2.75rem_minmax(5rem,1fr)_2.75rem]">
      <button
        type="button"
        disabled={isMinusDisabled}
        className={`flex h-10 items-center justify-center text-lg font-bold transition-colors ${
          isMinusDisabled
            ? 'text-slate-300'
            : 'text-brand-700 hover:bg-slate-50 active:scale-95'
        }`}
        onClick={() => onChange(Math.max(resolvedMin, numericValue - resolvedStep))}
      >
        -
      </button>

      <span className="min-w-0 truncate px-1 text-center text-xs font-semibold text-ink sm:px-3 sm:text-sm">
        {value} {meta.shortLabel}
      </span>

      <button
        type="button"
        disabled={disabled}
        className={`flex h-10 items-center justify-center text-lg font-bold transition-colors ${
          disabled
            ? 'text-slate-300'
            : 'text-brand-700 hover:bg-slate-50 active:scale-95'
        }`}
        onClick={() => onChange(numericValue + resolvedStep)}
      >
        +
      </button>
    </div>
  );
}

export default QuantityControl;