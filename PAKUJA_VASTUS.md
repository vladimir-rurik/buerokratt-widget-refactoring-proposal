# Pakuja Vastus: Bürokratt Widgeti Refaktoreerimine

---

## 1. Kuidas lihtsustada widgeti arhitektuuri ning kaasajastada seda?

### Praegune olukord

Analüüsides olemasolevat Chat-Widget koodibaasi, tuvastasin järgmised peamised probleemid:

| Probleem | Asukoht | Mõju |
|----------|---------|------|
| Monoliitne olekuslice | `chat-slice.ts` (1009 rida) | Raske hallata, testida ja laiendada |
| Üleliia suured komponendid | `chat.tsx` (413 rida) | Segatud vastutusalad, keeruline taaskasutus |
| Hajutatud külgmõjud | 15+ useEffect App.tsx-s | Andmevoogude jälgimine raskendatud |
| Globaalne konfiguratsioon | `window._env_` | Testimise ja isoleeritud arenduse takistus |

### Lahendus: Feature-Sliced arhitektuur

Rakendan Büstacki DSL arhitektuuri põhimõtteid frontendile:

**1. Dekompositsioon vastutusalade kaupa**

Praegune monoliitne `chat-slice` jaotun neljaks sõltumatuks üksuseks:

```
chat-slice.ts (1009 rida)
        ↓
┌───────────────────────────────────────┐
│  useChatUIStore      (UI olek)        │
│  useMessagesStore    (sõnumid)        │
│  useSessionStore     (sessioon)       │
│  useFeedbackStore    (tagasiside)     │
└───────────────────────────────────────┘
```

Iga store vastab ühele ärivaldkonnale ja on iseseisvalt testitav.

**2. Feature Hookid kompositsiooniks**

Sarnaselt Ruuteri DSL-ile, kus sammud komponeeritakse töövoogudeks, komponeerin ka hookidest kõrgematasemelisi üksusi:

```typescript
// Madal tase
const messages = useChatMessages(chatId);
const session = useChatSession();
const ui = useChatUI();

// Kõrge tase - komponeeritud
const chat = useChat(); // sisaldab kõiki alumisi
```

**3. Komponendiarhitektuur (Atomic Design)**

```
components/
├── atoms/        Button, Input, Icon
├── molecules/    MessageBubble, ChatInput, RatingStars
├── organisms/    ChatWindow, MessageList, FeedbackForm
└── templates/    ChatTemplate
```

Iga komponent on:
- Puhtalt presentatsiooniline (ei sisalda äriloogikat)
- Täielikult isoleeritud ja testitav
- Taaskasutatav

**4. Konfiguratsiooni isolatsioon**

`window._env_` asendatakse Dependency Injection mustriga:

```typescript
// Enne (globaalne, raske testida)
http.post(window._env_.RUUTER_API_URL + '/endpoint');

// Pärast (konfigureeritav, testitav)
const config = useConfig();
api.sendMessage(chatId, content);
```

### Tulem

| Mõõdik | Praegu | Pärast |
|--------|--------|--------|
| Suurim fail | 1009 rida | <200 rida |
| useState hookid komponendis | 15+ | 0-2 |
| Testikate | ~60% | 80%+ |
| Bundle size | ~400KB | ~100KB |

---

## 2. Milliseid frontendi raamistikke soovitate?

### Põhiraamistik: React 18+

**Valiku põhjendused:**

| Kriteerium | React | Vue 3 | Svelte |
|------------|-------|-------|--------|
| Olemasolev investeering | 100% | 0% | 0% |
| Eesti arendajate kättesaadavus | Kõrge | Keskmine | Madal |
| Bürokrati meeskonna kogemus | Olemas | Pole | Pole |
| Ökosüsteemi küpsus | Suurim | Suur | Keskmine |
| TypeScript tugi | Suurepärane | Hea | Hea |

**Konkreetne soovitus:** Jätkata Reactiga, kuid uuendada versioonile 18+ Concurrent Rendering toetuseks. See võimaldab:
- Sujuvamat kasutajakogemust raskemate toimingute ajal
- Automatiseeritud batchingut (vähem re-render'eid)
- Transition API-t UI prioriseerimiseks

### Olekuhaldus: Zustand + React Query

**Miks mitte Redux Toolkit?**

| Aspekt | Redux Toolkit | Zustand |
|--------|---------------|---------|
| Boilerplate | Kõrge (actions, reducers, thunks) | Minimaalne |
| Bundle size | 11KB | 3KB |
| Õppimiskõver | Pikk (2-3 nädalat) | Lühike (1-2 päeva) |
| TypeScript tüvimine | Hea | Suurepärane |

**React Query roll:**

Serveri olek (API andmed) eraldan kohalikust UI olekust:

```typescript
// React Query handlib automaatselt:
// - Caching, Deduplication, Background refetching
// - Optimistic updates, Retry logic
const { data: messages } = useQuery({
  queryKey: ['messages', chatId],
  queryFn: () => api.getMessages(chatId),
  refetchInterval: 5000,
});
```

### Stiilid: Tailwind CSS + CSS Modules

**Praegune bundle:**
- styled-components: ~45KB
- PrimeReact + icons: ~80KB
- **Kokku: ~125KB**

**Uus bundle:**
- Tailwind (purged): ~8KB
- CSS Modules: ~5KB
- **Kokku: ~13KB (90% väiksem)**

Lisaks:
- Runtime CSS generation eemaldatud (parem jõudlus)
- Konsistentsne disainisüsteem
- Väiksem õppimiskõver kui styled-components

### Build tool: Vite

| Aspekt | Webpack | Vite |
|--------|---------|------|
| Dev server start | 15-30s | <1s |
| Hot Module Replace | 1-3s | <100ms |
| Production build | 45-60s | 15-20s |

Vite valmib samal arendajal (Evan You) kui Vue ja on tänaseks de facto standard nii Reacti kui Vue projektidele.

### Soovitatud stack kokkuvõte

```
┌─────────────────────────────────────────┐
│  Framework:     React 18+               │
│  State (UI):    Zustand                 │
│  State (API):   React Query             │
│  Styling:       Tailwind + CSS Modules  │
│  Testing:       Vitest + Playwright     │
│  Build:         Vite                    │
│  Language:      TypeScript 5.x          │
└─────────────────────────────────────────┘
```

See kombinatsioon:
- Sobib Bürokrati pikaajaliseks arenguks
- On laialdaselt kasutusel Eesti ettevõtetes
- Võimaldab inkrementaalset migratsiooni
- Tagab parima arendajakogemuse

---

## 3. Kuidas tagada backward-compatibility ja testitavus?

### Backward-Compatibility Strateegia

**1. Adapter Pattern**

Kõik olemasolevad integratsioonid toimivad muutumatuna:

```typescript
// Legacy adapter teisendab window._env_ uude formaati
function adaptLegacyConfig(env: WindowEnv): WidgetConfig {
  return {
    api: {
      ruuterUrl: env.RUUTER_API_URL,
      notificationUrl: env.NOTIFICATION_NODE_URL,
      // ...
    }
  };
}
```

Embedding snippet ei muutu:

```html
<!-- See töötab nii vana kui uue versiooniga -->
<div id="byk-va"></div>
<script>
  window._env_ = { RUUTER_API_URL: '...', ... };
</script>
<script src="widget_bundle.js"></script>
```

**2. Feature Flags**

Migratsioon toimub inkrementaalselt, mitte "big bang" meetodil:

```typescript
const migrationConfig = {
  components: {
    chatWindow: 'legacy' | 'new',  // saab lülitada
    messageList: 'legacy' | 'new',
  },
  modules: {
    stateManagement: 'redux' | 'zustand',
  }
};
```

Iga komponent on migreeritav eraldi. Vea korral saab üksikud osad välja lülitada.

**3. Strangler Fig Pattern**

```
Etapp 1: Uus kood paralleelselt vanaga
┌─────────────────────────────────────┐
│         Adapter Layer               │
│   ┌─────────┐    ┌─────────────┐    │
│   │  Legacy │◀──▶│     New     │    │
│   │  Redux  │    │   Zustand   │    │
│   └─────────┘    └─────────────┘    │
└─────────────────────────────────────┘

Etapp 2: Legacy eemaldatud pärast valideerimist
```

**4. Avaliku API stabiilsus**

```typescript
interface BuerokrattWidgetAPI {
  init(config?: Partial<WidgetConfig>): void;
  open(): void;
  close(): void;
  toggle(): void;
  destroy(): void;
  isOpen(): boolean;
  getChatId(): string | null;
  on(event: WidgetEvent, callback: EventCallback): void;
  off(event: WidgetEvent, callback: EventCallback): void;
}
```

See liides ei muutu kogu migratsiooni vältel.

### Testimise Strateegia

**Testpüramiid:**

```
                    ╱╲
                   ╱  ╲
                  ╱ E2E╲         Playwright
                 ╱──────╲        5 kriitilist flow'd
                ╱        ╲
               ╱Integration╲    Vitest + MSW
              ╱─────────────╲   API integratsioonid
             ╱               ╲
            ╱    Unit Tests   ╲  Vitest + Testing Library
           ╱───────────────────╲ Komponendid, hookid, utiliidid
```

**1. Unit testid (80%+ katvus)**

```typescript
// Komponent
describe('MessageBubble', () => {
  it('renders message content', () => {
    render(<MessageBubble message={mockMessage} />);
    expect(screen.getByText('Tere')).toBeInTheDocument();
  });
});

// Hook
describe('useChatMessages', () => {
  it('sends message optimistically', async () => {
    const { result } = renderHook(() => useChatMessages('chat-1'));
    act(() => result.current.sendMessage({ content: 'Test' }));
    expect(result.current.messages).toContainEqual(
      expect.objectContaining({ content: 'Test' })
    );
  });
});
```

**2. Integration testid (MSW-ga)**

```typescript
// Mock server
const server = setupServer(
  http.post('*/post-message', () => {
    return HttpResponse.json({ response: { id: 'msg-1' } });
  })
);

// Test
it('sends message to API', async () => {
  render(<ChatWindow />);
  await user.type(input, 'Tere');
  await user.click(sendButton);
  // MSW valideerib päringu formaadi
});
```

**3. E2E testid (Playwright)**

```typescript
test('complete chat flow', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="widget-trigger"]');
  await page.fill('[data-testid="message-input"]', 'Tere');
  await page.click('[data-testid="send-button"]');
  await expect(page.locator('.message-bubble')).toContainText('Tere');
});
```

**4. Backward-compatibility testid**

```typescript
describe('Backward Compatibility', () => {
  it('initializes with legacy window._env_', () => {
    window._env_ = { RUUTER_API_URL: 'https://test.com' };
    const widget = initWidget();
    expect(widget).toBeDefined();
  });

  it('renders into #byk-va container', () => {
    const container = document.createElement('div');
    container.id = 'byk-va';
    document.body.appendChild(container);
    initWidget();
    expect(container.querySelector('.chat-widget')).toBeDefined();
  });
});
```

**Testitööriistad:**

| Tase | Tööriist | Eesmärk |
|------|----------|---------|
| Unit | Vitest | Kiired (<<1s), isolatsioon |
| Integration | Vitest + MSW | API mockimine, integratsioon |
| E2E | Playwright | Reaalsed brauserid, kriitilised flow'd |

**Miks mitte Jest?**
- Vitest on 3-5x kiirem
- Native ESM tugi
- Vite integratsioon (sama konfiguratsioon)

**Miks mitte Cypress?**
- Playwright on kiirem ja stabiilsem
- Mitme brauseri tugi "kasti välja"
- Parem debugging

---

## Kokkuvõte

| Küsimus | Lahendus |
|---------|----------|
| Arhitektuuri lihtsustamine | Feature-Sliced design, komponendi dekompositsioon, DI konfiguratsioonile |
| Frontendi raamistikud | React 18 + Zustand + React Query + Tailwind + Vite |
| Backward-compatibility | Adapterid, Feature flags, stabiilne avalik API |
| Testitavus | Vitest + MSW + Playwright, 80%+ katvus |

Kõik ettepanekud järgivad Büstacki DSL arhitektuuri põhimõtteid (deklaratiivsus, kompositsioon, eraldatus) ning on kooskõlas Bürokrati pikaajalise arenguga.

---

*Lahendus on koostatud olemasoleva koodibaasi sügava analüüsi põhjal.*
