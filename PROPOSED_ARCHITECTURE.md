# Väljapakutud Arhitektuur

## Ülevaade

Uus arhitektuur järgib Büstacki DSL põhimõtteid: deklaratiivsus, kompositsioon ja modulaarsus.
Eesmärk on luua süsteem, kus iga osa on isoleeritud, testitav ja asendatav.

---

## Arhitektuurikihid

```
┌─────────────────────────────────────────────────────────────────────┐
│                           ENTRY POINT                               │
│                    (widget-loader.ts, index.tsx)                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                      UI LAYER                               │   │
│   │         React Components - Presentation Only                │   │
│   │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │   │
│   │  │  Views   │  │  Layouts │  │  Atoms   │  │  Icons   │     │   │
│   │  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                    FEATURE LAYER                            │   │
│   │        Feature Hooks - State + Logic Composition            │   │
│   │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │   │
│   │  │useChat       │  │useAuth       │  │useFeedback   │       │   │
│   │  │Messages      │  │              │  │              │       │   │
│   │  └──────────────┘  └──────────────┘  └──────────────┘       │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                      CORE LAYER                             │   │
│   │     Domain Logic, Utilities, Validators, Transformers       │   │
│   │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │   │
│   │  │ Domain   │  │  Utils   │  │ Validate │  │ Transform│     │   │
│   │  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                 INFRASTRUCTURE LAYER                        │   │
│   │          API Clients, Storage, Events, Adapters             │   │
│   │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │   │
│   │  │   API    │  │ Storage  │  │  Events  │  │ Adapters │     │   │
│   │  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                        EXTERNAL SERVICES                            │
│          Ruuter API, TIM Auth, Notification Node, SSE               │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Uus kastruktuur

```
widget-refactored/
├── src/
│   ├── index.ts                    # Public API export
│   │
│   ├── core/                       # Äridomeeni loogika
│   │   ├── chat/
│   │   │   ├── types.ts           # Chat tüübid
│   │   │   ├── validators.ts      # Sisendi valideerimine
│   │   │   ├── transformers.ts    # Andmete transformatsioon
│   │   │   └── constants.ts       # Konstantid
│   │   ├── message/
│   │   ├── feedback/
│   │   └── auth/
│   │
│   ├── infrastructure/             # Infrastruktuur
│   │   ├── api/
│   │   │   ├── client.ts          # Axios instance
│   │   │   ├── endpoints.ts       # API endpointid
│   │   │   └── adapters/
│   │   │       ├── ruuter.ts      # Ruuter adapter
│   │   │       └── notification.ts
│   │   ├── storage/
│   │   │   ├── localStorage.ts
│   │   │   └── sessionStorage.ts
│   │   └── events/
│   │       ├── eventBus.ts
│   │       └── sse.ts
│   │
│   ├── store/                      # Olekuhaldus (Zustand)
│   │   ├── index.ts
│   │   ├── features/
│   │   │   ├── chat/
│   │   │   │   ├── messages.ts    # Sõnumite olek
│   │   │   │   ├── ui.ts          # UI olek (avatud/suletud)
│   │   │   │   └── session.ts     # Sessiooni olek
│   │   │   ├── auth/
│   │   │   └── feedback/
│   │   └── middleware/
│   │       ├── logger.ts
│   │       └── persist.ts
│   │
│   ├── hooks/                      # Feature hooks
│   │   ├── features/
│   │   │   ├── useChatMessages.ts
│   │   │   ├── useChatSession.ts
│   │   │   ├── useChatUI.ts
│   │   │   ├── useAuth.ts
│   │   │   └── useFeedback.ts
│   │   └── utils/
│   │       ├── useInterval.ts
│   │       └── useLocalStorage.ts
│   │
│   ├── components/                 # UI komponendid
│   │   ├── atoms/                  # Baaskomponendid
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   ├── Icon/
│   │   │   └── Typography/
│   │   ├── molecules/              # Kombineeritud komponendid
│   │   │   ├── MessageBubble/
│   │   │   ├── InputField/
│   │   │   └── Avatar/
│   │   ├── organisms/              # Komplekssed komponendid
│   │   │   ├── ChatWindow/
│   │   │   ├── MessageList/
│   │   │   ├── InputArea/
│   │   │   └── FeedbackForm/
│   │   ├── templates/              # Lehe struktuurid
│   │   │   └── ChatTemplate/
│   │   └── index.ts
│   │
│   ├── config/                     # Konfiguratsioon
│   │   ├── index.ts
│   │   ├── defaults.ts
│   │   └── types.ts
│   │
│   └── utils/                      # Üldised utiliidid
│       ├── formatting.ts
│       ├── dates.ts
│       └── validation.ts
│
├── examples/                       # Kasutamisnäited
├── tests/                          # Testid
└── docs/                           # Dokumentatsioon
```

---

## Olekukihistus (Feature Slicing)

### Probleem: Monoliitsed Redux Slices

Praegune `chat-slice.ts` (1009 rida) sisaldab kõike:
- Sõnumid
- UI olek
- Kontaktid
- Tagasiside
- Ooteajad
- jne.

### Lahendus: Feature Slicing + Zustand

```typescript
// store/features/chat/messages.ts
interface MessagesState {
  items: Message[];
  queue: Message[];
  isLoading: boolean;
  error: string | null;
}

export const useMessagesStore = create<MessagesState>((set, get) => ({
  items: [],
  queue: [],
  isLoading: false,
  error: null,

  addMessage: (message: Message) => set(state => ({
    items: [...state.items, message]
  })),

  // React Query handlib serveri sünkronisatsiooni
}));

// store/features/chat/ui.ts
interface ChatUIState {
  isOpen: boolean;
  isFullscreen: boolean;
  dimensions: { width: number; height: number; };
}

export const useChatUIStore = create<ChatUIState>((set) => ({
  isOpen: false,
  isFullscreen: false,
  dimensions: { width: 400, height: 450 },

  toggle: () => set(state => ({ isOpen: !state.isOpen })),
  setFullscreen: (value: boolean) => set({ isFullscreen: value }),
}));

// store/features/chat/session.ts
interface SessionState {
  chatId: string | null;
  status: ChatStatus;
  customerSupportId: string | null;
}

export const useSessionStore = create<SessionState>((set) => ({
  chatId: null,
  status: 'idle',
  customerSupportId: null,

  init: (id: string) => set({ chatId: id, status: 'open' }),
  end: () => set({ status: 'ended' }),
}));
```

---

## Feature Hookid (Composite Pattern)

### DSL-põhine kompositsioon

Nagu Ruuteri DSL komponeerib samme, komponeerivad feature hookid loogikat:

```typescript
// hooks/features/useChatMessages.ts
export function useChatMessages() {
  // 1. Serveri olek (React Query)
  const {
    data: messages,
    isLoading,
    error
  } = useQuery({
    queryKey: ['messages', chatId],
    queryFn: () => api.getMessages(chatId),
    enabled: !!chatId,
    refetchInterval: 5000, // Polling
  });

  // 2. Kohalik olek (Zustand)
  const {
    queue,
    addMessage,
    clearQueue
  } = useMessagesStore();

  // 3. Mutatsioonid
  const sendMessage = useMutation({
    mutationFn: api.sendMessage,
    onMutate: async (newMessage) => {
      // Optimistic update
      addMessage(newMessage);
    },
    onSuccess: () => {
      clearQueue();
    },
  });

  // 4. SSE streaming
  useEffect(() => {
    const unsubscribe = sse.subscribe('message', (msg) => {
      addMessage(msg);
    });
    return unsubscribe;
  }, []);

  return {
    messages: messages ?? [],
    isLoading,
    error,
    sendMessage: sendMessage.mutate,
    isSending: sendMessage.isPending,
  };
}

// hooks/features/useChat.ts - kõrgeima taseme hook
export function useChat() {
  const messages = useChatMessages();
  const session = useChatSession();
  const ui = useChatUI();
  const feedback = useFeedback();

  const endChat = useCallback(() => {
    session.end();
    messages.clear();
    feedback.show();
  }, []);

  return {
    ...messages,
    ...session,
    ...ui,
    endChat,
  };
}
```

---

## Komponendiarhitektuur

### Atomic Design + Container/Presenter

```typescript
// components/atoms/Button/Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({ variant = 'primary', size = 'md', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'btn',
        `btn--${variant}`,
        `btn--${size}`
      )}
      {...props}
    />
  );
}

// components/molecules/MessageBubble/MessageBubble.tsx
interface MessageBubbleProps {
  message: Message;
  isOwn?: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  return (
    <div className={cn('message', { 'message--own': isOwn })}>
      <MessageContent content={message.content} />
      <MessageTimestamp timestamp={message.authorTimestamp} />
      {message.event && <MessageEvent event={message.event} />}
    </div>
  );
}

// components/organisms/MessageList/MessageList.tsx
interface MessageListProps {
  messages: Message[];
  onScrollToBottom?: () => void;
}

export function MessageList({ messages, onScrollToBottom }: MessageListProps) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  return (
    <div ref={listRef} className="message-list">
      {messages.map(msg => (
        <MessageBubble
          key={msg.id}
          message={msg}
          isOwn={msg.authorRole === 'end-user'}
        />
      ))}
    </div>
  );
}

// components/organisms/ChatWindow/ChatWindow.tsx
// Container komponent - ühendab kõik kokku
export function ChatWindow() {
  const { messages, sendMessage, isLoading } = useChatMessages();
  const { isOpen, toggle } = useChatUIStore();

  if (!isOpen) return null;

  return (
    <div className="chat-window">
      <ChatHeader onClose={toggle} />
      <MessageList messages={messages} />
      {isLoading && <LoadingIndicator />}
      <InputArea onSend={sendMessage} />
    </div>
  );
}
```

---

## Konfiguratsiooni arhitektuur

### Dependency Injection pattern

```typescript
// config/types.ts
export interface WidgetConfig {
  api: {
    ruuterUrl: string;
    notificationUrl: string;
    timeout: number;
  };
  features: {
    authentication: boolean;
    fileUpload: boolean;
    feedback: boolean;
    streaming: boolean;
  };
  ui: {
    height: number;
    width: number;
    theme: 'light' | 'dark';
  };
  officeHours: {
    enabled: boolean;
    timezone: string;
    begin: number;
    end: number;
    days: number[];
  };
}

// config/index.ts
import { defaults } from './defaults';

class ConfigManager {
  private config: WidgetConfig;

  constructor(initialConfig?: Partial<WidgetConfig>) {
    this.config = { ...defaults, ...initialConfig };
  }

  get<K extends keyof WidgetConfig>(key: K): WidgetConfig[K] {
    return this.config[key];
  }

  update(partial: Partial<WidgetConfig>): void {
    this.config = { ...this.config, ...partial };
  }
}

export const config = new ConfigManager();

// Legacy adapter - backward compatibility
export function initFromLegacyEnv(): Partial<WidgetConfig> {
  return {
    api: {
      ruuterUrl: window._env_?.RUUTER_API_URL ?? '',
      notificationUrl: window._env_?.NOTIFICATION_NODE_URL ?? '',
      timeout: 30000,
    },
    ui: {
      height: window._env_?.WIDGET_HEIGHT ?? 450,
      width: window._env_?.WIDGET_WIDTH ?? 400,
      theme: 'light',
    },
    // ...
  };
}
```

---

## API kliendi arhitektuur

### Adapter pattern välisteenustele

```typescript
// infrastructure/api/client.ts
import axios from 'axios';

export const createApiClient = (baseURL: string) => {
  const client = axios.create({
    baseURL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor - auth token
  client.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Response interceptor - error handling
  client.interceptors.response.use(
    (response) => response.data?.response ?? response.data,
    (error) => {
      if (error.response?.status === 401) {
        // Handle auth expiry
      }
      return Promise.reject(error);
    }
  );

  return client;
};

// infrastructure/api/adapters/ruuter.ts
export class RuuterAdapter {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = createApiClient(baseURL);
  }

  // Type-safe API methods
  async initChat(params: InitChatParams): Promise<Chat> {
    return this.client.post('/init-chat', params);
  }

  async getMessages(chatId: string): Promise<Message[]> {
    return this.client.post('/get-messages-by-chat-id', { chatId });
  }

  async sendMessage(message: Message): Promise<void> {
    return this.client.post('/post-message', { message });
  }

  // ... kõik teised API meetodid
}

// Dependency injection
export const ruuterApi = new RuuterAdapter(config.get('api').ruuterUrl);
```

---

## Sündmuste arhitektuur

### Event Bus pattern

```typescript
// infrastructure/events/eventBus.ts
type EventCallback<T = any> = (payload: T) => void;

class EventBus {
  private listeners = new Map<string, Set<EventCallback>>();

  on<T>(event: string, callback: EventCallback<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    return () => this.off(event, callback);
  }

  off<T>(event: string, callback: EventCallback<T>): void {
    this.listeners.get(event)?.delete(callback);
  }

  emit<T>(event: string, payload: T): void {
    this.listeners.get(event)?.forEach(cb => cb(payload));
  }
}

export const eventBus = new EventBus();

// Kasutamine
// Infrastruktuuris
eventBus.emit('chat:message-received', newMessage);

// Komponendis
useEffect(() => {
  return eventBus.on('chat:message-received', (msg) => {
    addMessage(msg);
  });
}, []);
```

---

## Järgmised sammud

1. Vaata implementatsiooni näidiseid: [./examples/](./examples/)
2. Loe tehnoloogia valikuid: [TECHNOLOGY_CHOICES.md](./TECHNOLOGY_CHOICES.md)
3. Tutvu migratsiooni plaaniga: [BACKWARD_COMPATIBILITY.md](./BACKWARD_COMPATIBILITY.md)
