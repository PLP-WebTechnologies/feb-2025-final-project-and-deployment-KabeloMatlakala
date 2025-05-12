/**
 * ShopEasy E-commerce Backend Server
 *
 * This file sets up an Express server with SQLite database integration
 * for the ShopEasy e-commerce application.
 *
 * SIMPLIFIED FOR BEGINNERS:
 * - Clear route organization
 * - Detailed comments
 * - Simple error handling
 */

// Import required modules
const express = require("express")
const cors = require("cors")
const { initializeDatabase, ProductOperations, OrderOperations } = require("./api-client")

// Create Express application
const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors()) // Enable CORS for all routes
app.use(express.json()) // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })) // Parse URL-encoded request bodies

// Initialize database connection
let db

// Initialize the database before starting the server
async function startServer() {
  try {
    // Initialize the database
    db = await initializeDatabase()
    console.log("Database initialized successfully")

    // ==========================================
    // PRODUCT ROUTES
    // ==========================================

    // GET all products
    app.get("/api/products", async (req, res) => {
      try {
        const products = await ProductOperations.getAllProducts()
        res.json(products)
      } catch (error) {
        console.error("Error getting all products:", error)
        res.status(500).json({ error: "Failed to get products" })
      }
    })

    // GET product by ID
    app.get("/api/products/:id", async (req, res) => {
      try {
        const productId = req.params.id
        const product = await ProductOperations.getProductById(productId)

        if (!product) {
          return res.status(404).json({ error: "Product not found" })
        }

        res.json(product)
      } catch (error) {
        console.error("Error getting product by ID:", error)
        res.status(500).json({ error: "Failed to get product" })
      }
    })

    // GET products by category
    app.get("/api/products/category/:category", async (req, res) => {
      try {
        const category = req.params.category
        const products = await ProductOperations.getProductsByCategory(category)
        res.json(products)
      } catch (error) {
        console.error("Error getting products by category:", error)
        res.status(500).json({ error: "Failed to get products by category" })
      }
    })

    // POST create a new product
    app.post("/api/products", async (req, res) => {
      try {
        const productData = req.body
        const newProduct = await ProductOperations.createProduct(productData)
        res.status(201).json(newProduct)
      } catch (error) {
        console.error("Error creating product:", error)
        res.status(500).json({ error: "Failed to create product" })
      }
    })

    // PUT update a product
    app.put("/api/products/:id", async (req, res) => {
      try {
        const productId = req.params.id
        const productData = req.body
        const updatedProduct = await ProductOperations.updateProduct(productId, productData)
        res.json(updatedProduct)
      } catch (error) {
        console.error("Error updating product:", error)
        res.status(500).json({ error: "Failed to update product" })
      }
    })

    // DELETE a product
    app.delete("/api/products/:id", async (req, res) => {
      try {
        const productId = req.params.id
        const result = await ProductOperations.deleteProduct(productId)
        res.json(result)
      } catch (error) {
        console.error("Error deleting product:", error)
        res.status(500).json({ error: "Failed to delete product" })
      }
    })

    // ==========================================
    // ORDER ROUTES
    // ==========================================

    // GET all orders
    app.get("/api/orders", async (req, res) => {
      try {
        const orders = await OrderOperations.getAllOrders()
        res.json(orders)
      } catch (error) {
        console.error("Error getting all orders:", error)
        res.status(500).json({ error: "Failed to get orders" })
      }
    })

    // GET order by ID
    app.get("/api/orders/:id", async (req, res) => {
      try {
        const orderId = req.params.id
        const order = await OrderOperations.getOrderById(orderId)

        if (!order) {
          return res.status(404).json({ error: "Order not found" })
        }

        res.json(order)
      } catch (error) {
        console.error("Error getting order by ID:", error)
        res.status(500).json({ error: "Failed to get order" })
      }
    })

    // POST create a new order
    app.post("/api/orders", async (req, res) => {
      try {
        const orderData = req.body
        const newOrder = await OrderOperations.createOrder(orderData)
        res.status(201).json(newOrder)
      } catch (error) {
        console.error("Error creating order:", error)
        res.status(500).json({ error: "Failed to create order" })
      }
    })

    // PUT update an order (for status updates)
    app.put("/api/orders/:id", async (req, res) => {
      try {
        const orderId = req.params.id
        const { status } = req.body

        // Update order status in the database
        await db.run("UPDATE orders SET status = ? WHERE id = ?", [status, orderId])

        // Get the updated order
        const updatedOrder = await OrderOperations.getOrderById(orderId)

        if (!updatedOrder) {
          return res.status(404).json({ error: "Order not found" })
        }

        res.json(updatedOrder)
      } catch (error) {
        console.error("Error updating order:", error)
        res.status(500).json({ error: "Failed to update order" })
      }
    })

    // ==========================================
    // ADMIN ROUTES
    // ==========================================

    // GET dashboard statistics
    app.get("/api/admin/stats", async (req, res) => {
      try {
        // Get all products
        const products = await ProductOperations.getAllProducts()

        // Get all orders
        const orders = await OrderOperations.getAllOrders()

        // Calculate total revenue
        let totalRevenue = 0
        orders.forEach((order) => {
          totalRevenue += order.total_amount
        })

        // Calculate product counts by category
        const categoryCounts = {}
        products.forEach((product) => {
          if (product.category) {
            categoryCounts[product.category] = (categoryCounts[product.category] || 0) + 1
          }
        })

        // Return statistics
        res.json({
          productCount: products.length,
          orderCount: orders.length,
          totalRevenue,
          categoryCounts,
        })
      } catch (error) {
        console.error("Error getting admin statistics:", error)
        res.status(500).json({ error: "Failed to get admin statistics" })
      }
    })

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
      console.log(`API available at http://localhost:${PORT}/api`)
    })
  } catch (error) {
    console.error("Failed to start server:", error)
    process.exit(1)
  }
}

// Start the server
startServer()
