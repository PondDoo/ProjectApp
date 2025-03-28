import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Button, TouchableOpacity, Alert, Image } from 'react-native';
import { fetchCartItems, removeFromCart, increaseQuantity, decreaseQuantity } from '../services/api';  // เพิ่มฟังก์ชัน increase, decrease
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

  // ฟังก์ชันสำหรับเพิ่มจำนวนสินค้า
const handleIncreaseQuantity = async (productId) => {
  try {
    if (userId) {
      // เช็คว่า quantity ปัจจุบันมีอยู่ใน cartItems หรือไม่
      const currentProduct = cartItems.find(item => item.product_id === productId);
      if (currentProduct) {
        const response = await increaseQuantity(userId, productId);
        setCartItems((prevItems) =>
          prevItems.map(item =>
            item.product_id === productId
              ? { ...item, quantity: response.quantity }
              : item
          )
        );
      }
    }
  } catch (error) {
    
    console.error('Error increasing quantity:', error.message);
    //Alert.alert("Failed to increase quantity");
  }
};

// ฟังก์ชันสำหรับลดจำนวนสินค้า
const handleDecreaseQuantity = async (productId) => {
  try {
    if (userId) {
      // เช็คว่า quantity ปัจจุบันมากกว่า 1 หรือไม่
      const currentProduct = cartItems.find(item => item.product_id === productId);
      if (currentProduct && currentProduct.quantity > 1) {
        const response = await decreaseQuantity(userId, productId);
        setCartItems((prevItems) =>
          prevItems.map(item =>
            item.product_id === productId
              ? { ...item, quantity: response.quantity }
              : item
          )
        );
      } else {
        //Alert.alert("Quantity cannot be less than 1");
      }
    }
  } catch (error) {
    console.error('Error decreasing quantity:', error.message);
    Alert.alert("Failed to decrease quantity");
  }
};


  // ดึงข้อมูลตะกร้าของผู้ใช้
  const getCartItems = async () => {
    if (!userId) return;  // หากไม่มี userId, ไม่ต้องดึงข้อมูลตะกร้า

    try {
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
      {loading ? (
        <Text>กำลังโหลดข้อมูล...</Text>  // แสดงข้อความขณะโหลดข้อมูล
      ) : (
        <FlatList
          data={cartItems}
          keyExtractor={(item) => item.product_id.toString()}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Image source={{ uri: item.image_url }} style={styles.image} />
              {/* ใช้ imageUrl ที่ดึงจากฐานข้อมูล */}
              <Text>{item.item_name}</Text>
              <Text>Price: ${item.price}</Text>

              <View style={styles.quantityContainer}>
                <TouchableOpacity onPress={() => handleDecreaseQuantity(item.product_id)}>
                  <Text style={styles.quantityButton}>-</Text>
                </TouchableOpacity>
                <Text>{item.quantity}</Text>
                <TouchableOpacity onPress={() => handleIncreaseQuantity(item.product_id)}>
                  <Text style={styles.quantityButton}>+</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveFromCart(item.product_id)}
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
    resizeMode: 'contain',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  quantityButton: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 10,
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
