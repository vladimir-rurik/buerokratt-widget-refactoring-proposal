# Bürokratt Widgeti Refaktoreerimise Ettepanek

## Sisukord

1. [Kokkuvõte](#kokkuvõte)
2. [Praeguse olukorra analüüs](#praeguse-olukorra-analüüs)
3. [Uue arhitektuuri põhimõtted](#uue-arhitektuuri-põhimõtted)
4. [Tehnoloogilised valikud](#tehnoloogilised-valikud)
5. [Backward-compatibility strateegia](#backward-compatibility-strateegia)
6. [Testimise strateegia](#testimise-strateegia)
7. [Migratsiooni plaan](#migratsiooni-plaan)

---

## Kokkuvõte

See dokument kirjeldab Bürokratt vestluswidgeti modulaarset refaktoreerimist, eesmärgiga luua
puhas, testitav ja hallatav koodibaas, mis järgib Büstacki DSL arhitektuuri põhimõtteid.

### Peamised eesmärgid

- **Modulaarsus**: Komponentide tugev eraldatus ja selge vastutusala
- **Testitavus**: 80%+ koodi katvus kõikidel tasemetel
- **Backward-compatibility**: Sujuv migratsioon ilma olemasolevate integratsioonide katkestamiseta
- **Arendajakogemus**: Selge struktuur, hästi dokumenteeritud, lihtne laiendada

---

## Praeguse olukorra analüüs

### Tugevused

- TypeScripti kasutamine tüübikindluse tagamiseks
- Redux Toolkit olekuhalduseks
- Komponendipõhine arhitektuur
- Olemasolev testikate (unit testid)
- Dokumenteeritud API integratsioon Ruuteriga

### Probleemid

| Kategooria | Probleem | Mõju |
|------------|----------|------|
| Olekuhaldus | `chat-slice.ts` 1009 rida - liiga suur ja vastutusrikk | Raske testida, tihe sidumus |
| Komponendid | `chat.tsx` 413 rida - segatud loogika ja esitlus | Raske taaskasutada, testida |
| Konfiguratsioon | `window._env_` globaalne muutuja | Testimise raskus, tihe sidumus |
| Kõrvalmõjud | 15+ useEffect hook'i App.tsx-s | Raske jälgida andmevoogusid |
| Stiilid | styled-components + PrimeReact segu | Ebajärjepidev disain, bundle suurus |

### Võlad

```
chat-slice.ts (1009 rida)
├── Olek: 22 välja (liiga palju)
├── Reducerid: 40+ toimingut
├── Thunkid: 25+ asünkroonset toimingut
└── Kompleksne sündmuste käsitlus
```

---

## Uue arhitektuuri põhimõtted

### Büstacki DSL Inspireeritud Lähenemine

Ruuteri DSL arhitektuur baseerub deklaratiivsetel töövoogudel. Samu põhimõtteid rakendame frontendis:

1. **Deklaratiivsus**: UI kirjeldab "mida", mitte "kuidas"
2. **Kompositsioon**: Väikestest, taaskasutatavatest osadest koostamine
3. **Eraldatus**: Iga moodul teab vaid oma vastutusalast
4. **Konfigureeritavus**: Käitumine määratletakse konfiguratsiooni kaudu

### Arhitektuurikihid

```
┌─────────────────────────────────────────────────────┐
│                   UI Layer                          │
│  (React Components - Presentation Only)             │
├─────────────────────────────────────────────────────┤
│                   Feature Layer                     │
│  (Feature Hooks - State + Logic Composition)        │
├─────────────────────────────────────────────────────┤
│                   Core Layer                        │
│  (Domain Logic, Utilities, Adapters)                │
├─────────────────────────────────────────────────────┤
│                   Infrastructure Layer              │
│  (API Clients, Storage, Events)                     │
└─────────────────────────────────────────────────────┘
```

---

## Tehnoloogilised valikud

### Põhiraamistik: React 18+

**Põhjendus**:
- Olemasoleva koodibaasi järjepidevus
- Suurim ökosüsteem ja kogukond Eestis
- Incrementaalne migratsioon võimalik
- Headless komponendid võimaldavad paindlikku disaini

### Olekuhaldus: Zustand + React Query

**Põhjendus**:
- **Zustand**: Kerge, boilerplate-vaba, TypeScripti-sõbralik
- **React Query**: Serveri oleku haldus (caching, refetching, optimistic updates)
- Väiksem õppimiskõver kui Redux
- Väiksem bundle size

**Võrdlus**:

| Lahendus | Bundle | Boilerplate | DevTools | TypeScript |
|----------|--------|-------------|----------|------------|
| Redux Toolkit | 11KB | Kõrge | Suurepärane | Hea |
| Zustand | 3KB | Madal | Hea | Suurepärane |
| Jotai | 2KB | Madal | Keskmine | Suurepärane |

### Stiilid: CSS Modules + Tailwind CSS

**Põhjendus**:
- Eemaldab styled-components runtime overhead
- Tailwind kiirendab arendust
- CSS Modules tagavad skoobitud stiilid
- Väiksem bundle size

### Testimine: Vitest + Testing Library + Playwright

**Põhjendus**:
- **Vitest**: Vite-põhine, kiirem kui Jest
- **Testing Library**: React komponentide testid
- **Playwright**: E2E testid

---

## Backward-compatibility strateegia

### Adapteri muster

```
┌──────────────────┐     ┌─────────────────┐     ┌──────────────────┐
│   Legacy API     │────▶│    Adapter      │────▶│   New Core       │
│   (window._env_) │     │   Layer         │     │   (Config)       │
└──────────────────┘     └─────────────────┘     └──────────────────┘
```

### Migratsiooni etapid

1. **Etapp 1**: Adapterite loomine 
2. **Etapp 2**: Uue arhitektuuri tuuma loomine 
3. **Etapp 3**: Komponentide inkrementaalne migratsioon 
4. **Etapp 4**: Legacy koodi eemaldamine 

### API stabiilsus

```typescript
// Backward-compatible public API
export interface WidgetPublicAPI {
  init(config: WidgetConfig): void;
  open(): void;
  close(): void;
  destroy(): void;
  on(event: WidgetEvent, callback: EventCallback): void;
  off(event: WidgetEvent, callback: EventCallback): void;
}
```

---

## Testimise strateegia

### Testpüramiid

```
           ╱╲
          ╱  ╲
         ╱ E2E╲        - Playwright
        ╱──────╲       - Kriitilised kasutajateekonnad
       ╱        ╲
      ╱Integration╲    - Vitest + MSW
     ╱────────────╲    - API integratsioonid
    ╱              ╲
   ╱   Unit Tests   ╲  - Vitest + Testing Library
  ╱──────────────────╲ - Komponendid, hookid, utiliidid
```

### Katvuse eesmärgid

| Tase | Eesmärk | Tööriist |
|------|---------|----------|
| Unit | 80%+ | Vitest |
| Integration | 70%+ | Vitest + MSW |
| E2E | 5 oluline flow'd | Playwright |

---

## Migratsiooni plaan

### 10-nädalane tegevuskava

| Nädal | Tegevus | Tulemus |
|-------|---------|---------|
| 1-2 | Infrastruktuur ja adapterid | Arenduskeskkond valmis |
| 3-4 | Tuuma arhitektuur | Feature flag-id tööle |
| 5-6 | Chat komponendid | Uued komponendid paralleelselt |
| 7-8 | Integratsioon ja testimine | 80%+ katvus |
| 9-10 | Legacy eemaldamine ja dokumentatsioon | Production-valmis |

### Riskid ja leevendused

| Risk | Tõenäosus | Mõju | Leevenemine |
|------|-----------|------|-------------|
| API murdumine | Keskmine | Kõrge | Adapterid + põhjalikud testid |
| Ajakava ületamine | Kõrge | Keskmine | Incrementaalne migratsioon |
| Jõudluse langus | Madal | Keskmine | Bundle analüüs ja optimisatsioon |

---

## Järgmised sammud

1. Tutvu detailse arhitektuuri plaaniga: [PROPOSED_ARCHITECTURE.md](./PROPOSED_ARCHITECTURE.md)
2. Vaata tehnoloogia põhjendusi: [TECHNOLOGY_CHOICES.md](./TECHNOLOGY_CHOICES.md)
3. Loetest backward-compatibility plaan: [BACKWARD_COMPATIBILITY.md](./BACKWARD_COMPATIBILITY.md)
4. Uuri testimise strateegiat: [TESTING_STRATEGY.md](./TESTING_STRATEGY.md)
5. Vaata implementatsiooni näidiseid: [./examples/](./examples/)

---

