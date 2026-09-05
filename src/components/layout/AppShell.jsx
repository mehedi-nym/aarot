import { Link, NavLink, useLocation } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { formatBanglaNumber } from '../../lib/utils';

const navItems = [
  { to: '/', label: 'আজকের বাজার' },
  { to: '/track', label: 'অর্ডার ট্র্যাক' },
];

function AppShell({ children }) {
  const { totalItems } = useCart();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-grain bg-[size:16px_16px]">
      <header className="sticky top-0 z-40 border-b border-white/50 bg-clay/85 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between gap-2 px-3 sm:px-6 lg:px-8">

          {/* Logo */}
          <Link
            to="/"
            className="flex shrink-0 items-center"
          >
            <img
              src="https://bmqsgrrrravkziwbmyll.supabase.co/storage/v1/object/public/asset/logo_aarot.png"
              alt="Live আড়ৎ"
              className="h-14 w-14 object-contain sm:h-16 sm:w-16"
            />
          </Link>

          {/* Navigation - ALWAYS VISIBLE */}
          <nav className="flex min-w-0 flex-1 items-center justify-center gap-1 sm:gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-full px-2.5 py-2 text-[12px] font-semibold transition sm:px-4 sm:text-sm ${
                    isActive
                      ? 'bg-brand-600 text-white'
                      : 'text-brand-700 hover:bg-white hover:text-brand-800'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Cart */}
          <Link
            to="/checkout"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-ink px-2.5 py-2 text-[12px] font-semibold text-white sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm"
          >
            <span className="hidden xs:inline">বাজারের ব্যাগ</span>
            <span className="xs:hidden">ব্যাগ</span>

            <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[11px] sm:px-2 sm:text-xs">
              {formatBanglaNumber(totalItems)}
            </span>
          </Link>
        </div>
      </header>

      <main
        className={
          location.pathname === '/admin'
            ? 'pb-10'
            : 'pb-10'
        }
      >
        {children}
      </main>

      {location.pathname !== '/admin' && (
        <footer className="border-t border-brand-100/70 bg-white/80 backdrop-blur">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              
              {/* Brand Section */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link to="/" className="inline-flex shrink-0 items-center gap-3">
                  <img
                    src="https://bmqsgrrrravkziwbmyll.supabase.co/storage/v1/object/public/asset/logo_aarot.png"
                    alt="Live আড়ৎ"
                    className="h-10 w-10 object-contain sm:h-12 sm:w-12"
                  />
                  <div>
                    <p className="text-base font-black text-ink sm:text-lg">আড়ৎ</p>
                    <p className="text-xs font-bold text-brand-700">
                      টাটকা বাজার, সরাসরি আপনার দরজায়
                    </p>
                  </div>
                </Link>
                <p className="text-xs font-medium text-slate-500 sm:border-l sm:border-slate-200 sm:pl-4">
                  সহজ, স্বচ্ছ এবং নির্ভরযোগ্য অনলাইন বাজার প্ল্যাটফর্ম।
                </p>
              </div>

              {/* Navigation Links */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-bold text-slate-600 sm:text-sm">
                <Link to="/about" className="transition hover:text-brand-700">
                  আমাদের সম্পর্কে
                </Link>
                <Link to="/policy" className="transition hover:text-brand-700">
                  নীতিমালা
                </Link>
                <Link to="/track" className="transition hover:text-brand-700">
                  অর্ডার ট্র্যাক
                </Link>
              </div>

            </div>

            {/* Bottom Copyright Bar */}
            <div className="mt-6 border-t border-slate-100 pt-4 text-center sm:text-left">
              <p className="text-xs font-semibold text-slate-500">
                © {new Date().getFullYear()} আড়ৎ। সর্বস্বত্ব সংরক্ষিত।
              </p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default AppShell;