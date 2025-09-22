// App.js - Your original navigation app
import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firebaseConfig from './firebase.config';
import DashboardScreen from "./screens/DashboardScreen";
import EntryScreen from "./screens/EntryScreen";
import ReportScreen from "./screens/ReportScreen";
import AccountsScreen from "./screens/AccountsScreen";
import MasterScreen from "./screens/MasterScreen";
import FeaturesScreen from "./screens/FeaturesScreen";
import SettingsScreen from "./screens/SettingsScreen";
import CustomerDataScreen from "./screens/CustomerDataScreen";
import SalesBillScreen from "./screens/SalesBillScreen";
import CollectionBillScreen from "./screens/CollectionBillScreen";

const Stack = createStackNavigator();

export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const initializeApp = async () => {
      try {
        // Initialize Firebase if not already initialized
        if (!firebase.apps.length) {
          firebase.initializeApp(firebaseConfig);
          console.log('Firebase initialized successfully');
        } else {
          console.log('Firebase already initialized');
        }

        // Handle user state changes
        const onAuthStateChanged = (user) => {
          if (isMounted) {
            setUser(user);
            setInitializing(false);
          }
        };

        // Set up auth state listener
        const subscriber = auth().onAuthStateChanged(onAuthStateChanged);

        // Sign in anonymously if no user is signed in
        if (!auth().currentUser) {
          console.log('Signing in anonymously...');
          await auth().signInAnonymously();
          console.log('Anonymous sign-in successful');
        } else {
          // User already signed in, stop initializing
          if (isMounted) {
            setInitializing(false);
          }
        }

        return subscriber;
      } catch (error) {
        console.error('App initialization failed:', error);
        if (isMounted) {
          setInitializing(false);
        }
      }
    };

    const cleanup = initializeApp();

    return () => {
      isMounted = false;
      cleanup.then(subscriber => {
        if (subscriber && typeof subscriber === 'function') {
          subscriber();
        }
      }).catch(console.error);
    };
  }, []);

  // Always call all hooks before any conditional returns
  const loadingScreen = (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#1F49B6" />
      <Text style={styles.loadingText}>Initializing App...</Text>
    </View>
  );

  const mainApp = (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Dashboard"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen 
          name="Dashboard" 
          component={DashboardScreen} 
          options={{
            headerShown: true,
            headerStyle: { backgroundColor: "#1F49B6" },
            headerTintColor: "#fff",
            headerTitleStyle: { fontWeight: "bold" },
            title: "Dashboard"
          }}
        />
        <Stack.Screen name="Entry" component={EntryScreen} />
        <Stack.Screen name="Report" component={ReportScreen} />
        <Stack.Screen name="Accounts" component={AccountsScreen} />
        <Stack.Screen name="Master" component={MasterScreen} />
        <Stack.Screen name="Features" component={FeaturesScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="CustomerData" component={CustomerDataScreen} />
        <Stack.Screen name="SalesBill" component={SalesBillScreen} />
        <Stack.Screen name="CollectionBill" component={CollectionBillScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );

  // Return based on initialization state
  return initializing ? loadingScreen : mainApp;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
});
