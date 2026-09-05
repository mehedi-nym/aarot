import { useEffect, useMemo, useState } from 'react';
import {
  fetchCategories,
  fetchDeliveryAreas,
  fetchProducts,
  fetchPromotionalBanners,
  fetchSettings,
} from '../lib/queries';
import { hasSupabaseEnv, supabase } from '../lib/supabase';
import { getDiscountAmount, hasActiveOffer } from '../lib/utils';

const normalizeSearchValue = (value) =>
  String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[-_]+/g, ' ')
    .trim();

const getPriorityValue = (product) => {
  const priority = Number(product.priority);
  return Number.isFinite(priority) ? priority : Number.MAX_SAFE_INTEGER;
};

const sortByPriority = (left, right) => {
  const priorityDiff = getPriorityValue(left) - getPriorityValue(right);
  if (priorityDiff !== 0) return priorityDiff;

  return new Date(right.created_at || 0).getTime() - new Date(left.created_at || 0).getTime();
};

const productMatchesSearch = (product, searchQuery) => {
  const query = normalizeSearchValue(searchQuery);
  if (!query) return true;

  const searchableText = [
    product.name_bn,
    product.slug,
    product.origin_bn,
    product.sell_type,
    product.categories?.name_bn,
    product.categories?.slug,
  ]
    .map(normalizeSearchValue)
    .join(' ');

  return searchableText.includes(query);
};

export function useProducts(activeCategory = 'all', options = {}) {
  const { searchQuery = '', includeUnavailable = false } = options;
  const [categories, setCategories] = useState([]);
  const [deliveryAreas, setDeliveryAreas] = useState([]);
  const [products, setProducts] = useState([]);
  const [promotionalBanners, setPromotionalBanners] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [
        categoryData,
        productData,
        settingData,
        deliveryAreaData,
        promotionalBannerData,
      ] = await Promise.all([
        fetchCategories(),
        fetchProducts(),
        fetchSettings(),
        fetchDeliveryAreas({ includeInactive: includeUnavailable }),
        fetchPromotionalBanners({ placement: 'home_popup' }),
      ]);

      setCategories(categoryData);
      setProducts(productData);
      setSettings(settingData);
      setDeliveryAreas(deliveryAreaData);
      setPromotionalBanners(promotionalBannerData);
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
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'delivery_areas' },
        () => loadData(),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'promotional_banners' },
        () => loadData(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const visibleProducts = useMemo(() => {
    const publicProducts = includeUnavailable
      ? products
      : products.filter((product) => product.is_available !== false);

    return [...publicProducts].sort(sortByPriority);
  }, [includeUnavailable, products]);

  const filteredProducts = useMemo(() => {
    const categoryProducts =
      activeCategory === 'all'
        ? visibleProducts
        : visibleProducts.filter((product) => product.category_id === activeCategory);

    return categoryProducts.filter((product) => productMatchesSearch(product, searchQuery));
  }, [activeCategory, searchQuery, visibleProducts]);

  const todaysProducts = useMemo(
    () => filteredProducts,
    [filteredProducts],
  );

  const allTodaysProducts = useMemo(
    () => visibleProducts,
    [visibleProducts],
  );

  const offerProducts = useMemo(
    () =>
      visibleProducts
        .filter(hasActiveOffer)
        .sort((left, right) => getDiscountAmount(right) - getDiscountAmount(left)),
    [visibleProducts],
  );

  return {
    categories,
    deliveryAreas,
    products: filteredProducts,
    allProducts: visibleProducts,
    todaysProducts,
    allTodaysProducts,
    offerProducts,
    promotionalBanners,
    settings,
    loading,
    error,
    refetch: loadData,
  };
}
