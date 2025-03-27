import React from "react";
import {View,TextInput,StyleSheet} from 'react-native'
import Feather from "@expo/vector-icons/Feather"

const SearchBox =({placeholder,value,onChangeText,secure}) => {
    return (
        <View style = {styles.container}>
            <Feather name = "search" size = {26} color="#888" style={styles.icon} />
            <TextInput
            style = {styles.input}
            placeholder={placeholder}
            value = {value}
            onChangeText={onChangeText}
            secureTextEntry={secure}
            />
        </View>
    );
};

const styles = StyleSheet.create ({
    container: {
        margin: 5,
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 10,
        paddingHorizontal: 12,
        borderWidth: 2,  // กำหนดความหนาของกรอบ
        borderColor: "#ccc",  // กำหนดสีของกรอบ
    },
    input: {
        padding:10,
        fontSize:18,
        borderColor:"#333",
        borderRadius:10,
    }

})
export default SearchBox;