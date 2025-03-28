import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Button, Modal, FlatList, Alert, TouchableOpacity } from "react-native";
import { Calendar } from "react-native-calendars";
import RNPickerSelect from "react-native-picker-select";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import icon from "@expo/vector-icons/Ionicons"
import CustomButton from "../component/custombutton";

const QueueScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [bookedSlots, setBookedSlots] = useState({});

  useEffect(() => {
    loadBookings();
  }, []);

  const storeBookings = async (data) => {
    try {
      await AsyncStorage.setItem("bookedSlots", JSON.stringify(data));
    } catch (error) {
      console.error("Error saving booking data:", error);
    }
  };

  const loadBookings = async () => {
    try {
      const storedData = await AsyncStorage.getItem("bookedSlots");
      if (storedData) {
        setBookedSlots(JSON.parse(storedData));
      }
    } catch (error) {
      console.error("Error loading booking data:", error);
    }
  };

  const clearBookings = async () => {
    await AsyncStorage.removeItem("bookedSlots");
    setBookedSlots({});
    Alert.alert("ล้างข้อมูล", "การจองทั้งหมดถูกล้างแล้ว!");
  };

  const cancelBooking = async (date, time) => {
    if (!bookedSlots[date] || !bookedSlots[date][time]) {
      Alert.alert("ไม่พบการจอง", `ไม่มีการจองเวลา ${time} ในวันที่ ${date}`);
      return;
    }
  
    const updatedBookings = { ...bookedSlots };
    delete updatedBookings[date][time]; // ลบเวลานั้นออก
  
    // ถ้าหลังจากลบแล้ว วันนั้นไม่มีการจองเหลืออยู่ ให้ลบวันออกไปเลย
    if (Object.keys(updatedBookings[date]).length === 0) {
      delete updatedBookings[date];
    }
  
    setBookedSlots(updatedBookings);
    await storeBookings(updatedBookings);
    Alert.alert("ยกเลิกการจอง", `การจองเวลา ${time} ในวันที่ ${date} ถูกยกเลิกแล้ว!`);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date.dateString);
    setModalVisible(true);
  };

  const confirmBooking = () => {
    if (!selectedDate || !selectedTime) return;

    const updatedBookings = { ...bookedSlots };

    if (!updatedBookings[selectedDate]) {
      updatedBookings[selectedDate] = {};
    }

    // เช็คว่าเวลาโดนจองแล้วหรือยัง
    if (updatedBookings[selectedDate][selectedTime]) {
      Alert.alert("เวลาถูกจองแล้ว", `เวลา ${selectedTime} ในวันที่ ${selectedDate} ถูกจองแล้ว`);
      return;
    }

    updatedBookings[selectedDate][selectedTime] = selectedTime;

    setBookedSlots(updatedBookings);
    storeBookings(updatedBookings);
    setModalVisible(false);
    Alert.alert("จองสำเร็จ", `คุณได้จองเวลา ${selectedTime} ในวันที่ ${selectedDate}`);
  };

  const currentDate = new Date();
  const formattedCurrentDate = currentDate.toISOString().split("T")[0];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>เลือกวันที่จองคิว</Text>
      <Calendar
        onDayPress={handleDateSelect}
        minDate={formattedCurrentDate}
        markedDates={Object.keys(bookedSlots).reduce((acc, date) => {
          acc[date] = { selected: true, selectedColor: "blue" };
          return acc;
        }, {})}
      />

      <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Ionicons name="close-circle" size={24} color="red" />
            </TouchableOpacity>

            <Text>เลือกเวลาสำหรับวันที่ {selectedDate}</Text>
            <RNPickerSelect
              onValueChange={setSelectedTime}
              items={Array.from({ length: 11 }, (_, i) => ({
                label: `${i + 8}:00`,
                value: `${i + 8}:00`,
              }))}
            />
            <Button title="ยืนยันการจอง" onPress={confirmBooking} disabled={!selectedTime} />
          </View>
        </View>
      </Modal>

      <Text style={styles.title}>ตารางการจอง</Text>
      {Object.keys(bookedSlots).length > 0 ? (
        <FlatList
          data={Object.entries(bookedSlots)}
          keyExtractor={(item) => item[0]}
          renderItem={({ item }) => (
            <View style={styles.bookingItem}>
              <Text style={styles.bookingText}>📅 {item[0]}</Text>
              {Object.entries(item[1]).map(([time, value]) => (
                <View key={time} style={styles.bookingTextContainer}>
                  <Text style={styles.bookingText}>🕒 {time}</Text>
                  <TouchableOpacity style={styles.cancelButton} onPress={() => cancelBooking(item[0], time)}>
                    <Text style={styles.cancelButtonText}>ยกเลิก</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        />
      ) : (
        <Text style={styles.noBooking}>ยังไม่มีการจอง</Text>
      )}

      <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.clearButton} onPress={clearBookings}>
            <Text style={styles.clearButtonText}>ล้างข้อมูล</Text>
          </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor:"white"
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop:20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
    position: "relative",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  
  clearButton: {
    backgroundColor: "#F7374F",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    width: "90%", // ทำให้ปุ่มกว้างขึ้น
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3, // สำหรับ Android
  },
  clearButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  bookingItem: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
  },
  bookingTextContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bookingText: {
    fontSize: 16,
    fontWeight:"600",
  },
  noBooking: {
    fontSize: 14,
    fontStyle: "italic",
    color: "gray",
  },
  cancelButton: {
    backgroundColor: "#FF6B6B",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  
  cancelButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  
});

export default QueueScreen;