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
              alt="Live আড়ৎ"
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
            : 'pb-28 md:pb-10'
        }
      >
        {children}
      </main>

      {location.pathname !== '/admin' && (
        <footer className="border-t border-brand-100/70 bg-white/70 pb-24 backdrop-blur md:pb-0">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 md:grid-cols-[1.2fr,0.8fr] lg:px-8">
            <div>
              <Link to="/" className="inline-flex items-center gap-3">
                <img
                  src="https://bmqsgrrrravkziwbmyll.supabase.co/storage/v1/object/public/asset/logo_aarot.png"
                  alt="Live আড়ৎ"
                  className="h-12 w-12 object-contain"
                />
                <div>
                  <p className="text-lg font-black text-ink">আড়ৎ</p>
                  <p className="text-xs font-bold text-brand-700">
                    টাটকা বাজার, সরাসরি আপনার দরজায়
                  </p>
                </div>
              </Link>
              <p className="mt-4 max-w-xl text-sm font-semibold leading-7 text-slate-600">
                স্থানীয় গ্রাহকের জন্য সহজ, স্বচ্ছ এবং নির্ভরযোগ্য সবজি ও গ্রোসারি অর্ডার প্ল্যাটফর্ম।
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 md:text-right">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-brand-600">
                  তথ্য
                </p>
                <div className="mt-3 flex flex-col gap-2 text-sm font-bold text-slate-600 md:items-end">
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

              <div>
                <p className="text-xs font-black uppercase tracking-widest text-brand-600">
                  কপিরাইট
                </p>
                <p className="mt-3 text-sm font-bold leading-7 text-slate-600">
                  © {new Date().getFullYear()} আড়ৎ। সর্বস্বত্ব সংরক্ষিত।
                </p>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default AppShell;
