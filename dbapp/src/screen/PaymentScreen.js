import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Image, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { placeOrder, clearcart } from '../services/api'; // อย่าลืมนำเข้า clearcart

const PaymentScreen = ({ navigation }) => {
    const [cartItems, setCartItems] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [shippingAddress, setShippingAddress] = useState('');
    const [userId, setUserId] = useState(null);

    useEffect(() => {
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
        getUserId();
    }, []);

    useEffect(() => {
        if (!userId) return;
        const getCartItems = async () => {
            try {
                const response = await fetch(`http://10.5.50.228:5000/cart/${userId}`);
                const data = await response.json();
                if (data.cart) {
                    setCartItems(data.cart);
                    setTotalPrice(data.cart.reduce((acc, item) => acc + item.price * item.quantity, 0));
                }
            } catch (error) {
                console.error('Error fetching cart items:', error);
            }
        };
        getCartItems();
    }, [userId]);

    // ฟังก์ชันเคลียร์ตะกร้า
    const cartempty = async () => {
        try {
            const response = await clearcart(userId); // เรียกฟังก์ชัน clearcart เพื่อล้างตะกร้า
            console.log('Cart cleared:', response); // เช็คการลบตะกร้า
        } catch (error) {
            console.error('Error clearing cart:', error);
        }
    };

    const handlePayment = async () => {
        try {
            const orderData = await placeOrder(userId, cartItems, shippingAddress);
            if (orderData.orderId) {
                Alert.alert('ยืนยันการชำระเงิน', 'ชำระเงินเสร็จสิ้น');
                
                // เรียก cartempty เพื่อเคลียร์ตะกร้าหลังการชำระเงินสำเร็จ
                await cartempty();

                // นำผู้ใช้กลับไปที่หน้าหลัก
                navigation.navigate('Home');
            } else {
                Alert.alert('Order Failed', 'There was an issue placing your order');
            }
        } catch (error) {
            console.error('Error placing order:', error);
            Alert.alert('Error', 'There was an issue placing your order');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>ชำระเงิน</Text>
            <FlatList
                data={cartItems}
                keyExtractor={(item) => item.product_id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.item}>
                        <Image source={{ uri: item.image_url }} style={styles.image} />
                        <View style={styles.details}>
                            <Text style={styles.itemName}>{item.item_name}</Text>
                            <Text style={styles.price}>฿{item.price}</Text>
                            <Text>จำนวน: {item.quantity}</Text>
                        </View>
                    </View>
                )}
            />
            <View style={styles.summary}>
                <Text style={styles.totalPrice}>ราคารวม: ฿{totalPrice.toFixed(2)}</Text>
                <TextInput placeholder="ที่อยู่จัดส่ง" value={shippingAddress} onChangeText={setShippingAddress} style={styles.input} />
                <TouchableOpacity style={styles.checkoutButton} onPress={handlePayment}>
                    <Text style={styles.checkoutText}>ยืนยันการชำระเงิน</Text>
                </TouchableOpacity>
            </View>
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
      fontSize: 26,
      fontWeight: "bold",
      textAlign: "center",
      margin: 15,
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
        color: '#FF5733',
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
    input: {
        padding: 10,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 10,
        marginBottom: 10,
        width: '100%',
    },
    checkoutButton: {
      width: '100%',
      backgroundColor: "#FF9D23",
      padding: 10,
      borderRadius: 10,
      alignItems: 'center',
      elevation:5
    },
    checkoutText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default PaymentScreen;
