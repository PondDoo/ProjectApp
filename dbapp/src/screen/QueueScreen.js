import React, { useState } from "react";
import { View, Text, StyleSheet, Modal, Button } from "react-native";

const QueueScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);

  const toggleModal = () => {
    setModalVisible(!modalVisible); // เปลี่ยนสถานะการแสดงผลของ Modal
  };

  return (
    <View style={styles.container}>
      {/* ปุ่มเปิด Modal */}
      <Button title="Open Modal" onPress={toggleModal} />
      
      {/* Modal */}
      <Modal
        animationType="slide"  // กำหนดประเภทการอนิเมชั่นของ Modal
        transparent={true}      // กำหนดให้พื้นหลังของ Modal เป็นโปร่งใส
        visible={modalVisible}  // กำหนดให้ Modal แสดงหรือซ่อนตามสถานะ
        onRequestClose={toggleModal}  // ฟังก์ชันที่เรียกเมื่อผู้ใช้กดปุ่มย้อนกลับ (บน Android)
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            <Text>ปอนด์</Text>
            {/* ปุ่มปิด Modal */}
            <Button title="Close Modal" onPress={toggleModal} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // สร้างพื้นหลังที่โปร่งใสสำหรับ Modal
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
  },
});

export default QueueScreen;
