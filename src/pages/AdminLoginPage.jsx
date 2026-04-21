import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInAdmin } from '../lib/queries';

function AdminLoginPage() {
  const navigate = useNavigate();

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

      const DEV_EMAIL = 'admin@aarot.com';
      const DEV_PASSWORD = '123456';

      // ✅ DEV BYPASS LOGIN (FAST MODE)
      if (
        form.email === DEV_EMAIL &&
        form.password === DEV_PASSWORD
      ) {
        localStorage.setItem(
          'admin_auth',
          JSON.stringify({
            email: form.email,
            role: 'admin',
            loginTime: Date.now(),
          })
        );

        navigate('/admin', { replace: true });
        return;
      }

      // ✅ REAL LOGIN (Supabase or API)
      const user = await signInAdmin(form);

      if (user) {
        localStorage.setItem(
          'admin_auth',
          JSON.stringify({
            email: form.email,
            role: 'admin',
            loginTime: Date.now(),
          })
        );

        navigate('/admin', { replace: true });
      } else {
        throw new Error('লগইন ব্যর্থ হয়েছে');
      }

    } catch (loginError) {
      setError(loginError.message || 'লগইন করা যায়নি');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <section className="section-shell p-6 md:p-8">

        <h2 className="text-3xl font-extrabold text-ink">
          অ্যাডমিন লগইন
        </h2>

        <p className="mt-3 text-sm text-brand-700">
          Admin panel access
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>

          <input
            type="email"
            className="field-base"
            placeholder="admin@email.com"
            value={form.email}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                email: e.target.value,
              }))
            }
            required
          />

          <input
            type="password"
            className="field-base"
            placeholder="Password"
            value={form.password}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                password: e.target.value,
              }))
            }
            required
          />

          {error && (
            <div className="text-red-600 text-sm font-bold">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'লগইন হচ্ছে...' : 'লগইন করুন'}
          </button>

        </form>
      </section>
    </div>
  );
}

export default AdminLoginPage;