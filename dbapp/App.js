import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import LoginScreen from "./src/screen/LoginScreen";
import RegisterScreen from "./src/screen/RegisterScreen";
import HomeScreen from "./src/screen/HomeScreen";
import AdminScreen from "./src/screen/AdminScreen";
import CartScreen from "./src/screen/CartScreen";
import QueueScreen from "./src/screen/QueueScreen";
import PaymentScreen from "./src/screen/PaymentScreen";
import ManageQueueScreen from "./src/screen/ManageQueueScreen";
const Stack = createStackNavigator();

const App = () => {
  return(
    <NavigationContainer>
      <Stack.Navigator 
      initialRouteName="Login"
      screenOptions={{headerShown:false}}
      >
        <Stack.Screen 
        name ="Login" 
        component={LoginScreen}
        />
        <Stack.Screen 
        name ="Register" 
        component={RegisterScreen}
        />

        <Stack.Screen 
        name ="Home" 
        component={HomeScreen}
        />

        <Stack.Screen 
        name ="Admin" 
        component={AdminScreen}
        />

        <Stack.Screen
        name ="Cart"
        component={CartScreen}
        />
        <Stack.Screen
        name ="Queue"
        component={QueueScreen}
        />

        <Stack.Screen
        name = "Payment"
        component={PaymentScreen}
        />
        
        <Stack.Screen
        name = "ManageQueue"
        component={ManageQueueScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
export default App;