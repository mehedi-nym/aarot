import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useOrders } from '../hooks/useOrders';
import OrderStatusBadge from '../components/OrderStatusBadge';
import { 
  formatBanglaCurrency, 
  formatBanglaDateTime, 
  formatBanglaNumber 
} from '../lib/utils';

const STEPS = [
  { id: 'pending', label: 'পেন্ডিং' },
  { id: 'hold', label: 'প্রসেসিং' },
  { id: 'out_for_delivery', label: 'অন দ্য ওয়ে' },
  { id: 'delivered', label: 'ডেলিভার্ড' }
];

function OrderDetailsPage() {
  const { orderCode } = useParams();
  const { findOrder, submitting } = useOrders();
  const [order, setOrder] = useState(null);
  const [loaded, setLoaded] = useState(false);
  
  useEffect(() => {
    let isCurrent = true;

    const getOrderDetails = async () => {
      setLoaded(false);
      const result = await findOrder({ orderCode });

      if (!isCurrent) return;
      
      if (result && Array.isArray(result)) {
        setOrder(result[0]);
      } else {
        setOrder(result);
      }

      setLoaded(true);
    };
    
    if (orderCode) getOrderDetails();

    return () => {
      isCurrent = false;
    };
  }, [findOrder, orderCode]);

  if (!loaded || submitting) return <p className="p-10 sm:p-20 text-center font-bold text-slate-400 text-sm sm:text-base">অর্ডার লোড হচ্ছে...</p>;
  if (!order) return <p className="p-10 sm:p-20 text-center font-bold text-slate-400 text-sm sm:text-base">অর্ডারটি পাওয়া যায়নি</p>;

  // Normalize status string safely
  const rawStatus = order.status || order.order_status || order.current_status || '';
  const normalizedStatus = String(rawStatus).toLowerCase().trim();
  const currentStepIndex = STEPS.findIndex(s => s.id === normalizedStatus);

  return (
    <div className="min-h-screen bg-slate-50 px-3 py-6 sm:px-4 sm:py-10 md:py-16">
      <div className="mx-auto max-w-4xl">
        
        {/* Top Navigation */}
        <Link to="/track" className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-400 hover:text-emerald-600 mb-6 transition-colors">
          ← পেছনে যান
        </Link>

        {/* Status Stepper Card */}
        <section className="bg-white rounded-3xl md:rounded-[2.5rem] p-5 sm:p-8 md:p-12 shadow-sm border border-slate-100 mb-6 sm:mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 mb-8 sm:mb-12">
            <div>
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-1 block">Tracking ID</span>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">#{order.order_code}</h1>
                <OrderStatusBadge status={normalizedStatus} />
              </div>
            </div>
            <div className="text-left md:text-right border-t border-slate-100 pt-3 md:pt-0 md:border-t-0">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">অর্ডার সময়</p>
              <p className="text-xs sm:text-sm font-bold text-slate-700">{formatBanglaDateTime(order.created_at)}</p>
            </div>
          </div>

          {/* Stepper UI (Vertical on Mobile, Horizontal on Desktop) */}
          <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-8">
            {STEPS.map((step, index) => {
              const isCompleted = index < currentStepIndex || normalizedStatus === 'delivered';
              const isCurrent = normalizedStatus === step.id;
              const isCancelled = normalizedStatus === 'cancelled' && index === currentStepIndex;

              return (
                <div key={step.id} className="relative flex md:flex-col items-center gap-3.5 md:gap-3 z-10 flex-1 w-full">
                  
                  {/* Mobile Connecting Line */}
                  {index < STEPS.length - 1 && (
                    <div className="absolute left-4 top-9 bottom--6 w-0.5 bg-slate-100 md:hidden -z-10 h-6" />
                  )}

                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-black text-xs sm:text-sm shrink-0 transition-all shadow-md ${
                    isCancelled ? 'bg-red-500 text-white' : 
                    isCompleted || isCurrent ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {isCompleted ? '✓' : formatBanglaNumber(index + 1)}
                  </div>
                  <div className="text-left md:text-center">
                    <p className={`text-xs font-black uppercase tracking-tight ${isCurrent || isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>
                      {isCancelled ? 'বাতিল করা হয়েছে' : step.label}
                    </p>
                  </div>
                </div>
              );
            })}
            
            {/* Desktop Connector Line */}
            <div className="hidden md:block absolute top-5 left-0 right-0 h-0.5 bg-slate-100 -z-0" />
          </div>

          {/* Admin Message Bubble */}
          <div className="mt-8 sm:mt-12 p-4 sm:p-6 bg-emerald-50 rounded-2xl sm:rounded-[2rem] border border-emerald-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 sm:p-4 text-3xl sm:text-4xl opacity-10">💬</div>
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1.5">অ্যাডমিন মেসেজ</p>
            <p className="text-sm sm:text-lg font-bold text-emerald-900 leading-relaxed">
              {order.status_message_bn || 'আপনার অর্ডারটি প্রক্রিয়াধীন রয়েছে। আমাদের সাথেই থাকুন।'}
            </p>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-[1.2fr,0.8fr] gap-6 sm:gap-8">
          {/* Left: Product & Billing */}
          <div className="space-y-6 sm:space-y-8">
            <div className="bg-white rounded-3xl sm:rounded-[2.5rem] p-5 sm:p-8 border border-slate-100 shadow-sm">
              <h3 className="font-black text-slate-900 mb-4 sm:mb-6 text-base sm:text-lg">অর্ডার আইটেম</h3>
              <div className="space-y-4">
                {(order.items || []).map((item, i) => (
                  <div key={i} className="flex flex-wrap sm:flex-nowrap justify-between items-center gap-3 py-3 border-b border-slate-50 last:border-none">
                    <div className="flex gap-3 sm:gap-4 items-center min-w-0">
                      <div className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-100">
                        <img
                          src={item.image_url || '/placeholder-product.png'}
                          alt={item.product_name_bn}
                          className="h-full w-full object-cover"
                          onError={(event) => {
                            event.currentTarget.src =
                              'https://via.placeholder.com/150?text=No+Image';
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">{item.product_name_bn}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Qty: {formatBanglaNumber(item.quantity)}</p>
                      </div>
                    </div>
                    <p className="font-bold text-slate-900 text-sm sm:text-base ml-auto sm:ml-0">{formatBanglaCurrency(item.line_total)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 rounded-3xl sm:rounded-[2.5rem] p-5 sm:p-8 text-white">
              <h3 className="font-black mb-4 sm:mb-6 opacity-50 uppercase text-[10px] tracking-[0.3em]">Billing Summary</h3>
              <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm font-bold">
                <div className="flex justify-between text-slate-400"><span>সাব-টোটাল</span><span>{formatBanglaCurrency(order.subtotal)}</span></div>
                <div className="flex justify-between text-slate-400"><span>ডেলিভারি চার্জ</span><span>{formatBanglaCurrency(order.delivery_charge)}</span></div>
                <div className="pt-3 sm:pt-4 border-t border-slate-800 flex justify-between items-center">
                  <span className="text-base sm:text-lg">সর্বমোট</span>
                  <span className="text-xl sm:text-3xl font-black text-emerald-400 tracking-tight">{formatBanglaCurrency(order.total_amount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Shipping & Payment */}
          <div className="space-y-6 sm:space-y-8">
            <div className="bg-white rounded-3xl sm:rounded-[2.5rem] p-5 sm:p-8 border border-slate-100 shadow-sm">
              <h3 className="font-black text-slate-900 mb-4 sm:mb-6 text-base sm:text-lg">শিপিং ডিটেইলস</h3>
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">কাস্টমার</p>
                  <p className="font-bold text-slate-800 text-sm sm:text-base">{order.customer_name}</p>
                  <p className="text-xs sm:text-sm font-medium text-slate-500">{order.phone}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">ঠিকানা</p>
                  <p className="text-xs sm:text-sm font-bold text-slate-700 leading-relaxed break-words">{order.address_bn}</p>
                  <p className="text-xs font-bold text-emerald-600 mt-1">📍 {order.area_name_bn}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl sm:rounded-[2.5rem] p-5 sm:p-8 border border-slate-100 shadow-sm">
              <h3 className="font-black text-slate-900 mb-4 sm:mb-6 text-base sm:text-lg">পেমেন্ট ইনফো</h3>
              <div className="p-3.5 sm:p-4 bg-slate-50 rounded-2xl">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">মেথড</p>
                <p className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-tight">{order.payment_method}</p>
                {order.bkash_transaction_id && (
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">TrxID</p>
                    <p className="text-xs font-black text-emerald-600 tracking-widest break-all">{order.bkash_transaction_id}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default OrderDetailsPage;