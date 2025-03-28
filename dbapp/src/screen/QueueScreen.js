import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Button, Modal, FlatList, Alert, TouchableOpacity } from "react-native";
import { Calendar } from "react-native-calendars";
import RNPickerSelect from "react-native-picker-select";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

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
    delete updatedBookings[date][time];

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
                  <Button
                    title="ยกเลิก"
                    onPress={() => cancelBooking(item[0], time)}
                    color="red"
                  />
                </View>
              ))}
            </View>
          )}
        />
      ) : (
        <Text style={styles.noBooking}>ยังไม่มีการจอง</Text>
      )}

      <View style={styles.buttonContainer}>
        <Button title="ล้างการจองทั้งหมด" onPress={clearBookings} color="red" />
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
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
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
    fontSize: 14,
  },
  noBooking: {
    fontSize: 14,
    fontStyle: "italic",
    color: "gray",
  },
  buttonContainer: {
    marginTop: 20,
  },
});

export default QueueScreen;