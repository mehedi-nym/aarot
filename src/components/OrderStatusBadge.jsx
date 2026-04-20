import { getStatusMeta } from '../lib/utils';

const statusClasses = {
  pending: 'bg-amber-100 text-amber-700',
  hold: 'bg-slate-200 text-slate-700',
  out_for_delivery: 'bg-sky-100 text-sky-700',
  delivered: 'bg-brand-100 text-brand-700',
  cancelled: 'bg-red-100 text-red-600',
};

function OrderStatusBadge({ status }) {
  const meta = getStatusMeta(status);
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
        statusClasses[status] || statusClasses.pending
      }`}
    >
      {meta.label}
    </span>
  );
}

export default OrderStatusBadge;
