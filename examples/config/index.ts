// config/index.ts
import { defaultConfig } from './defaults';
import { adaptLegacyConfig } from './adapter';
import type { WidgetConfig, LegacyEnv } from './types';

class ConfigManager {
  private config: WidgetConfig;

  constructor() {
    this.config = { ...defaultConfig };
  }

  init(userConfig?: Partial<WidgetConfig>): void {
    // Legacy config from window._env_
    if (typeof window !== 'undefined') {
      const win = window as { _env_?: LegacyEnv };
      if (win._env_) {
        this.config = this.merge(adaptLegacyConfig(win._env_));
      }
    }

    // User config override
    if (userConfig) {
      this.config = this.merge(userConfig);
    }
  }

  get<K extends keyof WidgetConfig>(key?: K): WidgetConfig | WidgetConfig[K] {
    return key ? this.config[key] : this.config;
  }

  private merge(partial: Partial<WidgetConfig>): WidgetConfig {
    return {
      ...this.config,
      ...partial,
      api: { ...this.config.api, ...partial.api },
      auth: { ...this.config.auth, ...partial.auth },
      ui: { ...this.config.ui, ...partial.ui },
      officeHours: { ...this.config.officeHours, ...partial.officeHours },
    };
  }
}

export const config = new ConfigManager();
export type { WidgetConfig, LegacyEnv };
