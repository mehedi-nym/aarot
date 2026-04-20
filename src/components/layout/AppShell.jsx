import { Link, NavLink, useLocation } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { formatBanglaNumber } from '../../lib/utils';

const navItems = [
  { to: '/', label: 'আজকের বাজার' },
  { to: '/track', label: 'অর্ডার ট্র্যাক' },
  { to: '/admin', label: 'অ্যাডমিন' },
];

function AppShell({ children }) {
  const { totalItems } = useCart();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-grain bg-[size:16px_16px]">
      <header className="sticky top-0 z-40 border-b border-white/50 bg-clay/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-2xl font-extrabold text-white">
              আ
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-600">
                Aarot
              </p>
              <h1 className="text-xl font-extrabold text-ink">আড়ৎ</h1>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-semibold transition ${
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

          <Link
            to="/checkout"
            className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-white"
          >
            <span>কার্ট</span>
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">
              {formatBanglaNumber(totalItems)}
            </span>
          </Link>
        </div>

        <nav className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-4 pb-3 md:hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-brand-600 text-white'
                    : 'border border-brand-100 bg-white/90 text-brand-700'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className={location.pathname === '/admin' ? 'pb-10' : 'pb-28 md:pb-10'}>
        {children}
      </main>
    </div>
  );
}

export default AppShell;
