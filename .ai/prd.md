# Dokument wymagań produktu (PRD) - Aplikacja Chat AI

## 1. Przegląd produktu

Aplikacja mobilna do konwersacyjnej współpracy z modelem LLM, łącząca czat tekstowy, obsługę załączników (obrazy i dokumenty), oraz wejście głosowe (opcjonalnie) w prostym przepływie z zachowaniem lokalnej prywatności i bez serwerowego backendu. Produkt jest budowany w React Native (Expo) z Expo Router oraz Vercel AI SDK, z naciskiem na szybkie wyświetlanie odpowiedzi (quasi‑streaming na RN), prostą nawigację w zakładkach i lokalną persystencję podstawowych danych (profil, stan zalogowania, historia sesji).

- Platformy: iOS 16+ oraz Android 10+
- Język interfejsu: polski; model konwersuje po polsku
- Model czatu i vision: GPT‑4o‑mini (Vercel AI SDK)
- STT (opcjonalnie, jeśli nie zwiększa złożoności MVP): ElevenLabs streaming STT z partials i autointerpunkcją; fallback do transkrypcji asynchronicznej
- Stan i persystencja: Zustand (chat, profile, attachments), AsyncStorage (profil), SecureStore (stan zalogowania), pamięć sesji (historia czatu)
- Załączniki: md, txt, jpeg, png, pdf (walidacja typów, limitów i pre‑podgląd)
- Nawigacja: Expo Router w układzie zakładek (Chat, Profile)
- Dystrybucja: TestFlight (iOS) i Google Internal Testing (Android)
- Budżet operacyjny: 15 USD/miesiąc (lokalny licznik kosztów)

Zakres MVP obejmuje: mock‑logowanie z utrwaleniem przez SecureStore, ekran czatu z quasi‑streamingiem odpowiedzi i obsługą załączników, podstawową ścieżkę PDF i obrazów (ekstrakcja tekstu i vision), edycję profilu z lokalną persystencją oraz prostą nawigację między ekranami.

## 2. Problem użytkownika

- Potrzeba szybkiej i mobilnej interakcji z LLM, która dostarcza natychmiastową informację zwrotną i pozwala zadawać pytania w ruchu bez skomplikowanej konfiguracji.
- Konieczność prostego dołączenia kontekstu do zapytania (obrazy, PDF, pliki tekstowe) bez opuszczania wątku czatu.
- Oczekiwanie zachowania podstawowych preferencji i tożsamości użytkownika lokalnie (profil), z jednoczesnym minimalnym narzutem na bezpieczeństwo i prywatność.
- Wygodna nawigacja i responsywny interfejs, który zachowuje stan sesji, umożliwia przerwanie lub ponowienie generowania oraz informuje o błędach w sposób zrozumiały i akcjonowalny.

## 3. Wymagania funkcjonalne

3.1 Czat i odpowiedzi modelu

- Wysyłanie wiadomości tekstowych do 5000 znaków; licznik znaków i blokada wysyłki po przekroczeniu limitu.
- Historia rozmowy przechowywana w pamięci sesji, utrzymana pomiędzy zakładkami, resetowana po ubiciu aplikacji lub wylogowaniu.
- Odbiór odpowiedzi z quasi‑streamingiem na RN: okresowe porcjowanie treści co 50–100 ms lub płynna aktualizacja bloku odpowiedzi; wskaźnik stanu „model pisze…”.
- Kontrola generowania: przycisk Stop (przerywa generowanie) i Wyślij ponownie (ponawia ostatnie zapytanie wraz z kontekstem).
- Kopiowanie: możliwość zaznaczenia i skopiowania tekstu odpowiedzi.
- Zarządzanie kontekstem: soft‑limit tokenów, lokalne obcinanie/sumaryzacja wątku w celu utrzymania spójności i kosztów.
- Obsługa błędów: toasty u góry z kategorią i przyciskiem „Ponów” dla 429/5xx/timeout; backoff i sensowne timeouts; czytelne komunikaty dla innych błędów.

  3.2 Załączniki i walidacja

- Obsługiwane typy: md, txt, jpeg, png, pdf; whitelist MIME skonfigurowana i egzekwowana.
- Limity: do 10 MB na plik, maks. 5 plików w jednym zapytaniu, łączny limit 30 MB; przekroczenia wyświetlają czytelne toasty z przyczyną.
- Wybór plików: expo‑image‑picker (obrazy) i expo‑document‑picker (pdf/md/txt); miniatury/preview w UI przed wysyłką; możliwość usunięcia pojedynczego załącznika przed wysyłką.
- Przekazanie do modelu: experimental_attachments w useChat Vercel AI SDK.

  3.3 Przetwarzanie obrazów i PDF

- Obrazy: skalowanie do maks. ~1600 px po dłuższym boku, kompresja ok. 0.8, usuwanie EXIF; przekazanie do modelu z kontekstem vision.
- PDF: ekstrakcja tekstu do limitu 50 stron lub 50 tys. znaków; dla skanów fallback do Tesseract OCR; czytelne komunikaty, gdy plik jest poza limitami.

  3.4 Wejście głosowe (opcjonalne w MVP, jeśli nie zwiększa nadmiernie złożoności)

- Nagrywanie z expo‑av: M4A/AAC, mono, 16 kHz; przyciski Start/Stop; auto‑stop po 60 s; obsługa przerwań systemowych.
- Streaming STT: ElevenLabs z partials i autointerpunkcją; pierwsze partials w ~800–1000 ms.
- Fallback: asynchroniczna transkrypcja z wynikiem dla 10 s audio w ~5–7 s.
- Normalizacja liczb; wynik trafia do pola czatu z możliwością edycji przed wysyłką.

  3.5 Profil i sesja

- Profil zawiera nazwę, e‑mail i zdjęcie; edycja oraz lokalna persystencja w AsyncStorage, niezależna od historii czatu.
- Mock‑logowanie z twardymi danymi test@example.com/password123; po sukcesie przekierowanie do czatu; stan zalogowania utrzymany po restarcie dzięki SecureStore.
- Wylogowanie z modalem potwierdzenia oraz czyszczeniem historii sesji i stanu aplikacji powiązanego z użytkownikiem.

  3.6 Nawigacja i UX

- Expo Router w układzie zakładek: Chat i Profile; szybkie przełączanie bez utraty stanu sesji.
- Spójne zachowanie przycisku wstecz, linków i nawigacji zgodne z file‑based routing.
- Minimalna dostępność: czytelność/kontrast, etykiety elementów, haptics dla start/stop nagrania.

  3.7 Koszty i limity

- Lokalny licznik wykorzystania: uproszczona estymacja żądań/tokenów w UI.
- Ostrzeżenie przy zbliżaniu się do miesięcznego progu 15 USD.

  3.8 Bezpieczeństwo i klucze

- Brak serwerowego proxy w MVP; klucze tylko lokalnie w .env po stronie dewelopera/testera; dostarczone .env.example.
- Zakaz commitowania kluczy do repo; repo publiczne.

  3.9 Wydajność i stabilność

- TTFB zgodny z możliwościami SDK i platform: płynne przewijanie listy wiadomości; przetwarzanie załączników nie blokuje głównego wątku.
- Crash‑free rate docelowo ≥ 99.5% w MVP.

## 4. Granice produktu

Poza zakresem MVP:

- Prawdziwe backendowe uwierzytelnianie, rejestracja, odzyskiwanie hasła i zarządzanie tokenami poza lokalnym mock‑logowaniem.
- Trwała (chmurowa) historia rozmów, synchronizacja między urządzeniami, role/organizacje i uprawnienia wieloużytkownikowe.
- Zaawansowana moderacja treści, RAG z wektorami, routing wielu dostawców, skomplikowane polityki kosztów/limitów.
- Twardy token‑by‑token streaming na RN bez obejść (poza quasi‑streamingiem/aktualizacją blokową).
- Tryb offline i telemetria.

## 5. Historyjki użytkowników

US‑001
Tytuł: Logowanie mock
Opis: Jako użytkownik chcę zalogować się test@example.com/password123, aby wejść do czatu.
Kryteria akceptacji:

- Po wpisaniu danych test@example.com/password123 i potwierdzeniu, przechodzę do ekranu czatu.
- Błędne dane pokazują czytelny komunikat o błędzie bez wycieku szczegółów.
- Stan zalogowania jest zapisany w SecureStore.

US‑002
Tytuł: Auto‑login po restarcie
Opis: Jako użytkownik chcę być automatycznie zalogowany po ponownym uruchomieniu aplikacji.
Kryteria akceptacji:

- Po restarcie aplikacja odczytuje stan z SecureStore i pomija ekran logowania.
- W przypadku braku stanu aplikacja pokazuje ekran logowania.

US‑003
Tytuł: Wylogowanie i czyszczenie
Opis: Jako użytkownik chcę się wylogować i wyczyścić historię sesji.
Kryteria akceptacji:

- Wylogowanie wymaga potwierdzenia w modalu.
- Po potwierdzeniu: czatowa historia sesji, załączniki i stan sesji są wyczyszczone.
- Użytkownik trafia na ekran logowania.

US‑010
Tytuł: Wysłanie wiadomości tekstowej
Opis: Jako użytkownik chcę wysłać wiadomość tekstową i otrzymać odpowiedź modelu.
Kryteria akceptacji:

- Pole wejścia akceptuje do 5000 znaków i blokuje wysyłkę po przekroczeniu.
- Po wysyłce pojawia się natychmiastowy stan „model pisze…”.
- Odpowiedź renderuje się quasi‑streamingowo lub w płynnych porcjach.

US‑011
Tytuł: Przerwanie generowania
Opis: Jako użytkownik chcę zatrzymać generowanie odpowiedzi.
Kryteria akceptacji:

- Przycisk Stop natychmiast przerywa aktualne generowanie.
- Interfejs przechodzi do stanu spoczynku i pozwala na kolejną akcję.

US‑012
Tytuł: Ponowienie wysyłki
Opis: Jako użytkownik chcę ponowić ostatnie zapytanie wraz z kontekstem.
Kryteria akceptacji:

- Przycisk „Wyślij ponownie” wysyła ostatnie zapytanie i załączniki.
- Odpowiedź wyświetla się jak przy zwykłej wysyłce.

US‑013
Tytuł: Kopiowanie odpowiedzi
Opis: Jako użytkownik chcę zaznaczyć i skopiować fragment lub całość odpowiedzi.
Kryteria akceptacji:

- Zaznaczenie tekstu w odpowiedzi jest możliwe.
- Po wybraniu opcji kopiowania zawartość trafia do schowka systemowego.

US‑014
Tytuł: Błędy serwera i timeouty
Opis: Jako użytkownik chcę otrzymać czytelny toast z opcją „Ponów” przy 429/5xx/timeout.
Kryteria akceptacji:

- Dla 429/5xx/timeout pojawia się toast z przyciskiem „Ponów”.
- Ponów wykonuje retry z rozsądnym backoffem.
- Inne błędy mają czytelny komunikat i brak „Ponów”.

US‑015
Tytuł: Limit znaków wiadomości
Opis: Jako użytkownik nie chcę móc wysłać wiadomości dłuższej niż 5000 znaków.
Kryteria akceptacji:

- Licznik znaków aktualizuje się na bieżąco.
- Przycisk wyślij jest nieaktywny po przekroczeniu limitu i pokazuje komunikat.

US‑016
Tytuł: Historia w pamięci sesji
Opis: Jako użytkownik chcę widzieć historię wątku w bieżącej sesji i między zakładkami.
Kryteria akceptacji:

- Przełączanie między Chat a Profile nie resetuje wątku.
- Utrata historii następuje po ubiciu aplikacji lub wylogowaniu.

US‑017
Tytuł: Soft‑limit kontekstu
Opis: Jako użytkownik oczekuję, że aplikacja będzie utrzymywać kontekst w granicach soft‑limitu tokenów.
Kryteria akceptacji:

- Przy zbliżaniu się do limitu starsze wiadomości są obcinane lub streszczane lokalnie.
- Nie następują błędy odrzucenia przez model z powodu nadmiernego kontekstu w typowych przypadkach.

US‑020
Tytuł: Start nagrywania głosu
Opis: Jako użytkownik chcę rozpocząć nagrywanie głosu, aby podyktować wiadomość.
Kryteria akceptacji:

- Przyciski Start/Stop są dostępne.
- Po Starcie widać stan nagrywania; w razie braku zgody na mikrofon wyświetla się komunikat i link do ustawień.

US‑021
Tytuł: Auto‑stop po 60 s
Opis: Jako użytkownik oczekuję, że nagrywanie zatrzyma się automatycznie po 60 sekundach.
Kryteria akceptacji:

- Nagrywanie przerywa się po 60 s z komunikatem informacyjnym.
- Zapisany fragment jest przekazany do STT lub do kolejki fallback.

US‑022
Tytuł: Streaming partials STT
Opis: Jako użytkownik chcę widzieć częściowe wyniki transkrypcji podczas nagrywania.
Kryteria akceptacji:

- Pierwsze partials pojawiają się w 800–1000 ms od startu.
- Tekst partials jest aktualizowany w polu wejścia.

US‑023
Tytuł: Fallback transkrypcji asynchronicznej
Opis: Jako użytkownik chcę otrzymać transkrypcję po zakończeniu nagrania, jeśli streaming nie działa.
Kryteria akceptacji:

- Dla 10 s audio transkrypcja pojawia się w 5–7 s.
- Użytkownik może edytować tekst przed wysyłką do modelu.

US‑024
Tytuł: Przerwanie nagrywania przez system
Opis: Jako użytkownik chcę, aby przerwania (np. połączenie) nie korumpowały sesji.
Kryteria akceptacji:

- Po przerwaniu nagrywanie zatrzymuje się i stan UI jest spójny.
- Nagranie częściowe nie powoduje crasha; komunikat wyjaśnia sytuację.

US‑025
Tytuł: Brak uprawnień do mikrofonu
Opis: Jako użytkownik chcę zrozumieć, jak włączyć uprawnienia, gdy są wyłączone.
Kryteria akceptacji:

- Aplikacja pokazuje komunikat z instrukcją i przyciskiem do ustawień.
- Brak pętli błędów/nieskończonych retry.

US‑030
Tytuł: Dodanie załączników (obrazy/PDF/md/txt)
Opis: Jako użytkownik chcę dodać 1–5 plików do zapytania.
Kryteria akceptacji:

- Można wybrać pliki zezwolonych typów.
- Przed wysyłką widać miniatury/preview i rozmiary.

US‑031
Tytuł: Podgląd i usuwanie załączników
Opis: Jako użytkownik chcę obejrzeć i ewentualnie usunąć załącznik przed wysyłką.
Kryteria akceptacji:

- Miniatura i nazwa pliku są widoczne.
- Usunięcie pojedynczego pliku aktualizuje listę bez błędów.

US‑032
Tytuł: Limit liczby plików
Opis: Jako użytkownik nie chcę dodać więcej niż 5 plików.
Kryteria akceptacji:

- Po przekroczeniu limitu aplikacja pokazuje toast i blokuje dodanie.

US‑033
Tytuł: Limit 10 MB/plik
Opis: Jako użytkownik nie chcę dodać pliku większego niż 10 MB.
Kryteria akceptacji:

- Plik > 10 MB jest odrzucony z czytelnym tostem.

US‑034
Tytuł: Limit 30 MB łącznie
Opis: Jako użytkownik nie chcę przekroczyć łącznego limitu 30 MB.
Kryteria akceptacji:

- Przy próbie przekroczenia sumarycznej wagi pojawia się toast i blokada.

US‑035
Tytuł: Nieobsługiwany typ pliku
Opis: Jako użytkownik chcę jasnego komunikatu dla nieobsługiwanych typów.
Kryteria akceptacji:

- Pliki spoza whitelisty są odrzucane z komunikatem.

US‑036
Tytuł: Przetwarzanie PDF do tekstu
Opis: Jako użytkownik chcę, aby PDF był przekształcany do tekstu do limitu.
Kryteria akceptacji:

- PDF do 50 stron lub 50 tys. znaków przechodzi ekstrakcję.
- Powyżej limitu pojawia się komunikat i propozycja skrócenia.

US‑037
Tytuł: OCR dla skanów PDF
Opis: Jako użytkownik chcę mieć wynik OCR, gdy PDF jest skanem.
Kryteria akceptacji:

- Jeśli brak tekstu, uruchamia się OCR.
- W razie niepowodzenia pojawia się komunikat i sugestia ponowienia.

US‑038
Tytuł: Kompresja i skalowanie obrazów
Opis: Jako użytkownik chcę, aby obrazy były optymalizowane i bez EXIF.
Kryteria akceptacji:

- Dłuższy bok do ~1600 px; jakość ~0.8.
- Dane EXIF nie są zachowywane.

US‑039
Tytuł: Vision dla obrazów
Opis: Jako użytkownik chcę, aby model brał pod uwagę obraz w odpowiedzi.
Kryteria akceptacji:

- Załączony obraz jest przekazany jako kontekst vision.
- Odpowiedź modelu odnosi się do treści obrazu.

US‑040
Tytuł: Edycja profilu
Opis: Jako użytkownik chcę edytować nazwę, e‑mail i zdjęcie.
Kryteria akceptacji:

- Zmiany zapisują się lokalnie i są widoczne po powrocie do aplikacji.
- E‑mail walidowany podstawowo (format).

US‑041
Tytuł: Trwałość profilu
Opis: Jako użytkownik chcę, aby dane profilu przetrwały restart aplikacji.
Kryteria akceptacji:

- Po restarcie dane z AsyncStorage są odczytane i odtworzone.

US‑042
Tytuł: Usunięcie zdjęcia profilowego
Opis: Jako użytkownik chcę usunąć zdjęcie profilowe.
Kryteria akceptacji:

- Po usunięciu widoczny jest stan domyślny; dane są zapisane.

US‑050
Tytuł: Przełączanie zakładek
Opis: Jako użytkownik chcę przełączać się między Chat i Profile bez utraty stanu czatu.
Kryteria akceptacji:

- Przełączanie nie resetuje listy wiadomości ani wpisanego tekstu.

US‑051
Tytuł: Zachowanie wstecz
Opis: Jako użytkownik oczekuję przewidywalnego działania przycisku wstecz.
Kryteria akceptacji:

- Wstecz cofa w obrębie zakładek zgodnie z nawigacją Expo Router.

US‑060
Tytuł: Licznik kosztów
Opis: Jako użytkownik chcę widzieć uproszczony licznik wykorzystania.
Kryteria akceptacji:

- W UI widoczna jest estymacja kosztu/zużycia.
- Ostrzeżenie pojawia się przy zbliżaniu się do 15 USD.

US‑070
Tytuł: Quasi‑streaming na RN
Opis: Jako użytkownik chcę płynnego odczucia strumieniowania nawet bez token‑by‑token.
Kryteria akceptacji:

- Odpowiedź renderuje się porcjami co 50–100 ms lub blokowo z płynną aktualizacją.
- Wskaźnik „model pisze…” widoczny do zakończenia generowania.

US‑071
Tytuł: Brak połączenia sieciowego
Opis: Jako użytkownik chcę jasnego komunikatu, gdy nie ma internetu.
Kryteria akceptacji:

- Przy braku sieci pojawia się komunikat i brak prób wysyłki.
- Po odzyskaniu sieci można ponowić wysyłkę.

US‑072
Tytuł: Timeouts i backoff
Opis: Jako użytkownik oczekuję stabilnych prób ponownych bez blokowania UI.
Kryteria akceptacji:

- Zapytania mają rozsądne timeouty i backoff.
- UI pozostaje responsywne podczas retry.

US‑073
Tytuł: Minimalna dostępność
Opis: Jako użytkownik oczekuję czytelnych etykiet i kontrastu oraz haptics dla nagrywania.
Kryteria akceptacji:

- Elementy mają etykiety dostępności i wystarczający kontrast.
- Haptics sygnalizuje start/stop nagrania.

US‑074
Tytuł: Reset historii przy wylogowaniu
Opis: Jako użytkownik chcę, aby wylogowanie usuwało historię czatu.
Kryteria akceptacji:

- Po wylogowaniu lista wiadomości jest pusta.
- Nowa sesja zaczyna się bez poprzedniego kontekstu.

## 6. Metryki sukcesu

- Czas do pierwszej porcji odpowiedzi (TTFB): mediana ≤ 2.0–2.5 s, p95 ≤ 5 s.
- STT: pierwsze partials ≤ ~800–1000 ms; transkrypcja 10 s audio ≤ 5–7 s (fallback async).
- Załączniki: co najmniej 95% plików do 10 MB przetwarzanych bez błędów; PDF ≤ 50 stron przechodzi ekstrakcję lub informuje o ograniczeniach.
- Stabilność/UX: crash‑free ≥ 99.5%; toasty dla 4xx/5xx/timeout; „Ponów” działa dla 429/5xx/timeout.
- Koszty: licznik w UI sygnalizuje zbliżanie się do 15 USD/miesiąc; brak przekroczeń w typowych scenariuszach testowych.
- Nawigacja i stan: szybkie przełączanie zakładek bez utraty stanu; spójność zachowania wstecz zgodna z Expo Router.
