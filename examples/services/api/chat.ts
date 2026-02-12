// services/api/chat.ts
import type { AxiosInstance } from 'axios';
import type { Message } from '@/store/messages';

export interface InitChatParams {
  message: Partial<Message>;
  endUserTechnicalData: {
    endUserUrl: string;
    endUserOs?: string;
  };
}

export interface Chat {
  id: string;
  status: 'OPEN' | 'ACTIVE' | 'IDLE' | 'ENDED';
  customerSupportId: string | null;
  customerSupportName: string | null;
}

/**
 * Chat API service
 */
export class ChatApiService {
  constructor(private client: AxiosInstance) {}

  async initChat(params: InitChatParams): Promise<Chat> {
    return this.client.post('/init-chat', params);
  }

  async getChatById(chatId: string): Promise<Chat> {
    return this.client.post('/get-chat-by-id', { chatId });
  }

  async endChat(params: { chatId: string; status: string; event?: string }): Promise<void> {
    return this.client.post('/end-chat', {
      message: {
        chatId: params.chatId,
        authorRole: 'end-user',
        authorTimestamp: new Date().toISOString(),
        event: params.event,
      },
      status: params.status,
    });
  }

  async getMessages(chatId: string): Promise<Message[]> {
    return this.client.post('/get-messages-by-chat-id', { chatId });
  }

  async sendMessage(message: Partial<Message>): Promise<Message> {
    return this.client.post('/post-message', { message });
  }

  async sendRating(params: { chatId: string; rating: number }): Promise<void> {
    return this.client.post('/post-chat-feedback-rating', params);
  }

  async sendFeedback(params: { chatId: string; feedbackText: string }): Promise<void> {
    return this.client.post('/post-chat-feedback-text', params);
  }

  async extendJwt(): Promise<void> {
    return this.client.post('/custom-jwt-extend');
  }
}
