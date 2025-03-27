import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, TextInput, Alert,Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { placeOrder } from '../services/api';

const PaymentScreen = ({ navigation }) => {
    const [cartItems, setCartItems] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [couponCode, setCouponCode] = useState('');
    const [userId, setUserId] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('credit');  // ช่องทางการชำระเงิน
    const [shippingAddress, setShippingAddress] = useState('');  // ที่อยู่สำหรับจัดส่ง
  
    // ดึงข้อมูล userId
    const getUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        if (storedUserId) {
          setUserId(storedUserId);
        } else {
          navigation.navigate('Login');
        }
      } catch (error) {
        console.error('Error retrieving userId', error);
      }
    };
  
    // ดึงข้อมูลรายการสินค้าจากตะกร้า
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
        console.error('Error fetching cart items:', error);
      }
    };
  
    // คำนวณยอดรวมของตะกร้า
    const calculateTotalPrice = (items) => {
      const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
      setTotalPrice(total);
    };
  
    useEffect(() => {
      getUserId();
    }, []);
  
    useEffect(() => {
      if (userId) {
        getCartItems();
      }
    }, [userId]);
  
    const handlePayment = async () => {
      if (paymentMethod === 'cash') {
        try {
          // เรียกใช้ฟังก์ชัน placeOrder
          const orderData = await placeOrder(userId, cartItems, shippingAddress);
          
          if (orderData.orderId) {
            Alert.alert('Order Placed', 'Your order has been placed successfully');
            navigation.navigate('Home');
          } else {
            Alert.alert('Order Failed', 'There was an issue placing your order');
          }
        } catch (error) {
          console.error('Error placing order:', error);
          Alert.alert('Error', 'There was an issue placing your order');
        }
      } else {
        Alert.alert('Payment Failed', 'Please select a valid payment method');
      }
    };
  
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Payment</Text>
  
        {/* แสดงรายการสินค้าจากตะกร้า */}
        {cartItems.map((item) => (
          <View style={styles.item} key={item.product_id}>
            <Image source={{ uri: item.image_url }} style={styles.image} />
            <Text>{item.item_name}</Text>
            <Text>Price: ${item.price}</Text>
            <Text>Quantity: {item.quantity}</Text>
          </View>
        ))}
  
        {/* แสดงยอดรวม */}
        <Text style={styles.totalPrice}>Total Price: ${totalPrice.toFixed(2)}</Text>
  
        {/* ช่องกรอกคูปอง */}
        <TextInput
          placeholder="Enter coupon code"
          value={couponCode}
          onChangeText={setCouponCode}
          style={styles.input}
        />
        <Button title="Apply Coupon" onPress={() => alert('Coupon applied!')} />
  
        {/* เลือกช่องทางการชำระเงิน */}
        <Text>Select Payment Method:</Text>
        <View style={styles.paymentMethods}>
          <Button title="Cash on Delivery" onPress={() => setPaymentMethod('cash')} />
        </View>
  
        {/* ช่องกรอกที่อยู่ */}
        <Text>Enter Shipping Address:</Text>
        <TextInput
          placeholder="Enter your address"
          value={shippingAddress}
          onChangeText={setShippingAddress}
          style={styles.input}
        />
  
        {/* ปุ่มยืนยันการชำระเงิน */}
        <Button title="Confirm Payment" onPress={handlePayment} />
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
    totalPrice: {
      fontSize: 20,
      fontWeight: 'bold',
      marginTop: 20,
    },
    input: {
      padding: 10,
      borderColor: '#ccc',
      borderWidth: 1,
      borderRadius: 5,
      marginBottom: 10,
    },
    paymentMethods: {
      flexDirection: 'row',
      marginTop: 10,
      justifyContent: 'space-between',
    },
    image: {
      width: 100,
      height: 100,
      marginTop: 10,
      resizeMode: 'contain', // เพื่อให้รูปแสดงตามขนาดที่กำหนด
    },
  });
  
  export default PaymentScreen;