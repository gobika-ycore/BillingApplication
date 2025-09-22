// Firebase Emulator Setup - 100% Free, No Billing Required
// This allows you to use Firestore locally without any billing

import { initializeApp, getApps } from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';

// Emulator configuration
const EMULATOR_CONFIG = {
  host: '10.0.2.2', // Android emulator host
  port: 8080,
  ssl: false
};

class FirebaseEmulatorSetup {
  static isEmulatorSetup = false;

  static async setupEmulator() {
    try {
      if (this.isEmulatorSetup) {
        console.log('✅ Emulator already configured');
        return { success: true };
      }

      // Check if running in development
      if (__DEV__) {
        console.log('🔧 Setting up Firebase Emulator...');
        
        // Connect to Firestore emulator
        if (!firestore().app._options.projectId.includes('demo-')) {
          // Use demo project for emulator
          await firestore().useEmulator(EMULATOR_CONFIG.host, EMULATOR_CONFIG.port);
          console.log(`✅ Connected to Firestore emulator at ${EMULATOR_CONFIG.host}:${EMULATOR_CONFIG.port}`);
        }

        this.isEmulatorSetup = true;
        return { success: true, message: 'Emulator setup successful' };
      } else {
        console.log('📱 Production mode - using live Firebase');
        return { success: true, message: 'Using live Firebase' };
      }
    } catch (error) {
      console.error('❌ Emulator setup failed:', error);
      return { success: false, error: error.message };
    }
  }

  static async testEmulatorConnection() {
    try {
      // Test write to emulator
      const testDoc = firestore().collection('test').doc('connection');
      await testDoc.set({
        timestamp: firestore.FieldValue.serverTimestamp(),
        message: 'Emulator connection test',
        isEmulator: __DEV__
      });

      // Test read from emulator
      const doc = await testDoc.get();
      if (doc.exists) {
        console.log('✅ Emulator read/write test successful');
        
        // Clean up
        await testDoc.delete();
        
        return { success: true, message: 'Emulator connection successful' };
      } else {
        throw new Error('Test document not found');
      }
    } catch (error) {
      console.error('❌ Emulator connection test failed:', error);
      return { success: false, error: error.message };
    }
  }

  static getEmulatorStatus() {
    return {
      isSetup: this.isEmulatorSetup,
      isDevelopment: __DEV__,
      host: EMULATOR_CONFIG.host,
      port: EMULATOR_CONFIG.port,
      projectId: firestore().app.options.projectId
    };
  }
}

export default FirebaseEmulatorSetup;
