/**
 * Product Detail Page JavaScript
 *
 * This file handles the functionality of the product detail page.
 * It loads a specific product from the API and displays its details.
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

  // Get the container where product details will be displayed
  const productDetailContainer = document.getElementById("product-detail-container")

  // Get the container where related products will be displayed
  const relatedProductsContainer = document.getElementById("related-products")

  // ==========================================
  // STEP 2: Get the product ID from the URL
  // ==========================================

  // Get the URL parameters (everything after the ? in the URL)
  const urlParams = new URLSearchParams(window.location.search)

  // Get the 'id' parameter from the URL and convert it to a number
  const productId = Number.parseInt(urlParams.get("id"))

  // Check if the product ID is valid
  if (!productId) {
    // If the ID is not valid, redirect to the products page
    window.location.href = "products.html"
    return
  }

  // ==========================================
  // STEP 3: Load product details
  // ==========================================

  // Call the loadProductDetails function to fetch the product from the API
  loadProductDetails()

  // ==========================================
  // STEP 4: Define functions
  // ==========================================

  // Function to format price
  function formatPrice(price) {
    return `$${price.toFixed(2)}`
  }

  // Function to add to cart (placeholder)
  function addToCart(productId, quantity = 1) {
    console.log(`Adding product ${productId} with quantity ${quantity} to cart`)
    // Implement your cart logic here
  }

  // Function to show notification (placeholder)
  function showNotification(message) {
    alert(message)
    // Implement your notification logic here
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
      console.log("Product loaded from server:", product)
      return product
    } catch (error) {
      // Log any errors and return null
      console.error(`Error fetching product ${id}:`, error)
      return null
    }
  }

  // Function to fetch products by category from the server
  async function getProductsByCategory(category) {
    try {
      // Define the API URL
      const API_URL = "http://localhost:3000/api"

      // Fetch products in a specific category from the API
      const response = await fetch(`${API_URL}/products/category/${category}`)

      // Check if the request was successful
      if (!response.ok) {
        console.error("Error fetching products by category:", response.status)
        return []
      }

      // Parse the JSON response
      const products = await response.json()
      console.log(`Products in category '${category}' loaded from server:`, products.length)
      return products
    } catch (error) {
      // Log any errors and return an empty array
      console.error(`Error fetching products in category ${category}:`, error)
      return []
    }
  }

  // Function to load product details from the API
  async function loadProductDetails() {
    // Check if the product detail container exists
    if (!productDetailContainer) return

    try {
      // Show a loading message
      productDetailContainer.innerHTML = '<div class="loading">Loading product details...</div>'

      // Fetch the product from the API
      const product = await getProductById(productId)

      // Check if the product exists
      if (!product) {
        productDetailContainer.innerHTML = '<div class="error">Product not found.</div>'
        return
      }

      // Update the page title and breadcrumb
      document.title = `${product.name} - ShopEasy`

      // Update the product name in the header
      const productNameElement = document.getElementById("product-name")
      if (productNameElement) {
        productNameElement.textContent = product.name
      }

      // Update the product breadcrumb
      const productBreadcrumb = document.getElementById("product-breadcrumb")
      if (productBreadcrumb) {
        productBreadcrumb.textContent = product.name
      }

      // Create the HTML for the product details
      productDetailContainer.innerHTML = `
        <div class="product-detail-image">
          <img src="${product.image}" alt="${product.name}">
        </div>
        <div class="product-detail-info">
          <h1>${product.name}</h1>
          <p class="product-detail-price">${formatPrice(product.price)}</p>
          <div class="product-detail-description">
            <p>${product.description}</p>
          </div>
          <div class="product-detail-meta">
            <p><strong>Category:</strong> ${product.category.charAt(0).toUpperCase() + product.category.slice(1)}</p>
            <p><strong>SKU:</strong> ${product.id.toString().padStart(6, "0")}</p>
            <p><strong>Availability:</strong> <span class="${product.stock > 0 ? "in-stock" : "out-of-stock"}">${product.stock > 0 ? "In Stock" : "Out of Stock"}</span></p>
          </div>
          <div class="product-detail-actions">
            <div class="quantity-selector">
              <button class="decrease-quantity">-</button>
              <input type="number" value="1" min="1" max="${product.stock}" id="product-quantity">
              <button class="increase-quantity">+</button>
            </div>
            <button class="btn add-to-cart-detail" data-id="${product.id}" ${product.stock <= 0 ? "disabled" : ""}>
              ${product.stock > 0 ? "Add to Cart" : "Out of Stock"}
            </button>
          </div>
        </div>
      `

      // ==========================================
      // STEP 5: Set up event listeners for quantity buttons
      // ==========================================

      // Get the decrease quantity button
      const decreaseBtn = productDetailContainer.querySelector(".decrease-quantity")

      // Get the increase quantity button
      const increaseBtn = productDetailContainer.querySelector(".increase-quantity")

      // Get the quantity input field
      const quantityInput = productDetailContainer.querySelector("#product-quantity")

      // Get the add to cart button
      const addToCartBtn = productDetailContainer.querySelector(".add-to-cart-detail")

      // Add a click event listener to the decrease button
      decreaseBtn.addEventListener("click", () => {
        // Get the current quantity
        const quantity = Number.parseInt(quantityInput.value)

        // Decrease the quantity if it's greater than 1
        if (quantity > 1) {
          quantityInput.value = quantity - 1
        }
      })

      // Add a click event listener to the increase button
      increaseBtn.addEventListener("click", () => {
        // Get the current quantity
        const quantity = Number.parseInt(quantityInput.value)

        // Get the maximum stock
        const maxStock = Number.parseInt(product.stock)

        // Increase the quantity if it's less than the maximum stock
        if (quantity < maxStock) {
          quantityInput.value = quantity + 1
        }
      })

      // Add a click event listener to the add to cart button
      addToCartBtn.addEventListener("click", () => {
        // Get the quantity
        const quantity = Number.parseInt(quantityInput.value)

        // Add the product to the cart
        addToCart(productId, quantity)

        // Show a notification
        showNotification(`${quantity} ${product.name}${quantity > 1 ? "s" : ""} added to cart!`)
      })

      // ==========================================
      // STEP 6: Load related products
      // ==========================================

      // Load related products based on the product's category
      loadRelatedProducts(product.category)
    } catch (error) {
      // Show an error message if something goes wrong
      console.error("Error loading product details:", error)
      productDetailContainer.innerHTML =
        '<div class="error">Failed to load product details. Please try again later.</div>'
    }
  }

  // Function to load related products
  async function loadRelatedProducts(category) {
    // Check if the related products container exists
    if (!relatedProductsContainer) return

    try {
      // Show a loading message
      relatedProductsContainer.innerHTML = '<div class="loading">Loading related products...</div>'

      // Fetch products in the same category
      const relatedProducts = await getProductsByCategory(category)

      // Filter out the current product and limit to 4 products
      const filteredProducts = []

      // Loop through related products
      for (let i = 0; i < relatedProducts.length; i++) {
        // Skip the current product
        if (relatedProducts[i].id === productId) continue

        // Add the product to filtered products
        filteredProducts.push(relatedProducts[i])

        // Stop after 4 products
        if (filteredProducts.length >= 4) break
      }

      // Check if there are any related products
      if (filteredProducts.length === 0) {
        relatedProductsContainer.innerHTML = '<div class="no-products">No related products found.</div>'
        return
      }

      // Clear the container
      relatedProductsContainer.innerHTML = ""

      // Loop through each related product and create a product card
      for (let i = 0; i < filteredProducts.length; i++) {
        const product = filteredProducts[i]

        // Create a new div for the product card
        const productCard = document.createElement("div")
        productCard.className = "product-card"

        // Set the HTML content of the product card
        productCard.innerHTML = `
          <img src="${product.image}" alt="${product.name}" class="product-image">
          <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-price">${formatPrice(product.price)}</p>
            <div class="product-actions">
              <button class="btn btn-small add-to-cart" data-id="${product.id}" ${product.stock <= 0 ? "disabled" : ""}>
                ${product.stock > 0 ? "Add to Cart" : "Out of Stock"}
              </button>
              <a href="product-detail.html?id=${product.id}" class="btn btn-small btn-secondary">View Details</a>
            </div>
          </div>
        `

        // Add the product card to the container
        relatedProductsContainer.appendChild(productCard)

        // Get the Add to Cart button
        const addToCartBtn = productCard.querySelector(".add-to-cart")

        // Add a click event listener to the Add to Cart button
        if (addToCartBtn) {
          addToCartBtn.addEventListener("click", function () {
            // Get the product ID from the data-id attribute
            const productId = Number.parseInt(this.getAttribute("data-id"))

            // Add the product to the cart
            addToCart(productId)

            // Show a notification
            showNotification(`${product.name} added to cart!`)
          })
        }
      }
    } catch (error) {
      // Show an error message if something goes wrong
      console.error("Error loading related products:", error)
      relatedProductsContainer.innerHTML = '<div class="error">Failed to load related products.</div>'
    }
  }
})
