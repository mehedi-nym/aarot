import { Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { formatBanglaCurrency, formatBanglaNumber } from '../lib/utils';

function StickyCartBar() {
  const { items, subtotal, totalItems } = useCart();

  if (!items.length) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-40 px-4 md:hidden">
      <Link
        to="/checkout"
        className="flex items-center justify-between rounded-[26px] bg-ink px-5 py-4 text-white shadow-soft"
      >
        <div>
          <p className="text-xs text-white/70">কার্টে পণ্য</p>
          <p className="text-lg font-bold">{formatBanglaNumber(totalItems)} ইউনিট</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-white/70">মোট</p>
          <p className="text-lg font-bold">{formatBanglaCurrency(subtotal)}</p>
        </div>
      </Link>
    </div>
  );
}

export default StickyCartBar;
