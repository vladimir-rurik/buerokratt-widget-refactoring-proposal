# Testimise Strateegia

## Testpüramiid

```
                    ╱╲
                   ╱  ╲
                  ╱ E2E ╲         ─────────────────────────────────
                 ╱──────╲        │  Playwright                    │
                ╱        ╲       │  - Kriitilised kasutajateekonnad │
               ╱          ╲      │  - 5 olulist flow'd             │
              ╱ Integration ╲    ─────────────────────────────────
             ╱──────────────╲    │  Vitest + MSW                  │
            ╱                ╲   │  - API integratsioonid         │
           ╱                  ╲  │  - Hookide koostöö             │
          ╱    Unit Tests      ╲ │  - Feature testid              │
         ╱──────────────────────╲────────────────────────────────
        ╱                        ╲│  Vitest + Testing Library      │
       ╱                          │  - Komponendid                 │
      ╱                           │  - Hookid                      │
     ╱                            │  - Utiliidid                   │
    ╱                             │  - Transformaatorid            │
   ╱                              ─────────────────────────────────
```

---

## Katvuse eesmärgid

| Tase | Eesmärk | Tööriistad | Kestus |
|------|---------|------------|--------|
| Unit | 80%+ | Vitest, Testing Library | < 5s |
| Integration | 70%+ | Vitest, MSW | < 15s |
| E2E | 5 flow'd | Playwright | < 2min |

---

## Unit Testid

### Komponendi testid

```typescript
// tests/unit/components/MessageBubble.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MessageBubble } from '@/components/molecules/MessageBubble';

describe('MessageBubble', () => {
  const mockMessage = {
    id: '1',
    content: 'Tere, kuidas saad?',
    authorRole: 'chatbot',
    authorTimestamp: '2024-01-15T10:30:00Z',
  };

  it('renders message content', () => {
    render(<MessageBubble message={mockMessage} />);
    expect(screen.getByText('Tere, kuidas saad?')).toBeInTheDocument();
  });

  it('applies own-message class for end-user messages', () => {
    const userMessage = { ...mockMessage, authorRole: 'end-user' };
    const { container } = render(<MessageBubble message={userMessage} isOwn />);
    expect(container.firstChild).toHaveClass('message--own');
  });

  it('formats timestamp correctly', () => {
    render(<MessageBubble message={mockMessage} />);
    // Eeldab eesti lokaati
    expect(screen.getByText(/10:30/)).toBeInTheDocument();
  });
});
```

### Hookide testid

```typescript
// tests/unit/hooks/useChatMessages.test.ts
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useChatMessages } from '@/hooks/features/useChatMessages';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useChatMessages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns empty array when no chatId', () => {
    const { result } = renderHook(() => useChatMessages(null), {
      wrapper: createWrapper(),
    });

    expect(result.current.messages).toEqual([]);
  });

  it('fetches messages when chatId provided', async () => {
    const { result } = renderHook(() => useChatMessages('chat-123'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.messages.length).toBeGreaterThan(0);
  });

  it('sends message optimistically', async () => {
    const { result } = renderHook(() => useChatMessages('chat-123'), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.sendMessage({
        content: 'Test sõnum',
        authorRole: 'end-user',
      });
    });

    // Optimistic update
    expect(result.current.messages).toContainEqual(
      expect.objectContaining({ content: 'Test sõnum' })
    );
  });
});
```

### Utiliitide testid

```typescript
// tests/unit/utils/formatTime.test.ts
import { describe, it, expect } from 'vitest';
import { formatTime, formatRelativeTime } from '@/utils/formatting';

describe('formatTime', () => {
  it('formats ISO date to local time', () => {
    const iso = '2024-01-15T14:30:00Z';
    expect(formatTime(iso, 'et-EE')).toMatch(/14:30|16:30/); // timezone dependent
  });

  it('returns empty string for null', () => {
    expect(formatTime(null)).toBe('');
  });
});

describe('formatRelativeTime', () => {
  it('returns "just now" for recent times', () => {
    const now = new Date().toISOString();
    expect(formatRelativeTime(now, 'et')).toBe('Just nüüd');
  });

  it('returns minutes ago', () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(formatRelativeTime(fiveMinAgo, 'et')).toBe('5 minutit tagasi');
  });
});
```

---

## Integration Testid

### MSW Setup

```typescript
// tests/mocks/handlers.ts
import { http, HttpResponse, delay } from 'msw';
import { mockMessages, mockChat } from './data';

export const handlers = [
  // Init chat
  http.post('*/init-chat', async () => {
    await delay(100);
    return HttpResponse.json({
      response: mockChat,
    });
  }),

  // Get messages
  http.post('*/get-messages-by-chat-id', async ({ request }) => {
    await delay(50);
    const body = await request.json();
    return HttpResponse.json({
      response: mockMessages.filter((m) => m.chatId === body.chatId),
    });
  }),

  // Post message
  http.post('*/post-message', async ({ request }) => {
    await delay(100);
    const body = await request.json();
    return HttpResponse.json({
      response: { id: 'new-msg-' + Date.now(), ...body.message },
    });
  }),

  // Error scenario
  http.post('*/error-endpoint', () => {
    return new HttpResponse(null, { status: 500 });
  }),
];

// tests/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);

// tests/setup.ts
import { beforeAll, afterAll, afterEach } from 'vitest';
import { server } from './mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### API Integration Testid

```typescript
// tests/integration/api/chat.test.ts
import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/tests/mocks/server';
import { chatApi } from '@/infrastructure/api/adapters/chat';

describe('Chat API Integration', () => {
  it('initializes chat successfully', async () => {
    const result = await chatApi.initChat({
      message: { content: 'Tere' },
      endUserTechnicalData: { endUserUrl: 'https://test.ee' },
    });

    expect(result).toHaveProperty('id');
    expect(result.status).toBe('OPEN');
  });

  it('handles network errors gracefully', async () => {
    server.use(
      http.post('*/init-chat', () => {
        return new HttpResponse(null, { status: 503 });
      })
    );

    await expect(chatApi.initChat({})).rejects.toThrow();
  });

  it('retries on transient failures', async () => {
    let attempts = 0;
    server.use(
      http.post('*/init-chat', () => {
        attempts++;
        if (attempts < 3) {
          return new HttpResponse(null, { status: 503 });
        }
        return HttpResponse.json({ response: { id: 'chat-1' } });
      })
    );

    const result = await chatApi.initChat({});
    expect(result.id).toBe('chat-1');
    expect(attempts).toBe(3);
  });
});
```

### Feature Integration Testid

```typescript
// tests/integration/features/chat-flow.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { App } from '@/App';
import { server } from '@/tests/mocks/server';
import { http, HttpResponse, delay } from 'msw';

describe('Chat Flow Integration', () => {
  it('complete message exchange flow', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Ava widget
    await user.click(screen.getByTestId('widget-trigger'));

    // Saada sõnum
    const input = screen.getByPlaceholderText(/kirjuta sõnum/i);
    await user.type(input, 'Tere, mul on küsimus');
    await user.click(screen.getByRole('button', { name: /saada/i }));

    // Oota vastust
    await waitFor(() => {
      expect(screen.getByText(/tere, mul on küsimus/i)).toBeInTheDocument();
    });

    // Kontrolli bot vastust
    await waitFor(() => {
      const botMessages = screen.getAllByTestId('message-bubble');
      expect(botMessages.length).toBeGreaterThan(1);
    });
  });

  it('handles SSE streaming', async () => {
    server.use(
      http.get('*/stream', async () => {
        const stream = new ReadableStream({
          start(controller) {
            controller.enqueue('data: {"content": "Tere"}\n\n');
            controller.enqueue('data: {"content": ", kuidas"}\n\n');
            controller.enqueue('data: {"content": " saad?"}\n\n');
            controller.close();
          },
        });
        return new HttpResponse(stream, {
          headers: { 'Content-Type': 'text/event-stream' },
        });
      })
    );

    render(<App />);

    // Ava widget
    await user.click(screen.getByTestId('widget-trigger'));

    // Kontrolli streaming teateid
    await waitFor(() => {
      expect(screen.getByText(/tere, kuidas saad\?/i)).toBeInTheDocument();
    });
  });

  it('handles authentication flow', async () => {
    render(<App />);

    // Klõpsa logi sisse
    await user.click(screen.getByRole('button', { name: /logi sisse/i }));

    // Oota auth redirecti
    await waitFor(() => {
      expect(window.location.href).toContain('tim.ee');
    });
  });
});
```

---

## E2E Testid

### Playwright Setup

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
    { name: 'webkit', use: { browserName: 'webkit' } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Olulised E2E stsenaariumid

```typescript
// tests/e2e/chat.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Chat Widget', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('widget loads and opens', async ({ page }) => {
    // Kontrolli, et widget on lehel
    await expect(page.locator('[data-testid="widget-trigger"]')).toBeVisible();

    // Ava widget
    await page.click('[data-testid="widget-trigger"]');

    // Kontrolli, et chat aken on nähtav
    await expect(page.locator('.chat-window')).toBeVisible();
  });

  test('complete chat flow', async ({ page }) => {
    // Ava widget
    await page.click('[data-testid="widget-trigger"]');

    // Saada sõnum
    await page.fill('[data-testid="message-input"]', 'Tere');
    await page.click('[data-testid="send-button"]');

    // Kontrolli, et sõnum on loendis
    await expect(page.locator('.message-list')).toContainText('Tere');

    // Oota bot vastust
    await expect(page.locator('.message--bot').first()).toBeVisible({ timeout: 5000 });
  });

  test('fullscreen toggle', async ({ page }) => {
    await page.click('[data-testid="widget-trigger"]');

    // Klõpsa fullscreen nupule
    await page.click('[data-testid="fullscreen-button"]');

    // Kontrolli, et on fullscreen
    await expect(page.locator('.chat-window')).toHaveClass(/fullscreen/);

    // Välju fullscreenist
    await page.click('[data-testid="exit-fullscreen-button"]');
    await expect(page.locator('.chat-window')).not.toHaveClass(/fullscreen/);
  });

  test('end chat and show feedback', async ({ page }) => {
    await page.click('[data-testid="widget-trigger"]');

    // Saada sõnum
    await page.fill('[data-testid="message-input"]', 'Test');
    await page.click('[data-testid="send-button"]');

    // Lõpeta vestlus
    await page.click('[data-testid="end-chat-button"]');

    // Kontrolli tagasiside vormi
    await expect(page.locator('.feedback-form')).toBeVisible();
  });

  test('accessibility - keyboard navigation', async ({ page }) => {
    await page.click('[data-testid="widget-trigger"]');

    // Tab läbi elemendid
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveAttribute('data-testid', 'message-input');

    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveAttribute('data-testid', 'send-button');

    // Saada sõnum Enter'iga
    await page.keyboard.type('Tere');
    await page.keyboard.press('Enter');

    await expect(page.locator('.message-list')).toContainText('Tere');
  });
});
```

### Authentication E2E

```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('TARA login flow', async ({ page, context }) => {
    // Mock TARA response
    await context.addCookies([
      {
        name: 'JWTTOKEN',
        value: 'mock-jwt-token',
        domain: 'localhost',
        path: '/',
      },
    ]);

    await page.goto('/');

    // Ava widget
    await page.click('[data-testid="widget-trigger"]');

    // Kontrolli, et kasutaja on sisse logitud
    await expect(page.locator('.user-info')).toBeVisible();
  });

  test('session expiry handling', async ({ page }) => {
    // Sea aegunud token
    await page.context().addCookies([
      {
        name: 'JWTTOKEN',
        value: 'expired-token',
        domain: 'localhost',
        path: '/',
      },
    ]);

    await page.goto('/');
    await page.click('[data-testid="widget-trigger"]');

    // Kontrolli, et kuvatakse logi sisse nupp
    await expect(page.getByRole('button', { name: /logi sisse/i })).toBeVisible();
  });
});
```

---

## Testikatte raport

### Coverage konfiguratsioon

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.test.*',
        '**/__mocks__/**',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
  },
});
```

### Coverage aruanne

```bash
# Käivita coverage
npm run test:coverage

# Väljund:
#  File                   | % Lines | % Functions | % Branches |
# ------------------------|---------|-------------|------------|
#  components/            |   85.2  |    82.1     |    78.3    |
#  hooks/                 |   92.4  |    94.2     |    88.1    |
#  services/              |   78.6  |    75.3     |    70.2    |
#  store/                 |   88.9  |    86.7     |    82.4    |
#  utils/                 |   95.1  |    96.8     |    91.2    |
# ------------------------|---------|-------------|------------|
#  TOTAL                  |   83.4  |    81.2     |    76.8    |
```

---

## Testkäivitus

### npm skriptid

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest watch",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:all": "npm run test:coverage && npm run test:e2e"
  }
}
```

### CI/CD konfiguratsioon

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci
      - run: npm run test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - run: npm ci
      - run: npx playwright install --with-deps

      - run: npm run build
      - run: npm run test:e2e

      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Kokkuvõte

| Tase | Katvus | Tööriistad | Aeg |
|------|--------|------------|-----|
| Unit | 80%+ | Vitest + Testing Library | < 5s |
| Integration | 70%+ | Vitest + MSW | < 15s |
| E2E | 5 flow'd | Playwright | < 2min |
