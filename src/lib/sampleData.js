import { CATEGORY_FALLBACKS, DELIVERY_AREA_FALLBACKS } from './constants';

export const sampleSettings = {
  id: 1,
  delivery_notice_bn: 'আজ দুপুর ২টার আগে অর্ডার করলে আজই ডেলিভারি, এরপরের অর্ডার যাবে পরের দিনের স্লটে।',
  delivery_radius_km: 6,
  base_delivery_charge: 40,
  per_km_delivery_charge: 5,
  bkash_number: '01711-223344',
  mix_pack_enabled: true,
  delivery_start_time_time: '14:00:00',
};

export const sampleCategories = CATEGORY_FALLBACKS;

export const sampleDeliveryAreas = DELIVERY_AREA_FALLBACKS;

export const samplePromotionalBanners = [
  {
    id: 'promo-home-1',
    placement: 'home_popup',
    title_bn: 'আজকের টাটকা বাজার',
    title_en: "Today's Fresh Market",
    description_bn: 'নতুন অফার পণ্য দেখতে নিচের অফার সেকশন ঘুরে দেখুন।',
    description_en: 'Explore today’s offer products in the offer section.',
    media_url:
      'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1000&q=80',
    media_type: 'image',
    alt_text_bn: 'তাজা সবজি ও ফলের বাজারের ছবি',
    alt_text_en: 'Fresh vegetables and fruits market image',
    link_url: '#offers',
    button_label_bn: 'অফার দেখুন',
    button_label_en: 'View Offers',
    seo_title_bn: 'আড়ৎ অফার',
    seo_title_en: 'Aarot Offers',
    seo_description_bn: 'আড়ৎ থেকে আজকের টাটকা পণ্যের অফার।',
    seo_description_en: 'Fresh product offers from Aarot.',
    starts_at: null,
    ends_at: null,
    priority: 1,
    is_active: false,
  },
];

export const sampleContentPages = [
  {
    slug: 'about',
    title_bn: 'আমাদের সম্পর্কে',
    title_en: 'About Us',
    body_bn:
      'আড়ৎ হলো ঘরে বসে টাটকা সবজি, ফল ও প্রয়োজনীয় বাজার অর্ডার করার সহজ প্ল্যাটফর্ম। আমাদের লক্ষ্য হলো স্থানীয় গ্রাহকদের কাছে আড়ৎ থেকে সতেজ পণ্য সঠিক ওজনে, স্বচ্ছ দামে এবং যত্নসহকারে পৌঁছে দেওয়া।\n\nআমাদের ভিশন হলো দৈনন্দিন বাজারকে আরও সহজ, বিশ্বাসযোগ্য ও ডিজিটাল করা। আমাদের মিশন হলো প্রতিদিন মানসম্পন্ন পণ্য সংগ্রহ, সঠিক পরিমাপ, পরিষ্কার প্যাকিং এবং সময়মতো ডেলিভারির মাধ্যমে গ্রাহকের ভরসা অর্জন করা।',
    body_en:
      'Aarot is a simple platform for ordering fresh vegetables, fruits, and daily groceries from home. Our goal is to deliver fresh market products to local customers with accurate weight, transparent pricing, and careful handling.\n\nOur vision is to make everyday grocery shopping easier, more trustworthy, and more digital. Our mission is to earn customer trust through quality sourcing, accurate measurement, clean packing, and timely delivery.',
    seo_title_bn: 'আড়ৎ সম্পর্কে',
    seo_title_en: 'About Aarot',
    seo_description_bn: 'আড়ৎ-এর ভিশন, মিশন এবং সেবার গল্প জানুন।',
    seo_description_en: 'Learn about Aarot’s vision, mission, and service story.',
    is_published: true,
  },
  {
    slug: 'policy',
    title_bn: 'নীতিমালা',
    title_en: 'Policy',
    body_bn:
      'আড়ৎ-এ অর্ডার করার সময় গ্রাহকের তথ্য নিরাপদে ব্যবহার করা হয় এবং শুধুমাত্র অর্ডার, ডেলিভারি ও সাপোর্টের কাজে রাখা হয়। পণ্যের দাম, স্টক এবং ডেলিভারি সময় বাজার পরিস্থিতি অনুযায়ী পরিবর্তন হতে পারে।\n\nকোনো পণ্য স্টকে না থাকলে বা মান ঠিক না হলে আমরা গ্রাহককে জানিয়ে সমাধান করি। ডেলিভারির সময় ঠিকানা, ফোন নম্বর এবং পেমেন্ট তথ্য সঠিকভাবে দেওয়া গ্রাহকের দায়িত্ব।',
    body_en:
      'At Aarot, customer information is used carefully and only for orders, delivery, and support. Product prices, stock, and delivery timing may change based on market conditions.\n\nIf a product is out of stock or does not meet our quality standard, we inform the customer and resolve it. Customers are responsible for providing correct address, phone number, and payment information.',
    seo_title_bn: 'আড়ৎ নীতিমালা',
    seo_title_en: 'Aarot Policy',
    seo_description_bn: 'আড়ৎ-এর অর্ডার, ডেলিভারি, তথ্য এবং সাপোর্ট নীতিমালা।',
    seo_description_en: 'Aarot order, delivery, information, and support policy.',
    is_published: true,
  },
];

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
    offer_price: 85,
    offer_starts_at: null,
    offer_ends_at: null,
    offer_badge_bn: 'আজকের অফার',
    offer_badge_en: "Today's Offer",
    stock_quantity: 42,
    quantity_step: 0.5,
    minimum_quantity: 0.5,
    is_available: true,
    available_today: true,
    include_in_mix_pack: true,
    priority: 1,
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
    offer_price: null,
    offer_starts_at: null,
    offer_ends_at: null,
    offer_badge_bn: null,
    offer_badge_en: null,
    stock_quantity: 24,
    quantity_step: 1,
    minimum_quantity: 1,
    is_available: true,
    available_today: true,
    include_in_mix_pack: true,
    priority: 2,
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
    offer_price: null,
    offer_starts_at: null,
    offer_ends_at: null,
    offer_badge_bn: null,
    offer_badge_en: null,
    stock_quantity: 8000,
    quantity_step: 250,
    minimum_quantity: 250,
    is_available: true,
    available_today: true,
    include_in_mix_pack: true,
    priority: 3,
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
    offer_price: null,
    offer_starts_at: null,
    offer_ends_at: null,
    offer_badge_bn: null,
    offer_badge_en: null,
    stock_quantity: 50,
    quantity_step: 1,
    minimum_quantity: 2,
    is_available: true,
    available_today: true,
    include_in_mix_pack: false,
    priority: 4,
  },
];

export const sampleOrders = [];
