import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Alert, TextInput, FlatList, Image, TouchableOpacity } from "react-native";
import { fetchShopItems, addToCart } from "../services/api";
import CustomButton from "../component/custombutton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

const HomeScreen = ({ navigation }) => {
  const [Password, setPassword] = useState("");
  const [shopItems, setShopItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

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
        console.log("Adding product to cart", { userId, productId, quantity });
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
        placeholder="Password"
        secureTextEntry={true}
        value={Password}
        onChangeText={setPassword}
        style={styles.input}
      />

      <CustomButton title="Admin Login" backgroundColor="#FF9D23" onPress={CheckPassword} />
      <CustomButton title="จองคิว" backgroundColor="#d84315" onPress={() => navigation.navigate("Queue")} />

      {loading ? (
        <Text style={styles.loadingText}>กำลังโหลดข้อมูล...</Text>
      ) : (
        <FlatList
          data={shopItems}
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
    backgroundColor: "#ffe0b2",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
    // color: "#e64a19",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  loadingText: {
    textAlign: "center",
    fontSize: 16,
  },
  card: {
    backgroundColor: "#fff8e1",
    borderRadius: 10,
    padding: 15,
    marginTop:10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  image: {
    width: "100%",
    height: 150,
    borderRadius: 8,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 5,
  },
  price: {
    fontSize: 16,
    color: "#FF5733",
  },
  detail: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: "#e64a19",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default HomeScreen;
