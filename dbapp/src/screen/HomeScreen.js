import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Alert, TextInput, FlatList, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { fetchShopItems, addToCart } from "../services/api";
import CustomButton from "../component/custombutton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import Feather from "@expo/vector-icons/Feather";

const HomeScreen = ({ navigation }) => {
  const [Password, setPassword] = useState("");
  const [shopItems, setShopItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [showPasswordInput, setShowPasswordInput] = useState(false); // State สำหรับแสดง input รหัส

  const numColumns = 2; // กำหนดให้เป็นค่าคงที่

  const CheckPassword = () => {
    if (Password === "1234") {
      navigation.navigate("Admin");
    } else {
      Alert.alert("กรุณากรอก password ให้ถูกต้อง");
    }
  };

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

  useEffect(() => {
    getUserId();
  }, []);

  const getShopItems = async () => {
    try {
      const items = await fetchShopItems();
      setShopItems(items);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching shopitems:", error);
      Alert.alert("Error", "ไม่สามารถดึงข้อมูลสินค้าได้");
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      getShopItems();
    }, [])
  );

  const handleAddToCart = async (productId, quantity) => {
    try {
      if (userId) {
        await addToCart(userId, productId, quantity);
        //Alert.alert("Product added to cart");
      } else {
        Alert.alert("User not logged in");
      }
    } catch (error) {
      console.error("Error adding product to cart:", error);
      Alert.alert("Failed to add product to cart");
    }
  };

  // ฟังก์ชันสำหรับออกจากระบบ
  const handleLogout = async () => {
    try {
      // ลบ userId ออกจาก AsyncStorage
      await AsyncStorage.removeItem("userId");

      // นำทางไปยังหน้า Login
      navigation.navigate("Login");

      // แสดงข้อความแจ้งเตือนว่าออกจากระบบสำเร็จ
      Alert.alert("สำเร็จ", "คุณได้ออกจากระบบแล้ว");
    } catch (error) {
      console.error("Error during logout", error);
      Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถออกจากระบบได้");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Motorix Shop</Text>

      {/* ปุ่ม Admin Login อยู่มุมขวาบน */}
      <TouchableOpacity
        style={styles.adminButton}
        onPress={() => setShowPasswordInput(true)} // เมื่อกดจะแสดงฟอร์มกรอกรหัส
      >
        <Feather name="lock" size={24} color="white" />
      </TouchableOpacity>

      {/* ถ้า showPasswordInput เป็น true จะแสดงฟอร์มกรอกรหัส */}
      {showPasswordInput && (
        <View style={styles.passwordContainer}>
          {/* ไอคอนกากบาทสำหรับปิดฟอร์ม */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowPasswordInput(false)} // เมื่อกดจะปิดฟอร์ม
          >
            <Feather name="x" size={24} color="black" />
          </TouchableOpacity>

          <TextInput
            placeholder="Password Admin"
            secureTextEntry={true}
            value={Password}
            onChangeText={setPassword}
            style={styles.input}
          />
          <CustomButton title="Log in" backgroundColor="#FF9D23" onPress={CheckPassword} />
        </View>
      )}

      <CustomButton
        title="จองคิว"
        backgroundColor="#d84315"
        icon={<Feather name="shopping-cart" size={20} color="white" />} // เพิ่มไอคอน
        onPress={() => navigation.navigate("Queue")}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#e64a19" style={styles.loadingIndicator} />
      ) : (
        <FlatList
          key={numColumns.toString()} // ป้องกันปัญหา numColumns เปลี่ยน
          data={shopItems}
          numColumns={numColumns}
          columnWrapperStyle={{ justifyContent: "space-between" }} // จัดระยะห่าง
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image source={{ uri: item.image_url }} style={styles.image} />
              <Text style={styles.itemTitle}>{item.item_name}</Text>
              <Text style={styles.price}>${item.price}</Text>
              <Text style={styles.detail}>{item.item_detail}</Text>
              <TouchableOpacity style={styles.addButton} onPress={() => handleAddToCart(item.id, 1)}>
                <Text style={styles.addButtonText}>เพิ่มสินค้า</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      {/* ปุ่มออกจากระบบ */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Feather name="log-out" size={24} color="white" />
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.checkoutButton} 
        onPress={() => navigation.navigate('Cart')}
      >
        <Text style={styles.checkoutText}>ตะกร้า</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
    backgroundColor: "white",
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    margin: 15,
  },
  adminButton: {
    position: "absolute",
    top: 45,
    right: 20,
    width: 50,
    height: 50,
    backgroundColor: "#FF9D23",
    borderRadius: 25, // ทำให้ปุ่มกลม
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2, // เพิ่ม zIndex เพื่อให้ปุ่มอยู่เหนือฟอร์ม
  },
  passwordContainer: {
    marginTop: 10,
    padding: 25,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    position: "relative", // ทำให้ตำแหน่งของปุ่มกากบาทไม่ซ้อนกัน
  },
  closeButton: {
    position: "absolute",
    top: 0,
    right: 1,
    backgroundColor: "transparent",
    padding: 3,
    zIndex: 3, // ทำให้ไอคอนกากบาทอยู่เหนือ input
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 15,
    marginBottom: 12,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  loadingIndicator: {
    marginTop: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginVertical: 10,
    width: "48%", // ทำให้แถวละ 2 คอลัมน์มีขนาดพอดี
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  image: {
    width: "100%",
    height: 180,
    borderRadius: 10,
  },
  itemTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 6,
    color: "#333",
  },
  price: {
    fontSize: 18,
    color: "#FF5733",
    fontWeight: "bold",
  },
  detail: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: "#e64a19",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  checkoutButton: {
    width: '100%',
    backgroundColor: "#FF9D23",
    padding: 10,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 4, // เงาเพิ่มมิติให้ปุ่ม
  },
  checkoutText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  logoutButton: {
    position: "absolute", // ทำให้ปุ่มลอยอยู่
    top: 45,
    left: 20,
    width: 50,
    height: 50,
    backgroundColor: "#d84315",
    borderRadius: 25, // ทำให้ปุ่มกลม
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2, // เพิ่ม zIndex เพื่อให้ปุ่มอยู่เหนือฟอร์ม
  },
  logoutText: {
    color: "white",
    fontSize: 16,
  },
});

export default HomeScreen;
