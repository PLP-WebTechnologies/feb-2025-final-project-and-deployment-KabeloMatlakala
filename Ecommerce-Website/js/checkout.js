/**
 * Checkout Page JavaScript
 *
 * This file handles the functionality of the checkout page.
 * It loads cart items, calculates totals, and processes the order.
 *
 * SIMPLIFIED FOR BEGINNERS:
 * - Step-by-step code execution
 * - Clear variable names
 * - Detailed comments
 */

// Wait for the page to load before running any code
document.addEventListener("DOMContentLoaded", async () => {
  // ==========================================
  // STEP 1: Get references to HTML elements
  // ==========================================

  // Get the container where checkout items will be displayed
  const checkoutItemsContainer = document.getElementById("checkout-items")

  // Get elements for order summary
  const subtotalElement = document.getElementById("checkout-subtotal")
  const shippingElement = document.getElementById("checkout-shipping")
  const taxElement = document.getElementById("checkout-tax")
  const totalElement = document.getElementById("checkout-total")

  // Get the shipping form
  const shippingForm = document.getElementById("shipping-form")

  // ==========================================
  // STEP 2: Get the cart and check if it's empty
  // ==========================================

  // Get the cart with product details
  const cartWithDetails = await getCartWithDetails()

  // Check if the cart is empty
  if (cartWithDetails.length === 0) {
    // If the cart is empty, redirect to the products page
    window.location.href = "products.html"
    return
  }

  // ==========================================
  // STEP 3: Load checkout items
  // ==========================================

  // Call the loadCheckoutItems function to display cart items
  loadCheckoutItems()

  // ==========================================
  // STEP 4: Set up event listener for form submission
  // ==========================================

  // Add a submit event listener to the shipping form
  if (shippingForm) {
    shippingForm.addEventListener("submit", handleCheckout)
  }

  // ==========================================
  // STEP 5: Define functions
  // ==========================================

  // Function to load checkout items
  async function loadCheckoutItems() {
    // Check if the checkout items container exists
    if (!checkoutItemsContainer) return

    try {
      // Show a loading message
      checkoutItemsContainer.innerHTML = '<div class="loading">Loading cart items...</div>'

      // Calculate cart totals
      const cartTotals = await calculateCartTotals()

      // Check if there are items in the cart
      if (cartTotals.items.length === 0) {
        checkoutItemsContainer.innerHTML = '<div class="empty-cart">Your cart is empty.</div>'
        return
      }

      // Clear the container
      checkoutItemsContainer.innerHTML = ""

      // Loop through each cart item and create a checkout item element
      for (let i = 0; i < cartTotals.items.length; i++) {
        const item = cartTotals.items[i]

        // Create a checkout item element
        const checkoutItem = document.createElement("div")
        checkoutItem.className = "checkout-item"

        // Set the HTML content of the checkout item
        checkoutItem.innerHTML = `
          <img src="${item.image}" alt="${item.name}" class="checkout-item-image">
          <div class="checkout-item-details">
            <h3 class="checkout-item-name">${item.name}</h3>
            <p class="checkout-item-price">${formatPrice(item.price)} x ${item.quantity}</p>
            <p class="checkout-item-total">${formatPrice(item.total)}</p>
          </div>
        `

        // Add the checkout item to the container
        checkoutItemsContainer.appendChild(checkoutItem)
      }

      // Update order summary
      if (subtotalElement) subtotalElement.textContent = formatPrice(cartTotals.subtotal)
      if (shippingElement) shippingElement.textContent = formatPrice(cartTotals.shipping)
      if (taxElement) taxElement.textContent = formatPrice(cartTotals.tax)
      if (totalElement) totalElement.textContent = formatPrice(cartTotals.total)

      // Store order data for submission
      window.orderData = cartTotals
    } catch (error) {
      // Show an error message if something goes wrong
      console.error("Error loading checkout items:", error)
      checkoutItemsContainer.innerHTML =
        '<div class="error">Failed to load checkout items. Please try again later.</div>'
    }
  }

  // Function to handle checkout form submission
  async function handleCheckout(e) {
    // Prevent the form from submitting normally
    e.preventDefault()

    try {
      // Get form data
      const formData = new FormData(shippingForm)

      // Get individual form fields
      const firstName = formData.get("first-name")
      const lastName = formData.get("last-name")
      const email = formData.get("email")
      const address = formData.get("address")
      const city = formData.get("city")
      const state = formData.get("state")
      const zip = formData.get("zip")
      const country = formData.get("country")
      const phone = formData.get("phone")
      const cardName = formData.get("card-name")
      const cardNumber = formData.get("card-number")
      const expiryDate = formData.get("expiry-date")
      const cvv = formData.get("cvv")

      // Debug: Log form values
      console.log("Form values:", {
        firstName,
        lastName,
        email,
        address,
        city,
        state,
        zip,
        country,
        phone,
        cardName,
        cardNumber,
        expiryDate,
        cvv,
      })

      // Validate required fields
      if (
        !firstName ||
        !lastName ||
        !email ||
        !address ||
        !city ||
        !state ||
        !zip ||
        !country ||
        !phone ||
        !cardName ||
        !cardNumber ||
        !expiryDate ||
        !cvv
      ) {
        showNotification("Please fill in all required fields.", "error")
        return
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        showNotification("Please enter a valid email address.", "error")
        return
      }

      // Create order data
      const orderData = {
        customer_name: `${firstName} ${lastName}`,
        customer_email: email,
        customer_address: `${address}, ${city}, ${state} ${zip}, ${country}`,
        total_amount: window.orderData.total,
        items: window.orderData.items.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
      }

      // Log the order data for debugging
      console.log("Submitting order data:", orderData)

      // Show loading state
      const submitBtn = shippingForm.querySelector('button[type="submit"]')
      const originalBtnText = submitBtn.textContent
      submitBtn.disabled = true
      submitBtn.textContent = "Processing..."

      // Create the order
      const order = await createOrder(orderData)

      // Clear the cart after successful order
      clearCart()

      // Show success message
      showNotification("Order placed successfully! Thank you for your purchase.")

      // Redirect to confirmation page or home
      setTimeout(() => {
        window.location.href = "index.html"
      }, 2000)
    } catch (error) {
      // Show an error message if something goes wrong
      console.error("Error placing order:", error)
      showNotification("Failed to place order. Please try again.", "error")

      // Reset submit button
      const submitBtn = shippingForm.querySelector('button[type="submit"]')
      submitBtn.disabled = false
      submitBtn.textContent = "Place Order"
    }
  }

  // Mock functions (replace with actual implementations or imports)
  function getCart() {
    // Replace with actual cart retrieval logic (e.g., from localStorage)
    return JSON.parse(localStorage.getItem("cart") || "[]")
  }

  // Function to fetch a product by ID from the server
  async function getProductById(id) {
    try {
      // Define the API URL
      const API_URL = "http://localhost:3000/api"

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

  function formatPrice(price) {
    return "$" + price.toFixed(2)
  }

  // Function to create an order on the server
  async function createOrder(orderData) {
    try {
      // Define the API URL
      const API_URL = "http://localhost:3000/api"

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
      console.log("Order created successfully:", order)
      return order
    } catch (error) {
      // Log any errors and rethrow the error
      console.error("Error creating order:", error)
      throw error
    }
  }

  function clearCart() {
    // Replace with actual cart clearing logic (e.g., clearing localStorage)
    localStorage.removeItem("cart")
  }

  function showNotification(message, type = "success") {
    alert(message) // Replace with a better notification system
  }

  async function getCartWithDetails() {
    const cart = getCart()
    const cartWithDetails = []

    for (let i = 0; i < cart.length; i++) {
      const cartItem = cart[i]
      const product = await getProductById(cartItem.id)

      if (product) {
        cartWithDetails.push({
          ...product,
          quantity: cartItem.quantity,
        })
      }
    }

    return cartWithDetails
  }

  async function calculateCartTotals() {
    let subtotal = 0
    const items = []

    const cartWithDetails = await getCartWithDetails()

    for (let i = 0; i < cartWithDetails.length; i++) {
      const item = cartWithDetails[i]
      const itemTotal = item.price * item.quantity
      subtotal += itemTotal

      items.push({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        total: itemTotal,
      })
    }

    const shipping = subtotal > 50 ? 0 : 10 // Free shipping over $50
    const tax = subtotal * 0.1 // 10% tax
    const total = subtotal + shipping + tax

    return {
      subtotal,
      shipping,
      tax,
      total,
      items,
    }
  }
})
