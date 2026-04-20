import { useMemo, useState } from 'react';
import CategoryManager from '../components/admin/CategoryManager';
import OrderManager from '../components/admin/OrderManager';
import ProductManager from '../components/admin/ProductManager';
import SettingsManager from '../components/admin/SettingsManager';
import StatsGrid from '../components/admin/StatsGrid';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { useOrders } from '../hooks/useOrders';
import { useProducts } from '../hooks/useProducts';
import { saveCategory, saveProduct, saveSettings } from '../lib/queries';

const tabs = [
  { id: 'orders', label: 'অর্ডার' },
  { id: 'products', label: 'পণ্য' },
  { id: 'categories', label: 'ক্যাটাগরি' },
  { id: 'settings', label: 'সেটিংস' },
];

function AdminDashboardPage() {
  const { admin, logout } = useAdminAuth();
  const { categories, products, settings, refetch } = useProducts();
  const { orders, loading, submitting, changeStatus } = useOrders({
    adminMode: true,
  });
  const [activeTab, setActiveTab] = useState('orders');

  const todayString = new Date().toDateString();
  const stats = useMemo(() => {
    const todayOrders = orders.filter(
      (order) => new Date(order.created_at).toDateString() === todayString,
    );

    return {
      todayOrders: todayOrders.length,
      pendingOrders: orders.filter((order) => order.status === 'pending').length,
      revenue: todayOrders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0),
      products: products.length,
    };
  }, [orders, products, todayString]);

  const handleCategorySave = async (payload) => {
    await saveCategory(payload);
    await refetch();
  };

  const handleProductSave = async (payload) => {
    await saveProduct(payload);
    await refetch();
  };

  const handleSettingsSave = async (payload) => {
    await saveSettings(payload);
    await refetch();
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="section-shell overflow-hidden">
        <div className="grid gap-6 bg-gradient-to-br from-ink via-brand-900 to-soil p-6 text-white md:grid-cols-[1fr,auto] md:p-8">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-white/70">অ্যাডমিন ড্যাশবোর্ড</p>
            <h2 className="mt-3 text-3xl font-extrabold">আড়ৎ অপারেশনস সেন্টার</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/75">
              পণ্য, অর্ডার, ক্যাটাগরি, ডেলিভারি সেটিংস আর payment number সব কিছু এখান থেকে
              live control করুন।
            </p>
          </div>
          <div className="flex flex-col gap-3 md:items-end">
            <div className="rounded-3xl bg-white/10 px-5 py-4 text-left backdrop-blur">
              <p className="text-xs text-white/70">বর্তমান অ্যাডমিন</p>
              <p className="mt-1 text-lg font-bold">
                {admin?.profile?.full_name || 'ডেমো অ্যাডমিন'}
              </p>
            </div>
            <button
              type="button"
              className="btn-secondary border-white/30 bg-white/10 text-white"
              onClick={logout}
            >
              লগআউট
            </button>
          </div>
        </div>
      </section>

      <StatsGrid stats={stats} />

      <div className="flex gap-3 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold transition ${
              activeTab === tab.id
                ? 'bg-brand-600 text-white'
                : 'border border-brand-100 bg-white text-brand-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'orders' && (
        <OrderManager orders={orders} onUpdateStatus={changeStatus} submitting={submitting || loading} />
      )}
      {activeTab === 'products' && (
        <ProductManager
          categories={categories}
          products={products}
          onSave={handleProductSave}
          submitting={submitting}
        />
      )}
      {activeTab === 'categories' && (
        <CategoryManager categories={categories} onSave={handleCategorySave} submitting={submitting} />
      )}
      {activeTab === 'settings' && (
        <SettingsManager settings={settings} onSave={handleSettingsSave} submitting={submitting} />
      )}
    </div>
  );
}

export default AdminDashboardPage;
