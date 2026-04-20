import { useEffect, useMemo, useState } from 'react';
import { fetchCategories, fetchProducts, fetchSettings } from '../lib/queries';
import { hasSupabaseEnv, supabase } from '../lib/supabase';

export function useProducts(activeCategory = 'all') {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [categoryData, productData, settingData] = await Promise.all([
        fetchCategories(),
        fetchProducts(),
        fetchSettings(),
      ]);

      setCategories(categoryData);
      setProducts(productData);
      setSettings(settingData);
      setError('');
    } catch (loadError) {
      setError(loadError.message || 'ডাটা লোড করা যায়নি');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!hasSupabaseEnv) return undefined;

    const channel = supabase
      .channel('aarot-public')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => loadData(),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'categories' },
        () => loadData(),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'site_settings' },
        () => loadData(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'all') return products;
    return products.filter((product) => product.category_id === activeCategory);
  }, [activeCategory, products]);

  const todaysProducts = useMemo(
    () => filteredProducts.filter((product) => product.available_today && product.is_available),
    [filteredProducts],
  );

  return {
    categories,
    products: filteredProducts,
    todaysProducts,
    settings,
    loading,
    error,
    refetch: loadData,
  };
}
