import {create} from "zustand";
import type {ChatMessage, ChatState} from "./types";

interface ChatStore extends ChatState {
  addMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => void;
  clearMessages: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error?: string) => void;
  updateLastMessage: (content: string) => void;
}

export const useChatStore = create<ChatStore>()((set, get) => ({
  messages: [],
  isLoading: false,
  error: undefined,

  addMessage: (messageData) => {
    const message: ChatMessage = {
      ...messageData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
    };

    set((state) => ({
      messages: [...state.messages, message],
    }));
  },

  clearMessages: () => {
    set({messages: [], error: undefined});
  },

  setLoading: (loading) => {
    set({isLoading: loading});
  },

  setError: (error) => {
    set({error, isLoading: false});
  },

  updateLastMessage: (content) => {
    set((state) => {
      const messages = [...state.messages];
      const lastIndex = messages.length - 1;

      if (lastIndex >= 0 && messages[lastIndex].role === "assistant") {
        messages[lastIndex] = {
          ...messages[lastIndex],
          content,
        };
      }

      return {messages};
    });
  },
}));
