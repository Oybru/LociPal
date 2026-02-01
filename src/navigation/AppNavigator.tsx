// App Navigator - Root navigation setup
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import {
  HomeScreen,
  PalaceListScreen,
  CreatePalaceScreen,
  PalaceViewScreen,
  TotemDetailScreen,
  TotemCreateScreen,
  AtlantisTestScreen,
} from '../screens';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="PalaceList" component={PalaceListScreen} />
        <Stack.Screen name="CreatePalace" component={CreatePalaceScreen} />
        <Stack.Screen name="PalaceView" component={PalaceViewScreen} />
        <Stack.Screen name="TotemDetail" component={TotemDetailScreen} />
        <Stack.Screen name="TotemCreate" component={TotemCreateScreen} />
        <Stack.Screen name="AtlantisTest" component={AtlantisTestScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
