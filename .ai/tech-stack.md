# Tech Stack - Aplikacja Chat AI

## Framework mobilny - Expo + React Native + TypeScript:

- **Expo SDK 52+** pozwala na szybkie tworzenie aplikacji mobilnych bez konieczności konfiguracji natywnych narzędzi (Xcode/Android Studio)
- **React Native 0.76** zapewnia natywną wydajność przy zachowaniu jednej bazy kodu dla iOS i Android
- **TypeScript 5** oferuje statyczne typowanie, lepsze wsparcie IDE i zmniejsza liczbę błędów w runtime
- **Expo Router** implementuje file-based routing znany z Next.js, upraszczając nawigację i strukturę aplikacji

## UI i Stylowanie - NativeWind + Tailwind CSS:

- **NativeWind 4** umożliwia użycie Tailwind CSS w React Native, drastycznie przyspiesza proces stylowania
- **Tailwind CSS 3.4** zapewnia utility-first approach do CSS, co zwiększa produktywność developera
- **Lucide React Native** dostarcza spójną bibliotekę ikon SVG zoptymalizowanych dla mobile
- **Expo Image** oferuje wydajne ładowanie i cache'owanie obrazów z lepszą kontrolą nad pamięcią

## AI i Chat - Vercel AI SDK + OpenAI:

- **Vercel AI SDK 4** zapewnia prosty w użyciu hook `useChat` z wbudowaną obsługą streamingu i error handling
- **@ai-sdk/openai** oferuje bezpośrednią integrację z GPT-4o-mini z obsługą experimental_attachments
- **GPT-4o-mini** jako model chat+vision pozwala na przetwarzanie zarówno tekstu jak i obrazów/PDF w jednym API call
- Eliminuje potrzebę custom quasi-streamingu - SDK obsługuje to natywnie

## Zarządzanie stanem - Zustand:

- **Zustand 5** oferuje minimalistyczne, ale potężne zarządzanie stanem bez boilerplate
- **Zustand persist middleware** automatycznie synchronizuje stan z AsyncStorage
- Lekka alternatywa dla Redux z lepszą wydajnością i prostszą składnią
- Doskonale sprawdza się w aplikacjach React Native

## Obsługa plików - Expo File Pickers + Image Manipulator:

- **Expo Document Picker** zapewnia dostęp do plików PDF, MD, TXT z walidacją typów MIME
- **Expo Image Picker** obsługuje wybór zdjęć z galerii i aparatu z built-in permissions
- **Expo Image Manipulator** umożliwia skalowanie, kompresję i usuwanie EXIF bez dependencies natywnych
- Wszystkie biblioteki są częścią Expo SDK - brak konfliktów wersji

## Wejście głosowe - Expo Speech:

- **Expo Speech** zapewnia lokalne STT bez kosztów external API (ElevenLabs)
- Prostsze w implementacji niż streaming solutions - mniej moving parts
- Natywnie wspierane przez Expo managed workflow
- Automatyczny fallback do text input w przypadku braku uprawnień

## Persystencja danych - AsyncStorage + SecureStore:

- **@react-native-async-storage/async-storage** dla danych profilu użytkownika (nazwa, email, avatar)
- **Expo SecureStore** dla wrażliwych danych (stan logowania, mock credentials)
- **Zustand persist middleware** automatycznie integruje się z AsyncStorage
- Historia czatu przechowywana tylko w pamięci sesji (zgodnie z wymaganiami PRD)

## Network i Utilities - Expo Network + Polyfills:

- **Expo Network** do detekcji połączenia internetowego i obsługi offline states
- **React Native URL Polyfill** zapewnia kompatybilność z web APIs
- **React Native Get Random Values** dla crypto operations wymaganych przez niektóre biblioteki
- **Expo Constants** do dostępu do zmiennych środowiskowych (.env)

## Build i Dystrybucja - Expo Application Services (EAS):

- **EAS CLI** umożliwia tworzenie buildów dla iOS i Android w chmurze
- **EAS Build** eliminuje potrzebę lokalnych narzędzi natywnych (Xcode/Android Studio)
- **EAS Submit** automatyzuje proces publikacji do TestFlight i Google Internal Testing
- Integracja z GitHub Actions dla CI/CD pipeline

## Bezpieczeństwo - Lokalne klucze API (MVP):

- **Klucze OpenAI** przechowywane lokalnie w .env dla szybkiego MVP
- **Expo SecureStore** dla mock logowania (test@example.com/password123)
- **Brak serwerowego proxy** w MVP - upraszcza architekturę i przyspiesza development
- Zaplanowana migracja do backend proxy w przyszłych wersjach
