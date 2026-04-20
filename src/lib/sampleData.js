import { CATEGORY_FALLBACKS } from './constants';

export const sampleSettings = {
  id: 1,
  delivery_notice_bn: 'আজ দুপুর ২টার আগে অর্ডার করলে আজই ডেলিভারি, এরপরের অর্ডার যাবে পরের দিনের স্লটে।',
  delivery_radius_km: 6,
  base_delivery_charge: 40,
  per_km_delivery_charge: 10,
  bkash_number: '01711-223344',
  delivery_start_time_time: '14:00:00',
};

export const sampleCategories = CATEGORY_FALLBACKS;

export const sampleProducts = [
  {
    id: 'prod-1',
    name_bn: 'দেশি টমেটো',
    slug: 'deshi-tomato',
    image_url:
      'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=900&q=80',
    category_id: 'cat-veg',
    origin_bn: 'বগুড়া',
    sell_type: 'kg',
    price: 95,
    stock_quantity: 42,
    quantity_step: 0.5,
    minimum_quantity: 0.5,
    is_available: true,
    available_today: true,
  },
  {
    id: 'prod-2',
    name_bn: 'ফুলকপি',
    slug: 'fulkopi',
    image_url:
      'https://images.unsplash.com/photo-1615485291234-9fbc14a99691?auto=format&fit=crop&w=900&q=80',
    category_id: 'cat-veg',
    origin_bn: 'যশোর',
    sell_type: 'piece',
    price: 55,
    stock_quantity: 24,
    quantity_step: 1,
    minimum_quantity: 1,
    is_available: true,
    available_today: true,
  },
  {
    id: 'prod-3',
    name_bn: 'গাজর',
    slug: 'gajor',
    image_url:
      'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=900&q=80',
    category_id: 'cat-veg',
    origin_bn: 'রংপুর',
    sell_type: 'gram',
    price: 28,
    stock_quantity: 8000,
    quantity_step: 250,
    minimum_quantity: 250,
    is_available: true,
    available_today: true,
  },
  {
    id: 'prod-4',
    name_bn: 'কলা (সাগর)',
    slug: 'kola-sagor',
    image_url:
      'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=900&q=80',
    category_id: 'cat-fruit',
    origin_bn: 'নরসিংদী',
    sell_type: 'piece',
    price: 12,
    stock_quantity: 50,
    quantity_step: 1,
    minimum_quantity: 2,
    is_available: true,
    available_today: true,
  },
];

export const sampleOrders = [];
