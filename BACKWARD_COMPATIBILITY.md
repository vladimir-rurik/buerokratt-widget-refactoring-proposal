# Backward Compatibility Strateegia

## Põhimõtted

1. **Zero Breaking Changes** - Kõik olemasolevad integratsioonid töötavad
2. **Incremental Migration** - Saab migreerida komponent haaval
3. **Feature Flags** - Uus ja vana kood paralleelselt
4. **Adapter Pattern** - API-d jäävad samaks

---

## API Stabiilsus

### Avalik API

Widgeti avalik API peab jääma tagasiühilduvaks kogu migratsiooni vältel:

```typescript
// src/public-api.ts - stabiilne, ei muutu

/**
 * Widgeti avalik API
 * Kõik need meetodid on tagasiühilduvad
 */
export interface BuerokrattWidgetAPI {
  // Initsialiseerimine
  init(config: WidgetConfig): void;

  // Widget kontroll
  open(): void;
  close(): void;
  toggle(): void;
  destroy(): void;

  // Sündmused
  on(event: WidgetEvent, callback: EventCallback): void;
  off(event: WidgetEvent, callback: EventCallback): void;

  // Olek (read-only)
  isOpen(): boolean;
  getChatId(): string | null;
}

// Globaalne eksport - sama nagu praegu
declare global {
  interface Window {
    BuerokrattWidget?: BuerokrattWidgetAPI;
  }
}
```

### Embedding snippet

Praegune embedding snippet peab töötama:

```html
<!-- PRAEGUNE - peab töötama ka pärast refaktoreerimist -->
<div id="byk-va"></div>
<script>
  window._env_ = {
    RUUTER_API_URL: 'https://api.example.com',
    NOTIFICATION_NODE_URL: 'https://notifications.example.com',
    TIM_AUTHENTICATION_URL: 'https://auth.example.com',
    // ...
  };
</script>
<script src="https://cdn.example.com/widget_bundle.js"></script>
```

---

## Adapter Pattern

### Legacy Config Adapter

```typescript
// src/infrastructure/adapters/legacy-config-adapter.ts

/**
 * Teisendab legacy window._env_ konfiguratsiooni uude formaati
 */
export function adaptLegacyConfig(env: typeof window._env_): WidgetConfig {
  return {
    api: {
      ruuterUrl: env.RUUTER_API_URL ?? '',
      notificationUrl: env.NOTIFICATION_NODE_URL ?? '',
      timeout: 30000,
    },
    auth: {
      timUrl: env.TIM_AUTHENTICATION_URL ?? '',
      enabled: !!env.TIM_AUTHENTICATION_URL,
    },
    features: {
      hidden: env.ENABLE_HIDDEN_FEATURES === 'TRUE',
      feedbackColors: env.FEEDBACK_RATING_COLORS_ENABLED === 'TRUE',
      multiDomain: env.ENABLE_MULTI_DOMAIN === 'FALSE',
    },
    ui: {
      height: env.WIDGET_HEIGHT ?? 450,
      width: env.WIDGET_WIDTH ?? 400,
    },
    officeHours: env.OFFICE_HOURS
      ? {
          enabled: true,
          timezone: env.OFFICE_HOURS.TIMEZONE ?? 'Europe/Tallinn',
          begin: env.OFFICE_HOURS.BEGIN ?? 8,
          end: env.OFFICE_HOURS.END ?? 17,
          days: env.OFFICE_HOURS.DAYS ?? [1, 2, 3, 4, 5],
        }
      : { enabled: false },
    termination: {
      timeout: env.TERMINATION_TIMEOUT ?? 10,
    },
    streaming: {
      typingSpeed: env.STREAM_TYPING_SPEED ?? 30,
    },
    iframe: {
      targetOrigin: env.IFRAME_TARGET_OIRGIN ?? '*',
    },
    integrations: {
      smax: env.SMAX_INTEGRATION?.enabled ?? false,
    },
  };
}
```

### Redux-to-Zustand Adapter

```typescript
// src/infrastructure/adapters/state-adapter.ts

/**
 * Adapter mis võimaldab kasutada nii Redux kui Zustand stati
 * Migreerimise ajal
 */
import { store as legacyStore } from '../legacy/store';
import { useChatStore } from '../store/chat';

export function useChatState() {
  const migrationMode = useMigrationStore((s) => s.mode);

  if (migrationMode === 'legacy') {
    // Kasuta vana Redux store
    return {
      chatId: useSelector((s) => s.chat.chatId),
      messages: useSelector((s) => s.chat.messages),
      isOpen: useSelector((s) => s.chat.isChatOpen),
      // ...
    };
  }

  // Kasuta uut Zustand store
  return useChatStore();
}
```

---

## Feature Flags

### Migreerimise konfiguratsioon

```typescript
// src/config/migration.ts

export interface MigrationConfig {
  // Üldine lülitus
  useNewArchitecture: boolean;

  // Komponent-üksikud lipud
  components: {
    chatWindow: 'legacy' | 'new';
    messageList: 'legacy' | 'new';
    inputArea: 'legacy' | 'new';
    feedback: 'legacy' | 'new';
  };

  // Moodulid
  modules: {
    stateManagement: 'redux' | 'zustand';
    apiClient: 'legacy' | 'new';
    streaming: 'legacy' | 'new';
  };
}

const defaultMigrationConfig: MigrationConfig = {
  useNewArchitecture: false, // Algselt välja lülitatud
  components: {
    chatWindow: 'legacy',
    messageList: 'legacy',
    inputArea: 'legacy',
    feedback: 'legacy',
  },
  modules: {
    stateManagement: 'redux',
    apiClient: 'legacy',
    streaming: 'legacy',
  },
};
```

### Feature Flag kasutamine

```typescript
// src/components/ChatWindow.tsx

import { useMigrationConfig } from '../hooks/useMigrationConfig';
import { ChatWindowLegacy } from './legacy/ChatWindowLegacy';
import { ChatWindowNew } from './new/ChatWindowNew';

export function ChatWindow() {
  const config = useMigrationConfig();

  if (config.components.chatWindow === 'new') {
    return <ChatWindowNew />;
  }

  return <ChatWindowLegacy />;
}
```

---

## Migratsiooni strateegia

### Strangler Fig Pattern

```
Etapp 1: Kõik legacy kood
┌──────────────────────────────────────┐
│           Legacy Code                │
│  ┌───────────────────────────────┐   │
│  │      Redux Store              │   │
│  │      Old Components           │   │
│  │      Old API Client           │   │
│  └───────────────────────────────┘   │
└──────────────────────────────────────┘

Etapp 2: Uus kood paralleelselt
┌──────────────────────────────────────┐
│    Adapter Layer                     │
│  ┌───────────┐    ┌───────────────┐  │
│  │  Legacy   │◀──▶│     New       │  │
│  │  Redux    │    │   Zustand     │  │
│  └───────────┘    └───────────────┘  │
│  ┌───────────┐    ┌───────────────┐  │
│  │Old Comps  │    │  New Comps    │  │
│  └───────────┘    └───────────────┘  │
└──────────────────────────────────────┘

Etapp 3: Legacy kood eemaldatud
┌──────────────────────────────────────┐
│           New Code                   │
│  ┌───────────────────────────────┐   │
│  │      Zustand Store            │   │
│  │      New Components           │   │
│  │      New API Client           │   │
│  └───────────────────────────────┘   │
└──────────────────────────────────────┘
```

### Inkrementaalne migreerimine

```typescript
// Migreerimise järjekord
const migrationPhases = [
  {
    phase: 1,
    name: 'Infrastructure',
    duration: '2 nädalat',
    changes: [
      'Lisa uus API klient adapteriga',
      'Lisa uus konfiguratsiooni süsteem',
      'Lisa event bus',
    ],
    rollback: 'Keela uued moodulid feature flagiga',
  },
  {
    phase: 2,
    name: 'State Management',
    duration: '2 nädalat',
    changes: [
      'Lisa Zustand store paralleelselt',
      'Sünkrooni Redux ja Zustand adapteri kaudu',
      'Migreeri üksikud komponendid',
    ],
    rollback: 'Kasuta ainult Redux store',
  },
  {
    phase: 3,
    name: 'Components',
    duration: '4 nädalat',
    changes: [
      'Migreeri komponendid ükshaaval',
      'Alusta väiksematest (Button, Input)',
      'Jätka suuremate juurde (ChatWindow)',
    ],
    rollback: 'Kasuta legacy komponente',
  },
  {
    phase: 4,
    name: 'Cleanup',
    duration: '2 nädalat',
    changes: [
      'Eemalda Redux store',
      'Eemalda legacy komponendid',
      'Eemalda adapterid',
    ],
    rollback: 'Tagasi feature flagidega',
  },
];
```

---

## Testimine

### Backward Compatibility Testid

```typescript
// tests/backward-compatibility/embedding.test.ts

describe('Backward Compatibility', () => {
  beforeEach(() => {
    // Sea legacy window._env_
    window._env_ = {
      RUUTER_API_URL: 'https://test-api.com',
      NOTIFICATION_NODE_URL: 'https://test-notif.com',
      TIM_AUTHENTICATION_URL: 'https://test-auth.com',
      WIDGET_HEIGHT: 500,
      WIDGET_WIDTH: 400,
      OFFICE_HOURS: {
        TIMEZONE: 'Europe/Tallinn',
        BEGIN: 8,
        END: 17,
        DAYS: [1, 2, 3, 4, 5],
      },
      // ...
    };
  });

  it('initializes with legacy config', () => {
    const widget = initWidget();
    expect(widget).toBeDefined();
    expect(widget.isOpen()).toBe(false);
  });

  it('renders into #byk-va container', () => {
    const container = document.createElement('div');
    container.id = 'byk-va';
    document.body.appendChild(container);

    initWidget();

    expect(container.querySelector('.chat-widget')).toBeDefined();
  });

  it('exposes public API on window', () => {
    const widget = initWidget();
    expect(window.BuerokrattWidget).toBe(widget);
  });

  it('supports all public methods', () => {
    const widget = initWidget();

    expect(typeof widget.open).toBe('function');
    expect(typeof widget.close).toBe('function');
    expect(typeof widget.toggle).toBe('function');
    expect(typeof widget.destroy).toBe('function');
    expect(typeof widget.on).toBe('function');
    expect(typeof widget.off).toBe('function');
  });
});
```

### Integration testid

```typescript
// tests/backward-compatibility/integration.test.ts

describe('API Integration', () => {
  it('calls Ruuter endpoints with correct format', async () => {
    const widget = initWidget();
    widget.open();

    // Kontrolli, et API kutsed on samas formaadis
    await waitFor(() => {
      expect(mockApi.post).toHaveBeenCalledWith(
        '/init-chat',
        expect.objectContaining({
          message: expect.any(Object),
          endUserTechnicalData: expect.any(Object),
        })
      );
    });
  });

  it('handles authentication same as before', async () => {
    const widget = initWidget();

    // Mock TARA auth response
    mockAuth.success();

    widget.open();

    await waitFor(() => {
      expect(widget.getChatId()).not.toBeNull();
    });
  });
});
```

---

## Rollback strateegia

### Kiire rollback

```typescript
// Kui midagi läheb valesti:
// 1. Sea feature flag false'ks
// 2. Deploy eelmine versioon
// 3. Kõik töötab nagu enne

// index.html
<script>
  window.BUEROKRATT_CONFIG = {
    useNewArchitecture: false, // Kiire rollback
  };
</script>
```

### Rollback protseduur

1. **Feature flag keelamine**: < 1 minut
2. **Eelmise versiooni deploy**: 5-10 minutit
3. **Cache invalidation**: 1-2 minutit
4. **Kasutajatele teavitamine**: Kohe (UI tagasiside)

---

## Migratsiooni ajakava

| Nädal | Tegevus | Rollback võimalus |
|-------|---------|-------------------|
| 1-2 | Adapterid ja infrastruktuur | Feature flags |
| 3-4 | Zustand paralleelselt Reduxiga | Redux domineerib |
| 5-6 | Komponentide migreerimine (50%) | Legacy komponendid aktiivsed |
| 7-8 | Komponentide migreerimine (100%) | Mõlemad versioonid saadaval |
| 9-10 | Legacy eemaldamine | Feature flag rollback |

---

## Kokkuvõte

Backward compatibility tagamine:
1. **Adapterid** - Legacy API-d töötavad edasi
2. **Feature flags** - Uus kood ohutult sisse lülitatav
3. **Testid** - Kõik vana käitumine testitud
4. **Rollback** - Kiire tagasipöördumine võimalik

Kogu migratsiooni vältel on olemasolevad integratsioonid katkestamata töökorras.
