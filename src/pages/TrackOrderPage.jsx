import { useState } from 'react';
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
  const [phone, setPhone] = useState(() => {
  return localStorage.getItem('track_phone') || '';
});
  const [orders, setOrders] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleTrack = async (e) => {
  e.preventDefault();

  localStorage.setItem('track_phone', phone);

  const data = await findOrder({ phone });

  let results = Array.isArray(data) ? data : data ? [data] : [];

  // ✅ Sort latest first
  results = results.sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  setOrders(results);
  setHasSearched(true);
};

  return (
    <div className="min-h-screen bg-[#F9FAFB] px-4 py-12 md:py-20">
      <div className="mx-auto max-w-2xl">
        
        {/* Search Header */}
        <div className="mb-12">
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">আমার অর্ডার</h2>
          <p className="text-slate-500 font-medium">আপনার ফোন নম্বর দিয়ে সব অর্ডারের আপডেট জানুন</p>
        </div>

        {/* Minimal Search Input */}
        <form onSubmit={handleTrack} className="mb-12">
          <div className="group relative bg-white p-2 rounded-[2rem] shadow-xl shadow-slate-200/50 flex items-center border border-transparent focus-within:border-indigo-500 transition-all">
            <input 
              type="tel" required placeholder="ফোন নম্বর (01XXXXXXXXX)"
              className="flex-grow bg-transparent h-14 pl-6 text-lg font-bold text-slate-800 outline-none"
              value={phone} onChange={(e) => setPhone(e.target.value)}
            />
            <button className="bg-slate-900 text-white h-14 px-8 rounded-[1.7rem] font-black text-sm hover:bg-indigo-600 transition-colors active:scale-95">
              {submitting ? '...' : 'অর্ডার দেখুন'}
            </button>
          </div>
          {error && <p className="mt-4 ml-4 text-xs font-bold text-red-500 uppercase tracking-widest">⚠️ {error}</p>}
        </form>

        {/* Results Section */}
        <div className="space-y-6">
          {hasSearched && orders.length === 0 && (
            <div className="text-center py-20 bg-white rounded-[3rem] border border-slate-100">
              <p className="text-slate-400 font-bold italic">এই নাম্বারে কোনো অর্ডার পাওয়া যায়নি</p>
            </div>
          )}

          {orders.map((order) => (
            <div key={order.id} className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden transition-transform active:scale-[0.99]">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest block mb-1">Order Code</span>
                  <h4 className="text-xl font-black text-slate-900 leading-none tracking-tight">#{order.order_code}</h4>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>

              {/* Status Message Bubble */}
              <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">সর্বশেষ আপডেট</p>
                <p className="text-sm font-bold text-slate-700">
                  {order.status_message_bn || 'আপনার অর্ডারটি প্রক্রিয়াধীন রয়েছে।'}
                </p>
              </div>

              <div className="flex justify-between items-end border-t border-slate-50 pt-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">তারিখ</p>
                  <p className="text-xs font-bold text-slate-600">{formatBanglaDateTime(order.created_at)}</p>
                </div>
                {/* THIS IS THE LINK */}
      <Link 
        to={`/track/${order.order_code}`} 
        className="text-xs font-black text-indigo-600 hover:underline uppercase tracking-widest"
      >
        বিস্তারিত দেখুন →
      </Link>

                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">মোট পরিশোধযোগ্য</p>
                  <p className="text-2xl font-black text-indigo-600 tracking-tighter leading-none">
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