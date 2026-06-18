import axios from 'axios';
import { TRANSITLAND_API_KEY, TRANSITLAND_BASE_URL } from '../constants/config';

const api = axios.create({
  baseURL: TRANSITLAND_BASE_URL,
  params: { apikey: TRANSITLAND_API_KEY },
});

// Megállók keresése szöveg alapján
export const searchStops = async (query: string) => {
  const response = await api.get('/stops', {
    params: { search: query, limit: 10 },
  });
  return response.data.stops || [];
};

// Járatok keresése megálló alapján
export const getRoutesByStop = async (stopId: string) => {
  const response = await api.get('/routes', {
    params: { served_by_onestop_ids: stopId, limit: 10 },
  });
  return response.data.routes || [];
};

// Menetrend lekérése megállóhoz
export const getStopDepartures = async (stopId: string) => {
  const response = await api.get('/stop_times', {
    params: { stop_onestop_id: stopId, limit: 20 },
  });
  return response.data.stop_times || [];
};
