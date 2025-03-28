import React, { useState } from "react";
import { View, Text, StyleSheet, Alert, TouchableOpacity } from "react-native";
import CustomButton from "../component/custombutton";
import SearchBox from "../component/SearchBox";
import { registerUser } from "../services/api";
import { useNavigation } from "@react-navigation/native";

const RegisterScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Error", "รหัสผ่านไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง");
      return;
    }

    try {
      await registerUser(username, password);
      Alert.alert("Register Successful");
      navigation.navigate("Login");
    } catch (error) {
      Alert.alert("Register Failed", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.flame}>
        <Text style={styles.title}>Create an Account</Text>
        
        <SearchBox placeholder={"Username"} value={username} onChangeText={setUsername} icons={"user"} />
        <SearchBox placeholder={"Password"} secure={true} value={password} onChangeText={setPassword} icons={"lock"} />
        <SearchBox placeholder={"Confirm Password"} secure={true} value={confirmPassword} onChangeText={setConfirmPassword} icons={"lock"} />

        <CustomButton title={"Create Account"} backgroundColor={"#FF9D23"} onPress={handleRegister} style={{ marginTop: 30 }} />
        
        <View style={styles.titleStyle}>
          <Text style={styles.textStyle}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.signupStyle}>Sign in</Text>
          </TouchableOpacity>
        </View>      
      </View>
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
    fontSize: 42,
    fontWeight: "bold",
    marginBottom: 15,
  },
  flame: {
    borderRadius: 20,
    padding: 20,
  },
  titleStyle: {
    flexDirection: "row",
    justifyContent: "center",
    margin: 10,
  },
  textStyle: {
    fontSize: 16,
    fontWeight: "600",
  },
  signupStyle: {
    color: "red",
    fontSize: 16,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});

export default RegisterScreen;
