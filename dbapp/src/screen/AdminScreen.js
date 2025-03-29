import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Alert, FlatList } from "react-native";
import { fetchOrders, addmarket } from "../services/api";
import CustomButton from "../component/custombutton";
import SearchBox from "../component/SearchBox";
import { useNavigation } from "@react-navigation/native";
import Feather from "@expo/vector-icons/Feather";

const AdminScreen = () => {
  const navigation = useNavigation();
  const [orders, setOrders] = useState([]);
  const [item_name, setItem_name] = useState("");
  const [price, setPrice] = useState("");
  const [image_url, setImage_url] = useState("");
  const [item_detail, setItem_detail] = useState("");

  // Load orders
  const loadOrders = async () => {
    try {
      const fetchedOrders = await fetchOrders();
      if (fetchedOrders) {
        setOrders(fetchedOrders);
      } else {
        Alert.alert("No Orders", "No orders found");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      Alert.alert("Error", "There was an issue fetching the orders");
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
      <Text style={styles.orderTitle}>รหัสออเดอร์: {item.id}</Text>
      <Text>User ID: {item.user_id}</Text>
      <Text>ราคารวม: {item.total_amount} บาท</Text>
      <Text>ที่อยู่จัดส่ง: {item.shipping_address}</Text>
      <Text>สถานะ: {item.status}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>หน้าจัดการออเดอร์</Text>
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

      <CustomButton title={"Register"} backgroundColor={"#FF9D23"} onPress={addtomarket} />

      {/* Manage Queue Button */}
      <CustomButton title={"Manage Queue"} backgroundColor={"#d84315"} onPress={() => navigation.navigate("ManageQueue")} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "white",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    // color: "#FF9D23",
  },
  orderItem: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    borderWidth: 1,
    // borderColor: "#FF9D23",
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    // color: "#FF9D23",
  },
  listContainer: {
    paddingBottom: 20,
  },
});

export default AdminScreen;
