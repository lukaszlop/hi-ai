# Zero-API MVP Implementation Plan

## 1. Przegląd funkcjonalności dla MVP

Zero-API MVP to client-only aplikacja mobilna do konwersacji z AI, oparta na React Native (Expo) bez custom backend API. Wszystkie funkcjonalności działają lokalnie na urządzeniu lub przez bezpośrednie połączenia z external APIs (OpenAI). Architektura eliminuje potrzebę serwerowego backendu w fazie MVP, zapewniając szybkie wdrożenie przy zachowaniu jasnej ścieżki migracji do pełnej architektury backend w przyszłych wersjach.

### Kluczowe funkcjonalności:

- Mock authentication z lokalną persystencją
- Direct OpenAI chat integration z streaming support
- Local file processing (obrazy, PDF, teksty)
- Session-only chat history (resetuje się przy restarcie)
- Local cost tracking z miesięcznym budżetem
- Opcjonalne voice input z Expo Speech

## 2. Szczegóły architektury dla MVP

### Core Architecture Pattern

```
📱 React Native App (Expo SDK 52+)
├── 🔐 Mock Authentication (SecureStore)
├── 💾 Local Data Storage (AsyncStorage + Session Memory)
├── 🤖 Direct OpenAI API (Vercel AI SDK 4)
├── 📎 Local File Processing (Expo APIs)
├── 🎤 Local Speech-to-Text (Expo Speech)
└── 📊 Local Cost Tracking (AsyncStorage)
```

### State Management Structure

- **AuthStore**: Mock login state, session management
- **ChatStore**: Session-only messages (no persistence)
- **ProfileStore**: User profile z AsyncStorage persistence
- **FileStore**: Temporary file attachments processing
- **UsageStore**: Local cost tracking z monthly reset

### Data Persistence Strategy

- **SecureStore**: Mock authentication credentials, login state
- **AsyncStorage**: User profile data, usage tracking, app preferences
- **Session Memory**: Chat messages (cleared on app restart/logout)
- **No Backend Storage**: Brak cloud sync, wszystko locally

## 3. Service Layer Implementation

### AuthService (Mock Authentication)

```typescript
interface AuthCredentials {
  email: string;
  password: string;
}

interface AuthSession {
  isLoggedIn: boolean;
  loginTime: number;
}

class AuthService {
  private static readonly MOCK_CREDENTIALS = {
    email: "test@example.com",
    password: "password123",
  };

  static async login(
    email: string,
    password: string
  ): Promise<{success: boolean; error?: string}>;
  static async logout(): Promise<void>;
  static async checkAuthStatus(): Promise<AuthSession | null>;
  static async isAuthenticated(): Promise<boolean>;
}
```

### ChatService (Direct OpenAI Integration)

```typescript
interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  attachments?: FileAttachment[];
  timestamp: number;
}

class ChatService {
  static async sendMessage(
    message: string,
    attachments?: FileAttachment[]
  ): Promise<void>;
  static async stopGeneration(): Promise<void>;
  static validateMessage(content: string): {valid: boolean; error?: string};
}
```

### FileService (Local Processing)

```typescript
interface ProcessedFile {
  uri: string;
  type: string;
  name: string;
  content?: string;
  size: number;
}

class FileService {
  static async pickFiles(): Promise<ProcessedFile[]>;
  static async pickImages(): Promise<ProcessedFile[]>;
  static async validateFiles(
    files: ProcessedFile[]
  ): Promise<{valid: boolean; errors: string[]}>;
  static async processImage(uri: string): Promise<ProcessedFile>;
  static async processPDF(uri: string): Promise<ProcessedFile>;
  static async readTextFile(uri: string): Promise<string>;
}
```

### CostTrackingService (Local Monitoring)

```typescript
interface UsageData {
  totalTokens: number;
  estimatedCost: number;
  resetDate: string;
  monthlyBudget: number;
}

class CostTrackingService {
  static async trackUsage(tokens: number): Promise<void>;
  static async getCurrentUsage(): Promise<UsageData>;
  static async resetMonthlyUsage(): Promise<void>;
  static async checkBudgetWarning(): Promise<{
    warning: boolean;
    message?: string;
  }>;
}
```

## 4. Przepływ danych

### Authentication Flow

```
1. User Launch → Check SecureStore for session
2. If session exists → Auto-login → Navigate to Chat
3. If no session → Show Login Screen
4. Mock Login → Validate credentials → Store in SecureStore
5. Logout → Clear SecureStore → Clear Chat History → Navigate to Login
```

### Chat Message Flow

```
1. User Input → Local validation (5000 chars)
2. Attachments → Local processing → Size/type validation
3. Message + Attachments → Direct OpenAI API call
4. Streaming Response → Real-time UI updates
5. Complete Response → Add to session memory (ChatStore)
6. Token Usage → Track locally → Budget warnings
```

### File Processing Flow

```
1. File Selection → Expo DocumentPicker/ImagePicker
2. Local Validation → Size (10MB/file, 30MB total), MIME type
3. Image Processing → Compression, EXIF removal, resize (1600px max)
4. PDF Processing → Client-side text extraction (limited in MVP)
5. Text Files → Direct content reading
6. Processed Files → Temporary storage → Attach to message
```

### Cost Tracking Flow

```
1. API Response → Extract token usage from OpenAI response
2. Calculate Cost → tokens * rate (GPT-4o-mini pricing)
3. Update Monthly Usage → AsyncStorage persistence
4. Budget Check → Warning at 80% ($12 of $15)
5. Monthly Reset → Automatic on month change
```

## 5. Względy bezpieczeństwa

### API Key Security

- **Storage**: OpenAI API key w .env (EXPO_PUBLIC_OPENAI_API_KEY)
- **Exposure Risk**: Client-side key exposure (acceptable for MVP)
- **Rotation**: Manual key rotation process
- **Future Migration**: Backend proxy planned for production

### Data Security

- **Sensitive Data**: Only mock credentials w SecureStore
- **User Data**: Profile data w AsyncStorage (non-sensitive)
- **Chat History**: Session-only (automatically cleared)
- **File Processing**: Local processing, no cloud storage

### Authentication Security

- **Mock System**: test@example.com/password123 (MVP only)
- **Session Management**: SecureStore persistence
- **Future Migration**: Real OAuth/JWT planned for production

### Validation Security

- **Client-Side Only**: All validation local (can be bypassed)
- **File Validation**: MIME type, size limits enforced locally
- **Input Sanitization**: Basic validation for character limits
- **Network Security**: HTTPS for all external API calls

## 6. Obsługa błędów

### Network Error Handling

```typescript
// Network connectivity detection
- Offline Detection → Show offline message
- API Errors → Retry mechanism z exponential backoff
- Rate Limiting → User-friendly message + wait suggestion
- Timeout → Retry option with user notification
```

### File Processing Errors

```typescript
// File validation and processing errors
- File Too Large → Toast notification w języku polskim
- Unsupported Type → Clear error message + supported types list
- Corrupted Files → Graceful fallback + retry option
- Permission Denied → Permission request + manual settings guide
```

### Authentication Errors

```typescript
// Mock authentication error scenarios
- Invalid Credentials → "Nieprawidłowe dane logowania"
- SecureStore Error → Fallback + app restart suggestion
- Session Expired → Auto-logout + login screen navigation
```

### AI Response Errors

```typescript
// OpenAI API error handling
- Invalid Request → User-friendly message + retry
- Content Policy → Clear explanation + retry without attachments
- Model Overload → "Serwer przeciążony, spróbuj ponownie"
- Cost Limit → Budget warning + usage statistics
```

### Toast Notification System

```typescript
interface ToastConfig {
  type: "error" | "success" | "info" | "warning";
  message: string;
  duration?: number;
  action?: {label: string; onPress: () => void};
}

// Examples:
showErrorToast("Błąd połączenia internetowego", {
  action: {label: "Spróbuj ponownie", onPress: retryFunction},
});
```

## 7. Rozważania dotyczące wydajności

### Memory Management

- **Chat History**: Session-only prevents memory bloat
- **File Processing**: Temporary files cleanup after processing
- **Image Optimization**: Automatic compression + resize
- **Component Optimization**: React.memo dla message list items

### Network Optimization

- **Streaming**: Vercel AI SDK native streaming support
- **File Upload**: Local processing reduces network load
- **API Efficiency**: Direct OpenAI calls without proxy overhead
- **Connection Pooling**: Built-in z Vercel AI SDK

### Storage Optimization

- **AsyncStorage**: Minimal data persistence (profile only)
- **SecureStore**: Only authentication state
- **File System**: Temporary files automatic cleanup
- **Cache Management**: Expo Image built-in caching

### UI Performance

```typescript
// FlatList optimization dla message history
const MessageList = React.memo(() => {
  return (
    <FlatList
      data={messages}
      keyExtractor={(item) => item.id}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      getItemLayout={(data, index) => ({
        length: ITEM_HEIGHT,
        offset: ITEM_HEIGHT * index,
        index,
      })}
    />
  );
});
```

## 8. Etapy wdrożenia

### Phase 1: Project Setup & Core Architecture (Week 1)

1. **Initialize Expo project** z SDK 52+

   ```bash
   npx create-expo-app --template blank-typescript
   npm install @ai-sdk/openai ai zustand @react-native-async-storage/async-storage expo-secure-store
   ```

2. **Setup NativeWind & Tailwind**

   ```bash
   npm install nativewind@^4.0.0 tailwindcss
   npx tailwindcss init
   ```

3. **Configure Expo Router**

   ```bash
   npm install expo-router
   # Setup app directory structure
   ```

4. **Environment Configuration**
   - Create .env z EXPO_PUBLIC_OPENAI_API_KEY
   - Configure Expo Constants dla env variables

### Phase 2: Authentication System (Week 1-2)

1. **Implement AuthService**
   - Mock login logic z SecureStore
   - Session management
   - Auto-login check

2. **Create AuthStore (Zustand)**

   ```typescript
   const useAuthStore = create<AuthState>((set) => ({
     isLoggedIn: false,
     login: async (email, password) => {
       /* mock implementation */
     },
     logout: async () => {
       /* clear data implementation */
     },
   }));
   ```

3. **Build Login Screen**
   - Input fields z NativeWind styling
   - Form validation
   - Error handling z toast notifications

4. **Setup Navigation Guards**
   - Protected routes implementation
   - Auto-redirect logic

### Phase 3: Core Chat Functionality (Week 2-3)

1. **Implement ChatService**
   - Direct OpenAI integration z Vercel AI SDK
   - Message validation (5000 chars limit)
   - Streaming response handling

2. **Create ChatStore (Zustand)**

   ```typescript
   const useChatStore = create<ChatState>((set) => ({
     messages: [],
     addMessage: (message) => {
       /* session-only storage */
     },
     clearMessages: () => {
       /* logout cleanup */
     },
   }));
   ```

3. **Build Chat Interface**
   - Message list z FlatList optimization
   - Input field z character counting
   - Send/Stop buttons
   - Loading states z "model pisze..." indicator

4. **Implement Message Components**
   - User message bubbles
   - AI response bubbles
   - Timestamp display
   - Error state indicators

### Phase 4: File Attachment System (Week 3-4)

1. **Implement FileService**
   - Expo DocumentPicker integration
   - Expo ImagePicker integration
   - File validation (size, type)

2. **Add Image Processing**

   ```typescript
   import * as ImageManipulator from "expo-image-manipulator";

   const processImage = async (uri: string) => {
     return await ImageManipulator.manipulateAsync(
       uri,
       [{resize: {width: 1600}}],
       {compress: 0.8, format: ImageManipulator.SaveFormat.JPEG}
     );
   };
   ```

3. **Build File Selection UI**
   - Attachment picker buttons
   - File preview components
   - Remove attachment functionality
   - File size warnings

4. **Integrate with Chat System**
   - Attach files to messages
   - Display attachments w message bubbles
   - Handle attachment errors

### Phase 5: Cost Tracking System (Week 4)

1. **Implement CostTrackingService**
   - Token usage calculation
   - Monthly budget tracking (15 USD)
   - AsyncStorage persistence

2. **Add Usage Monitoring**
   - Track API response tokens
   - Calculate estimated costs
   - Budget warnings at 80%

3. **Build Usage Display**
   - Usage statistics w profile screen
   - Budget progress indicator
   - Monthly reset information

### Phase 6: Profile & Settings (Week 4-5)

1. **Implement ProfileStore**

   ```typescript
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
   ```

2. **Build Profile Screen**
   - User info display/edit
   - Avatar selection z ImagePicker
   - Usage statistics display
   - Logout functionality

3. **Add Settings Options**
   - Theme preferences (opcjonalne)
   - Notification settings
   - Data management options

### Phase 7: Network & Error Handling (Week 5)

1. **Implement Network Detection**

   ```typescript
   import * as Network from "expo-network";

   const useNetworkState = () => {
     // Network connectivity monitoring
   };
   ```

2. **Add Offline Support**
   - Offline message display
   - Queue messages for when online (opcjonalne)
   - Network retry mechanisms

3. **Comprehensive Error Handling**
   - Toast notification system
   - Retry mechanisms
   - Graceful degradation

### Phase 8: Voice Input (Optional - Week 5-6)

1. **Implement Voice Recording**
   - Expo Audio for recording
   - Permission handling
   - 60-second auto-stop

2. **Add STT Integration**
   - Expo Speech dla local STT
   - Fallback to text input
   - Haptic feedback

3. **Voice UI Components**
   - Record button z visual feedback
   - Recording state indicators
   - Voice permission requests

### Phase 9: Polish & Testing (Week 6)

1. **UI/UX Polish**
   - Consistent styling z NativeWind
   - Loading states improvement
   - Animation polish z react-native-reanimated

2. **Performance Optimization**
   - Message list optimization
   - Memory leak fixes
   - File processing optimization

3. **Error Scenarios Testing**
   - Network failure scenarios
   - File processing edge cases
   - Authentication edge cases

4. **Device Testing**
   - iOS device testing
   - Android device testing
   - Different screen sizes

### Phase 10: Deployment Preparation (Week 6-7)

1. **Environment Configuration**
   - Production .env setup
   - Build configuration
   - Asset optimization

2. **EAS Build Setup**

   ```bash
   npm install -g @expo/cli
   eas init
   eas build:configure
   ```

3. **Testing Build**
   - Development build testing
   - Production build testing
   - Internal distribution setup

## 9. Ścieżka migracji do Backend

### Phase 1: Authentication API

- Replace mock login z real authentication service
- Implement JWT token management
- Add password reset functionality

### Phase 2: Chat History Persistence

- Add conversation storage API
- Implement sync capabilities
- Add cross-device chat history

### Phase 3: File Upload Service

- Server-side file processing
- Cloud storage integration
- Enhanced PDF text extraction

### Phase 4: Advanced Features

- Real-time collaboration
- Advanced analytics
- Server-side cost management

## 10. Monitoring i Maintenance

### Local Monitoring (MVP)

- Client-side error tracking
- Usage statistics collection
- Performance metrics (basic)

### Future Backend Integration

- Server-side analytics
- Real-time monitoring
- Centralized error tracking

### Maintenance Considerations

- Monthly budget resets
- File cleanup routines
- App update mechanisms
- User data migration planning

Ten plan zapewnia systematyczne wdrożenie Zero-API MVP z zachowaniem jasnej ścieżki do przyszłej migracji na pełną architekturę backend.
