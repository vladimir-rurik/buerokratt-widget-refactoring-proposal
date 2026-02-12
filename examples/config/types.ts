// config/types.ts
export interface WidgetConfig {
  api: {
    ruuterUrl: string;
    notificationUrl: string;
    timeout: number;
  };
  auth: {
    timUrl: string;
    enabled: boolean;
  };
  ui: {
    height: number;
    width: number;
    instantlyOpen: boolean;
  };
  officeHours: {
    enabled: boolean;
    timezone: string;
    begin: number;
    end: number;
    days: number[];
  };
}

export interface LegacyEnv {
  RUUTER_API_URL?: string;
  NOTIFICATION_NODE_URL?: string;
  TIM_AUTHENTICATION_URL?: string;
  WIDGET_HEIGHT?: number;
  WIDGET_WIDTH?: number;
  OFFICE_HOURS?: {
    TIMEZONE?: string;
    BEGIN?: number;
    END?: number;
    DAYS?: number[];
  };
}
