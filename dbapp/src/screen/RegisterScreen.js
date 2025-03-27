import React,{useState} from "react";
import {View,Text,StyleSheet,Alert} from "react-native"
import CustomButton from "../component/custombutton";
import SearchBox from "../component/SearchBox";
import {registerUser} from "../services/api"
import { useNavigation } from "@react-navigation/native";

const RegisterScreen = ({ navigation }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleRegister = async () => {
      try {
        await registerUser(username, password);
        Alert.alert("Register Successful");
        navigation.navigate("Login");
      } catch (error) {
        Alert.alert("Register Failed :", error.message);
      }
    };

    return (
      <View style={styles.container}>
        <View style={styles.flame}>
        <Text style={styles.title}>
          Registration {username} {password}
        </Text>
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
          title={"Register"}
          backgroundColor={"#C14600"}
          onPress={handleRegister}
        />
        <CustomButton
          title={"Back to Log in"}
          backgroundColor={"#FF9D23"}
          onPress={() => navigation.navigate("Login")}
        />
        </View>
      </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      //alignItems:"center",
      justifyContent: "center",
      padding: 20,
      backgroundColor: "#ffe0b2",
    },
    title: {
      fontSize: 20,
      fontWeight: "bold",
    },
    flame: {
      backgroundColor: "#fff8e1",
      borderRadius: 20,
      padding: 15,
      paddingTop: 20,
    },
  });

  export default RegisterScreen;