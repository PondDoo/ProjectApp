import React, { useState } from "react";
import { View, Text, StyleSheet ,TouchableOpacity} from "react-native";
import CustomButton from "../component/custombutton";
import SearchBox from "../component/SearchBox";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { loginUser } from "../services/api";

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const { token, userId } = await loginUser(username, password);
      if (token && userId) {
        await AsyncStorage.setItem("userToken", token);
        await AsyncStorage.setItem("userId", userId.toString());

        Toast.show({
          type: "success",
          text1: "เข้าสู่ระบบสำเร็จ",
          text2: `ยินดีต้อนรับคุณ ${userId} 🎉`,
          position: "top",
          visibilityTime: 3000,
        });

        setTimeout(() => {
          navigation.navigate("Home");
        }, 1500);
      } else {
        throw new Error("Login failed: No token or userId received");
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "เข้าสู่ระบบล้มเหลว ❌",
        text2: error.message,
        position: "top",
      });
      console.error("Login Error:", error);
    }
  };

  return (
    <View style={styles.container}>
    <Text style = {styles.header}> Welcome Back!</Text>
      <View style={styles.flame}>
        <SearchBox placeholder={"Username"} value={username} onChangeText={setUsername} icons={"user"}/>
        <SearchBox placeholder={"Password"} secure={true} value={password} onChangeText={setPassword} icons={"lock"} />
        <CustomButton title={"Log in"} backgroundColor={"#FF9D23"} onPress={handleLogin} />
        <View style={styles.titleStyle}>
          <Text style = {styles.textStyle}>Create An Account </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text style = {styles.signupStyle}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "white",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  flame: {
    borderRadius: 20,
    padding: 15,
  },
  header:{
    fontSize:40,
    fontWeight:"bold",
    marginTop:20,
  },
  titleStyle:{
    flexDirection:"row",
    justifyContent:"center",
    margin:10,
  },
  textStyle:{
    fontSize:16,
    fontWeight:"600"
  },
  signupStyle:{
    color:"red",
    fontSize:16,
    fontWeight:"600",
    textDecorationLine:"underline"
  }
});

export default LoginScreen;