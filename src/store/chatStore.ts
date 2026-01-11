import { create } from "zustand";
import { User, ChatMessage } from "@/types/sockettypes";

interface ChatStore {
  onlineUsers: User[];
  conversations: Record<string, ChatMessage[]>; 
  activeConversation: string | null;
  
  setOnlineUsers: (users: User[]) => void;
  setActiveConversation: (userId: string) => void;
  
  setConversationHistory: (userId: string, history: ChatMessage[]) => void;
  
  addMessage: (userId: string, message: ChatMessage) => void;
  
  updateMessageStatus: (userId: string, messageId: string, status: string) => void;
  
  getConversation: (userId: string) => ChatMessage[];
}

export const useChatStore = create<ChatStore>((set, get) => ({
  onlineUsers: [],
  conversations: {},
  activeConversation: null,
  
  setOnlineUsers: (users) => set({ onlineUsers: users }),
  
  setActiveConversation: (userId) => set({ activeConversation: userId }),
  
  setConversationHistory: (userId, history) =>
    set((state) => ({
      conversations: {
        ...state.conversations,
        [userId]: history,
      },
    })),
  
  addMessage: (userId, message) =>
    set((state) => ({
      conversations: {
        ...state.conversations,
        [userId]: [...(state.conversations[userId] || []), message],
      },
    })),
  
  updateMessageStatus: (userId, messageId, status) =>
    set((state) => ({
      conversations: {
        ...state.conversations,
        [userId]: (state.conversations[userId] || []).map((msg) =>
          msg._id === messageId ? { ...msg, status } : msg
        ),
      },
    })),
  
  getConversation: (userId) => {
    return get().conversations[userId] || [];
  },
}));