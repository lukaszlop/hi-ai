# Zero-API MVP Plan - Client-Only Architecture

## 1. Overview

The MVP version operates as a **client-only application** with zero custom backend API endpoints. All functionality is handled locally on the device or through direct external API calls, following the PRD requirement: _"Brak serwerowego backendu"_ and _"Brak serwerowego proxy w MVP"_.

### Architecture Pattern

```
📱 React Native App (Expo)
├── 🔐 Local Authentication (SecureStore)
├── 💾 Local Data Storage (AsyncStorage + Session Memory)
├── 🤖 Direct OpenAI API (Vercel AI SDK)
├── 📎 Local File Processing (Expo APIs)
└── 🎤 Local Speech-to-Text (Expo Speech)
```

## 2. Component-by-Component Implementation

### Authentication & User Management

#### Mock Login System

```typescript
// Using Expo SecureStore for session persistence
import * as SecureStore from "expo-secure-store";

const AUTH_CREDENTIALS = {
  email: "test@example.com",
  password: "password123",
};

// Login implementation
const login = async (email: string, password: string) => {
  if (
    email === AUTH_CREDENTIALS.email &&
    password === AUTH_CREDENTIALS.password
  ) {
    await SecureStore.setItemAsync(
      "userSession",
      JSON.stringify({
        isLoggedIn: true,
        loginTime: Date.now(),
      })
    );
    return {success: true};
  }
  return {success: false, error: "Invalid credentials"};
};

// Auto-login check
const checkAuthStatus = async () => {
  const session = await SecureStore.getItemAsync("userSession");
  return session ? JSON.parse(session) : null;
};
```

#### Profile Management

```typescript
// Using AsyncStorage for profile persistence
import AsyncStorage from "@react-native-async-storage/async-storage";

interface UserProfile {
  name: string;
  email: string;
  avatar: string | null;
}

const saveProfile = async (profile: UserProfile) => {
  await AsyncStorage.setItem("userProfile", JSON.stringify(profile));
};

const loadProfile = async (): Promise<UserProfile> => {
  const stored = await AsyncStorage.getItem("userProfile");
  return stored
    ? JSON.parse(stored)
    : {
        name: "",
        email: "test@example.com",
        avatar: null,
      };
};
```

### Chat Functionality

#### Direct OpenAI Integration

```typescript
// Using Vercel AI SDK with direct OpenAI API calls
import { useChat } from 'ai/react-native';
import { openai } from '@ai-sdk/openai';

const ChatComponent = () => {
  const { messages, input, handleInputChange, handleSubmit, isLoading, stop } = useChat({
    api: '/api/chat', // This would be replaced with direct OpenAI call
    // Direct configuration for MVP:
    experimental_attachments: true,
    maxTokens: 1000,
    onError: (error) => {
      // Local error handling with toast notifications
      showErrorToast(error.message);
    }
  });

  // Character limit validation (local)
  const isMessageTooLong = input.length > 5000;

  return (
    <View>
      {/* Chat messages display */}
      {/* Input with local validation */}
      {/* Stop/Retry buttons */}
    </View>
  );
};
```

#### Session-Only Message History

```typescript
// Using Zustand for in-memory chat history
import {create} from "zustand";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  attachments?: FileAttachment[];
  timestamp: number;
}

const useChatStore = create<{
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  clearMessages: () => void;
}>((set) => ({
  messages: [],
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
  clearMessages: () => set({messages: []}),
}));

// Clear on logout or app restart (as per PRD requirement)
const logout = async () => {
  await SecureStore.deleteItemAsync("userSession");
  useChatStore.getState().clearMessages(); // Clear chat history
  // Navigate to login
};
```

### File Attachment Handling

#### Local File Processing

```typescript
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";

// File picker with validation
const pickFiles = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        "image/jpeg",
        "image/png",
        "application/pdf",
        "text/plain",
        "text/markdown",
      ],
      multiple: true,
      copyToCacheDirectory: true,
    });

    if (!result.canceled) {
      return validateAndProcessFiles(result.assets);
    }
  } catch (error) {
    showErrorToast("File selection failed");
  }
};

// Local file validation (no server needed)
const validateAndProcessFiles = async (
  files: DocumentPicker.DocumentPickerAsset[]
) => {
  const processedFiles: ProcessedFile[] = [];
  let totalSize = 0;

  for (const file of files) {
    // Size validation
    if (file.size && file.size > 10 * 1024 * 1024) {
      // 10MB limit
      showErrorToast(`File ${file.name} exceeds 10MB limit`);
      continue;
    }

    totalSize += file.size || 0;
    if (totalSize > 30 * 1024 * 1024) {
      // 30MB total limit
      showErrorToast("Total file size exceeds 30MB limit");
      break;
    }

    // Process based on type
    if (file.mimeType?.startsWith("image/")) {
      const processed = await processImage(file.uri);
      processedFiles.push(processed);
    } else if (file.mimeType === "application/pdf") {
      const processed = await processPDF(file.uri);
      processedFiles.push(processed);
    } else {
      processedFiles.push({
        uri: file.uri,
        type: file.mimeType || "text/plain",
        name: file.name || "file",
        content: await readTextFile(file.uri),
      });
    }
  }

  return processedFiles;
};

// Image processing with Expo Image Manipulator
const processImage = async (uri: string) => {
  const manipulated = await ImageManipulator.manipulateAsync(
    uri,
    [{resize: {width: 1600}}], // Max 1600px on longest side
    {
      compress: 0.8, // 0.8 compression as per PRD
      format: ImageManipulator.SaveFormat.JPEG,
    }
  );

  return {
    uri: manipulated.uri,
    type: "image/jpeg",
    name: "processed_image.jpg",
  };
};

// Basic PDF text extraction (client-side library needed)
const processPDF = async (uri: string) => {
  // Note: Would need a client-side PDF processing library
  // For MVP, could show limitation message for complex PDFs
  return {
    uri,
    type: "application/pdf",
    name: "document.pdf",
    content: "PDF processing available in full version",
  };
};
```

### Voice Input (Optional for MVP)

#### Local Speech-to-Text

```typescript
import * as Speech from 'expo-speech';

const VoiceInput = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');

  const startRecording = async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        showErrorToast('Microphone permission required');
        return;
      }

      setIsRecording(true);

      // 60-second auto-stop timer
      setTimeout(() => {
        if (isRecording) {
          stopRecording();
          showInfoToast('Recording stopped automatically after 60 seconds');
        }
      }, 60000);

    } catch (error) {
      showErrorToast('Failed to start recording');
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    // Process recording with local STT
    // Fallback to text input if STT fails
  };

  return (
    <View>
      {/* Voice input UI */}
    </View>
  );
};
```

### Cost Tracking

#### Local Usage Monitoring

```typescript
// Simple local cost tracking
import AsyncStorage from "@react-native-async-storage/async-storage";

interface UsageData {
  totalTokens: number;
  estimatedCost: number; // Based on GPT-4o-mini pricing
  resetDate: string;
}

const MONTHLY_BUDGET = 15; // $15 USD as per PRD
const TOKEN_COST_PER_1K = 0.00015; // GPT-4o-mini input cost

const trackUsage = async (tokens: number) => {
  const currentMonth = new Date().getMonth();
  const stored = await AsyncStorage.getItem(`usage_${currentMonth}`);
  const usage: UsageData = stored
    ? JSON.parse(stored)
    : {
        totalTokens: 0,
        estimatedCost: 0,
        resetDate: new Date().toISOString(),
      };

  usage.totalTokens += tokens;
  usage.estimatedCost += (tokens / 1000) * TOKEN_COST_PER_1K;

  // Warning at 80% of budget ($12)
  if (usage.estimatedCost > MONTHLY_BUDGET * 0.8) {
    showWarningToast(
      `Approaching monthly budget: $${usage.estimatedCost.toFixed(2)} of $${MONTHLY_BUDGET}`
    );
  }

  await AsyncStorage.setItem(`usage_${currentMonth}`, JSON.stringify(usage));
};
```

## 3. External API Dependencies

### Direct OpenAI API Integration

```typescript
// Environment configuration
const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

// Direct API call configuration (bypassing custom backend)
const chatConfig = {
  model: "gpt-4o-mini",
  apiKey: OPENAI_API_KEY,
  stream: true,
  experimental_attachments: true,
};
```

### Network State Management

```typescript
import * as Network from 'expo-network';

const useNetworkState = () => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const checkNetwork = async () => {
      const networkState = await Network.getNetworkStateAsync();
      setIsOnline(networkState.isConnected ?? false);
    };

    checkNetwork();
    const interval = setInterval(checkNetwork, 5000);
    return () => clearInterval(interval);
  }, []);

  return isOnline;
};

// Usage in chat component
const ChatScreen = () => {
  const isOnline = useNetworkState();

  if (!isOnline) {
    return <OfflineMessage />;
  }

  // Regular chat UI
};
```

## 4. Data Flow Architecture

### State Management with Zustand

```typescript
import {create} from "zustand";
import {persist, createJSONStorage} from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Auth store with SecureStore
const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  login: async (email, password) => {
    // Mock login logic
  },
  logout: async () => {
    // Clear all local data
  },
}));

// Profile store with AsyncStorage persistence
const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profile: null,
      updateProfile: (profile) => set({profile}),
    }),
    {
      name: "user-profile",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Chat store (session-only, no persistence)
const useChatStore = create<ChatState>((set) => ({
  messages: [],
  attachments: [],
  // Methods for chat management
}));
```

## 5. Limitations of Zero-API Approach

### Current Limitations

1. **No Cross-Device Sync**: Chat history lost on app uninstall/device change
2. **API Key Exposure**: OpenAI key stored locally (though encrypted in .env)
3. **No Server-Side Validation**: All validation happens client-side
4. **Limited Analytics**: No server-side usage tracking
5. **No Real Authentication**: Mock login only
6. **Session Memory Only**: Chat history lost on app restart (as per PRD)

### Security Considerations

- OpenAI API keys stored in device environment
- No server-side rate limiting (relying on OpenAI limits)
- Local validation only (can be bypassed)
- No centralized cost monitoring across users

## 6. Migration Path to Full Backend

### Phase 1: Add Authentication API

```typescript
// Replace mock login with real API
const login = async (email: string, password: string) => {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({email, password}),
  });
  // Handle real authentication
};
```

### Phase 2: Add Chat History Persistence

```typescript
// Store messages on server instead of session-only
const saveMessage = async (message: ChatMessage) => {
  await fetch(`${API_BASE}/conversations/${conversationId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });
};
```

### Phase 3: Server-Side File Processing

```typescript
// Upload files to server for processing
const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE}/files/upload`, {
    method: "POST",
    headers: {Authorization: `Bearer ${token}`},
    body: formData,
  });

  return response.json();
};
```

## 7. Implementation Checklist

### Core MVP Features (Zero-API)

- [ ] Mock authentication with SecureStore
- [ ] Profile management with AsyncStorage
- [ ] Direct OpenAI chat integration
- [ ] Local file attachment processing
- [ ] Session-only chat history
- [ ] Local cost tracking
- [ ] Network state detection
- [ ] Basic error handling with toasts

### Optional MVP Features

- [ ] Local speech-to-text (Expo Speech)
- [ ] Haptic feedback for voice recording
- [ ] PDF text extraction (client-side)
- [ ] Image compression and EXIF removal

### Preparation for Backend Migration

- [ ] Modular API service layer (easily replaceable)
- [ ] Consistent error handling patterns
- [ ] Token-based auth structure (even if mock)
- [ ] Data models matching future API responses

### Security Notes

- Never commit .env to repository
- Use .env.example for team setup
- Consider key rotation strategy
- Plan for server-side key storage in future versions

This zero-API approach allows for rapid MVP development while maintaining a clear path to full backend integration when needed.
