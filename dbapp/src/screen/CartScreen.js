import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Button, TouchableOpacity, Alert, Image } from 'react-native';
import { fetchCartItems, removeFromCart, increaseQuantity, decreaseQuantity } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CartScreen = ({ navigation }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  const getUserId = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem("userId");
      if (storedUserId) {
        setUserId(storedUserId);
      } else {
        navigation.navigate("Login");
      }
    } catch (error) {
      console.error("Error retrieving userId", error);
    }
  };

  const handleRemoveFromCart = async (productId) => {
    try {
      if (userId) {
        await removeFromCart(userId, productId);
        // Alert.alert("Product removed from cart");
        getCartItems();
      } else {
        Alert.alert("User not logged in");
      }
    } catch (error) {
      console.error("Error removing product from cart:", error);
      Alert.alert("Failed to remove product from cart");
    }
  };

  const handleIncreaseQuantity = async (productId) => {
    try {
      if (userId) {
        const response = await increaseQuantity(userId, productId);
        setCartItems((prevItems) => 
          prevItems.map(item => 
            item.product_id === productId ? { ...item, quantity: response.quantity } : item
          )
        );
      }
    } catch (error) {
      console.error('Error increasing quantity:', error.message);
      Alert.alert("Failed to increase quantity");
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

  const getCartItems = async () => {
    if (!userId) return;

    try {
      const response = await fetchCartItems(userId);
      setCartItems(response.cart);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching cart items:", error);
      Alert.alert("Error", "ไม่สามารถดึงข้อมูลตะกร้าได้");
      setLoading(false);
    }
  };

  // ฟังก์ชันคำนวณราคารวมทั้งหมด
  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  useEffect(() => {
    getUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      getCartItems();
    }
  }, [userId]);

  return (
    <View style={styles.container}>
      {loading ? (
        <Text>กำลังโหลดข้อมูล...</Text>
      ) : (
        <>
        <Text style={styles.cart}>ตะกร้าสินค้า</Text>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.product_id.toString()}
            renderItem={({ item }) => (
              <View style={styles.item}>
                <Image source={{ uri: item.image_url }} style={styles.image} />
                <View style={styles.details}>
                  <Text style={styles.itemName}>{item.item_name}</Text>
                  <Text style={styles.price}>฿{item.price}</Text>
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
                    <Text style={styles.removeButtonText}>ลบสินค้า</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
          
          {/* แสดงราคารวมทั้งหมด */}
          <View style={styles.summary}>
              <Text style={styles.totalPrice}>ราคารวม: ฿{getTotalPrice()}</Text>
              <TouchableOpacity 
                style={styles.checkoutButton} 
                onPress={() => navigation.navigate('Payment')}
              >
                <Text style={styles.checkoutText}>ชำระเงิน</Text>
              </TouchableOpacity>
          </View>

        </>
      )}

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FFF7F3",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    padding: 10,
    backgroundColor: "rgba(71, 71, 71, 0.06)",
    borderRadius: 10,
    borderColor: "black",
  },
  image: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  details: {
    flex: 1,
    marginLeft: 15,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  price: {
    fontSize: 14,
    color: "#FF5733",
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
    padding: 8,
    borderRadius: 8,
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
    alignItems: 'center',
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  checkoutButton: {
    width: '100%',
    backgroundColor: "#FF9D23",
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    // marginTop: ,
    elevation:5
  },
  checkoutText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  cart: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    margin: 15,
  },
  
});

export default CartScreen;