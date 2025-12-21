export type MessageType = 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';

export interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  type: MessageType;
}

export interface MessageList {
  items: Message[];
  nextToken?: string | null;
}

