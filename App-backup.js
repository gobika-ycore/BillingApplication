// App-backup.js - Your original navigation app
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import DashboardScreen from "./screens/DashboardScreen";
import EntryScreen from "./screens/EntryScreen";
import ReportScreen from "./screens/ReportScreen";
import AccountsScreen from "./screens/AccountsScreen";
import MasterScreen from "./screens/MasterScreen";
import FeaturesScreen from "./screens/FeaturesScreen";
import SettingsScreen from "./screens/SettingsScreen";

const Stack = createStackNavigator();

export default function App() {
  return (
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
