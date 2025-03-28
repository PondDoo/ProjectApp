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
        Alert.alert("Product added to cart");
      } else {
        Alert.alert("User not logged in");
      }
    } catch (error) {
      console.error("Error adding product to cart:", error);
      Alert.alert("Failed to add product to cart");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Motorix Shop</Text>

      <TextInput
        placeholder="Password Admin"
        secureTextEntry={true}
        value={Password}
        onChangeText={setPassword}
        style={styles.input}
      />

      <CustomButton title="Admin Login" backgroundColor="#FF9D23" onPress={CheckPassword} />
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
                <Text style={styles.addButtonText}>Add to Cart</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <CustomButton title="ตะกร้า" backgroundColor="#3F7D58" onPress={() => navigation.navigate("Cart")} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "white",
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    margin: 15,
    // color: "#e64a19",
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
});

export default HomeScreen; 