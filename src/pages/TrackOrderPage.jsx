import { useCallback, useEffect, useState } from 'react';
import OrderStatusBadge from '../components/OrderStatusBadge';
import { useOrders } from '../hooks/useOrders';
import { Link } from 'react-router-dom';
import { 
  formatBanglaCurrency, 
  formatBanglaDateTime, 
  formatBanglaNumber 
} from '../lib/utils';

function TrackOrderPage() {
  const { findOrder, submitting, error } = useOrders();
  const [cachedTrackPhone] = useState(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('track_phone') || '';
  });
  const [phone, setPhone] = useState(() => {
    return cachedTrackPhone;
  });
  const [orders, setOrders] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const loadOrdersByPhone = useCallback(
    async (phoneNumber, shouldCache = false) => {
      const cleanPhone = phoneNumber.trim();

      if (!cleanPhone) {
        setOrders([]);
        setHasSearched(false);
        return;
      }

      if (shouldCache && typeof window !== 'undefined') {
        localStorage.setItem('track_phone', cleanPhone);
      }

      const data = await findOrder({ phone: cleanPhone });
      const results = Array.isArray(data) ? data : data ? [data] : [];

      setOrders(results);
      setHasSearched(true);
    },
    [findOrder],
  );

  useEffect(() => {
    const cachedPhone = cachedTrackPhone.trim();
    if (!cachedPhone) return undefined;

    loadOrdersByPhone(cachedPhone);

    const refreshCachedOrders = () => {
      if (document.visibilityState === 'visible') {
        loadOrdersByPhone(cachedPhone);
      }
    };

    window.addEventListener('focus', refreshCachedOrders);
    window.addEventListener('pageshow', refreshCachedOrders);
    document.addEventListener('visibilitychange', refreshCachedOrders);

    return () => {
      window.removeEventListener('focus', refreshCachedOrders);
      window.removeEventListener('pageshow', refreshCachedOrders);
      document.removeEventListener('visibilitychange', refreshCachedOrders);
    };
  }, [cachedTrackPhone, loadOrdersByPhone]);

  const handleTrack = async (e) => {
    e.preventDefault();
    await loadOrdersByPhone(phone, true);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] px-3 py-6 sm:px-4 sm:py-12 md:py-20">
      <div className="mx-auto max-w-2xl">
        
        {/* Search Header */}
        <div className="mb-6 sm:mb-12">
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mb-2">
            আমার অর্ডার
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            একবার নম্বর দিলে পরে এই পেজে এলেই নতুন অর্ডার আপডেট দেখাবে
          </p>
        </div>

        {/* Search Input - Fully Responsive */}
        <form onSubmit={handleTrack} className="mb-8 sm:mb-12">
          <div className="group relative bg-white p-2 rounded-3xl sm:rounded-[2rem] shadow-xl shadow-slate-200/50 flex flex-col sm:flex-row gap-2 border border-slate-100 focus-within:border-emerald-500 transition-all">
            <input 
              type="tel" 
              required 
              placeholder="ফোন নম্বর (01XXXXXXXXX)"
              className="w-full bg-transparent h-12 sm:h-14 px-4 sm:pl-6 text-base sm:text-lg font-bold text-slate-800 outline-none"
              value={phone} 
              onChange={(e) => setPhone(e.target.value)}
            />
            <button className="w-full sm:w-auto shrink-0 bg-slate-900 text-white h-12 sm:h-14 px-6 sm:px-8 rounded-2xl sm:rounded-[1.7rem] font-black text-sm hover:bg-emerald-600 transition-colors active:scale-95">
              {submitting ? 'লোড হচ্ছে...' : 'অর্ডার দেখুন'}
            </button>
          </div>
          {error && <p className="mt-3 ml-2 text-xs font-bold text-red-500 uppercase tracking-widest">⚠️ {error}</p>}
        </form>

        {/* Results Section */}
        <div className="space-y-4 sm:space-y-6">
          {hasSearched && orders.length === 0 && (
            <div className="text-center py-12 sm:py-20 bg-white rounded-3xl sm:rounded-[3rem] border border-slate-100 px-4">
              <p className="text-slate-400 text-sm font-bold italic">এই নাম্বারে কোনো অর্ডার পাওয়া যায়নি</p>
            </div>
          )}

          {orders.map((order) => (
            <div key={order.id} className="bg-white p-5 sm:p-8 rounded-3xl sm:rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden transition-transform active:scale-[0.99]">
              
              {/* Order Header */}
              <div className="flex flex-wrap justify-between items-center gap-2 mb-4 sm:mb-6">
                <div>
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block mb-0.5">Order Code</span>
                  <h4 className="text-lg sm:text-xl font-black text-slate-900 leading-none tracking-tight">#{order.order_code}</h4>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>

              {/* Status Message Bubble */}
              <div className="mb-5 p-3.5 sm:p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">সর্বশেষ আপডেট</p>
                <p className="text-xs sm:text-sm font-bold text-slate-700">
                  {order.status_message_bn || 'আপনার অর্ডারটি প্রক্রিয়াধীন রয়েছে।'}
                </p>
              </div>

              {/* Order Details Footer */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-t border-slate-100 pt-4 sm:pt-6">
                <div className="flex items-center justify-between sm:block space-y-1">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">তারিখ</p>
                    <p className="text-xs font-bold text-slate-600">{formatBanglaDateTime(order.created_at)}</p>
                  </div>
                  
                  <Link 
                    to={`/track/${order.order_code}`} 
                    className="sm:hidden text-xs font-black text-emerald-600 hover:underline uppercase tracking-widest"
                  >
                    বিস্তারিত দেখুন →
                  </Link>
                </div>

                <Link 
                  to={`/track/${order.order_code}`} 
                  className="hidden sm:block text-xs font-black text-emerald-600 hover:underline uppercase tracking-widest"
                >
                  বিস্তারিত দেখুন →
                </Link>

                <div className="flex items-center justify-between sm:block text-left sm:text-right border-t sm:border-t-0 border-slate-50 pt-3 sm:pt-0">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">মোট পরিশোধযোগ্য</p>
                  <p className="text-xl sm:text-2xl font-black text-emerald-600 tracking-tighter leading-none">
                    {formatBanglaCurrency(order.total_amount)}
                  </p>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TrackOrderPage;