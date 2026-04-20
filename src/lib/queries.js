import { sampleCategories, sampleOrders, sampleProducts, sampleSettings } from './sampleData';
import { hasSupabaseEnv, supabase } from './supabase';
import { buildOrderCode, safeJsonParse, sortByDateDesc } from './utils';

const LOCAL_SETTINGS_KEY = 'aarot-settings';
const LOCAL_CATEGORIES_KEY = 'aarot-categories';
const LOCAL_PRODUCTS_KEY = 'aarot-products';
const LOCAL_ORDERS_KEY = 'aarot-orders';

const readLocalValue = (key, fallback) => {
  if (typeof window === 'undefined') return fallback;
  return safeJsonParse(localStorage.getItem(key), fallback);
};

const writeLocalValue = (key, value) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
};

const readLocalOrders = () => {
  return readLocalValue(LOCAL_ORDERS_KEY, sampleOrders);
};

const writeLocalOrders = (orders) => {
  writeLocalValue(LOCAL_ORDERS_KEY, orders);
};

export async function fetchSettings() {
  if (!hasSupabaseEnv) return readLocalValue(LOCAL_SETTINGS_KEY, sampleSettings);

  const { data, error } = await supabase.from('site_settings').select('*').single();
  if (error) throw error;
  return data;
}

export async function fetchCategories() {
  if (!hasSupabaseEnv) return readLocalValue(LOCAL_CATEGORIES_KEY, sampleCategories);

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data;
}

export async function fetchProducts() {
  if (!hasSupabaseEnv) return readLocalValue(LOCAL_PRODUCTS_KEY, sampleProducts);

  const { data, error } = await supabase
    .from('products')
    .select(
      `
        *,
        categories (
          id,
          name_bn,
          slug
        )
      `,
    )
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function placeOrder(orderPayload) {
  if (!hasSupabaseEnv) {
    const orders = readLocalOrders();
    const newOrder = {
      ...orderPayload,
      id: crypto.randomUUID(),
      order_code: orderPayload.order_code || buildOrderCode(),
      created_at: new Date().toISOString(),
    };
    const updated = [newOrder, ...orders].sort(sortByDateDesc);
    writeLocalOrders(updated);
    return newOrder;
  }

  const { data, error } = await supabase.rpc('place_order', {
    order_payload: orderPayload,
  });

  if (error) throw error;
  return data;
}

export async function trackOrder(orderCode, phone) {
  if (!hasSupabaseEnv) {
    const orders = readLocalOrders();
    const order = orders.find(
      (item) => item.order_code === orderCode.trim().toUpperCase() && item.phone === phone.trim(),
    );
    return order || null;
  }

  const { data, error } = await supabase.rpc('track_order', {
    order_code_input: orderCode.trim().toUpperCase(),
    phone_input: phone.trim(),
  });

  if (error) throw error;
  return data?.[0] || null;
}

export async function fetchOrders() {
  if (!hasSupabaseEnv) {
    return readLocalOrders().sort(sortByDateDesc);
  }

  const { data, error } = await supabase
    .from('orders')
    .select(
      `
        *,
        order_items (
          id,
          product_name_bn,
          sell_type,
          unit_price,
          quantity,
          line_total
        )
      `,
    )
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function saveCategory(category) {
  if (!hasSupabaseEnv) {
    const categories = readLocalValue(LOCAL_CATEGORIES_KEY, sampleCategories);
    const payload = { ...category, id: category.id || crypto.randomUUID() };
    const updated = category.id
      ? categories.map((item) => (item.id === category.id ? payload : item))
      : [...categories, payload];
    writeLocalValue(LOCAL_CATEGORIES_KEY, updated);
    return payload;
  }

  const payload = {
    ...category,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase.from('categories').upsert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function saveProduct(product) {
  const { categories, categoryName, ...productFields } = product;

  if (!hasSupabaseEnv) {
    const products = readLocalValue(LOCAL_PRODUCTS_KEY, sampleProducts);
    const payload = { ...productFields, id: productFields.id || crypto.randomUUID() };
    const updated = productFields.id
      ? products.map((item) => (item.id === productFields.id ? payload : item))
      : [payload, ...products];
    writeLocalValue(LOCAL_PRODUCTS_KEY, updated);
    return payload;
  }

  const payload = {
    ...productFields,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase.from('products').upsert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function saveSettings(settings) {
  if (!hasSupabaseEnv) {
    writeLocalValue(LOCAL_SETTINGS_KEY, settings);
    return settings;
  }

  const payload = {
    ...settings,
    id: 1,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase.from('site_settings').upsert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updateOrderStatus({ orderId, status, status_message_bn }) {
  if (!hasSupabaseEnv) {
    const orders = readLocalOrders();
    const updatedOrders = orders.map((order) =>
      order.id === orderId ? { ...order, status, status_message_bn } : order,
    );
    writeLocalOrders(updatedOrders);
    return updatedOrders.find((order) => order.id === orderId);
  }

  const { data, error } = await supabase
    .from('orders')
    .update({
      status,
      status_message_bn,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function signInAdmin({ email, password }) {
  if (!hasSupabaseEnv) {
    return {
      user: {
        id: 'demo-admin',
        email,
      },
      profile: {
        full_name: 'ডেমো অ্যাডমিন',
        role: 'admin',
      },
    };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  const { data: profile, error: profileError } = await supabase
    .from('admin_profiles')
    .select('*')
    .eq('user_id', data.user.id)
    .single();

  if (profileError) throw profileError;
  return {
    user: data.user,
    profile,
  };
}

export async function getCurrentAdmin() {
  if (!hasSupabaseEnv) return null;

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) return null;

  const { data, error } = await supabase
    .from('admin_profiles')
    .select('*')
    .eq('user_id', session.user.id)
    .single();

  if (error) throw error;

  return {
    user: session.user,
    profile: data,
  };
}

export async function signOutAdmin() {
  if (!hasSupabaseEnv) return;
  await supabase.auth.signOut();
}
