// Semantic IDs deliberately stay independent of each theme's filename ordering.
export const screens = [
  { id: 'home', title: 'Daily check-in', description: 'Make a little space to recognize how you’re feeling.', dark: 1, light: 4 },
  { id: 'welcome', title: 'Your space to breathe', description: 'A gentle beginning. A little more room to be yourself.', dark: 2, light: 1 },
  { id: 'chika', title: 'Meet Chika', description: 'A friendly companion for your moments of reflection.', dark: 3, light: 2 },
  { id: 'factors', title: 'Understand your stressors', description: 'Explore the areas that may be contributing to your stress.', dark: 4, light: 3 },
  { id: 'assessment', title: 'A moment to reflect', description: 'Reflect on your experiences through structured questions.', dark: 5, light: 5 },
  { id: 'results', title: 'A little more understanding', description: 'Understand your self-reported scores. A starting point, never a diagnosis.', dark: 6, light: 6 },
  { id: 'recommendations', title: 'Find your next small step', description: 'Explore supportive suggestions based on your assessment.', dark: 7, light: 7 },
  { id: 'history', title: 'See how far you’ve come', description: 'Look back at your previous check-ins and results.', dark: 8, light: 8 },
  { id: 'consultation', title: 'Make room for a conversation', description: 'Explore available guidance support and consultation options.', dark: 9, light: 9 },
];
export type ScreenTheme = 'dark' | 'light';
export const screenPath = (screen: typeof screens[number], theme: ScreenTheme) => `/screens/${theme}mode/${screen[theme]}.webp`;
// Set only to a verified public APK destination. Empty means coming soon.
export const apkUrl = (import.meta.env.PUBLIC_APK_URL || '').trim();
if (apkUrl && !/^https:\/\//.test(apkUrl)) throw new Error('PUBLIC_APK_URL must be a verified HTTPS APK URL.');
