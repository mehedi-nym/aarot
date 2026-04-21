import { useEffect, useState } from 'react';
import {
  fetchOrders,
  placeOrder,
  trackOrder,
  updateOrderStatus,
} from '../lib/queries';
import { hasSupabaseEnv, supabase } from '../lib/supabase';

export function useOrders({ adminMode = false } = {}) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(adminMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadOrders = async () => {
    if (!adminMode) return;
    try {
      setLoading(true);
      const data = await fetchOrders();
      setOrders(data);
      setError('');
    } catch (loadError) {
      setError(loadError.message || 'অর্ডার লোড করা যায়নি');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [adminMode]);

  useEffect(() => {
    if (!adminMode || !hasSupabaseEnv) return undefined;

    const channel = supabase
      .channel('aarot-orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => loadOrders(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [adminMode]);

  const submitOrder = async (payload) => {
    try {
      setSubmitting(true);
      setError('');
      const createdOrder = await placeOrder(payload);
      if (adminMode) {
        await loadOrders();
      }
      return createdOrder;
    } catch (submitError) {
      setError(submitError.message || 'অর্ডার করা যায়নি');
      throw submitError;
    } finally {
      setSubmitting(false);
    }
  };

  const findOrder = async ({ orderCode, phone }) => {
  try {
    setSubmitting(true);
    setError('');

    let query = supabase.from('orders').select(`
      *,
      items:order_items(*)
    `);

    // If we have an orderCode, that's unique enough!
    if (orderCode) {
      query = query.eq('order_code', orderCode);
    } 
    
    // If we only have a phone (like on the list page)
    if (phone && !orderCode) {
      query = query.eq('phone', phone);
    }

    const { data, error: fetchError } = await query;

    if (fetchError) throw fetchError;
    
    // Return the first item if searching by Code, otherwise the whole array
    return orderCode ? (data[0] || null) : data;

  } catch (trackError) {
    setError(trackError.message || 'অর্ডার খুঁজে পাওয়া যায়নি');
    return null;
  } finally {
    setSubmitting(false);
  }
};
  const changeStatus = async (payload) => {
    try {
      setSubmitting(true);
      setError('');
      const updated = await updateOrderStatus(payload);
      await loadOrders();
      return updated;
    } catch (statusError) {
      setError(statusError.message || 'স্ট্যাটাস আপডেট করা যায়নি');
      throw statusError;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    orders,
    loading,
    submitting,
    error,
    refetch: loadOrders,
    submitOrder,
    findOrder,
    changeStatus,
  };
}
