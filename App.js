import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { PremiumProvider } from './src/context/PremiumContext';
import { colors } from './src/theme/colors';

import HomeScreen from './src/screens/HomeScreen';
import CreateScreen from './src/screens/CreateScreen';
import PreviewScreen from './src/screens/PreviewScreen';
import UpgradeScreen from './src/screens/UpgradeScreen';
import CustomizeScreen from './src/screens/CustomizeScreen';

const Stack = createNativeStackNavigator();

const navTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    card: colors.bg,
    text: colors.text,
    border: 'transparent',
    primary: colors.accentBlue,
  },
};

export default function App() {
  return (
    <PremiumProvider>
      <NavigationContainer theme={navTheme}>
        <StatusBar style="light" />
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: colors.bg },
            headerTintColor: colors.text,
            headerTitleStyle: { fontWeight: '900', letterSpacing: 0.3 },
            headerShadowVisible: false,
            headerLargeTitle: false,
            headerBackTitle: '',
            contentStyle: { backgroundColor: colors.bg },
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Create" component={CreateScreen} options={{ title: 'Create' }} />
          <Stack.Screen name="Preview" component={PreviewScreen} options={{ title: 'Preview' }} />
          <Stack.Screen name="Upgrade" component={UpgradeScreen} options={{ title: 'Upgrade' }} />
          <Stack.Screen name="Customize" component={CustomizeScreen} options={{ title: 'Customize' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </PremiumProvider>
  );
}
