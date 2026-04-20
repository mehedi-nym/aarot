import { formatBanglaTime } from '../lib/utils';

function DeliveryBanner({ settings }) {
  return (
    <section className="relative overflow-hidden rounded-[2.5rem] bg-white border border-slate-200 shadow-sm">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 z-0" />
      
      <div className="relative z-10 grid gap-8 p-8 md:p-12 md:grid-cols-[1fr,auto]">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">
              সার্ভিস স্ট্যাটাস: লাইভ
            </p>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-black leading-tight text-slate-900 tracking-tight">
            আড়ৎ <br />
            <span className="text-emerald-600 font-serif italic">এখন আপনার হাতে।</span>
          </h2>
          
          <p className="max-w-xl text-base leading-relaxed text-slate-500 font-medium">
            {settings?.delivery_notice_bn}
          </p>
        </div>

        <div className="flex flex-col justify-center gap-4">
          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 min-w-[240px]">
            <div className="flex items-center gap-4">
              <div className="text-2xl">🚚</div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">ডেলিভারি শুরু</p>
                <p className="text-xl font-black text-slate-900">
                  {formatBanglaTime(settings?.delivery_start_time)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="text-2xl">📍</div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">সার্ভিস এলাকা</p>
                <p className="text-xl font-black text-slate-900">
                  {settings?.delivery_radius_km} কিমি (ধানমণ্ডি,মোহাম্মদপুর)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default DeliveryBanner;