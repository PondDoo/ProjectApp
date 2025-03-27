import axios from "axios";

const API_URL = "http://10.5.50.228:5000";  // ใช้ URL ที่ตรงกับเซิร์ฟเวอร์ของคุณ

// ฟังก์ชันสำหรับการลงทะเบียนผู้ใช้
export const registerUser = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/register`, {
      username,
      password,
    });
    return response.data;  // ส่งข้อมูลที่ได้รับกลับ
  } catch (error) {
    console.error('Register error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Error registering user");
  }
};

// ฟังก์ชันสำหรับการเข้าสู่ระบบ
export const loginUser = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, {
      username,
      password,
    });
    
    // ตรวจสอบว่า response.data มีทั้ง token และ userId
    if (response.data && response.data.token && response.data.userId) {
      return { token: response.data.token, userId: response.data.userId };  // ส่งกลับทั้ง token และ userId
    } else {
      throw new Error('Login failed: Missing token or userId');
    }
    
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Invalid login");
  }
};

// ฟังก์ชันสำหรับการดึงข้อมูลสินค้า
export const fetchShopItems = async () => {
  try {
    const response = await axios.get(`${API_URL}/shopitems`);
    return response.data;  // ส่งข้อมูลสินค้ากลับ
  } catch (error) {
    console.error('Error fetching shopitems:', error.response ? error.response.data : error.message);
    throw new Error(error.response?.data?.message || "Error fetching shopitems");
  }
};

export const addToCart = async (userId, productId, quantity) => {
  try {
    console.log('Sending add to cart request:', { userId, productId, quantity });  // พิมพ์ข้อมูลที่ส่งไป
    const response = await axios.post(`${API_URL}/add-to-cart`, {
      userId,
      productId,
      quantity
    });
    return response.data;
  } catch (error) {
    console.error('Error in addToCart API:', error.response ? error.response.data : error.message);  // แสดงข้อความแสดงข้อผิดพลาด
    throw new Error(error.response?.data?.message || "Error adding to cart");
  }
};

export const fetchCartItems = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/cart/${userId}`);  // ดึงข้อมูลจาก API โดยใช้ userId
    return response.data;  // ส่งข้อมูลตะกร้ากลับ
  } catch (error) {
    console.error('Error fetching cart items:', error);
    throw new Error('Failed to fetch cart items');
  }
};

export const placeOrder = async (userId, items, shippingAddress) => {
  try {
    const response = await axios.post(`${API_URL}/place-order`, {
      userId,
      items,
      shippingAddress,
    });

    return response.data; // ส่งข้อมูลที่ได้รับจาก API กลับไปให้
  } catch (error) {
    console.error('Error placing order:', error);
    throw error; // โยนข้อผิดพลาดออกไป
  }
};

export const fetchOrders = async () => {
  try {
    const response = await axios.get(`${API_URL}/admin/orders`);
    return response.data.orders;  // คืนค่าคำสั่งซื้อทั้งหมด
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;  // โยนข้อผิดพลาดออกไป
  }
};

// ฟังก์ชันสำหรับการลงทะเบียนผู้ใช้
export const addmarket = async (item_name ,price,image_url,item_detail,) => {
  try {
    const response = await axios.post(`${API_URL}/add-to-market`, {
      item_name ,
      price,
      image_url,
      item_detail
    });
    return response.data;
  } catch (error) {
    console.error('Register error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Error registering user");
  }
};

export const removeFromCart = async (userId, productId) => {
  try {
    const response = await axios.delete(`http://10.5.50.228:5000/cart/${userId}/item/${productId}`);
    return response.data; // คืนค่าผลลัพธ์จาก API ถ้าลบสำเร็จ
  } catch (error) {
    console.error("Error removing from cart:", error);
    throw error;  // ถ้ามีข้อผิดพลาดในการลบ ให้โยนข้อผิดพลาดไปที่ผู้ใช้
  }
};