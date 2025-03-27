import React ,{ useState } from "react";
import {View,Text,StyleSheet,Alert} from "react-native"
import CustomButton from "../component/custombutton";
import SearchBox from "../component/SearchBox";
import { useNavigation } from "@react-navigation/native";
import { loginUser } from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const { token, userId } = await loginUser(username, password);  // รับทั้ง token และ userId
      if (token && userId) {
        await AsyncStorage.setItem("userToken", token);  // เก็บ token
        await AsyncStorage.setItem("userId", userId.toString());  // เก็บ userId
        Alert.alert("Login Successful", `User ID: ${userId}`);
        navigation.navigate("Home");
      } else {
        throw new Error('Login failed: No token or userId received');
      }
    } catch (error) {
      Alert.alert("Login Failed", error.message);
      console.error("Login Error:", error);
    }
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <SearchBox
        placeholder={"Username"}
        value={username}
        onChangeText={setUsername}
      />
      <SearchBox
        placeholder={"Password"}
        secure={true}
        value={password}
        onChangeText={setPassword}
      />
      <CustomButton 
        title={"Log in"} 
        backgroundColor={"#FF9D23"}
        onPress={handleLogin}
      />
      <CustomButton
        title={"Register"}
        backgroundColor={"#C14600"}
        onPress={() => navigation.navigate("Register")}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
});

export default LoginScreen;
  