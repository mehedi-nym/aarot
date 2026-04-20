import { formatBanglaCurrency, formatBanglaNumber } from '../../lib/utils';

function StatsGrid({ stats }) {
  const cards = [
    { label: 'আজকের অর্ডার', value: formatBanglaNumber(stats.todayOrders) },
    { label: 'পেন্ডিং অর্ডার', value: formatBanglaNumber(stats.pendingOrders) },
    { label: 'আজকের বিক্রি', value: formatBanglaCurrency(stats.revenue) },
    { label: 'মোট পণ্য', value: formatBanglaNumber(stats.products) },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="section-shell p-5">
          <p className="text-sm text-brand-700">{card.label}</p>
          <p className="mt-3 text-3xl font-extrabold text-ink">{card.value}</p>
        </div>
      ))}
    </div>
  );
}

export default StatsGrid;
