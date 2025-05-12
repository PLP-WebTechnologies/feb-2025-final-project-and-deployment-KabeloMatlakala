/**
 * Products Page JavaScript
 *
 * This file handles the functionality of the products listing page.
 * It loads products from the API, filters them, and renders them on the page.
 */

document.addEventListener("DOMContentLoaded", async () => {
  // ==========================================
  // STEP 1: Get references to HTML elements
  // ==========================================

  // Get the container where products will be displayed
  const productsContainer = document.getElementById("all-products")

  // Get the category filter dropdown
  const categoryFilter = document.getElementById("category-filter")

  // Get the sort filter dropdown
  const sortFilter = document.getElementById("sort-filter")

  // Get the search input field
  const searchInput = document.getElementById("search-input")

  // Get the search form
  const searchForm = document.getElementById("search-form")

  // ==========================================
  // STEP 2: Set up variables to store data
  // ==========================================

  // Array to store all products from the API
  let allProducts = []

  // Array to store filtered products (based on category, sort, search)
  let filteredProducts = []

  // Declare functions that are used but not defined in this file.
  // These functions are assumed to be defined in other files and available globally.
  // async function getAllProducts() {
  //   // Placeholder implementation. Replace with actual API call.
  //   return new Promise((resolve) => {
  //     setTimeout(() => {
  //       resolve([
  //         {
  //           id: 1,
  //           name: "Product 1",
  //           price: 20,
  //           description: "Description 1",
  //           category: "Category1",
  //           image: "image1.jpg",
  //           stock: 5,
  //         },
  //         {
  //           id: 2,
  //           name: "Product 2",
  //           price: 30,
  //           description: "Description 2",
  //           category: "Category2",
  //           image: "image2.jpg",
  //           stock: 0,
  //         },
  //         {
  //           id: 3,
  //           name: "Product 3",
  //           price: 40,
  //           description: "Description 3",
  //           category: "Category1",
  //           image: "image3.jpg",
  //           stock: 3,
  //         },
  //       ])
  //     }, 500)
  //   })
  // }

  // function formatPrice(price) {
  //   return `$${price.toFixed(2)}`
  // }

  // function addToCart(productId) {
  //   console.log(`Adding product with ID ${productId} to cart`)
  // }

  // function updateCartCountDisplay() {
  //   console.log("Updating cart count display")
  // }

  // function showNotification(message) {
  //   alert(message)
  // }

  // ==========================================
  // STEP 3: Load products when the page loads
  // ==========================================

  // Call the loadProducts function to fetch products from the API
  loadProducts()

  // ==========================================
  // STEP 4: Set up event listeners for filters
  // ==========================================

  // When the category filter changes, filter the products
  if (categoryFilter) {
    categoryFilter.addEventListener("change", filterProducts)
  }

  // When the sort filter changes, filter the products
  if (sortFilter) {
    sortFilter.addEventListener("change", filterProducts)
  }

  // When the search form is submitted, filter the products
  if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
      // Prevent the form from submitting normally
      e.preventDefault()

      // Filter the products based on the search input
      filterProducts()
    })
  }

  // ==========================================
  // STEP 5: Define functions
  // ==========================================

  // Function to load products from the API
  async function loadProducts() {
    // Check if the products container exists
    if (!productsContainer) return

    try {
      // Show a loading message
      productsContainer.innerHTML = '<div class="loading">Loading products...</div>'

      // Fetch products from the API using the getAllProducts function from api-client.js
      allProducts = await window.getAllProducts()

      // Copy all products to filtered products initially
      filteredProducts = [...allProducts]

      // Set up category filter options
      if (categoryFilter) {
        populateCategoryFilter()
      }

      // Check for URL parameters (category and search)
      const urlParams = new URLSearchParams(window.location.search)
      const categoryParam = urlParams.get("category")
      const searchParam = urlParams.get("search")

      // Apply URL filters if they exist
      if (categoryParam && categoryFilter) {
        // Find the option with the matching category value
        const categoryOption = Array.from(categoryFilter.options).find(
          (option) => option.value.toLowerCase() === categoryParam.toLowerCase(),
        )

        // If the option exists, set it as selected
        if (categoryOption) {
          categoryFilter.value = categoryOption.value
        }
      }

      if (searchParam && searchInput) {
        searchInput.value = searchParam
      }

      // Filter products based on URL parameters
      filterProducts()
    } catch (error) {
      // Show an error message if something goes wrong
      console.error("Error loading products:", error)
      productsContainer.innerHTML = '<div class="error">Failed to load products. Please try again later.</div>'
    }
  }

  // Function to populate the category filter dropdown
  function populateCategoryFilter() {
    // Get unique categories from all products
    const categories = []

    // Loop through all products
    for (let i = 0; i < allProducts.length; i++) {
      const category = allProducts[i].category

      // If the category is not already in the categories array, add it
      if (category && !categories.includes(category)) {
        categories.push(category)
      }
    }

    // Clear existing options except the first one (All Categories)
    while (categoryFilter.options.length > 1) {
      categoryFilter.remove(1)
    }

    // Add each category as an option in the dropdown
    for (let i = 0; i < categories.length; i++) {
      const category = categories[i]

      // Create a new option element
      const option = document.createElement("option")
      option.value = category

      // Capitalize the first letter of the category
      option.textContent = category.charAt(0).toUpperCase() + category.slice(1)

      // Add the option to the dropdown
      categoryFilter.appendChild(option)
    }
  }

  // Function to filter products based on category, sort, and search
  function filterProducts() {
    // Check if the products container exists
    if (!productsContainer) return

    // Get filter values
    const selectedCategory = categoryFilter ? categoryFilter.value : "all"
    const selectedSort = sortFilter ? sortFilter.value : "default"
    const searchQuery = searchInput ? searchInput.value.toLowerCase().trim() : ""

    // Filter products by category and search query
    filteredProducts = []

    // Loop through all products
    for (let i = 0; i < allProducts.length; i++) {
      const product = allProducts[i]

      // Check if the product matches the selected category
      const categoryMatch = selectedCategory === "all" || product.category === selectedCategory

      // Check if the product matches the search query
      let searchMatch = true

      if (searchQuery) {
        searchMatch =
          product.name.toLowerCase().includes(searchQuery) ||
          (product.description && product.description.toLowerCase().includes(searchQuery)) ||
          (product.category && product.category.toLowerCase().includes(searchQuery))
      }

      // If the product matches both category and search, add it to filtered products
      if (categoryMatch && searchMatch) {
        filteredProducts.push(product)
      }
    }

    // Sort the filtered products
    sortProducts(selectedSort)

    // Update the URL with the current filters
    updateURL(selectedCategory, searchQuery)

    // Render the filtered products
    renderProducts()
  }

  // Function to sort products
  function sortProducts(sortOption) {
    // Sort products based on the selected sort option
    switch (sortOption) {
      case "price-low":
        // Sort by price, lowest to highest
        filteredProducts.sort((a, b) => a.price - b.price)
        break

      case "price-high":
        // Sort by price, highest to lowest
        filteredProducts.sort((a, b) => b.price - a.price)
        break

      case "name-asc":
        // Sort by name, A to Z
        filteredProducts.sort((a, b) => a.name.localeCompare(b.name))
        break

      case "name-desc":
        // Sort by name, Z to A
        filteredProducts.sort((a, b) => b.name.localeCompare(a.name))
        break

      default:
        // Default sorting (featured or newest)
        // No sorting needed
        break
    }
  }

  // Function to update the URL with the current filters
  function updateURL(category, search) {
    // Create a new URLSearchParams object
    const params = new URLSearchParams()

    // Add the category parameter if it's not 'all'
    if (category && category !== "all") {
      params.set("category", category)
    }

    // Add the search parameter if it's not empty
    if (search) {
      params.set("search", search)
    }

    // Create the new URL
    const newURL = `${window.location.pathname}${params.toString() ? "?" + params.toString() : ""}`

    // Update the URL without reloading the page
    window.history.replaceState({}, "", newURL)
  }

  // Function to render the filtered products
  function renderProducts() {
    // Check if the products container exists
    if (!productsContainer) return

    // Clear the container
    productsContainer.innerHTML = ""

    // Check if there are products to display
    if (filteredProducts.length === 0) {
      productsContainer.innerHTML =
        '<div class="no-products">No products found. Try a different search or category.</div>'
      return
    }

    // Loop through each product and create a product card
    for (let i = 0; i < filteredProducts.length; i++) {
      const product = filteredProducts[i]

      // Create a new div for the product card
      const productCard = document.createElement("div")
      productCard.className = "product-card"

      // Handle missing description
      const description = product.description || "No description available"
      const truncatedDescription = description.length > 100 ? description.substring(0, 100) + "..." : description

      // Set the HTML content of the product card
      productCard.innerHTML = `
        <img src="${product.image}" alt="${product.name}" class="product-image">
        <div class="product-info">
          <h3 class="product-name">${product.name}</h3>
          <p class="product-price">${window.formatPrice(product.price)}</p>
          <p class="product-description">${truncatedDescription}</p>
          <div class="product-actions">
            <button class="btn btn-small add-to-cart" data-id="${product.id}" ${product.stock <= 0 ? "disabled" : ""}>
              ${product.stock > 0 ? "Add to Cart" : "Out of Stock"}
            </button>
            <a href="product-detail.html?id=${product.id}" class="btn btn-small btn-secondary">View Details</a>
          </div>
        </div>
      `

      // Add the product card to the container
      productsContainer.appendChild(productCard)

      // Get the Add to Cart button
      const addToCartBtn = productCard.querySelector(".add-to-cart")

      // Add a click event listener to the Add to Cart button
      if (addToCartBtn) {
        addToCartBtn.addEventListener("click", function () {
          // Get the product ID from the data-id attribute
          const productId = Number.parseInt(this.getAttribute("data-id"))

          // Add the product to the cart using the addToCart function from api-client.js
          window.addToCart(productId)

          // Update the cart count display
          window.updateCartCountDisplay()

          // Show a notification
          window.showNotification(`${product.name} added to cart!`)

          // Open the cart sidebar to show the added item
          if (window.openCartSidebar) {
            window.openCartSidebar()
          }
        })
      }
    }
  }
})
