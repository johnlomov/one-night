import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.onenightds.app',
  appName: 'One Night',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
}

export default config
