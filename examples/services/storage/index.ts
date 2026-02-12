// services/storage/index.ts

/**
 * Type-safe storage service
 */
class StorageService {
  private prefix: string;

  constructor(prefix = 'byk_') {
    this.prefix = prefix;
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  // LocalStorage
  get<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = localStorage.getItem(this.getKey(key));
      if (item === null) return defaultValue ?? null;
      return JSON.parse(item) as T;
    } catch {
      return defaultValue ?? null;
    }
  }

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(this.getKey(key), JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }

  remove(key: string): void {
    localStorage.removeItem(this.getKey(key));
  }

  // SessionStorage
  getSession<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = sessionStorage.getItem(this.getKey(key));
      if (item === null) return defaultValue ?? null;
      return JSON.parse(item) as T;
    } catch {
      return defaultValue ?? null;
    }
  }

  setSession<T>(key: string, value: T): void {
    try {
      sessionStorage.setItem(this.getKey(key), JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to sessionStorage:', error);
    }
  }

  removeSession(key: string): void {
    sessionStorage.removeItem(this.getKey(key));
  }

  clear(): void {
    // Clear only prefixed keys
    Object.keys(localStorage)
      .filter((key) => key.startsWith(this.prefix))
      .forEach((key) => localStorage.removeItem(key));

    Object.keys(sessionStorage)
      .filter((key) => key.startsWith(this.prefix))
      .forEach((key) => sessionStorage.removeItem(key));
  }
}

export const storage = new StorageService();
