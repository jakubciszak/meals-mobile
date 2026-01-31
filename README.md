# Meals Mobile

A React Native mobile application for tracking family meals and ratings. This is the mobile version of the [my-meals](https://github.com/jakubciszak/my-meals) web application.

## Features

- 📱 Track daily meals for your family
- 👨‍👩‍👧‍👦 Manage family members
- ⭐ Rate meals with likes/dislikes
- 📅 View meal history by date
- 💾 Local data storage with AsyncStorage
- 🔄 Automatic data persistence

## Tech Stack

- **React Native** with **Expo**
- **TypeScript** for type safety
- **React Navigation** for navigation
- **AsyncStorage** for local data persistence
- **Expo Vector Icons** for icons

## Getting Started

### Prerequisites

- Node.js (v20 or higher)
- npm or yarn
- Expo CLI (installed automatically)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/jakubciszak/meals-mobile.git
cd meals-mobile
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Run on Android:
```bash
npm run android
```

5. Run on iOS (macOS only):
```bash
npm run ios
```

## Building

### Android APK

The project includes GitHub Actions workflow for automated APK builds. Builds are triggered on:
- Push to `main` or `develop` branches
- Pull requests to `main`
- Manual workflow dispatch

APK artifacts are:
- Uploaded to GitHub Actions artifacts (30-day retention)
- Attached to GitHub Releases (for main branch builds)

To build locally:
```bash
npx expo prebuild --platform android
cd android
./gradlew assembleRelease
```

The APK will be available at `android/app/build/outputs/apk/release/app-release.apk`

## Project Structure

```
src/
├── components/       # Reusable UI components
├── hooks/           # Custom React hooks
│   ├── useFamilyMembers.ts
│   └── useMeals.ts
├── navigation/      # Navigation setup
│   └── AppNavigator.tsx
├── screens/         # Screen components
│   ├── HomeScreen.tsx
│   ├── MealsScreen.tsx
│   ├── FamilyScreen.tsx
│   └── SettingsScreen.tsx
└── types/           # TypeScript type definitions
    └── index.ts
```

## Screens

### Home (Dzisiaj)
- Add new meals for today or past dates
- Rate meals for each family member
- View today's meals with ratings

### Meals (Posiłki)
- Browse meal history grouped by date
- View rating summaries
- Delete old meals

### Family (Rodzina)
- Add family members
- Edit member names
- Remove family members

### Settings (Ustawienia)
- App configuration (future features)
- Data management options

## Data Storage

The app uses AsyncStorage for local data persistence:
- Meals are stored with ratings, dates, and ingredients
- Family members are stored separately
- Data is automatically saved on every change
- Data persists across app restarts

## License

MIT

## Related Projects

- [my-meals](https://github.com/jakubciszak/my-meals) - Web version of this application
