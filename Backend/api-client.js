/**
 * ShopEasy Backend API Client
 *
 * This file handles database operations for the ShopEasy e-commerce application.
 * It provides functions for working with products and orders in the SQLite database.
 *
 * SIMPLIFIED FOR BEGINNERS:
 * - Step-by-step database operations
 * - Clear function names
 * - Detailed comments
 */

// Import required modules
const sqlite3 = require("sqlite3")
const { open } = require("sqlite")
const path = require("path")

// Database connection
let db

// Initialize database connection
async function initializeDatabase() {
  try {
    // Open the database
    db = await open({
      filename: path.join(__dirname, "shopeasy.db"),
      driver: sqlite3.Database,
    })

    console.log("Connected to SQLite database")

    // Create tables if they don't exist
    await db.exec(`
      -- Products table
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        description TEXT,
        image TEXT,
        category TEXT,
        stock INTEGER DEFAULT 100,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Orders table
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_name TEXT NOT NULL,
        customer_email TEXT NOT NULL,
        customer_address TEXT NOT NULL,
        total_amount REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Order items table
      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      );
    `)

    // Check if products table is empty
    const productCount = await db.get("SELECT COUNT(*) as count FROM products")

    if (productCount.count === 0) {
      console.log("Initializing database with sample products...")

      // Insert sample products
      await db.exec(`
        INSERT INTO products (name, price, description, image, category) VALUES
        ('Premium T-Shirt', 29.99, 'High-quality cotton t-shirt with a modern fit.', 'https://via.placeholder.com/300x300', 'clothing'),
        ('Wireless Headphones', 99.99, 'Noise-cancelling wireless headphones with 20-hour battery life.', 'https://via.placeholder.com/300x300', 'electronics'),
        ('Leather Wallet', 49.99, 'Genuine leather wallet with multiple card slots and RFID protection.', 'https://via.placeholder.com/300x300', 'accessories'),
        ('Smart Watch', 199.99, 'Fitness tracker and smartwatch with heart rate monitoring.', 'https://via.placeholder.com/300x300', 'electronics'),
        ('Denim Jeans', 59.99, 'Classic denim jeans with a comfortable stretch fit.', 'https://via.placeholder.com/300x300', 'clothing'),
        ('Ceramic Coffee Mug', 14.99, 'Handcrafted ceramic coffee mug, perfect for your morning brew.', 'https://via.placeholder.com/300x300', 'home'),
        ('Bluetooth Speaker', 79.99, 'Portable Bluetooth speaker with rich sound and waterproof design.', 'https://via.placeholder.com/300x300', 'electronics'),
        ('Sunglasses', 39.99, 'Stylish sunglasses with UV protection.', 'https://via.placeholder.com/300x300', 'accessories')
      `)

      console.log("Sample products added successfully")
    }

    return db
  } catch (error) {
    console.error("Database initialization error:", error)
    throw error
  }
}

// Product operations
const ProductOperations = {
  // Get all products
  getAllProducts: async () => {
    try {
      // Execute a SQL query to get all products
      const products = await db.all("SELECT * FROM products")
      return products
    } catch (error) {
      console.error("Error getting all products:", error)
      throw error
    }
  },

  // Get product by ID
  getProductById: async (id) => {
    try {
      // Execute a SQL query to get a product by ID
      const product = await db.get("SELECT * FROM products WHERE id = ?", id)
      return product
    } catch (error) {
      console.error("Error getting product by ID:", error)
      throw error
    }
  },

  // Get products by category
  getProductsByCategory: async (category) => {
    try {
      // Execute a SQL query to get products by category
      const products = await db.all("SELECT * FROM products WHERE category = ?", category)
      return products
    } catch (error) {
      console.error("Error getting products by category:", error)
      throw error
    }
  },

  // Create a new product
  createProduct: async function (productData) {
    try {
      // Get product data
      const { name, price, description, image, category, stock } = productData

      // Execute a SQL query to insert a new product
      const result = await db.run(
        "INSERT INTO products (name, price, description, image, category, stock) VALUES (?, ?, ?, ?, ?, ?)",
        [name, price, description, image, category, stock || 100],
      )

      // Get the newly created product
      return await this.getProductById(result.lastID)
    } catch (error) {
      console.error("Error creating product:", error)
      throw error
    }
  },

  // Update a product
  updateProduct: async function (id, productData) {
    try {
      // Get product data
      const { name, price, description, image, category, stock } = productData

      // Get current product
      const product = await this.getProductById(id)

      // Check if product exists
      if (!product) {
        throw new Error("Product not found")
      }

      // Execute a SQL query to update the product
      await db.run(
        "UPDATE products SET name = ?, price = ?, description = ?, image = ?, category = ?, stock = ? WHERE id = ?",
        [
          name || product.name,
          price || product.price,
          description || product.description,
          image || product.image,
          category || product.category,
          stock || product.stock,
          id,
        ],
      )

      // Get the updated product
      return await this.getProductById(id)
    } catch (error) {
      console.error("Error updating product:", error)
      throw error
    }
  },

  // Delete a product
  deleteProduct: async function (id) {
    try {
      // Get the product
      const product = await this.getProductById(id)

      // Check if product exists
      if (!product) {
        throw new Error("Product not found")
      }

      // Execute a SQL query to delete the product
      await db.run("DELETE FROM products WHERE id = ?", id)

      return { success: true }
    } catch (error) {
      console.error("Error deleting product:", error)
      throw error
    }
  },
}

// Order operations
const OrderOperations = {
  // Create a new order
  createOrder: async function (orderData) {
    try {
      // Get order data
      const { customer_name, customer_email, customer_address, items, total_amount } = orderData

      // Begin transaction
      await db.run("BEGIN TRANSACTION")

      try {
        // Execute a SQL query to insert a new order
        const orderResult = await db.run(
          "INSERT INTO orders (customer_name, customer_email, customer_address, total_amount) VALUES (?, ?, ?, ?)",
          [customer_name, customer_email, customer_address, total_amount],
        )

        // Get the order ID
        const orderId = orderResult.lastID

        // Add order items
        for (let i = 0; i < items.length; i++) {
          const item = items[i]

          // Execute a SQL query to insert an order item
          await db.run("INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)", [
            orderId,
            item.id,
            item.quantity,
            item.price,
          ])

          // Update product stock
          await db.run("UPDATE products SET stock = stock - ? WHERE id = ?", [item.quantity, item.id])
        }

        // Commit transaction
        await db.run("COMMIT")

        // Get the newly created order
        return await this.getOrderById(orderId)
      } catch (error) {
        // Rollback transaction on error
        await db.run("ROLLBACK")
        throw error
      }
    } catch (error) {
      console.error("Error creating order:", error)
      throw error
    }
  },

  // Get all orders
  getAllOrders: async () => {
    try {
      // Execute a SQL query to get all orders
      return await db.all("SELECT * FROM orders ORDER BY created_at DESC")
    } catch (error) {
      console.error("Error getting all orders:", error)
      throw error
    }
  },

  // Get order by ID with items
  getOrderById: async (id) => {
    try {
      // Execute a SQL query to get an order by ID
      const order = await db.get("SELECT * FROM orders WHERE id = ?", id)

      // Check if order exists
      if (!order) {
        return null
      }

      // Execute a SQL query to get order items
      const items = await db.all(
        `
        SELECT oi.*, p.name, p.image 
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `,
        id,
      )

      // Add items to the order
      return {
        ...order,
        items,
      }
    } catch (error) {
      console.error("Error getting order by ID:", error)
      throw error
    }
  },
}

// Export functions and objects
module.exports = {
  initializeDatabase,
  ProductOperations,
  OrderOperations,
}
