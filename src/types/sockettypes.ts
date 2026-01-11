export interface User {
  _id?: string;
  name?: string;
}

export interface ChatMessage {
  // Support multiple shapes depending on backend/socket payloads
  _id?: string;
  from?: string;
  to?: string;
  text: string;
  senderId?: string;
  timestamp?: Date | string;
  status?: string; // e.g., 'sending', 'received', 'delivered'
}

export interface ChatState {
  onlineUsers: User[];
  chatHistory: ChatMessage[];
  setOnlineUsers: (users: User[]) => void;
  setChatHistory: (history: ChatMessage[]) => void;
}