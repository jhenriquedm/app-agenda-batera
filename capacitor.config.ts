import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bateraagenda.app',
  appName: 'Agenda do Batera',
  webDir: 'dist',
  android: {
    allowMixedContent: true,
    backgroundColor: '#020617',
  },
  server: {
    androidScheme: 'https',
  },
};

export default config;
