const { Pool } = require("pg");  // ใช้ pg library สำหรับการเชื่อมต่อกับ PostgreSQL
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// เชื่อมต่อกับ PostgreSQL (ใช้ pool เพื่อรองรับการเชื่อมต่อหลายๆ ครั้ง)
const pool = new Pool({
  host: "localhost",  // หรือ URL ของ PostgreSQL
  port: 5432,
  user: "postgres",  // เปลี่ยนให้ตรงกับข้อมูลของคุณ
  password: "4480",  // เปลี่ยนให้ตรงกับข้อมูลของคุณ
  database: "proapp",  // ชื่อฐานข้อมูล
});

// สร้างตาราง `users` ถ้ายังไม่มี
pool.query(
  `CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
)`
);

// สร้างตาราง `shopitems` ถ้ายังไม่มี
pool.query(
  `CREATE TABLE IF NOT EXISTS shopitems (
    id SERIAL PRIMARY KEY,
    item_name TEXT NOT NULL,
    price REAL NOT NULL,
    image_url TEXT,
    item_detail TEXT
)`
);

// สร้างตาราง `cart` ถ้ายังไม่มี
pool.query(
  `CREATE TABLE IF NOT EXISTS cart (
    cart_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT cart_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id)
)`
);

//สร้างตาราง `cart_items` ถ้ายังไม่มี
pool.query(
`CREATE TABLE IF NOT EXISTS cart_items (
    id SERIAL PRIMARY KEY,
    cart_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    CONSTRAINT cart_item_cart_id_fkey FOREIGN KEY (cart_id) REFERENCES cart(cart_id),
    CONSTRAINT cart_item_product_id_fkey FOREIGN KEY (product_id) REFERENCES shopitems(id),
    CONSTRAINT cart_item_unique UNIQUE (cart_id, product_id)
)`
);

//สร้างตาราง `orders` ถ้ายังไม่มี
pool.query(`CREATE TABLE IF NOT EXISTS orders (
    order_id SERIAL PRIMARY KEY,  -- รหัสคำสั่งซื้อ
    user_id INT NOT NULL,  -- รหัสผู้ใช้
    total_amount DECIMAL(10,2) NOT NULL,  -- ราคารวม
    shipping_address TEXT NOT NULL,  -- ที่อยู่จัดส่ง
    status VARCHAR(50) NOT NULL DEFAULT 'Pending',  -- สถานะคำสั่งซื้อ (เช่น Pending, Confirmed)
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- วันที่คำสั่งซื้อ
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE  -- เชื่อมโยงกับผู้ใช้
)`)

//สร้างตาราง `order_items` ถ้ายังไม่มี
pool.query(`CREATE TABLE IF NOT EXISTS order_items (
    order_item_id SERIAL PRIMARY KEY,  -- รหัสรายการสินค้า
    order_id INT NOT NULL,  -- รหัสคำสั่งซื้อ
    product_id INT NOT NULL,  -- รหัสสินค้า
    quantity INT NOT NULL,  -- จำนวนสินค้าที่สั่ง
    price DECIMAL(10,2) NOT NULL,  -- ราคาแต่ละรายการ
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,  -- เชื่อมโยงกับคำสั่งซื้อ
    FOREIGN KEY (product_id) REFERENCES shopitems(id) ON DELETE CASCADE  -- เชื่อมโยงกับสินค้า
)`)

// Route สำหรับ Register
app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const encryptedPassword = await bcrypt.hash(password, 10);

    // แทรกข้อมูลเข้า database
    const query = `INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id`;
    const values = [username, encryptedPassword];

    pool.query(query, values, (err, result) => {
      if (err) {
        return res.status(400).json({ message: "Username already exists" });
      }
      res.status(201).json({
        message: "User registered successfully",
        userId: result.rows[0].id,
      });
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Route สำหรับ Login
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const query = `SELECT * FROM users WHERE username = $1`;
  pool.query(query, [username], async (err, result) => {
    if (err) {
      return res.status(500).send({ message: "Database error" });
    }

    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).send({ message: "Invalid credentials" });
    }

    // สร้าง token
    const token = jwt.sign({ userId: user.id }, "secretkey");

    // ส่งกลับทั้ง token และ userId
    res.send({ token, userId: user.id });
  });
});


// Route สำหรับดึงข้อมูลสินค้า
app.get('/shopitems', (req, res) => {
  const query = `SELECT * FROM shopitems`; // คำสั่ง SQL เพื่อดึงข้อมูลจาก table shopitems
  pool.query(query, (err, result) => {
    if (err) {
      console.error("Error fetching shopitems:", err);
      return res.status(500).json({ message: 'Error fetching shopitems' });
    }
    res.json(result.rows); // ส่งข้อมูลสินค้าเป็น JSON
  });
});

// เพิ่มสินค้าในตะกร้า
app.post('/add-to-cart', async (req, res) => {
  const { userId, productId, quantity } = req.body;

  // ตรวจสอบว่า userId, productId, quantity ส่งมาครบหรือไม่
  if (userId === undefined || productId === undefined || quantity === undefined) {
    return res.status(400).json({ message: 'Missing required fields: userId, productId, or quantity' });
  }

  // แปลงค่าที่ได้รับมาให้เป็นตัวเลข (หากไม่ได้ส่งค่ามาในรูปแบบตัวเลข)
  const userIdInt = parseInt(userId);
  const productIdInt = parseInt(productId);
  const quantityInt = parseInt(quantity);

  // ตรวจสอบว่า userId, productId, quantity เป็นตัวเลขที่ถูกต้องหรือไม่
  if (isNaN(userIdInt) || isNaN(productIdInt) || isNaN(quantityInt)) {
    return res.status(400).json({ message: 'Invalid input: userId, productId, and quantity must be numbers' });
  }

  try {
    // ตรวจสอบผู้ใช้
    const userCheck = await pool.query('SELECT * FROM users WHERE id = $1', [userIdInt]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });  // ไม่พบผู้ใช้
    }

    // ตรวจสอบสินค้าที่ต้องการเพิ่ม และดึง image_url ของสินค้า
    const productCheck = await pool.query('SELECT * FROM shopitems WHERE id = $1', [productIdInt]);
    if (productCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });  // ไม่พบสินค้า
    }

    // ดึง image_url ของสินค้า
    const imageUrl = productCheck.rows[0].image_url;

    // ตรวจสอบว่าในตะกร้ามีสินค้าตัวนี้อยู่แล้วหรือไม่
    const cartCheck = await pool.query(
      `SELECT * FROM cart WHERE user_id = $1 AND status = 'pending'`, 
      [userIdInt]
    );
    
    let cartId;
    if (cartCheck.rows.length === 0) {
      // ถ้ายังไม่มีตะกร้า ให้สร้างใหม่
      const cartResult = await pool.query(
        `INSERT INTO cart (user_id, status) VALUES ($1, 'pending') RETURNING cart_id`,
        [userIdInt]
      );
      cartId = cartResult.rows[0].cart_id;
    } else {
      // ใช้ cart_id ของตะกร้าที่มีอยู่แล้ว
      cartId = cartCheck.rows[0].cart_id;
    }

    // เพิ่มสินค้าลงใน cart_items
    const cartItemCheck = await pool.query(
      `SELECT * FROM cart_items WHERE cart_id = $1 AND product_id = $2`, 
      [cartId, productIdInt]
    );

    if (cartItemCheck.rows.length > 0) {
      // ถ้ามีสินค้าอยู่ในตะกร้าแล้ว ให้เพิ่มจำนวนสินค้า
      await pool.query(
        `UPDATE cart_items SET quantity = quantity + $1 WHERE cart_id = $2 AND product_id = $3`,
        [quantityInt, cartId, productIdInt]
      );
    } else {
      // ถ้ายังไม่มีสินค้าในตะกร้า ให้เพิ่มใหม่
      await pool.query(
        `INSERT INTO cart_items (cart_id, product_id, quantity, image_url) VALUES ($1, $2, $3, $4)`,
        [cartId, productIdInt, quantityInt, imageUrl]
      );
    }

    res.status(200).json({ message: 'Product added to cart', cartId, productId: productIdInt, quantity: quantityInt, imageUrl });
  } catch (error) {
    console.error('Error adding to cart:', error);  // เพิ่มการแสดงข้อผิดพลาดเพิ่มเติม
    res.status(500).json({ message: 'Internal server error' });
  }
});


// ดูตะกร้าของผู้ใช้และรวมข้อมูลสินค้า เช่น item_name, price, image_url
app.get('/cart/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId);  // แปลง userId เป็นตัวเลข

  if (isNaN(userId)) {
    return res.status(400).json({ message: 'Invalid userId' });
  }

  try {
    const cartCheck = await pool.query(
      'SELECT * FROM cart WHERE user_id = $1 AND status = $2',
      [userId, 'pending']
    );

    if (cartCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const cartId = cartCheck.rows[0].cart_id;

    // ดึงข้อมูลสินค้าในตะกร้า พร้อมข้อมูลจากตาราง shopitems เช่น item_name, price, image_url
    const cartItems = await pool.query(
      `SELECT ci.product_id, ci.quantity, si.item_name, si.price, si.image_url
      FROM cart_items ci
      JOIN shopitems si ON ci.product_id = si.id
      WHERE ci.cart_id = $1`,
      [cartId]
    );

    // ส่งข้อมูลตะกร้าผู้ใช้ที่มีสินค้าพร้อมรายละเอียด
    res.status(200).json({ cart: cartItems.rows });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.get("/cart/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    // ดึงข้อมูลสินค้าจากฐานข้อมูลที่ผู้ใช้เพิ่มเข้าไปในตะกร้า
    const query = `
      SELECT ci.product_id, p.item_name, p.price, ci.quantity 
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = $1
    `;
    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No items found in cart" });
    }

    res.json({ cart: result.rows });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ message: "Server error while fetching cart" });
  }
});

app.post("/place-order", async (req, res) => {
  const { userId, items, shippingAddress } = req.body; // รับข้อมูลจากฟรอนต์เอนด์

  try {
    // คำนวณราคาสินค้าทั้งหมด (หรือตรวจสอบรายการในตะกร้า)
    const totalAmount = items.reduce((total, item) => total + item.price * item.quantity, 0);

    // บันทึกคำสั่งซื้อในตาราง orders
    const result = await pool.query(
      'INSERT INTO orders (user_id, total_amount, shipping_address, status) VALUES ($1, $2, $3, $4) RETURNING order_id',
      [userId, totalAmount, shippingAddress, 'Pending']  // สถานะ Pending สำหรับคำสั่งซื้อที่ยังไม่ได้ชำระเงิน
    );

    const orderId = result.rows[0].order_id;

    // บันทึกรายการสินค้าที่สั่งในตาราง order_items
    for (let item of items) {
      await pool.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
        [orderId, item.product_id, item.quantity, item.price]
      );
    }

    res.status(200).send({ message: "Order placed successfully", orderId });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).send({ message: "Error placing order" });
  }
});

app.get('/admin/orders', async (req, res) => {
  try {
    const orders = await pool.query('SELECT * FROM orders'); // ดึงข้อมูลคำสั่งซื้อทั้งหมดจากฐานข้อมูล
    console.log('Fetched orders:', orders.rows); // ดูข้อมูลที่ดึงมา
    res.json({ orders: orders.rows });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
});


// Start Server
app.listen(5000, () => {
  console.log("Server is running on port 5000");
});


app.post("/add-to-market", async (req, res) => {
  try {
    const { item_name, price, image_url, item_detail } = req.body;
 
    // แทรกข้อมูลเข้า database โดยไม่ต้องระบุ id
    const query = `INSERT INTO shopitems (item_name, price, image_url, item_detail) VALUES ($1, $2, $3, $4)`;
    const values = [item_name, price, image_url, item_detail];

    // ใช้ await กับ pool.query เพื่อรอผลการทำงาน
    await pool.query(query, values);

    res.status(201).json({
      message: "เพิ่มสินค้าเรียบร้อยแล้ว",
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Route สำหรับลบสินค้าจากตะกร้า
app.delete('/cart/:userId/item/:productId', async (req, res) => {
  const { userId, productId } = req.params;
  console.log(`Received DELETE request for userId: ${userId}, productId: ${productId}`);

  try {
    const query = `
      DELETE FROM cart_items 
      WHERE cart_id IN (SELECT cart_id FROM cart WHERE user_id = $1 AND status = 'pending')
      AND product_id = $2
      RETURNING *;
    `;
    const result = await pool.query(query, [userId, productId]);
    console.log(result);  // เพิ่มการ log ของผลลัพธ์จากฐานข้อมูล

    if (result.rowCount > 0) {
      return res.status(200).json({ message: 'Product removed from cart' });
    } else {
      return res.status(404).json({ message: 'Product not found in cart' });
    }
  } catch (error) {
    console.error('Error removing product from cart:', error);
    return res.status(500).json({ message: 'Server error, please try again later' });
  }
});


// เพิ่มจำนวนสินค้าภายในตะกร้า
app.put('/cart/:userId/item/:productId/increase', async (req, res) => {
  const { userId, productId } = req.params;

  try {
    // ค้นหาว่าสินค้าที่ระบุอยู่ในตะกร้าของผู้ใช้หรือไม่
    const cartItem = await pool.query(
      'SELECT * FROM cart_items WHERE cart_id IN (SELECT cart_id FROM cart WHERE user_id = $1 AND status = $2) AND product_id = $3',
      [userId, 'pending', productId]
    );

    if (cartItem.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found in cart' });
    }

    // เพิ่มจำนวนสินค้า
    const updatedCartItem = await pool.query(
      'UPDATE cart_items SET quantity = quantity + 1 WHERE cart_id = $1 AND product_id = $2 RETURNING *',
      [cartItem.rows[0].cart_id, productId]
    );

    res.status(200).json({
      message: 'Product quantity increased',
      quantity: updatedCartItem.rows[0].quantity,
    });
  } catch (error) {
    console.error('Error increasing product quantity:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// ลดจำนวนสินค้าภายในตะกร้า
app.put('/cart/:userId/item/:productId/decrease', async (req, res) => {
  const { userId, productId } = req.params;

  try {
    // ค้นหาว่าสินค้าที่ระบุอยู่ในตะกร้าของผู้ใช้หรือไม่
    const cartItem = await pool.query(
      'SELECT * FROM cart_items WHERE cart_id IN (SELECT cart_id FROM cart WHERE user_id = $1 AND status = $2) AND product_id = $3',
      [userId, 'pending', productId]
    );

    if (cartItem.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found in cart' });
    }

    // ถ้าจำนวนสินค้ามากกว่า 1 ให้ลดจำนวนลง
    if (cartItem.rows[0].quantity > 1) {
      const updatedCartItem = await pool.query(
        'UPDATE cart_items SET quantity = quantity - 1 WHERE cart_id = $1 AND product_id = $2 RETURNING *',
        [cartItem.rows[0].cart_id, productId]
      );

      return res.status(200).json({
        message: 'Product quantity decreased',
        quantity: updatedCartItem.rows[0].quantity,
      });
    }

    // ถ้าจำนวนสินค้าคือ 1 และต้องการลดลง จะลบสินค้าออกจากตะกร้า
    await pool.query(
      'DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2',
      [cartItem.rows[0].cart_id, productId]
    );

    res.status(200).json({
      message: 'Product removed from cart',
    });
  } catch (error) {
    console.error('Error decreasing product quantity:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Route สำหรับเคลียร์ตะกร้าของผู้ใช้
app.delete('/cart/clear/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    // ตรวจสอบว่า ตะกร้าของผู้ใช้มีสินค้าหรือไม่
    const cartCheck = await pool.query(
      'SELECT * FROM cart WHERE user_id = $1 AND status = $2',
      [userId, 'pending']
    );

    if (cartCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Cart not found for this user' });
    }

    const cartId = cartCheck.rows[0].cart_id;

    // ลบสินค้าทั้งหมดในตะกร้าที่เป็น 'pending'
    await pool.query(
      'DELETE FROM cart_items WHERE cart_id = $1',
      [cartId]
    );

    res.status(200).json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ message: 'Error clearing cart' });
  }
});