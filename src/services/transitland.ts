import axios from 'axios';
import { TRANSITLAND_API_KEY, TRANSITLAND_BASE_URL } from '../constants/config';

const api = axios.create({
  baseURL: TRANSITLAND_BASE_URL,
  params: { apikey: TRANSITLAND_API_KEY },
});

export interface TransitStop {
  onestop_id: string;
  name: string;
  latitude: number;
  longitude: number;
}

export interface TransitRoute {
  routeId: string;
  routeName: string;
  routeType: string;
  agencyName: string;
}

// Megállók keresése szöveg alapján
export const searchStops = async (query: string): Promise<TransitStop[]> => {
  const response = await api.get('/stops', {
    params: { search: query, limit: 10 },
  });
  return (response.data.stops || []).map((s: any) => ({
    onestop_id: s.onestop_id,
    name: s.stop_name,
    latitude: s.geometry?.coordinates?.[1],
    longitude: s.geometry?.coordinates?.[0],
  }));
};

// Megállók keresése GPS pozíció közelében
export const searchStopsNearby = async (
  lat: number,
  lon: number,
  radiusMeters = 800
): Promise<TransitStop[]> => {
  const response = await api.get('/stops', {
    params: { lat, lon, radius: radiusMeters, limit: 15 },
  });
  return (response.data.stops || []).map((s: any) => ({
    onestop_id: s.onestop_id,
    name: s.stop_name,
    latitude: s.geometry?.coordinates?.[1],
    longitude: s.geometry?.coordinates?.[0],
  }));
};

// Egy megálló összes járata
const getRoutesAtStop = async (stopOnestopId: string) => {
  const response = await api.get('/routes', {
    params: { served_by_stop_onestop_id: stopOnestopId, limit: 50 },
  });
  return response.data.routes || [];
};

// Olyan járatok keresése amik MINDKÉT megállón áthaladnak
// Ez a kulcsfunkció: csak a ténylegesen releváns járatokat ajánljuk fel
export const findMatchingRoutes = async (
  fromStopId: string,
  toStopId: string
): Promise<TransitRoute[]> => {
  const [fromRoutes, toRoutes] = await Promise.all([
    getRoutesAtStop(fromStopId),
    getRoutesAtStop(toStopId),
  ]);

  const toRouteIds = new Set(toRoutes.map((r: any) => r.onestop_id));

  const matching = fromRoutes.filter((r: any) => toRouteIds.has(r.onestop_id));

  return matching.map((r: any) => ({
    routeId: r.onestop_id,
    routeName: r.route_short_name || r.route_long_name || '—',
    routeType: r.route_type_name || 'Járat',
    agencyName: r.agency?.agency_name || '',
  }));
};

// Tájékoztató indulási/érkezési idő egy adott járathoz, megállóhoz
export const getStopDepartures = async (stopOnestopId: string) => {
  const response = await api.get('/stop_times', {
    params: { stop_onestop_id: stopOnestopId, limit: 20 },
  });
  return response.data.stop_times || [];
};
