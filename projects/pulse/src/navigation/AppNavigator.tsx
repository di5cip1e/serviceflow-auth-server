import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';

import type { RootTabParamList, DashboardStackParamList, ContactsStackParamList, ExploreStackParamList, JournalStackParamList, SettingsStackParamList } from '../types';

// Screen imports
import DashboardScreen from '../screens/free/DashboardScreen';
import ContactsListScreen from '../screens/free/ContactsListScreen';
import ContactDetailScreen from '../screens/free/ContactDetailScreen';
import ExploreScreen from '../screens/free/ExploreScreen';
import JournalScreen from '../screens/free/JournalScreen';
import SettingsScreen from '../screens/free/SettingsScreen';
import MyProfileScreen from '../screens/pro/MyProfileScreen';
import AskGCPModal from '../screens/features/AskGCPModal';

const Tab = createBottomTabNavigator<RootTabParamList>();
const DashboardStack = createNativeStackNavigator<DashboardStackParamList>();
const ContactsStack = createNativeStackNavigator<ContactsStackParamList>();
const ExploreStack = createNativeStackNavigator<ExploreStackParamList>();
const JournalStack = createNativeStackNavigator<JournalStackParamList>();
const SettingsStack = createNativeStackNavigator<SettingsStackParamList>();

const TabIcon = ({ name, focused }: { name: string; focused: boolean }) => (
  <View style={styles.tabIcon}>
    <Text style={[styles.tabIconText, focused && styles.tabIconTextFocused]}>
      {name}
    </Text>
  </View>
);

const DashboardStackNavigator = () => (
  <DashboardStack.Navigator>
    <DashboardStack.Screen 
      name="DashboardHome" 
      component={DashboardScreen}
      options={{ headerShown: false }}
    />
    <DashboardStack.Screen 
      name="AskGCP" 
      component={AskGCPModal}
      options={{ presentation: 'modal' }}
    />
  </DashboardStack.Navigator>
);

const ContactsStackNavigator = () => (
  <ContactsStack.Navigator>
    <ContactsStack.Screen 
      name="ContactsList" 
      component={ContactsListScreen}
      options={{ title: 'Contacts' }}
    />
    <ContactsStack.Screen 
      name="ContactDetail" 
      component={ContactDetailScreen}
      options={{ title: 'Contact' }}
    />
  </ContactsStack.Navigator>
);

const ExploreStackNavigator = () => (
  <ExploreStack.Navigator>
    <ExploreStack.Screen 
      name="ExploreHome" 
      component={ExploreScreen}
      options={{ title: 'Explore Personality' }}
    />
    <ExploreStack.Screen 
      name="MyProfile" 
      component={MyProfileScreen}
      options={{ title: 'My Profile' }}
    />
  </ExploreStack.Navigator>
);

const JournalStackNavigator = () => (
  <JournalStack.Navigator>
    <JournalStack.Screen 
      name="JournalHome" 
      component={JournalScreen}
      options={{ title: 'Journal' }}
    />
  </JournalStack.Navigator>
);

const SettingsStackNavigator = () => (
  <SettingsStack.Navigator>
    <SettingsStack.Screen 
      name="SettingsHome" 
      component={SettingsScreen}
      options={{ title: 'Settings' }}
    />
  </SettingsStack.Navigator>
);

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: '#6366F1',
          tabBarInactiveTintColor: '#6B7280',
          headerStyle: styles.header,
          headerTitleStyle: styles.headerTitle,
        }}
      >
        <Tab.Screen
          name="Dashboard"
          component={DashboardStackNavigator}
          options={{
            tabBarIcon: ({ focused }) => <TabIcon name="📊" focused={focused} />,
            headerShown: false,
          }}
        />
        <Tab.Screen
          name="Contacts"
          component={ContactsStackNavigator}
          options={{
            tabBarIcon: ({ focused }) => <TabIcon name="👥" focused={focused} />,
            headerShown: false,
          }}
        />
        <Tab.Screen
          name="Explore"
          component={ExploreStackNavigator}
          options={{
            tabBarIcon: ({ focused }) => <TabIcon name="🧠" focused={focused} />,
            headerShown: false,
          }}
        />
        <Tab.Screen
          name="Journal"
          component={JournalStackNavigator}
          options={{
            tabBarIcon: ({ focused }) => <TabIcon name="📝" focused={focused} />,
            headerShown: false,
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsStackNavigator}
          options={{
            tabBarIcon: ({ focused }) => <TabIcon name="⚙️" focused={focused} />,
            headerShown: false,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 8,
    paddingBottom: 8,
    height: 60,
  },
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconText: {
    fontSize: 20,
    opacity: 0.6,
  },
  tabIconTextFocused: {
    opacity: 1,
  },
  header: {
    backgroundColor: '#fff',
    shadowColor: 'transparent',
    elevation: 0,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
});
