# Tehnoloogiliste Valikute Põhjendus

## Sisukord

1. [Põhiraamistik](#põhiraamistik)
2. [Olekuhaldus](#olekuhaldus)
3. [Stiilid](#stiilid)
4. [Testimine](#testimine)
5. [Build ja Bundle](#build-ja-bundle)
6. [Võrdlustabelid](#võrdlustabelid)

---

## Põhiraamistik

### Valik: React 18+

**Põhjendused:**

| Kriteerium | React | Vue | Svelte | Põhjendus |
|------------|-------|-----|--------|-----------|
| Olemasolev koodibaas | ✓ | ✗ | ✗ | Migratsioon ei nõua ümberkirjutamist |
| Eesti kogukond | Suur | Väike | Väga väike | Kergem leida arendajaid |
| Ökosüsteem | Suurim | Suur | Keskmine | Rohkem valmislahendusi |
| TypeScript tugi | Suurepärane | Hea | Hea | Tüübikindlus kriitiline |
| Büstack meeskond | Kogenud | - | - | Väiksem õppimiskõver |

**React 18 eelised:**
- Concurrent Rendering - parem jõudlus
- Automatic Batching - vähem re-render'eid
- Transitions - UI prioriseerimine
- Suspense for Data Fetching

```typescript
// React 18 concurrent features
import { useTransition, useDeferredValue } from 'react';

function SearchComponent() {
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState('');

  const handleChange = (e) => {
    // Kiire update
    setQuery(e.target.value);

    // Aeglase update prioriseerimine
    startTransition(() => {
      searchResults.fetch(e.target.value);
    });
  };
}
```

---

## Olekuhaldus

### Valik: Zustand + React Query

#### Miks mitte Redux Toolkit?

| Aspekt | Redux Toolkit | Zustand | Reaktsioon |
|--------|---------------|---------|------------|
| Boilerplate | Kõrge | Madal | Zustand võidab |
| Bundle size | 11KB | 3KB | 73% väiksem |
| Õppimiskõver | Kõrge | Madal | Kiirem arendus |
| DevTools | Suurepärane | Hea | Redux pisut parem |
| TypeScript | Hea | Suurepärane | Zustand tüübituvem |

**Redux Toolkit näide:**
```typescript
// createAsyncThunk, createSlice, extraReducers...
export const fetchMessages = createAsyncThunk(
  'messages/fetch',
  async (chatId: string) => {
    return api.getMessages(chatId);
  }
);

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: { /* ... */ },
  extraReducers: (builder) => {
    builder.addCase(fetchMessages.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchMessages.fulfilled, (state, action) => {
      state.items = action.payload;
      state.isLoading = false;
    });
    // ...
  },
});
```

**Zustand + React Query näide:**
```typescript
// Zustand - ainult kohalik UI olek
const useUIStore = create((set) => ({
  isOpen: false,
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
}));

// React Query - serveri olek
const useMessages = (chatId: string) => {
  return useQuery({
    queryKey: ['messages', chatId],
    queryFn: () => api.getMessages(chatId),
    staleTime: 5000,
  });
};
```

#### React Query eelised

```typescript
// Automatiseeritud:
// - Caching
// - Deduplication
// - Background refetching
// - Optimistic updates
// - Retry logic
// - Window focus refetch

const useChat = (chatId: string) => {
  // Kõik "raske" töö tehakse automaatselt
  const { data, isLoading, error } = useQuery({
    queryKey: ['chat', chatId],
    queryFn: () => api.getChat(chatId),
    refetchInterval: 5000,        // Polling
    staleTime: 30000,             // Cache kehtivus
    retry: 3,                     // Automaatne retry
    refetchOnWindowFocus: true,   // Tagasi tulles värskenda
  });

  return { chat: data, isLoading, error };
};
```

### Alternatiivide võrdlus

| Raamistik | Bundle | Keerukus | Sobivus |
|-----------|--------|----------|---------|
| Redux Toolkit | 11KB | Kõrge | Suured meeskonnad |
| Zustand | 3KB | Madal | Kõik suurused |
| Jotai | 2KB | Madal | Atomic lähenemine |
| Recoil | 15KB | Kõrge | Facebooki projektid |
| MobX | 16KB | Keskmine | OOP lähenemine |

**Soovitus:** Zustand + React Query on optimaalne kombinatsioon Büstacki widgeti jaoks.

---

## Stiilid

### Valik: CSS Modules + Tailwind CSS

#### Miks mitte styled-components?

| Aspekt | styled-components | Tailwind + CSS Modules |
|--------|-------------------|------------------------|
| Runtime | ~45KB overhead | 0KB (compile-time) |
| Jõudlus | Runtime CSS generation | Eelgenereritud CSS |
| SSR | Hüdratsiooni probleemid | Probleemivaba |
| Bundle | Suurem | Väiksem (purged) |
| Õppimine | CSS-in-JS | Utility-first |

**styled-components probleemid:**
```typescript
// Runtime overhead
const Button = styled.button`
  padding: 8px 16px;
  background: ${props => props.theme.primary};
  // Iga render genereerib uue klassi
`;

// Bundle impact
// styled-components: ~45KB gzipped
```

**Tailwind lähenemine:**
```typescript
// Compile-time generation
const Button = ({ children, ...props }) => (
  <button className="px-4 py-2 bg-blue-500 text-white rounded" {...props}>
    {children}
  </button>
);

// Bundle impact (pärast purging)
// Tailwind: ~5-10KB gzipped
```

#### Headless UI komponendid

```typescript
// Ligipääsetavad, stiilita komponendid
import { Dialog, Transition } from '@headlessui/react';

function Modal({ isOpen, onClose }) {
  return (
    <Transition show={isOpen}>
      <Dialog onClose={onClose}>
        <Dialog.Panel className="bg-white rounded-lg p-6">
          <Dialog.Title>Pealkiri</Dialog.Title>
          <Dialog.Description>Kirjeldus</Dialog.Description>
        </Dialog.Panel>
      </Dialog>
    </Transition>
  );
}
```

### Bundle võrdlus

```
Praegune:
  styled-components: ~45KB
  PrimeReact + icons: ~80KB
  --------------------------------
  Kokku: ~125KB

Uus:
  Tailwind (purged): ~8KB
  Headless UI: ~12KB
  CSS Modules: ~5KB
  --------------------------------
  Kokku: ~25KB

Kokkuhoid: ~100KB (80% väiksem)
```

---

## Testimine

### Valik: Vitest + Testing Library + Playwright

#### Miks Vitest, mitte Jest?

| Aspekt | Jest | Vitest |
|--------|------|--------|
| Start aeg | 3-5 sekundit | <1 sekund |
| HMR | Puudub | Olemas |
| ESM tugi | Legacy | Native |
| Vite integratsioon | Puudub | Native |
| Konfiguratsioon | Kompleksne | Minimaalne |

```typescript
// Vitest config - minimaalne
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
    },
  },
});
```

#### Testing Library

```typescript
// User-centric testing
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('ChatWindow', () => {
  it('sends message when user types and clicks send', async () => {
    const user = userEvent.setup();
    render(<ChatWindow />);

    const input = screen.getByPlaceholderText(/kirjuta sõnum/i);
    const sendButton = screen.getByRole('button', { name: /saada/i });

    await user.type(input, 'Tere!');
    await user.click(sendButton);

    expect(screen.getByText('Tere!')).toBeInTheDocument();
  });
});
```

#### Playwright E2E

```typescript
// tests/e2e/chat.spec.ts
import { test, expect } from '@playwright/test';

test('complete chat flow', async ({ page }) => {
  await page.goto('/');

  // Ava widget
  await page.click('[data-testid="widget-trigger"]');
  await expect(page.locator('.chat-window')).toBeVisible();

  // Saada sõnum
  await page.fill('[data-testid="message-input"]', 'Tere');
  await page.click('[data-testid="send-button"]');

  // Kontrolli vastust
  await expect(page.locator('.message-bubble')).toContainText('Tere');
});
```

---

## Build ja Bundle

### Valik: Vite

#### Vite vs Webpack

| Aspekt | Webpack | Vite |
|--------|---------|------|
| Dev server start | 10-30s | <1s |
| Hot reload | 1-3s | <100ms |
| Build aeg | 30-60s | 10-20s |
| Konfiguratsioon | Kompleksne | Lihtne |
| Bundle analüüs | Pluginid | Sisseehitatud |

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'BuerokrattWidget',
      fileName: 'widget',
      formats: ['iife', 'es'],
    },
    rollupOptions: {
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
});
```

---

## Võrdlustabelid

### Bundle Size võrdlus

| Lahendus | Praegune | Uus | Muutus |
|----------|----------|-----|--------|
| Framework | React 17: 42KB | React 18: 42KB | 0% |
| State | Redux: 11KB | Zustand: 3KB | -73% |
| Styling | styled-components: 45KB | Tailwind: 8KB | -82% |
| Testing | Jest: 300KB+ | Vitest: 50KB | -83% |
| **Kokku** | **~400KB** | **~103KB** | **-74%** |


### Koodikvaliteet

| Mõõdik | Praegune | Eesmärk |
|--------|----------|---------|
| Testikate | ~60% | 80%+ |
| Cyclomatic complexity | 15+ | <10 |
| Duplication | 8% | <3% |
| Bundle size | 400KB | <150KB |

---

## Kokkuvõte

### Valitud stack

```
Frontend Framework:  React 18+
State Management:    Zustand + React Query
Styling:             Tailwind CSS + CSS Modules + Headless UI
Testing:             Vitest + Testing Library + Playwright
Build Tool:          Vite
Language:            TypeScript 5.x
```

### Põhjenduste kokkuvõte

1. **React 18**: Järjepidevus, ökosüsteem, Concurrent features
2. **Zustand**: Kerge, tüübikindel, väike boilerplate
3. **React Query**: Serveri olek automatiseeritud
4. **Tailwind**: Väike bundle, kiire arendus
5. **Vitest**: Kiired testid, Vite integratsioon
6. **Vite**: Kiire arendus, lihtne konfiguratsioon
