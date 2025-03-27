import React from "react";
import { Text, StyleSheet, TouchableOpacity } from "react-native"; // แก้ไขการนำเข้าจาก react-native

const CustomButton = ({ title, onPress, backgroundColor }) => {
  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor }]}
      onPress={onPress}
    >
      <Text style={styles.text}>{title}</Text>
      {/* แก้ไขจาก styles.Text เป็น styles.text */}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "blue",
    padding: 10,
    alignItems: "center", // แก้ไขจาก alignItem เป็น alignItems
    borderRadius: 5,
  },
  text: {
    // แก้ไขจาก text เป็น text (ต้องใช้ตัวพิมพ์เล็ก)
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default CustomButton;