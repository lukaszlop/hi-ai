// Typy dla store'ów

export interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
}

export interface AuthState {
  isLoggedIn: boolean;
  credentials?: {
    email: string;
    password: string;
  };
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  attachments?: {
    id: string;
    name: string;
    type: string;
    size: number;
    uri: string;
  }[];
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error?: string;
}
