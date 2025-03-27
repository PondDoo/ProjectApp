import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Alert, TextInput, FlatList, Image, Button } from "react-native";
import { fetchShopItems, addToCart } from "../services/api"; // import ฟังก์ชันจาก api.js
import CustomButton from "../component/custombutton"; // CustomButton ของคุณ
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

const HomeScreen = ({ navigation }) => {
  const [Password, setPassword] = useState("");
  const [shopItems, setShopItems] = useState([]); // สถานะสำหรับเก็บข้อมูลสินค้า
  const [loading, setLoading] = useState(true); // สถานะในการโหลดข้อมูล
  const [cart, setCart] = useState([]); // สำหรับเก็บข้อมูลตะกร้าของผู้ใช้
  const [userId, setUserId] = useState(null);

  // ฟังก์ชันตรวจสอบรหัสผ่าน
  const CheckPassword = () => {
    if (Password === "1234") {
      navigation.navigate("Admin");
    } else {
      Alert.alert("อย่ามั่วรหัสดิเห้ย");
    }
  };

  // ฟังก์ชันดึง userId จาก AsyncStorage
  const getUserId = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem("userId");
      if (storedUserId) {
        setUserId(storedUserId); // เก็บ userId ที่ดึงมา
      } else {
        // ถ้าไม่พบ userId ให้ไปที่หน้า login
        navigation.navigate("Login");
      }
    } catch (error) {
      console.error("Error retrieving userId", error);
    }
  };

  useEffect(() => {
    getUserId(); // เรียกฟังก์ชันเพื่อดึง userId เมื่อคอมโพเนนต์โหลด
  }, []);

  // ฟังก์ชันดึงข้อมูลสินค้า
  const getShopItems = async () => {
    try {
      const items = await fetchShopItems(); // เรียกฟังก์ชันจาก api.js
      setShopItems(items); // เก็บข้อมูลสินค้าในสถานะ
      setLoading(false); // เปลี่ยนสถานะโหลดข้อมูลเป็น false
    } catch (error) {
      console.error('Error fetching shopitems:', error);
      Alert.alert('Error', 'ไม่สามารถดึงข้อมูลสินค้าได้');
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      // เมื่อหน้า HomeScreen กลับมาแสดงให้ดึงข้อมูลสินค้าใหม่
      getShopItems(); 
    }, []) // เมื่อหน้ากลับมา focus
  );

  // ฟังก์ชันเพิ่มสินค้าเข้าสู่ตะกร้า
  const handleAddToCart = async (productId, quantity) => {
    try {
      if (userId) { // ตรวจสอบว่า userId มีค่าหรือไม่
        console.log('Adding product to cart', { userId, productId, quantity });
        const cartItem = await addToCart(userId, productId, quantity);  // ใช้ userId จาก AsyncStorage
        Alert.alert('Product added to cart');
        fetchCart(userId); // ส่ง userId ไปยังฟังก์ชัน fetchCart
      } else {
        Alert.alert('User not logged in');
      }
    } catch (error) {
      console.error('Error adding product to cart:', error);
      Alert.alert('Failed to add product to cart');
    }
  };

  // ฟังก์ชันดึงข้อมูลตะกร้าสำหรับ userId
  const fetchCart = async (userId) => {
    try {
      const response = await fetch(`http://10.5.50.228:5000/cart/${userId}`);  // ส่ง userId ไปที่ API
      const data = await response.json();
      setCart(data.cart);  // อัพเดตข้อมูลตะกร้า
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text>Tom</Text>

      <TextInput
        placeholder={"Password"}
        secureTextEntry={true} // เปลี่ยนจาก `secure` เป็น `secureTextEntry`
        value={Password}
        onChangeText={setPassword}
      />

      <CustomButton
        title={"Admin Login"}
        backgroundColor={"#FF9D23"}
        onPress={CheckPassword}
      />
      <CustomButton
        title={"จองคิว"}
        backgroundColor={"#FF9D23"}
        onPress={() => navigation.navigate('Queue')}
      />
      
      {loading ? (
        <Text>กำลังโหลดข้อมูล...</Text> // แสดงข้อความขณะโหลดข้อมูล
      ) : (
        <FlatList
          data={shopItems}
          keyExtractor={(item) => item.id ? item.id.toString() : 'defaultKey'}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Image source={{ uri: item.image_url }} style={styles.image} />
              <Text>{item.item_name}</Text>
              <Text>${item.price}</Text>
              <Text>{item.item_detail}</Text>
              <Button
                title="Add to Cart"
                onPress={() => handleAddToCart(item.id, 1)} // เพิ่มสินค้าลงในตะกร้า (quantity = 1)
              />
            </View>
          )}
        />
      )}

      <View style={styles.cartSummary}>
        <Button
          title="Go to Cart"
          onPress={() => {
            navigation.navigate('Cart'); // ไปยังหน้าตะกร้า
          }}
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
  image: {
    width: 100,
    height: 100,
    marginTop: 10,
    resizeMode: 'contain', // เพื่อให้รูปแสดงตามขนาดที่กำหนด
  },
  cartSummary: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    paddingTop: 10,
  },
});

export default HomeScreen;