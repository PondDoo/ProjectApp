import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Button,Image } from 'react-native';
import { fetchCartItems } from '../services/api';  // import ฟังก์ชันจาก api.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const CartScreen = ({ navigation }) => {
  const [cartItems, setCartItems] = useState([]);  // สถานะสำหรับเก็บข้อมูลสินค้าที่อยู่ในตะกร้า
  const [loading, setLoading] = useState(true);  // สถานะการโหลดข้อมูล
  const [userId, setUserId] = useState(null);  // สถานะเก็บ userId

  // ดึง userId จาก AsyncStorage
  const getUserId = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem("userId");
      if (storedUserId) {
        setUserId(storedUserId);  // เก็บ userId ที่ดึงมา
      } else {
        // ถ้าไม่พบ userId จะกลับไปที่หน้า Login
        navigation.navigate("Login");
      }
    } catch (error) {
      console.error("Error retrieving userId", error);
    }
  };

  // ดึงข้อมูลตะกร้าของผู้ใช้
  const getCartItems = async () => {
    if (!userId) return;  // หากไม่มี userId, ไม่ต้องดึงข้อมูลตะกร้า

    try {
      // สมมุติว่า fetchCartItems เป็นฟังก์ชันที่ดึงข้อมูลตะกร้าของผู้ใช้จาก API
      const response = await fetchCartItems(userId); 
      setCartItems(response.cart);  // เก็บข้อมูลสินค้าที่อยู่ในตะกร้า
      setLoading(false);  // อัพเดตสถานะว่าเสร็จสิ้นการโหลดข้อมูล
    } catch (error) {
      console.error("Error fetching cart items:", error);
      Alert.alert("Error", "ไม่สามารถดึงข้อมูลตะกร้าได้");
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserId();  // ดึง userId เมื่อหน้าโหลด
  }, []);

  useEffect(() => {
    if (userId) {
      getCartItems();  // ดึงข้อมูลตะกร้าเมื่อมี userId
    }
  }, [userId]);

  return (
    <View style={styles.container}>
      {/* <Text style={styles.title}>Your Cart</Text> */}
      
      {loading ? (
        <Text>กำลังโหลดข้อมูล...</Text>  // แสดงข้อความขณะโหลดข้อมูล
      ) : (
        <FlatList
  data={cartItems}
  keyExtractor={(item, index) => `${item.id}-${index}`}  // ใช้ทั้ง item.id และ index เพื่อสร้างคีย์ที่ไม่ซ้ำ
  renderItem={({ item }) => (
    <View style={styles.item}>
      {/* ตรวจสอบว่ามีค่า item_name ก่อน */}
      <Text>{item.item_name ? item.item_name : 'No Name Available'}</Text>  
      {/* ตรวจสอบว่า price มีค่าหรือไม่ */}
      <Text>Price: ${item.price ? item.price : 0}</Text>
      {/* ตรวจสอบว่า quantity มีค่าหรือไม่ */}
      <Text>Quantity: {item.quantity ? item.quantity : 1}</Text>
    </View>
  )}
/>



      )}

      <View style={styles.summary}>
        <Button
          title="Proceed to Checkout"
          onPress={() => navigation.navigate('Checkout')}  // ไปยังหน้าชำระเงิน
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#FFF7F3",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  item: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 5,
  },
  summary: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    paddingTop: 10,
  },
  image: {
    width: 100,
    height: 100,
    marginTop: 10,
    resizeMode: 'contain', // เพื่อให้รูปแสดงตามขนาดที่กำหนด
  },
});

export default CartScreen;
