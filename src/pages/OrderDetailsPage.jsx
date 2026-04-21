import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useOrders } from '../hooks/useOrders';
import { 
  formatBanglaCurrency, 
  formatBanglaDateTime, 
  formatBanglaNumber 
} from '../lib/utils';

const STEPS = [
  { id: 'pending', label: 'পেন্ডিং' },
  { id: 'hold', label: 'প্রসেসিং' },
  { id: 'out_for_delivery', label: 'অন দ্য ওয়ে' },
  { id: 'delivered', label: 'ডেলিভার্ড' }
];

function OrderDetailsPage() {
  const { orderCode } = useParams(); // Gets the ID from the URL
  const { findOrder, loading } = useOrders();
  const [order, setOrder] = useState(null);
  
  useEffect(() => {
    const getOrderDetails = async () => {
      // Assuming you have a phone number saved in local storage or 
      // you updated your hook to fetch by code only
      const result = await findOrder({ orderCode });
      
      // Since findOrder returns an array, we take the first item
      if (result && Array.isArray(result)) {
        setOrder(result[0]);
      } else {
        setOrder(result);
      }
    };
    
    if (orderCode) getOrderDetails();
  }, [orderCode]);

  if (loading) return <p className="p-20 text-center font-bold text-slate-400">অর্ডার লোড হচ্ছে...</p>;
  if (!order) return <p className="p-20 text-center font-bold text-slate-400">অর্ডারটি পাওয়া যায়নি</p>;

  const currentStepIndex = STEPS.findIndex(s => s.id === order.status);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 md:py-16">
      <div className="mx-auto max-w-4xl">
        
        {/* Top Navigation */}
        <Link to="/track" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-indigo-600 mb-8 transition-colors">
          ← পেছনে যান
        </Link>

        {/* Status Stepper Card */}
        <section className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-slate-100 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-1 block">Tracking ID</span>
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter">#{order.order_code}</h1>
            </div>
            <div className="text-left md:text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">অর্ডার সময়</p>
              <p className="font-bold text-slate-700">{formatBanglaDateTime(order.created_at)}</p>
            </div>
          </div>

          {/* Linear Stepper UI */}
          <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            {STEPS.map((step, index) => {
              const isCompleted = index < currentStepIndex || order.status === 'delivered';
              const isCurrent = order.status === step.id;
              const isCancelled = order.status === 'cancelled' && index === currentStepIndex;

              return (
                <div key={step.id} className="flex md:flex-col items-center gap-4 md:gap-3 z-10 flex-1 w-full">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm transition-all shadow-lg ${
                    isCancelled ? 'bg-red-500 text-white' : 
                    isCompleted || isCurrent ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {isCompleted ? '✓' : formatBanglaNumber(index + 1)}
                  </div>
                  <div className="text-left md:text-center">
                    <p className={`text-xs font-black uppercase tracking-tighter ${isCurrent || isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>
                      {isCancelled ? 'বাতিল করা হয়েছে' : step.label}
                    </p>
                  </div>
                </div>
              );
            })}
            {/* Desktop Connector Line */}
            <div className="hidden md:block absolute top-5 left-0 right-0 h-0.5 bg-slate-100 -z-0" />
          </div>

          {/* Admin Message Bubble */}
          <div className="mt-12 p-6 bg-indigo-50 rounded-[2rem] border border-indigo-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 text-4xl opacity-10">💬</div>
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">অ্যাডমিন মেসেজ</p>
            <p className="text-lg font-bold text-indigo-900 leading-relaxed">
              {order.status_message_bn || 'আপনার অর্ডারটি প্রক্রিয়াধীন রয়েছে। আমাদের সাথেই থাকুন।'}
            </p>
          </div>
        </section>

        <div className="grid md:grid-cols-[1.2fr,0.8fr] gap-8">
          {/* Left: Product & Billing */}
          <div className="space-y-8">
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
              <h3 className="font-black text-slate-900 mb-6">অর্ডার আইটেম</h3>
              <div className="space-y-4">
                {(order.items || []).map((item, i) => (
                  <div key={i} className="flex justify-between items-center py-3 border-b border-slate-50 last:border-none">
                    <div className="flex gap-4 items-center">
                      <div className="w-12 h-12 bg-slate-100 rounded-xl" />
                      <div>
                        <p className="text-sm font-bold text-slate-800">{item.product_name_bn}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Qty: {formatBanglaNumber(item.quantity)}</p>
                      </div>
                    </div>
                    <p className="font-bold text-slate-900">{formatBanglaCurrency(item.line_total)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white">
              <h3 className="font-black mb-6 opacity-50 uppercase text-[10px] tracking-[0.3em]">Billing Summary</h3>
              <div className="space-y-4 font-bold">
                <div className="flex justify-between text-slate-400"><span>সাব-টোটাল</span><span>{formatBanglaCurrency(order.subtotal)}</span></div>
                <div className="flex justify-between text-slate-400"><span>ডেলিভারি চার্জ</span><span>{formatBanglaCurrency(order.delivery_charge)}</span></div>
                <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                  <span className="text-lg">সর্বমোট</span>
                  <span className="text-3xl font-black text-indigo-400 tracking-tighter">{formatBanglaCurrency(order.total_amount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Shipping & Payment */}
          <div className="space-y-8">
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
              <h3 className="font-black text-slate-900 mb-6">শিপিং ডিটেইলস</h3>
              <div className="space-y-6">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">কাস্টমার</p>
                  <p className="font-bold text-slate-800">{order.customer_name}</p>
                  <p className="text-sm font-medium text-slate-500">{order.phone}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">ঠিকানা</p>
                  <p className="text-sm font-bold text-slate-700 leading-relaxed">{order.address_bn}</p>
                  <p className="text-xs font-bold text-indigo-600 mt-1">📍 {order.area_name_bn}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
              <h3 className="font-black text-slate-900 mb-6">পেমেন্ট ইনফো</h3>
              <div className="p-4 bg-slate-50 rounded-2xl">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">মেথড</p>
                <p className="font-bold text-slate-800 uppercase tracking-tight">{order.payment_method}</p>
                {order.bkash_transaction_id && (
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">TrxID</p>
                    <p className="text-xs font-black text-indigo-600 tracking-widest">{order.bkash_transaction_id}</p>
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