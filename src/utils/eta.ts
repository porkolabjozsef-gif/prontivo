import { haversineDistance } from './haversine';

interface Location {
  latitude: number;
  longitude: number;
}

export const calculateETA = (
  current: Location,
  destination: Location,
  speedMs: number | null
): number | null => {
  const distanceM = haversineDistance(current, destination) * 1000;
  if (!speedMs || speedMs < 0.5) return null;
  return Math.round(distanceM / speedMs / 60);
};

export const shouldAlert = (
  etaMinutes: number | null,
  alertMinutes: number,
  distanceKm: number
): boolean => {
  if (etaMinutes !== null && etaMinutes <= alertMinutes) return true;
  if (etaMinutes === null && distanceKm <= 0.5) return true;
  return false;
};
