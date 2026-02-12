// config/adapter.ts
import type { WidgetConfig, LegacyEnv } from './types';
import { defaultConfig } from './defaults';

/**
 * Adapt legacy window._env_ to new config format
 */
export function adaptLegacyConfig(env: LegacyEnv): Partial<WidgetConfig> {
  return {
    api: {
      ruuterUrl: env.RUUTER_API_URL ?? defaultConfig.api.ruuterUrl,
      notificationUrl: env.NOTIFICATION_NODE_URL ?? defaultConfig.api.notificationUrl,
      timeout: defaultConfig.api.timeout,
    },
    auth: {
      timUrl: env.TIM_AUTHENTICATION_URL ?? '',
      enabled: !!env.TIM_AUTHENTICATION_URL,
    },
    ui: {
      height: env.WIDGET_HEIGHT ?? defaultConfig.ui.height,
      width: env.WIDGET_WIDTH ?? defaultConfig.ui.width,
      instantlyOpen: false,
    },
    officeHours: env.OFFICE_HOURS
      ? {
          enabled: true,
          timezone: env.OFFICE_HOURS.TIMEZONE ?? 'Europe/Tallinn',
          begin: env.OFFICE_HOURS.BEGIN ?? 8,
          end: env.OFFICE_HOURS.END ?? 17,
          days: env.OFFICE_HOURS.DAYS ?? [1, 2, 3, 4, 5],
        }
      : defaultConfig.officeHours,
  };
}
