import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.slaphappy.app',
  appName: 'Slap Happy',
  webDir: 'www',
  server: {
    // No live reload — fully self-contained
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#E8F8F5',
      showSpinner: false,
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#E8F8F5',
    }
  },
  ios: {
    contentInset: 'always',
    preferredContentMode: 'mobile',
    scheme: 'Slap Happy',
  },
  android: {
    backgroundColor: '#E8F8F5',
    allowMixedContent: false,
  }
};

export default config;
