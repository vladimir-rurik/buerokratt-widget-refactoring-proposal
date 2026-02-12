// config/defaults.ts
import type { WidgetConfig } from './types';

export const defaultConfig: WidgetConfig = {
  api: {
    ruuterUrl: '',
    notificationUrl: '',
    timeout: 30000,
  },
  auth: {
    timUrl: '',
    enabled: false,
  },
  ui: {
    height: 450,
    width: 400,
    instantlyOpen: false,
  },
  officeHours: {
    enabled: false,
    timezone: 'Europe/Tallinn',
    begin: 8,
    end: 17,
    days: [1, 2, 3, 4, 5],
  },
};
