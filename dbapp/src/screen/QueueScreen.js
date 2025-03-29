import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Button, Modal, FlatList, Alert, TouchableOpacity,TextInput } from "react-native";
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
  const [serviceType, setServiceType] = useState(null);
  const [vehicleRegistration, setVehicleRegistration] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
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

  const confirmBooking = () => {
    if (!selectedDate || !selectedTime || !serviceType || !vehicleRegistration || !vehicleModel) {
      Alert.alert("โปรดกรอกข้อมูลให้ครบถ้วน");
      return;
    }

    const updatedBookings = { ...bookedSlots };

    if (!updatedBookings[selectedDate]) {
      updatedBookings[selectedDate] = {};
    }

    if (updatedBookings[selectedDate][selectedTime]) {
      Alert.alert(
        "เวลาถูกจองแล้ว",
        `เวลา ${selectedTime} ในวันที่ ${selectedDate} ถูกจองแล้ว`
      );
      return;
    }

    updatedBookings[selectedDate][selectedTime] = {
      time: selectedTime,
      service: serviceType,
      vehicle: `${vehicleRegistration} (${vehicleModel})`,
      notes: additionalNotes,
      status: "pending",
    };

    setBookedSlots(updatedBookings);
    storeBookings(updatedBookings);
    setModalVisible(false);
    Alert.alert(
      "จองสำเร็จ",
      `คุณได้จองเวลา ${selectedTime} สำหรับ ${serviceType} ในวันที่ ${selectedDate}`
    );
  };

  const renderBookingItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{`บริการ: ${item.service}`}</Text>
      <Text>{`วันที่: ${item.date}`}</Text>
      <Text>{`เวลา: ${item.time}`}</Text>
      <Text>{`สถานะ: ${item.status === "pending" ? "รอการยืนยัน" : "ยืนยันแล้ว"}`}</Text>
      <TouchableOpacity onPress={() => Alert.alert("รายละเอียดการจอง", JSON.stringify(item))}>
        <Text style={styles.linkText}>ดูรายละเอียดเพิ่มเติม</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>เลือกวันที่จองคิว</Text>
      <Calendar
        onDayPress={(date) => {
          setSelectedDate(date.dateString);
          setModalVisible(true);
        }}
      />

      <FlatList
        data={Object.entries(bookedSlots).flatMap(([date, slots]) =>
          Object.entries(slots).map(([time, details]) => ({
            date,
            time,
            ...details,
          }))
        )}
        keyExtractor={(item, index) => `${item.date}-${item.time}-${index}`}
        renderItem={renderBookingItem}
      />

      <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Ionicons name="close-circle" size={24} color="red" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>จองคิวบริการ</Text>

            <Text style={styles.label}>เลือกประเภทบริการ</Text>
            <RNPickerSelect
              onValueChange={setServiceType}
              items={[
                { label: "ซ่อมรถ", value: "ซ่อมรถ" },
                { label: "แต่งรถ", value: "แต่งรถ" },
                { label: "เช็คสภาพรถ", value: "เช็คสภาพรถ" },
              ]}
              style={{ inputAndroid: styles.input }}
            />

            <Text style={styles.label}>ทะเบียนรถ</Text>
            <TextInput style={styles.input} placeholder="ทะเบียนรถ" onChangeText={setVehicleRegistration} />

            <Text style={styles.label}>รุ่นรถ</Text>
            <TextInput style={styles.input} placeholder="รุ่นรถ" onChangeText={setVehicleModel} />

            <Text style={styles.label}>เวลา</Text>
            <RNPickerSelect
              onValueChange={setSelectedTime}
              items={Array.from({ length: 11 }, (_, i) => ({ label: `${i + 8}:00`, value: `${i + 8}:00` }))}
              style={{ inputAndroid: styles.input }}
            />

            <Button title="ยืนยันการจอง" onPress={confirmBooking} />
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalCard: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginTop: 5,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  linkText: {
    color: "#007BFF",
    marginTop: 10,
    textDecorationLine: "underline",
  },
});

export default QueueScreen;