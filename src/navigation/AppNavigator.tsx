import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'

import HomeScreen from '../screens/HomeScreen'
import MealsScreen from '../screens/MealsScreen'
import FamilyScreen from '../screens/FamilyScreen'
import SettingsScreen from '../screens/SettingsScreen'

export type RootTabParamList = {
  Home: undefined
  Meals: undefined
  Family: undefined
  Settings: undefined
}

const Tab = createBottomTabNavigator<RootTabParamList>()

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline'
            } else if (route.name === 'Meals') {
              iconName = focused ? 'restaurant' : 'restaurant-outline'
            } else if (route.name === 'Family') {
              iconName = focused ? 'people' : 'people-outline'
            } else if (route.name === 'Settings') {
              iconName = focused ? 'settings' : 'settings-outline'
            } else {
              iconName = 'help-outline'
            }

            return <Ionicons name={iconName} size={size} color={color} />
          },
          tabBarActiveTintColor: '#3b82f6',
          tabBarInactiveTintColor: 'gray',
          headerStyle: {
            backgroundColor: '#3b82f6',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        })}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ title: 'Dzisiaj' }}
        />
        <Tab.Screen 
          name="Meals" 
          component={MealsScreen}
          options={{ title: 'Posiłki' }}
        />
        <Tab.Screen 
          name="Family" 
          component={FamilyScreen}
          options={{ title: 'Rodzina' }}
        />
        <Tab.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{ title: 'Ustawienia' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  )
}
