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

export const DELIVERY_AREA_FALLBACKS = [
  {
    slug: 'dhanmondi',
    name: 'ধানমন্ডি',
    name_bn: 'ধানমন্ডি',
    distanceKm: 3,
    distance_km: 3,
    delivery_fee_override: null,
    is_active: true,
    sort_order: 1,
  },
  {
    slug: 'mohammadpur',
    name: 'মোহাম্মদপুর',
    name_bn: 'মোহাম্মদপুর',
    distanceKm: 5,
    distance_km: 5,
    delivery_fee_override: null,
    is_active: true,
    sort_order: 2,
  },
  {
    slug: 'lalmatia',
    name: 'লালমাটিয়া',
    name_bn: 'লালমাটিয়া',
    distanceKm: 4,
    distance_km: 4,
    delivery_fee_override: null,
    is_active: true,
    sort_order: 3,
  },
  {
    slug: 'adabor',
    name: 'আদাবর',
    name_bn: 'আদাবর',
    distanceKm: 6,
    distance_km: 6,
    delivery_fee_override: null,
    is_active: true,
    sort_order: 4,
  },
  {
    slug: 'shyamoli',
    name: 'শ্যামলী',
    name_bn: 'শ্যামলী',
    distanceKm: 6,
    distance_km: 6,
    delivery_fee_override: null,
    is_active: true,
    sort_order: 5,
  },
];

export const AREA_OPTIONS = DELIVERY_AREA_FALLBACKS;

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
