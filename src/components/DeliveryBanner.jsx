import React from 'react';
import { formatBanglaTime, getAreaName } from '../lib/utils';

function DeliveryBanner({ settings, deliveryAreas = [] }) {
  const serviceAreaNames = deliveryAreas.map(getAreaName).filter(Boolean);
  const serviceAreaText = serviceAreaNames.length
    ? `${serviceAreaNames.join(' · ')} কভারেজে`
    : 'আপনার এলাকার মধ্যে ডেলিভারি সুবিধা';

  return (
    <section className="relative overflow-hidden rounded-[24px] bg-[#F7F4EA] shadow-[0_8px_28px_rgba(20,60,35,0.09)] ring-1 ring-[#DDE7D8]">
      {/* Decorative background ambient glows */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-[#DCEAD7]/70 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-[#F2D98A]/30 blur-3xl" />

      {/* LIVE ticker marquee */}
      <div className="relative z-10 flex h-8 items-center overflow-hidden border-b border-[#D9E3D4] bg-[#173C2A] px-3 sm:px-4">
        <div className="flex shrink-0 items-center gap-2 pr-3">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#F3C84B] opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#F3C84B]" />
          </span>

          <span className="text-[12px] font-extrabold tracking-[0.16em] text-white">
            LIVE
          </span>
        </div>

        <div className="relative min-w-0 flex-1 overflow-hidden">
          <div className="whitespace-nowrap text-[14px] font-semibold text-[#E8F1E5] animate-[aarot-marquee_32s_linear_infinite]">
            আজকের আড়ৎ খোলা
            <span className="mx-3 text-[#F3C84B]">•</span>
            প্রতিদিনের টাটকা বাজার এখন ঘরে বসেই অর্ডার করুন
            <span className="mx-3 text-[#F3C84B]">•</span>
            কৃষকের কাছ থেকে সংগ্রহ করা সতেজ সবজি ও নিত্যপ্রয়োজনীয় পণ্য
            <span className="mx-3 text-[#F3C84B]">•</span>
            আপনার এলাকার মধ্যে দ্রুত ও যত্নসহকারে পৌঁছে দিচ্ছি
            <span className="mx-3 text-[#F3C84B]">•</span>
            {settings?.delivery_radius_km} কিমি এলাকায় ডেলিভারি সুবিধা
            <span className="mx-3 text-[#F3C84B]">•</span>
            বাজারে যাওয়ার ঝামেলা নয়, পছন্দের পণ্য অর্ডার করুন আড়ৎ থেকে
            <span className="mx-3 text-[#F3C84B]">•</span>
            আজকের বাজার, আজকের সতেজতা—সরাসরি আপনার দরজায়
            <span className="mx-3 text-[#F3C84B]">•</span>
            আজকের আড়ৎ খোলা
            <span className="mx-3 text-[#F3C84B]">•</span>
            প্রতিদিনের টাটকা বাজার এখন ঘরে বসেই অর্ডার করুন
            <span className="mx-3 text-[#F3C84B]">•</span>
            কৃষকের কাছ থেকে সংগ্রহ করা সতেজ সবজি ও নিত্যপ্রয়োজনীয় পণ্য
            <span className="mx-3 text-[#F3C84B]">•</span>
            আপনার এলাকার মধ্যে দ্রুত ও যত্নসহকারে পৌঁছে দিচ্ছি
            <span className="mx-3 text-[#F3C84B]">•</span>
            {settings?.delivery_radius_km} কিমি এলাকায় ডেলিভারি সুবিধা
            <span className="mx-3 text-[#F3C84B]">•</span>
            বাজারে যাওয়ার ঝামেলা নয়, পছন্দের পণ্য অর্ডার করুন আড়ৎ থেকে
            <span className="mx-3 text-[#F3C84B]">•</span>
            আজকের বাজার, আজকের সতেজতা—সরাসরি আপনার দরজায়
          </div>
        </div>
      </div>

      {/* Main banner content */}
      <div className="relative z-10 grid gap-5 px-4 py-5 sm:px-6 sm:py-6 md:grid-cols-[1.15fr_0.85fr] md:items-center md:px-8 md:py-7 lg:px-10">
        
        {/* LEFT CONTENT */}
        <div className="max-w-2xl">
          {/* Top Label */}
          <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-full border border-[#CFE0CA] bg-white/70 px-2.5 py-1 backdrop-blur-sm">
            <span className="text-sm">🥬</span>
            <span className="text-[10px] font-bold text-[#31563F]">
              প্রতিদিনের তাজা বাজার
            </span>
          </div>

          {/* Title */}
          <h2 className="text-[26px] pt-1 pb-1 font-black leading-[1.08] tracking-tight text-[#173C2A] sm:text-[32px] md:text-[40px]">
            আড়ৎ থেকে টাটকা পণ্য 
            <br />
            <span className="relative inline-block text-[#3E7A4E] pt-1 pb-1">
              পোছে যাবে আপনার ঠিকানায়। 
            
              <span className="absolute -bottom-1 left-0  h-[3px] w-2/3 rounded-full bg-[#F0C94A]" />
            </span>
          </h2>

          {/* Delivery Notice */}
          <p className="mt-3 max-w-lg text-[12px] font-medium leading-5 text-[#647268] sm:text-[13px]">
            {settings?.delivery_notice_bn}
          </p>

          {/* Delivery info cards */}
          <div className="mt-4 grid max-w-md grid-cols-2 gap-2.5">
            <div className="flex items-center gap-2 rounded-xl border border-[#DDE7D8] bg-white/80 px-3 py-2.5 shadow-sm backdrop-blur-sm">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#E8F2E4] text-sm">
                🛵
              </span>

              <div className="min-w-0">
                <div className="text-[9px] font-bold text-[#78857C]">
                  ডেলিভারি শুরু
                </div>
                <div className="text-sm font-black tabular-nums text-[#173C2A] sm:text-base">
                  {formatBanglaTime(settings?.delivery_start_time_time || settings?.delivery_start_time)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-[#DDE7D8] bg-white/80 px-3 py-2.5 shadow-sm backdrop-blur-sm">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#FFF2C7] text-sm">
                📍
              </span>

              <div className="min-w-0">
                <div className="text-[9px] font-bold text-[#78857C]">
                  সার্ভিস এলাকা
                </div>
                <div className="text-sm font-black tabular-nums text-[#173C2A] sm:text-base">
                  {settings?.delivery_radius_km} কিমি
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT VISUAL: Modern Dynamic Produce Presentation */}
        <div className="relative hidden min-h-[220px] items-center justify-center md:flex">
          {/* Animated Background Pulse Glow */}
          <div className="absolute right-6 h-48 w-48 rounded-full bg-gradient-to-tr from-[#DCEAD7] to-[#F2D98A]/40 animate-[aarot-pulse_6s_ease-in-out_infinite] blur-xl" />
          <div className="absolute right-12 h-36 w-36 rounded-full border-[2px] border-[#3E7A4E]/15 animate-[aarot-pulse_4s_ease-in-out_infinite]" />

          {/* Floating Organic Leaf SVG 2 */}
          <div className="absolute right-2 top-0 text-[#2B5437]/50 animate-[aarot-float-reverse_6s_ease-in-out_infinite]">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4Z" />
            </svg>
          </div>

          {/* Hero Visual Container */}
          <div className="relative z-10 flex items-center justify-center animate-[aarot-float_6s_ease-in-out_infinite]">
            {/* Basket Base Shadow */}
            <div className="absolute -bottom-2 h-5 w-44 rounded-[100%] bg-[#173C2A]/15 blur-md" />

            {/* High Quality Photorealistic / Clean Produce Composition */}
            <div className="relative overflow-hidden rounded-2xl border border-white/80 bg-gradient-to-b from-white/90 to-white/40 p-2 shadow-[0_16px_36px_rgba(23,60,42,0.12)] backdrop-blur-md">
              <img
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=480&q=80"
                alt="Fresh Market Produce"
                className="h-36 w-56 rounded-xl object-cover shadow-inner transition-transform duration-700 hover:scale-105"
              />

              {/* Freshness Overlay Badge */}
              <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-[#173C2A]/90 px-2.5 py-1 shadow-md backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-[#F0C94A] animate-ping" />
                <span className="text-[9px] font-bold text-white tracking-wide">
                  ১০০% টাটকা
                </span>
              </div>
            </div>
          </div>

          {/* Floating Tag Card 1: Organic Guarantee */}
          <div className="absolute left-1 bottom-4 z-20 rounded-xl border border-white/80 bg-white/90 px-3 py-1.5 shadow-lg backdrop-blur-md animate-[aarot-float-reverse_5s_ease-in-out_infinite]">
            <div className="flex items-center gap-1.5">
              <span className="text-xs">🌱</span>
              <span className="text-[10px] font-extrabold text-[#173C2A]">
                ফার্ম ফ্রেশ
              </span>
            </div>
          </div>

          {/* Floating Tag Card 2: Quality Seal */}
          <div className="absolute -right-2 top-8 z-20 rounded-2xl border border-white/80 bg-[#173C2A] px-3 py-2 shadow-xl backdrop-blur-md animate-[aarot-float_4.5s_ease-in-out_infinite]">
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#F3C84B] text-[10px] font-black text-[#173C2A]">
                ✓
              </div>
              <div>
                <div className="text-[8px] font-bold text-[#B9CCB9]">
                  আজকের আড়ৎ
                </div>
                <div className="text-[10px] font-black text-white">
                  নিশ্চিত মান
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom strip */}
      <div className="relative z-10 flex flex-col gap-1 border-t border-[#DDE7D8] bg-white/50 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-6 md:px-8">
        <p className="text-[10px] font-semibold text-[#647268]">
          📍 {serviceAreaText}
        </p>

        <p className="text-[10px] font-bold text-[#3E7A4E]">
          আজকের আড়ৎ থেকে সরাসরি আপনার দরজায়
        </p>
      </div>

      {/* Embedded Animations */}
      <style>{`
        @keyframes aarot-marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
        @keyframes aarot-float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-7px) rotate(1.5deg);
          }
        }
        @keyframes aarot-float-reverse {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(6px) rotate(-1.5deg);
          }
        }
        @keyframes aarot-pulse {
          0%, 100% {
            opacity: 0.4;
            transform: scale(1);
          }
          50% {
            opacity: 0.75;
            transform: scale(1.08);
          }
        }
      `}</style>
    </section>
  );
}

export default DeliveryBanner;
