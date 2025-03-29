import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, Button, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ManageQueueScreen = () => {
  const [queueData, setQueueData] = useState([]);

  useEffect(() => {
    loadQueueData();
  }, []);

  const loadQueueData = async () => {
    try {
      const storedData = await AsyncStorage.getItem("bookedSlots");
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        const formattedData = Object.keys(parsedData).flatMap(date =>
          Object.keys(parsedData[date]).map(time => ({
            date,
            time,
            ...parsedData[date][time],
            status: parsedData[date][time].status || "pending"
          }))
        );
        setQueueData(formattedData);
      }
    } catch (error) {
      console.error("Error loading queue data:", error);
    }
  };

  const updateQueueStatus = async (queueItem, newStatus) => {
    try {
      const storedData = await AsyncStorage.getItem("bookedSlots");
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        parsedData[queueItem.date][queueItem.time].status = newStatus;
        await AsyncStorage.setItem("bookedSlots", JSON.stringify(parsedData));
        loadQueueData();
        Alert.alert("อัปเดตสถานะสำเร็จ", `คิว ${queueItem.time} วันที่ ${queueItem.date} ถูกอัปเดตเป็น '${newStatus}'`);
      }
    } catch (error) {
      console.error("Error updating queue status:", error);
    }
  };

  const renderQueueItem = ({ item }) => (
    <View style={styles.queueItem}>
      <Text style={styles.queueText}>วันที่: {item.date}</Text>
      <Text>เวลา: {item.time}</Text>
      <Text>บริการ: {item.service}</Text>
      <Text>รถ: {item.vehicle}</Text>
      <Text>สถานะ: {item.status === "pending" ? "รอการยืนยัน" : item.status === "accepted" ? "ยืนยันแล้ว" : "ถูกปฏิเสธ"}</Text>
      {item.status === "pending" && (
        <View style={styles.buttonContainer}>
          <Button title="✔ ยืนยัน" color="green" onPress={() => updateQueueStatus(item, "accepted")} />
          <Button title="✖ ปฏิเสธ" color="red" onPress={() => updateQueueStatus(item, "rejected")} />
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>จัดการคิว</Text>
      <FlatList
        data={queueData}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderQueueItem}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FFF7F3",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  queueItem: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  queueText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  listContainer: {
    paddingBottom: 20,
  },
});

export default ManageQueueScreen;