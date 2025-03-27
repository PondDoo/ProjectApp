import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Button, TouchableOpacity, Alert, Image } from 'react-native';
import { fetchCartItems, removeFromCart } from '../services/api';  // import ฟังก์ชันจาก api.js
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

// ฟังก์ชันสำหรับลบสินค้าออกจากตะกร้า
const handleRemoveFromCart = async (productId) => {
  try {
    if (userId) {
      // เรียก API เพื่อลบสินค้าออกจากตะกร้า
      await removeFromCart(userId, productId); 
      Alert.alert("Product removed from cart");  // แจ้งผู้ใช้ว่าสินค้าได้ถูกลบ
      // ดึงข้อมูลตะกร้าใหม่หลังจากลบสินค้า
      getCartItems(); 
    } else {
      Alert.alert("User not logged in");
    }
  } catch (error) {
    console.error("Error removing product from cart:", error);
    Alert.alert("Failed to remove product from cart");
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

  // ฟังก์ชันสำหรับลบสินค้าออกจากตะกร้า
  

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
      {loading ? (
        <Text>กำลังโหลดข้อมูล...</Text>  // แสดงข้อความขณะโหลดข้อมูล
      ) : (
        <FlatList
          data={cartItems}
          keyExtractor={(item) => (item.product_id ? item.product_id.toString() : `${item.item_name || 'No Name Available'}`)}  // ใช้ product_id เป็น key ของแต่ละรายการ
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Image source={{ uri: item.image_url }} style={styles.image} />
              <Text>{item.item_name ? item.item_name : 'No Name Available'}</Text>
              <Text>Price: ${item.price ? item.price : 0}</Text>
              <Text>Quantity: {item.quantity ? item.quantity : 1}</Text>

              {/* ปุ่ม Remove from Cart */}
              <TouchableOpacity 
                style={styles.removeButton} 
                onPress={() => handleRemoveFromCart(item.product_id)} // เมื่อกดปุ่ม จะเรียก handleRemoveFromCart โดยส่ง product_id
              >
                <Text style={styles.removeButtonText}>Remove from Cart</Text>
              </TouchableOpacity>
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
  item: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 5,
  },
  image: {
    width: 100,
    height: 100,
    marginTop: 10,
    resizeMode: 'contain', // เพื่อให้รูปแสดงตามขนาดที่กำหนด
  },
  removeButton: {
    backgroundColor: "#FF5733",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  removeButtonText: {
    color: "#fff",
    fontWeight: 'bold',
  },
  summary: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    paddingTop: 10,
  },
});

export default CartScreen;
