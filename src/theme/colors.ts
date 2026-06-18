const isDayTime = (): boolean => {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 18;
};

export const DayTheme = {
  background: '#F7F4ED',
  surface: '#FFFFFF',
  primary: '#F5A623',
  primaryDark: '#C47D00',
  text: '#1A1A1A',
  textSecondary: '#6B6B6B',
  flipBoard: '#1A1A1A',
  flipText: '#F7F4ED',
  border: '#E0D8C8',
  success: '#2D7D46',
  danger: '#C0392B',
  mapStyle: 'light',
};

export const NightTheme = {
  background: '#0A0E1A',
  surface: '#141824',
  primary: '#F5A623',
  primaryDark: '#C47D00',
  text: '#F0EDE4',
  textSecondary: '#8A8FA8',
  flipBoard: '#0F1320',
  flipText: '#F5A623',
  border: '#1E2436',
  success: '#27AE60',
  danger: '#E74C3C',
  mapStyle: 'dark',
};

export const getTheme = () => isDayTime() ? DayTheme : NightTheme;
export type Theme = typeof DayTheme;
