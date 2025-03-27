import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, FlatList,Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CheckoutScreen = ({ navigation }) => {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [couponCode, setCouponCode] = useState('');
  const [userId, setUserId] = useState(null);

  // ฟังก์ชันเพื่อดึงข้อมูล userId จาก AsyncStorage
  const getUserId = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem('userId');
      if (storedUserId) {
        setUserId(storedUserId);
      } else {
        // ถ้าไม่พบ userId จะไปที่หน้า login
        navigation.navigate('Login');
      }
    } catch (error) {
      console.error("Error retrieving userId", error);
    }
  };

  // ฟังก์ชันดึงข้อมูลตะกร้าจาก API
  const getCartItems = async () => {
    if (!userId) return;

    try {
      const response = await fetch(`http://10.5.50.228:5000/cart/${userId}`);
      const data = await response.json();
      if (data.cart) {
        setCartItems(data.cart);
        calculateTotalPrice(data.cart);
      }
    } catch (error) {
      console.error("Error fetching cart items:", error);
    }
  };

  // คำนวณยอดรวมของตะกร้า
  const calculateTotalPrice = (items) => {
    const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    setTotalPrice(total);
  };

  // เมื่อโหลดหน้าจอ, ให้ดึง userId และข้อมูลตะกร้า
  useEffect(() => {
    getUserId();  // ดึง userId เมื่อเริ่มต้น
  }, []);

  useEffect(() => {
    if (userId) {
      getCartItems();  // ดึงข้อมูลตะกร้าเมื่อมี userId
    }
  }, [userId]);

  // ฟังก์ชันสำหรับการใช้คูปอง
  const handleApplyCoupon = () => {
    if (couponCode === 'DISCOUNT10') {
      const discount = totalPrice * 0.1;
      setTotalPrice(totalPrice - discount);
    } else {
      alert('Invalid Coupon Code');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Checkout</Text>

      {/* แสดงรายการสินค้าจากตะกร้า */}
      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.product_id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>{item.item_name}</Text>
            <Text>Price: ${item.price}</Text>
            <Text>Quantity: {item.quantity}</Text>
          </View>
        )}
      />

      {/* ช่องกรอกคูปอง
      <TextInput
        placeholder="Enter coupon code"
        value={couponCode}
        onChangeText={setCouponCode}
        style={styles.input}
      />
      <Button title="Apply Coupon" onPress={handleApplyCoupon} /> */}

      {/* แสดงยอดรวม */}
      <Text style={styles.totalPrice}>Total Price: ${totalPrice.toFixed(2)}</Text>

      {/* ปุ่มไปหน้าชำระเงิน */}
      <Button title="Proceed to Payment" onPress={() => navigation.navigate('Payment')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFF7F3',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  item: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
  },
  input: {
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
  },
  image: {
    width: 100,
    height: 100,
    marginTop: 10,
    resizeMode: 'contain', // เพื่อให้รูปแสดงตามขนาดที่กำหนด
  },
});

export default CheckoutScreen;
