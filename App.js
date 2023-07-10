import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {createStackNavigator} from '@react-navigation/stack';
import {createDrawerNavigator} from '@react-navigation/drawer';
import LoginScreen from './src/screens/Login/LoginScreen'; 
import HomeScreen from './src/screens/Home/HomeScreen';
import AddOrderScreen from './src/screens/AddOrder/AddOrderScreen';
import LogDataScreen from './src/screens/LogData/LogDataScreen';
import StocksScreen from './src/screens/Stocks/StocksScreen';
import AddStockScreen from './src/screens/AddStock/AddStockScreen';
import AddSupplierScreen from './src/screens/AddSupplier/AddSupplierScreen';
import TakeScreen from './src/screens/Take/TakeScreen';
import ClientInfoScreen from './src/screens/ClientInfo/ClientInfoScreen';
import IncomeScreen from './src/screens/Income/IncomeScreen';
import ProfileScreen from './src/screens/Profile/ProfileScreen';
import DrawerContainer from './src/screens/DrawerContainer/DrawerContainer';
import AddClientScreen from './src/screens/AddClient/AddClientScreen';

const Stack = createStackNavigator();

function MainNavigator() {
  return(
    <Stack.Navigator
      screenOptions={{
          headerTitleStyle: {
            fontWeight: 'bold',
            textAlign: 'center',
            alignSelf: 'center',
            flex: 1,
          }
      }}
    >
      <Stack.Screen options={{ headerShown: false }} name="Login" component={LoginScreen} />
      <Stack.Screen name='Home' component={HomeScreen} />
      <Stack.Screen name='Add Order' component={AddOrderScreen} />
      <Stack.Screen name='Log Data' component={LogDataScreen} />
      <Stack.Screen name='Stocks' component={StocksScreen} />
      <Stack.Screen name='Add Stock' component={AddStockScreen} />
      <Stack.Screen name='Add Supplier' component={AddSupplierScreen} />
      <Stack.Screen name='Take' component={TakeScreen} />
      <Stack.Screen name='Client Info' component={ClientInfoScreen} />
      <Stack.Screen name='Income' component={IncomeScreen} />
      <Stack.Screen name='Profile' component={ProfileScreen} />
      <Stack.Screen name='Add Client' component={AddClientScreen} />
    </Stack.Navigator>
  )
} 

const Drawer = createDrawerNavigator();

function DrawerStack() {
  return(
    <Drawer.Navigator
      drawerPosition='left'
      initialRouteName='Main'
      drawerStyle={{
        width: 250
      }}
      screenOptions={{headerShown: false}}
      drawerContent={({navigation})=> <DrawerContainer navigation={navigation}/>}
    >
      <Drawer.Screen name='Main' component={MainNavigator} />
    </Drawer.Navigator>
  )
} 

 export default function AppContainer() {
  return(
    <NavigationContainer>
      <DrawerStack/>
    </NavigationContainer>
  )
} 

console.disableYellowBox = true;