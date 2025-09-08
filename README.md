# Hi AI - Chat AI Mobile App

A React Native mobile application for conversational AI interactions with GPT-4o-mini, featuring text chat, file attachments, voice input, and local data persistence.

## Table of Contents

- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## Project Description

Hi AI is a mobile chat application built with Expo and React Native that enables users to interact with OpenAI's GPT-4o-mini model. The app supports:

- **Text Chat**: Conversational interface with native streaming responses (token-by-token)
- **File Attachments**: Support for images (JPEG, PNG), documents (PDF, Markdown, TXT) up to 10MB per file
- **Voice Input**: Local speech-to-text using Expo Speech with automatic fallback to text input
- **Vision Capabilities**: Image analysis through GPT-4o-mini's vision features
- **Local Storage**: User profile and session data stored locally without server backend
- **Polish Interface**: Application interface in Polish language

**Target Platforms**: iOS 16+ and Android 10+ using Expo managed workflow

**MVP Features**:

- Mock authentication (test@example.com/password123)
- Session-based chat history (cleared on app restart or logout)
- File attachment processing with compression and optimization
- Cost tracking with $15/month operational budget limit

## Tech Stack

### Core Framework

- **Expo SDK 52+** - Cross-platform mobile development
- **React Native 0.76** - Native mobile performance
- **TypeScript 5** - Static typing and enhanced development experience
- **Expo Router** - File-based routing system

### UI & Styling

- **NativeWind 4** - Tailwind CSS for React Native
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **Lucide React Native** - Consistent SVG icon library
- **Expo Image** - Optimized image loading and caching

### AI & Chat

- **Vercel AI SDK 4** - Chat streaming and error handling with `useChat` hook
- **@ai-sdk/openai** - OpenAI GPT-4o-mini integration
- **GPT-4o-mini** - Chat and vision AI model

### State Management

- **Zustand 5** - Lightweight state management
- **Zustand persist middleware** - Automatic AsyncStorage synchronization

### File Handling

- **Expo Document Picker** - PDF, MD, TXT file selection
- **Expo Image Picker** - Photo selection from gallery/camera
- **Expo Image Manipulator** - Image scaling, compression, EXIF removal

### Voice Input

- **Expo Speech** - Local speech-to-text (no external API costs)

### Data Persistence

- **@react-native-async-storage/async-storage** - User profile storage
- **Expo SecureStore** - Secure authentication state storage

### Utilities

- **Expo Network** - Internet connection detection
- **Expo Constants** - Environment variables access
- **React Native URL Polyfill** - Web API compatibility

### Build & Distribution

- **EAS CLI** - Cloud-based build service
- **EAS Build** - iOS and Android builds
- **EAS Submit** - App store distribution

## Getting Started Locally

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development) or Android Studio (for Android development)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd hi-ai
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` file and add your OpenAI API key:

   ```env
   EXPO_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Start the development server**

   ```bash
   npm start
   ```

5. **Run on device/simulator**
   - For iOS: Press `i` in the terminal or run `npm run ios`
   - For Android: Press `a` in the terminal or run `npm run android`
   - For web: Press `w` in the terminal or run `npm run web`

### Mock Authentication

The app uses mock authentication for MVP:

- **Email**: `test@example.com`
- **Password**: `password123`

## Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Start the app on Android device/emulator
- `npm run ios` - Start the app on iOS device/simulator
- `npm run web` - Start the app in web browser
- `npm run lint` - Run ESLint code analysis
- `npm run reset-project` - Reset the project to initial state

## Project Scope

### MVP Scope (Current)

✅ **Included:**

- Mock authentication with local session persistence
- Text chat with native streaming responses
- File attachment support (images, PDF, markdown, text files)
- Voice input with local speech-to-text
- Image processing and vision analysis
- Local user profile management
- Tab-based navigation (Chat, Profile)
- Cost tracking and usage monitoring
- Offline state detection

❌ **Not Included (Out of MVP Scope):**

- Real backend authentication and user management
- Persistent cloud chat history and cross-device sync
- Multi-user/organization features
- Advanced content moderation
- RAG (Retrieval Augmented Generation) with vector databases
- Multiple AI provider routing
- Advanced cost/limit policies
- Offline mode functionality

### Technical Constraints

- **File Limits**: 10MB per file, max 5 files per query, 30MB total
- **PDF Processing**: Up to 50 pages or 50,000 characters
- **Message Limit**: 5,000 characters per message
- **Operational Budget**: $15 USD per month
- **Platforms**: iOS 16+ and Android 10+ only

## Project Status

🚧 **Current Status**: MVP Development Phase

### Completed Features

- ✅ Project structure and dependencies setup
- ✅ Basic Expo Router navigation
- ✅ Zustand store configuration
- ✅ Core component structure

### In Progress

- 🔄 Chat interface with streaming responses
- 🔄 File attachment handling
- 🔄 User authentication flow
- 🔄 Voice input integration

### Upcoming Features

- 📋 Enhanced error handling and retry mechanisms
- 📋 Cost tracking and budget monitoring
- 📋 Accessibility improvements
- 📋 Performance optimizations
- 📋 EAS Build configuration for app store distribution

### Future Roadmap (Post-MVP)

- Server-side authentication and user management
- Persistent cloud chat history
- Advanced AI model routing
- Enhanced security and data encryption
- Real-time collaboration features

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Note**: This application requires an OpenAI API key and uses the GPT-4o-mini model. API usage costs apply according to OpenAI's pricing structure. The application includes local usage tracking to help monitor costs within the $15/month operational budget.
