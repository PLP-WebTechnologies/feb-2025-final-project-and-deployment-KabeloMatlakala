/**
 * ShopEasy E-commerce API Client
 *
 * This file contains all the functions needed to interact with the backend API
 * and manage client-side data like the shopping cart.
 *
 * SIMPLIFIED FOR BEGINNERS:
 * - Clear function names that describe what they do
 * - Detailed comments explaining each function
 * - Simple error handling
 * - Consistent coding style
 */

// API URL - Change this to match your server
const API_URL = "http://localhost:3000/api"

// Debug mode - set to true to see helpful console logs
const DEBUG_MODE = true

// Add a debug logger function
function debugLog(message, data) {
  if (DEBUG_MODE) {
    console.log(`🔍 DEBUG: ${message}`, data || "")
  }
}

// ==========================================
// PRODUCT FUNCTIONS
// ==========================================

// Get all products from the server
async function getAllProducts() {
  try {
    debugLog("Fetching all products from API...")
    // Fetch products from the API
    const response = await fetch(`${API_URL}/products`)

    // Check if the request was successful
    if (!response.ok) {
      console.error("Error fetching products:", response.status)
      return []
    }

    // Parse the JSON response
    const products = await response.json()
    debugLog("Products fetched successfully:", products)
    return products
  } catch (error) {
    // Log any errors and return an empty array
    console.error("Error fetching products:", error)
    return []
  }
}

// Get a single product by its ID
async function getProductById(id) {
  try {
    // Fetch a specific product from the API
    const response = await fetch(`${API_URL}/products/${id}`)

    // Check if the request was successful
    if (!response.ok) {
      console.error("Error fetching product:", response.status)
      return null
    }

    // Parse the JSON response
    const product = await response.json()
    return product
  } catch (error) {
    // Log any errors and return null
    console.error(`Error fetching product ${id}:`, error)
    return null
  }
}

// Get products by category
async function getProductsByCategory(category) {
  try {
    // Fetch products in a specific category from the API
    const response = await fetch(`${API_URL}/products/category/${category}`)

    // Check if the request was successful
    if (!response.ok) {
      console.error("Error fetching products by category:", response.status)
      return []
    }

    // Parse the JSON response
    const products = await response.json()
    return products
  } catch (error) {
    // Log any errors and return an empty array
    console.error(`Error fetching products in category ${category}:`, error)
    return []
  }
}

// Search products by name, description, or category
async function searchProducts(query) {
  try {
    // Get all products first
    const allProducts = await getAllProducts()

    // Convert search query to lowercase for case-insensitive search
    const searchQuery = query.toLowerCase()

    // Filter products that match the search query
    const matchingProducts = allProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(searchQuery) ||
        product.description.toLowerCase().includes(searchQuery) ||
        product.category.toLowerCase().includes(searchQuery),
    )

    return matchingProducts
  } catch (error) {
    // Log any errors and return an empty array
    console.error(`Error searching products:`, error)
    return []
  }
}

// ==========================================
// CART FUNCTIONS
// ==========================================

// Get the cart from localStorage
function getCart() {
  // Try to get the cart from localStorage
  const cartJson = localStorage.getItem("cart")

  // If the cart exists, parse it; otherwise, return an empty array
  if (cartJson) {
    return JSON.parse(cartJson)
  } else {
    return []
  }
}

// Save the cart to localStorage
function saveCart(cart) {
  // Convert the cart to a JSON string and save it to localStorage
  localStorage.setItem("cart", JSON.stringify(cart))

  // Update the cart count display whenever the cart is saved
  updateCartCountDisplay()
}

// Add a product to the cart
function addToCart(productId, quantity = 1) {
  debugLog(`Adding product ${productId} to cart with quantity ${quantity}`)

  // Get the current cart
  const cart = getCart()

  // Check if the product is already in the cart
  const existingItem = cart.find((item) => item.id === productId)

  if (existingItem) {
    // If the product is already in the cart, increase the quantity
    existingItem.quantity += quantity
    debugLog(`Updated quantity for product ${productId} to ${existingItem.quantity}`)
  } else {
    // If the product is not in the cart, add it
    cart.push({
      id: productId,
      quantity: quantity,
    })
    debugLog(`Added new product ${productId} to cart with quantity ${quantity}`)
  }

  // Save the updated cart
  saveCart(cart)

  // Return the updated cart
  return cart
}

// Update the quantity of a product in the cart
function updateCartQuantity(productId, quantity) {
  // Get the current cart
  const cart = getCart()

  // Find the index of the product in the cart
  const itemIndex = cart.findIndex((item) => item.id === productId)

  // If the product is in the cart
  if (itemIndex !== -1) {
    if (quantity <= 0) {
      // If the quantity is 0 or negative, remove the product from the cart
      cart.splice(itemIndex, 1)
      debugLog(`Removed product ${productId} from cart (quantity <= 0)`)
    } else {
      // Otherwise, update the quantity
      cart[itemIndex].quantity = quantity
      debugLog(`Updated quantity for product ${productId} to ${quantity}`)
    }

    // Save the updated cart
    saveCart(cart)
  }

  // Return the updated cart
  return cart
}

// Remove a product from the cart
function removeFromCart(productId) {
  // Get the current cart
  const cart = getCart()

  // Filter out the product to remove
  const updatedCart = cart.filter((item) => item.id !== productId)

  debugLog(`Removed product ${productId} from cart`)

  // Save the updated cart
  saveCart(updatedCart)

  // Return the updated cart
  return updatedCart
}

// Clear the cart
function clearCart() {
  // Remove the cart from localStorage
  localStorage.removeItem("cart")

  debugLog("Cart cleared")

  // Update the cart count display
  updateCartCountDisplay()

  // Return an empty array
  return []
}

// Get the total number of items in the cart
function getCartCount() {
  // Get the current cart
  const cart = getCart()

  // Sum up the quantities of all items
  let totalItems = 0
  for (let i = 0; i < cart.length; i++) {
    totalItems += cart[i].quantity
  }

  return totalItems
}

// Get the cart with product details
async function getCartWithDetails() {
  // Get the current cart
  const cart = getCart()

  // If the cart is empty, return an empty array
  if (cart.length === 0) {
    return []
  }

  // Create an array to store cart items with product details
  const cartWithDetails = []

  // Loop through each cart item
  for (let i = 0; i < cart.length; i++) {
    const item = cart[i]

    // Get the product details
    const product = await getProductById(item.id)

    // If the product exists, add it to the cart with details
    if (product) {
      cartWithDetails.push({
        id: item.id,
        quantity: item.quantity,
        name: product.name,
        price: product.price,
        image: product.image,
        total: product.price * item.quantity,
      })
    }
  }

  return cartWithDetails
}

// Calculate cart totals
async function calculateCartTotals() {
  // Get the cart with product details
  const cartItems = await getCartWithDetails()

  // Initialize totals
  let subtotal = 0

  // Calculate subtotal
  for (let i = 0; i < cartItems.length; i++) {
    subtotal += cartItems[i].total
  }

  // Calculate shipping (free shipping over $50)
  const shipping = subtotal > 50 ? 0 : 10

  // Calculate tax (10%)
  const tax = subtotal * 0.1

  // Calculate total
  const total = subtotal + shipping + tax

  return {
    subtotal,
    shipping,
    tax,
    total,
    items: cartItems,
  }
}

// ==========================================
// ORDER FUNCTIONS
// ==========================================


// Create a new order
async function createOrder(orderData) {
  try {
    debugLog("Creating new order:", orderData)

    // Send a POST request to create an order
    const response = await fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    })

    // Check if the request was successful
    if (!response.ok) {
      console.error("Error creating order:", response.status)
      throw new Error("Failed to create order")
    }

    // Parse the JSON response
    const order = await response.json()
    debugLog("Order created successfully:", order)

    // Clear the cart after successful order
    clearCart()

    return order
  } catch (error) {
    // Log any errors and rethrow the error
    console.error("Error creating order:", error)
    throw error
  }
}

// Get all orders
async function getAllOrders() {
  try {
    // Fetch all orders from the API
    const response = await fetch(`${API_URL}/orders`)

    // Check if the request was successful
    if (!response.ok) {
      console.error("Error fetching orders:", response.status)
      return []
    }

    // Parse the JSON response
    const orders = await response.json()
    return orders
  } catch (error) {
    // Log any errors and return an empty array
    console.error("Error fetching orders:", error)
    return []
  }
}

// Get a single order by its ID
async function getOrderById(id) {
  try {
    // Fetch a specific order from the API
    const response = await fetch(`${API_URL}/orders/${id}`)

    // Check if the request was successful
    if (!response.ok) {
      console.error("Error fetching order:", response.status)
      return null
    }

    // Parse the JSON response
    const order = await response.json()
    return order
  } catch (error) {
    // Log any errors and return null
    console.error(`Error fetching order ${id}:`, error)
    return null
  }
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

// Format a price as a currency string
function formatPrice(price) {
  // Convert the price to a fixed-point string with 2 decimal places
  return `$${Number.parseFloat(price).toFixed(2)}`
}

// Show a notification message
function showNotification(message, type = "success") {
  // Create a notification element
  const notification = document.createElement("div")
  notification.className = `notification ${type}`
  notification.textContent = message

  // Add the notification to the document
  document.body.appendChild(notification)

  // Show the notification
  setTimeout(() => {
    notification.classList.add("show")
  }, 10)

  // Remove the notification after a delay
  setTimeout(() => {
    notification.classList.remove("show")
    setTimeout(() => {
      document.body.removeChild(notification)
    }, 300)
  }, 3000)
}

// Update the cart count display in the header
function updateCartCountDisplay() {
  // Find the cart count element
  const cartCountElement = document.querySelector(".cart-count")

  // If the element exists, update its text
  if (cartCountElement) {
    const count = getCartCount()
    cartCountElement.textContent = count
    debugLog(`Updated cart count display: ${count}`)
  }
}

// Initialize the cart count display when the page loads
document.addEventListener("DOMContentLoaded", () => {
  updateCartCountDisplay()
})

// Make all functions available globally
window.getAllProducts = getAllProducts
window.getProductById = getProductById
window.getProductsByCategory = getProductsByCategory
window.searchProducts = searchProducts

window.getCart = getCart
window.addToCart = addToCart
window.updateCartQuantity = updateCartQuantity
window.removeFromCart = removeFromCart
window.clearCart = clearCart
window.getCartCount = getCartCount
window.getCartWithDetails = getCartWithDetails
window.calculateCartTotals = calculateCartTotals

window.createOrder = createOrder
window.getAllOrders = getAllOrders
window.getOrderById = getOrderById

window.formatPrice = formatPrice
window.showNotification = showNotification
window.updateCartCountDisplay = updateCartCountDisplay
