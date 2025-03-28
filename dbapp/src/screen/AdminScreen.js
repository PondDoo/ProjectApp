import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert ,FlatList } from 'react-native';
import { fetchOrders,addmarket } from '../services/api';
import CustomButton from "../component/custombutton";
import SearchBox from '../component/SearchBox';

const AdminScreen = () => {
  const [orders, setOrders] = useState([]);
  const [item_name,setItem_name] = useState([]);
  const [price,setPrice] = useState([]);
  const [image_url,setImage_url] = useState([]);
  const [item_detail,setItem_detail] = useState([]);

  // ดึงข้อมูลคำสั่งซื้อจาก API
  const loadOrders = async () => {
    try {
      const fetchedOrders = await fetchOrders();  // เรียกใช้ฟังก์ชัน fetchOrders ที่ได้ย้ายไปใน api.js
      if (fetchedOrders) {
        setOrders(fetchedOrders);  // เก็บข้อมูลคำสั่งซื้อใน state
      } else {
        Alert.alert('No Orders', 'No orders found');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      Alert.alert('Error', 'There was an issue fetching the orders');
    }
  };

  useEffect(() => {
    loadOrders();  // เรียกใช้งานฟังก์ชันเมื่อโหลดหน้า
  }, []);

  const addtomarket = async () =>{
    try{
      await addmarket(item_name ,price,image_url,item_detail)
      Alert.alert("เพิ่มสินค้าสำเร็จ");
    }catch (error) {
      Alert.alert("Register Failed :", error.message);
    }
  };

  // ฟังก์ชัน render สำหรับแสดงคำสั่งซื้อ
  const renderOrderItem = ({ item }) => (
    <View style={styles.orderItem}>
      <Text style={styles.orderTitle}>Order ID: {item.id}</Text>
      <Text>User ID: {item.user_id}</Text>
      <Text>Total Price: ${item.total_amount}</Text>
      <Text>Shipping Address: {item.shipping_address}</Text>
      <Text>Status: {item.status}</Text>
      {/* <Text>Date: {new Date(item.created_at).toLocaleString()}</Text> */}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin - Orders</Text>
      <FlatList
        data={orders}
        keyExtractor={(item, index) => `${item.id}-${index}`} // ใช้ id เป็น key ของแต่ละรายการ
        renderItem={renderOrderItem}
        contentContainerStyle={styles.listContainer}
      />

        <SearchBox
          placeholder={"ชื่อสินค้า"}
          value={item_name}
          onChangeText={setItem_name}
        />

          <SearchBox
          placeholder={"ราคา"}
          value={price}
          onChangeText={setPrice}
        />
        <SearchBox
          placeholder={"ลิงก์รูปภาพ"}
          value={image_url}
          onChangeText={setImage_url}
        />
        <SearchBox
          placeholder={"รายละเอียดสินค้า"}
          value={item_detail}
          onChangeText={setItem_detail}
        />
        <CustomButton
          title={"เพิ่มสินค้า"}
          backgroundColor={"#C14600"}
          onPress={addtomarket}
        />
        
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