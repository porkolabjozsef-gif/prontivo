import { useState, useEffect } from 'react';
import { getTheme, Theme } from '../theme/colors';

export const useTheme = (): Theme => {
  const [theme, setTheme] = useState<Theme>(getTheme());

  useEffect(() => {
    const interval = setInterval(() => {
      setTheme(getTheme());
    }, 60000); // percenként ellenőriz
    return () => clearInterval(interval);
  }, []);

  return theme;
};
