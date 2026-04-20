import { AREA_OPTIONS, ORDER_STATUSES, SELL_TYPES } from './constants';

export const formatBanglaNumber = (value) =>
  new Intl.NumberFormat('bn-BD').format(Number(value || 0));

export const formatBanglaCurrency = (value) =>
  `৳${formatBanglaNumber(Number(value || 0).toFixed(0))}`;

export const formatBanglaDate = (value) =>
  new Intl.DateTimeFormat('bn-BD', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(value));

export const formatBanglaDateTime = (value) =>
  new Intl.DateTimeFormat('bn-BD', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));

export const formatBanglaTime = (timeValue) => {
  if (!timeValue) return '';
  const [hours = '0', minutes = '0'] = timeValue.split(':');
  const date = new Date();
  date.setHours(Number(hours), Number(minutes), 0, 0);

  return new Intl.DateTimeFormat('bn-BD', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
};

export const getSellTypeMeta = (sellType) => SELL_TYPES[sellType] || SELL_TYPES.kg;

export const getAreaMeta = (slug) =>
  AREA_OPTIONS.find((area) => area.slug === slug) || AREA_OPTIONS[0];

export const calculateDeliveryCharge = (settings, areaSlug) => {
  const area = getAreaMeta(areaSlug);
  const baseCharge = Number(settings?.base_delivery_charge || 0);
  const perKmCharge = Number(settings?.per_km_delivery_charge || 0);
  const extraDistance = Math.max(0, area.distanceKm - 2);

  return baseCharge + extraDistance * perKmCharge;
};

export const isAreaEligible = (settings, areaSlug) => {
  const area = getAreaMeta(areaSlug);
  return area.distanceKm <= Number(settings?.delivery_radius_km || 0);
};

export const getOrderDeliveryInfo = (settings) => {
  const now = new Date();
  const deliveryStart = new Date();
  const [hours = '14', minutes = '00'] = (settings?.delivery_start_time_time || '14:00:00').split(':');
  deliveryStart.setHours(Number(hours), Number(minutes), 0, 0);

  const deliveryDate = new Date(now);
  const isNextDay = now > deliveryStart;

  if (isNextDay) {
    deliveryDate.setDate(deliveryDate.getDate() + 1);
  }

  return {
    deliveryDate,
    deliveryType: isNextDay ? 'next_day' : 'same_day',
    deliveryLabel: isNextDay ? 'পরের দিন' : 'আজ',
  };
};

export const buildOrderCode = () =>
  `AR-${Date.now().toString().slice(-8)}`.toUpperCase();

export const getStatusMeta = (status) =>
  ORDER_STATUSES.find((item) => item.value === status) || ORDER_STATUSES[0];

export const safeJsonParse = (value, fallback) => {
  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
};

export const sortByDateDesc = (left, right) =>
  new Date(right.created_at).getTime() - new Date(left.created_at).getTime();
