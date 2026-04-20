import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { signInAdmin } from '../lib/queries';
import { hasSupabaseEnv } from '../lib/supabase';

function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      setError('');
      await signInAdmin(form);
      navigate(location.state?.from || '/admin');
    } catch (loginError) {
      setError(loginError.message || 'লগইন করা যায়নি');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6 lg:px-8">
      <section className="section-shell p-6 md:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600">
          অ্যাডমিন লগইন
        </p>
        <h2 className="mt-3 text-3xl font-extrabold text-ink">অর্ডার ও সেটিংস কন্ট্রোল করুন</h2>
        <p className="mt-3 text-sm leading-7 text-brand-700">
          {hasSupabaseEnv
            ? 'Supabase Auth দিয়ে কেবল admin user-রাই এই প্যানেলে ঢুকতে পারবে।'
            : 'ডেমো মোডে আছেন। Supabase env যোগ করলে বাস্তব admin auth চালু হবে।'}
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <input
            type="email"
            className="field-base"
            placeholder="admin@email.com"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          />
          <input
            type="password"
            className="field-base"
            placeholder="পাসওয়ার্ড"
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
          />
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'লগইন হচ্ছে...' : 'লগইন করুন'}
          </button>
        </form>
      </section>
    </div>
  );
}

export default AdminLoginPage;
