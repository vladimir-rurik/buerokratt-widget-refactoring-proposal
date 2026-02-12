// core/events/index.ts
type EventCallback<T = unknown> = (payload: T) => void;

/**
 * Simple event bus for decoupled communication
 */
class EventBusClass {
  private listeners = new Map<string, Set<EventCallback>>();

  on<T = unknown>(event: string, callback: EventCallback<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback as EventCallback);

    return () => this.off(event, callback);
  }

  off<T = unknown>(event: string, callback: EventCallback<T>): void {
    this.listeners.get(event)?.delete(callback as EventCallback);
  }

  emit<T = unknown>(event: string, payload: T): void {
    this.listeners.get(event)?.forEach((cb) => cb(payload));
  }

  once<T = unknown>(event: string, callback: EventCallback<T>): () => void {
    const unsubscribe = this.on(event, (payload: T) => {
      callback(payload);
      unsubscribe();
    });
    return unsubscribe;
  }

  clear(): void {
    this.listeners.clear();
  }
}

export const eventBus = new EventBusClass();
