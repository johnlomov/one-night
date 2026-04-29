# One Night DS

Vue 3 + TypeScript приложение для проведения партий One Night Ultimate Werewolf без живого ведущего: ночные объявления, таймеры, голосование и экран результата.

## Технологии

- Vue 3 + TypeScript + Vite
- Pinia + Vue Router
- PWA через `vite-plugin-pwa`
- Android/iOS через Capacitor

## Требования

- Node.js 22+
- npm
- Для Android: Android Studio, Android SDK, JDK, Gradle wrapper из папки `android/`
- Для iOS: macOS и Xcode

## Установка

```bash
npm install
```

## Разработка

```bash
npm run dev
```

Локальный адрес обычно: `http://localhost:5173/`.

## Проверки

```bash
npm run typecheck
npm run lint:check
npm run format:check
npm run build
```

`npm run build` делает production-сборку веб-приложения и PWA в папку `dist/`.

## PWA-сборка

```bash
npm run build
```

После сборки в `dist/` появятся:

- `manifest.webmanifest`
- `sw.js`
- `registerSW.js`
- production assets приложения

Проверить PWA локально:

```bash
npm run preview
```

Открой `http://localhost:4173/`, затем проверь установку/Service Worker в DevTools → Application.

## Capacitor sync

После каждого изменения веб-кода перед сборкой нативных приложений нужно обновить native-проекты:

```bash
npm run cap:sync
```

Эта команда делает:

1. `npm run build`
2. копирование `dist/` в Android/iOS проекты
3. `npx cap sync`

## Android: открыть проект

```bash
npm run cap:open:android
```

Дальше можно запускать приложение из Android Studio на эмуляторе или устройстве.

## Android: собрать APK

Сначала синхронизируй web build:

```bash
npm run cap:sync
```

Debug APK:

```bash
cd android
./gradlew assembleDebug
```

Файл будет здесь:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

Release APK без подписи:

```bash
cd android
./gradlew assembleRelease
```

Файл будет здесь:

```text
android/app/build/outputs/apk/release/app-release-unsigned.apk
```

Для публикации нужен подписанный release build. Его удобнее настроить через Android Studio: Build → Generate Signed App Bundle / APK.

## Android: собрать AAB для Google Play

```bash
npm run cap:sync
cd android
./gradlew bundleRelease
```

Файл будет здесь:

```text
android/app/build/outputs/bundle/release/app-release.aab
```

## iOS

```bash
npm run cap:sync
npm run cap:open:ios
```

Дальше сборка и подпись выполняются в Xcode. Для установки на устройство или публикации нужен Apple Developer account и корректная signing configuration.

## Основные npm-скрипты

- `npm run dev` — запускает Vite dev server.
- `npm run build` — typecheck + production PWA build.
- `npm run preview` — локально показывает production build.
- `npm run typecheck` — проверяет TypeScript.
- `npm run lint:check` — проверяет ESLint без правок.
- `npm run format:check` — проверяет форматирование Prettier.
- `npm run cap:sync` — собирает PWA и синхронизирует Android/iOS.
- `npm run cap:open:android` — открывает Android проект.
- `npm run cap:open:ios` — открывает iOS проект.

## Примечания

- `android/` и `ios/` — сгенерированные Capacitor-проекты. Их не форматирует Prettier и не проверяет ESLint.
- Если меняется только веб-код, достаточно `npm run build`.
- Если после изменения веб-кода нужно собрать мобильное приложение, обязательно запускай `npm run cap:sync`.
- npm может показывать audit warnings для зависимостей Capacitor/Vite. Перед автоматическим `npm audit fix` проверь, не приведёт ли он к major-обновлениям.
