import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, FlatList } from 'react-native';
import { fetchOrders, addmarket } from '../services/api';
import CustomButton from "../component/custombutton";
import SearchBox from '../component/SearchBox';
import { useNavigation } from '@react-navigation/native';

const AdminScreen = () => {
  const navigation = useNavigation();
  const [orders, setOrders] = useState([]);
  const [item_name, setItem_name] = useState('');
  const [price, setPrice] = useState('');
  const [image_url, setImage_url] = useState('');
  const [item_detail, setItem_detail] = useState('');

  // ดึงข้อมูลคำสั่งซื้อจาก API
  const loadOrders = async () => {
    try {
      const fetchedOrders = await fetchOrders();
      if (fetchedOrders) {
        setOrders(fetchedOrders);
      } else {
        Alert.alert('No Orders', 'No orders found');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      Alert.alert('Error', 'There was an issue fetching the orders');
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const addtomarket = async () => {
    try {
      await addmarket(item_name, price, image_url, item_detail);
      Alert.alert("เพิ่มสินค้าสำเร็จ");
    } catch (error) {
      Alert.alert("Register Failed :", error.message);
    }
  };

  const renderOrderItem = ({ item }) => (
    <View style={styles.orderItem}>
      <Text style={styles.orderTitle}>Order ID: {item.id}</Text>
      <Text>User ID: {item.user_id}</Text>
      <Text>Total Price: ${item.total_price}</Text>
      <Text>Shipping Address: {item.shipping_address}</Text>
      <Text>Status: {item.status}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin - Orders</Text>
      <FlatList
        data={orders}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={renderOrderItem}
        contentContainerStyle={styles.listContainer}
      />

      <SearchBox placeholder={"ชื่อสินค้า"} value={item_name} onChangeText={setItem_name} />
      <SearchBox placeholder={"ราคา"} value={price} onChangeText={setPrice} />
      <SearchBox placeholder={"ลิงก์รูปภาพ"} value={image_url} onChangeText={setImage_url} />
      <SearchBox placeholder={"รายละเอียดสินค้า"} value={item_detail} onChangeText={setItem_detail} />
      
      <CustomButton title={"Register"} backgroundColor={"#C14600"} onPress={addtomarket} />

      {/* ปุ่มไปหน้าจัดการคิว */}
      <CustomButton title={"Manage Queue"} backgroundColor={"#007AFF"} onPress={() => navigation.navigate('ManageQueue')} />
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
  orderItem: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  listContainer: {
    paddingBottom: 20,
  },
});

export default AdminScreen;