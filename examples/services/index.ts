// services/index.ts
import { createApiClient, ChatApiService } from './api';
import type { ApiClientConfig, InitChatParams, Chat } from './api';

export { createApiClient, ChatApiService };
export type { ApiClientConfig, InitChatParams, Chat };
export { storage } from './storage';

// Create default API instance (will be configured at runtime)
let _chatApi: ChatApiService | null = null;

export function initializeApi(config: { ruuterUrl: string }): void {
  const client = createApiClient({ baseURL: config.ruuterUrl });
  _chatApi = new ChatApiService(client);
}

export const chatApi = {
  get instance(): ChatApiService {
    if (!_chatApi) {
      throw new Error('API not initialized. Call initializeApi() first.');
    }
    return _chatApi;
  },
};
