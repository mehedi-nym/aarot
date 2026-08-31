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

export const hasActiveOffer = (product) => {
  const price = Number(product?.price || 0);
  const offerPrice = Number(product?.offer_price || 0);
  const regularPrice = Number(product?.regular_price || 0);
  const now = new Date();
  const startsAt = product?.offer_starts_at ? new Date(product.offer_starts_at) : null;
  const endsAt = product?.offer_ends_at ? new Date(product.offer_ends_at) : null;

  if (startsAt && startsAt > now) return false;
  if (endsAt && endsAt < now) return false;

  return (offerPrice > 0 && offerPrice < price) || (regularPrice > 0 && price < regularPrice);
};

export const getProductPrice = (product) => {
  const price = Number(product?.price || 0);
  const offerPrice = Number(product?.offer_price || 0);

  if (!hasActiveOffer(product)) return price;
  return offerPrice > 0 && offerPrice < price ? offerPrice : price;
};

export const getAreaDistanceKm = (area) =>
  Number(area?.distance_km ?? area?.distanceKm ?? 0);

export const getAreaName = (area) => area?.name_bn || area?.name || '';

export const getAreaMeta = (slug, areas = AREA_OPTIONS) => {
  const availableAreas = areas.length ? areas : AREA_OPTIONS;
  return availableAreas.find((area) => area.slug === slug) || availableAreas[0];
};

export const calculateDeliveryCharge = (settings, areaSlug, areas = AREA_OPTIONS) => {
  const area = getAreaMeta(areaSlug, areas);
  const overrideFee = Number(area?.delivery_fee_override);
  if (Number.isFinite(overrideFee) && overrideFee >= 0) return overrideFee;

  const baseCharge = Number(settings?.base_delivery_charge || 0);
  const perKmCharge = Number(settings?.per_km_delivery_charge || 0);
  const extraDistance = Math.max(0, getAreaDistanceKm(area) - 2);

  return baseCharge + extraDistance * perKmCharge;
};

export const isAreaEligible = (settings, areaSlug, areas = AREA_OPTIONS) => {
  const area = getAreaMeta(areaSlug, areas);
  if (!area || area.is_active === false) return false;

  return getAreaDistanceKm(area) <= Number(settings?.delivery_radius_km || 0);
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
