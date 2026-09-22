// src/components/checkout/OrderProcessingModal.jsx
import { useEffect, useState } from 'react';

const STEPS = [
  { id: 1, text: 'অর্ডার প্রক্রিয়া গ্রহণ করা হচ্ছে...' },
  { id: 2, text: 'পণ্যের সহজলভ্যতা যাচাই করা হচ্ছে...' },
  { id: 3, text: 'অর্ডার নিশ্চিত করা হচ্ছে...' },
];

export default function OrderProcessingModal({ isOpen, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      return;
    }

    // Interval to cycle through steps (approx 1 sec per step = ~3 seconds total)
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < STEPS.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          // Small buffer before finishing process
          setTimeout(() => {
            onComplete();
          }, 600);
          return prev;
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, onComplete]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl">
        {/* Animated Spinner Icon */}
        <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-brand-100 border-t-brand-600 animate-spin" />
          <span className="text-2xl animate-bounce">📦</span>
        </div>

        <h3 className="text-lg font-black text-slate-900">
          অনুগ্রহ করে অপেক্ষা করুন
        </h3>

        {/* Dynamic step message */}
        <p className="mt-2 min-h-[2.5rem] text-sm font-bold text-brand-700 transition-all duration-300">
          {STEPS[currentStep].text}
        </p>

        {/* Progress Bar & Indicators */}
        <div className="mt-5 flex justify-center gap-2">
          {STEPS.map((step, idx) => (
            <div
              key={step.id}
              className={`h-2 rounded-full transition-all duration-500 ${
                idx === currentStep
                  ? 'w-8 bg-brand-600'
                  : idx < currentStep
                  ? 'w-2 bg-emerald-500'
                  : 'w-2 bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}