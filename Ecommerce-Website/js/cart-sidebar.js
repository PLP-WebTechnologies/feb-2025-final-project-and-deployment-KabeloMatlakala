/**
 * Cart Sidebar JavaScript
 *
 * This file handles the functionality of the cart sidebar.
 * It allows users to view their cart, update quantities, and proceed to checkout.
 */

document.addEventListener("DOMContentLoaded", () => {
    // ==========================================
    // STEP 1: Get references to HTML elements
    // ==========================================
  
    // Cart sidebar elements
    const cartSidebar = document.querySelector(".cart-sidebar")
    const overlay = document.querySelector(".overlay")
    const cartItems = document.querySelector(".cart-items")
    const totalPrice = document.querySelector(".total-price")
    const checkoutBtn = document.querySelector(".checkout-btn")
  
    // Cart toggle elements
    const cartIcon = document.querySelector(".cart-icon")
    const closeCartBtn = document.querySelector(".close-cart")
  
    // Mobile menu elements
    const mobileMenuBtn = document.querySelector(".mobile-menu-btn")
    const navLinks = document.querySelector(".nav-links")
  
    // ==========================================
    // STEP 2: Set up event listeners
    // ==========================================
  
    // Toggle cart sidebar when cart icon is clicked
    if (cartIcon) {
      cartIcon.addEventListener("click", function (e) {
        // If the cart icon is a link (has href), don't prevent default
        if (!this.getAttribute("href")) {
          e.preventDefault()
          openCartSidebar()
        }
      })
    }
  
    // Close cart sidebar when close button is clicked
    if (closeCartBtn) {
      closeCartBtn.addEventListener("click", closeCartSidebar)
    }
  
    // Close cart sidebar when overlay is clicked
    if (overlay) {
      overlay.addEventListener("click", closeCartSidebar)
    }
  
    // Redirect to checkout page when checkout button is clicked
    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", () => {
        window.location.href = "checkout.html"
      })
    }
  
    // Toggle mobile menu when menu button is clicked
    if (mobileMenuBtn && navLinks) {
      mobileMenuBtn.addEventListener("click", () => {
        mobileMenuBtn.classList.toggle("active")
        navLinks.classList.toggle("active")
      })
    }
  
    // ==========================================
    // STEP 3: Load cart items when the page loads
    // ==========================================
  
    // Load cart items
    loadCartItems()
  
    // ==========================================
    // STEP 4: Define functions
    // ==========================================
  
    // Function to open the cart sidebar
    function openCartSidebar() {
      if (cartSidebar && overlay) {
        cartSidebar.classList.add("active")
        overlay.classList.add("active")
        document.body.style.overflow = "hidden" // Prevent scrolling
  
        // Refresh cart items when opening
        loadCartItems()
      }
    }
  
    // Function to close the cart sidebar
    function closeCartSidebar() {
      if (cartSidebar && overlay) {
        cartSidebar.classList.remove("active")
        overlay.classList.remove("active")
        document.body.style.overflow = "" // Re-enable scrolling
      }
    }
  
    async function getCartWithDetails() {
      // Use the actual function from api-client.js
      return window.getCartWithDetails()
    }
  
    async function calculateCartTotals() {
      // Use the actual function from api-client.js
      return window.calculateCartTotals()
    }
  
    function formatPrice(price) {
      // Use the actual function from api-client.js
      return window.formatPrice(price)
    }
  
    async function updateCartQuantity(productId, quantity) {
      // Use the actual function from api-client.js
      return window.updateCartQuantity(productId, quantity)
    }
  
    async function removeFromCart(productId) {
      // Use the actual function from api-client.js
      return window.removeFromCart(productId)
    }
  
    async function updateCartCountDisplay() {
      // Use the actual function from api-client.js
      return window.updateCartCountDisplay()
    }
  
    function showNotification(message, type = "success") {
      // Use the actual function from api-client.js
      return window.showNotification(message, type)
    }
  
    // Function to load cart items
    async function loadCartItems() {
      if (!cartItems || !totalPrice) return
  
      try {
        // Get cart with product details
        const cartWithDetails = await getCartWithDetails()
  
        // Calculate cart totals
        const cartTotals = await calculateCartTotals()
  
        // Update total price
        totalPrice.textContent = formatPrice(cartTotals.total)
  
        // Clear cart items container
        cartItems.innerHTML = ""
  
        // Check if cart is empty
        if (cartWithDetails.length === 0) {
          cartItems.innerHTML = '<div class="empty-cart-message">Your cart is empty</div>'
          return
        }
  
        // Loop through each cart item and create a cart item element
        cartWithDetails.forEach((item) => {
          const cartItem = document.createElement("div")
          cartItem.className = "cart-item"
  
          cartItem.innerHTML = `
            <div class="cart-item-image">
              <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="cart-item-details">
              <h4 class="cart-item-name">${item.name}</h4>
              <div class="cart-item-price">${formatPrice(item.price)}</div>
              <div class="cart-item-quantity">
                <button class="quantity-btn decrease" data-id="${item.id}">-</button>
                <span class="quantity">${item.quantity}</span>
                <button class="quantity-btn increase" data-id="${item.id}">+</button>
              </div>
            </div>
            <button class="remove-item" data-id="${item.id}">&times;</button>
          `
  
          cartItems.appendChild(cartItem)
  
          // Add event listeners to quantity buttons
          const decreaseBtn = cartItem.querySelector(".decrease")
          const increaseBtn = cartItem.querySelector(".increase")
          const removeBtn = cartItem.querySelector(".remove-item")
  
          decreaseBtn.addEventListener("click", () => {
            updateItemQuantity(item.id, item.quantity - 1)
          })
  
          increaseBtn.addEventListener("click", () => {
            updateItemQuantity(item.id, item.quantity + 1)
          })
  
          removeBtn.addEventListener("click", () => {
            removeCartItem(item.id)
          })
        })
      } catch (error) {
        console.error("Error loading cart items:", error)
        cartItems.innerHTML = '<div class="error-message">Failed to load cart items</div>'
      }
    }
  
    // Function to update item quantity
    async function updateItemQuantity(productId, quantity) {
      try {
        // Update cart quantity
        updateCartQuantity(productId, quantity)
  
        // Reload cart items
        loadCartItems()
  
        // Update cart count display
        updateCartCountDisplay()
      } catch (error) {
        console.error("Error updating item quantity:", error)
        showNotification("Failed to update item quantity", "error")
      }
    }
  
    // Function to remove cart item
    async function removeCartItem(productId) {
      try {
        // Remove item from cart
        removeFromCart(productId)
  
        // Reload cart items
        loadCartItems()
  
        // Update cart count display
        updateCartCountDisplay()
  
        // Show notification
        showNotification("Item removed from cart")
      } catch (error) {
        console.error("Error removing cart item:", error)
        showNotification("Failed to remove item from cart", "error")
      }
    }
  
    // Make functions available globally
    window.openCartSidebar = openCartSidebar
    window.closeCartSidebar = closeCartSidebar
    window.loadCartItems = loadCartItems
  })
  