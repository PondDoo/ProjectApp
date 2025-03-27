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
    container : {
        margin:10,
        flexDirection:"row",
        alignItems: "center",
        backgroundColor: "f5f5f5",
        borderRadius:12,
        paddingHorizontal:12,
        height:45,
        shadowColor:"#000",
        shadowOffset:{width:0,height:2},
        shadowOpacity:0.2,
        shadowRadius:4,
        elevation:3,
    },
    input: {
        padding:10,
        fontSize:18,
        borderColor:"#333",
        borderWidth:1,
        borderRadius:10,
    }

})
export default SearchBox;