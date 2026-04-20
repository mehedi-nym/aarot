export const SELL_TYPES = {
  piece: {
    label: 'পিস',
    shortLabel: 'টি',
    step: 1,
    min: 1,
  },
  kg: {
    label: 'কেজি',
    shortLabel: 'কেজি',
    step: 0.5,
    min: 0.5,
  },
  gram: {
    label: 'গ্রাম',
    shortLabel: 'গ্রাম',
    step: 250,
    min: 250,
  },
};

export const AREA_OPTIONS = [
  {
    slug: 'dhanmondi',
    name: 'ধানমন্ডি',
    distanceKm: 3,
  },
  {
    slug: 'mohammadpur',
    name: 'মোহাম্মদপুর',
    distanceKm: 5,
  },
];

export const ORDER_STATUSES = [
  { value: 'pending', label: 'পেন্ডিং' },
  { value: 'hold', label: 'হোল্ড' },
  { value: 'out_for_delivery', label: 'ডেলিভারির পথে' },
  { value: 'delivered', label: 'ডেলিভারড' },
  { value: 'cancelled', label: 'বাতিল' },
];

export const CATEGORY_FALLBACKS = [
  {
    id: 'cat-veg',
    name_bn: 'সবজি',
    slug: 'sobji',
    is_active: true,
    sort_order: 1,
  },
  {
    id: 'cat-fruit',
    name_bn: 'ফল',
    slug: 'fol',
    is_active: true,
    sort_order: 2,
  },
  {
    id: 'cat-grocery',
    name_bn: 'ভবিষ্যতে গ্রোসারি',
    slug: 'grocery',
    is_active: true,
    sort_order: 3,
  },
];
