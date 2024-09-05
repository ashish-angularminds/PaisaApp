import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'paisa',
  appName: 'Paisa',
  webDir: 'www',
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
    }
  }
};

export default config;
