document.addEventListener("DOMContentLoaded", () => {
    // Mock data (replace with actual data fetching)
    const products = [
      {
        id: 1,
        name: "Product 1",
        price: 20,
        image: "placeholder.jpg",
        description: "Description 1",
        category: "Category A",
      },
      {
        id: 2,
        name: "Product 2",
        price: 30,
        image: "placeholder.jpg",
        description: "Description 2",
        category: "Category B",
      },
      {
        id: 3,
        name: "Product 3",
        price: 40,
        image: "placeholder.jpg",
        description: "Description 3",
        category: "Category A",
      },
      {
        id: 4,
        name: "Product 4",
        price: 50,
        image: "placeholder.jpg",
        description: "Description 4",
        category: "Category C",
      },
      {
        id: 5,
        name: "Product 5",
        price: 60,
        image: "placeholder.jpg",
        description: "Description 5",
        category: "Category B",
      },
      {
        id: 6,
        name: "Product 6",
        price: 70,
        image: "placeholder.jpg",
        description: "Description 6",
        category: "Category C",
      },
    ]
  
    // Helper function to get products by category
    function getProductsByCategory(category) {
      if (category === "all") {
        return products
      }
      return products.filter((product) => product.category === category)
    }
  
    // Helper function to format price
    function formatPrice(price) {
      return "$" + price.toFixed(2)
    }
  
    // Helper function to get product by ID
    function getProductById(id) {
      return products.find((product) => product.id === id)
    }
  
    // Initialize cart from localStorage
    let cart = JSON.parse(localStorage.getItem("cart")) || []
    updateCartCount()
  
    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector(".mobile-menu-btn")
    const navLinks = document.querySelector(".nav-links")
  
    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener("click", () => {
        navLinks.classList.toggle("show")
      })
    }
  
    // Cart sidebar toggle
    const cartIcon = document.querySelector(".cart-icon")
    const cartSidebar = document.querySelector(".cart-sidebar")
    const overlay = document.querySelector(".overlay")
    const closeCart = document.querySelector(".close-cart")
  
    if (cartIcon) {
      cartIcon.addEventListener("click", () => {
        cartSidebar.classList.add("open")
        overlay.classList.add("show")
        renderCartItems()
      })
    }
  
    if (closeCart) {
      closeCart.addEventListener("click", () => {
        cartSidebar.classList.remove("open")
        overlay.classList.remove("show")
      })
    }
  
    if (overlay) {
      overlay.addEventListener("click", () => {
        cartSidebar.classList.remove("open")
        overlay.classList.remove("show")
      })
    }
  
    // Load featured products on homepage
    const featuredProductsContainer = document.getElementById("featured-products")
    if (featuredProductsContainer) {
      const featuredProducts = products.slice(0, 4) // Get first 4 products
      renderProducts(featuredProducts, featuredProductsContainer)
    }
  
    // Load all products on products page
    const allProductsContainer = document.getElementById("all-products")
    if (allProductsContainer) {
      renderProducts(products, allProductsContainer)
  
      // Set up category filter
      const categoryFilter = document.getElementById("category-filter")
      if (categoryFilter) {
        // Check if there's a category in URL
        const urlParams = new URLSearchParams(window.location.search)
        const categoryParam = urlParams.get("category")
  
        if (categoryParam) {
          categoryFilter.value = categoryParam
          const filteredProducts = getProductsByCategory(categoryParam)
          renderProducts(filteredProducts, allProductsContainer)
        }
  
        categoryFilter.addEventListener("change", function () {
          const selectedCategory = this.value
          const filteredProducts = getProductsByCategory(selectedCategory)
          renderProducts(filteredProducts, allProductsContainer)
        })
      }
  
      // Set up sort filter
      const sortFilter = document.getElementById("sort-filter")
      if (sortFilter) {
        sortFilter.addEventListener("change", function () {
          const selectedSort = this.value
          const categoryFilter = document.getElementById("category-filter")
          const selectedCategory = categoryFilter ? categoryFilter.value : "all"
          const filteredProducts = getProductsByCategory(selectedCategory)
  
          switch (selectedSort) {
            case "price-low":
              filteredProducts.sort((a, b) => a.price - b.price)
              break
            case "price-high":
              filteredProducts.sort((a, b) => b.price - a.price)
              break
            case "name-asc":
              filteredProducts.sort((a, b) => a.name.localeCompare(b.name))
              break
            case "name-desc":
              filteredProducts.sort((a, b) => b.name.localeCompare(a.name))
              break
            default:
              // Default sorting (featured)
              break
          }
  
          renderProducts(filteredProducts, allProductsContainer)
        })
      }
    }
  
    // Newsletter form submission
    const newsletterForm = document.getElementById("newsletter-form")
    if (newsletterForm) {
      newsletterForm.addEventListener("submit", function (e) {
        e.preventDefault()
        const emailInput = this.querySelector('input[type="email"]')
        alert(`Thank you for subscribing with ${emailInput.value}!`)
        emailInput.value = ""
      })
    }
  
    // Checkout button in cart
    const checkoutBtn = document.querySelector(".checkout-btn")
    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", () => {
        if (cart.length === 0) {
          alert("Your cart is empty!")
        } else {
          window.location.href = "checkout.html"
        }
      })
    }
  
    // Function to render products
    function renderProducts(productsArray, container) {
      container.innerHTML = ""
  
      productsArray.forEach((product) => {
        const productCard = document.createElement("div")
        productCard.className = "product-card"
        productCard.innerHTML = `
                  <img src="${product.image}" alt="${product.name}" class="product-image">
                  <div class="product-info">
                      <h3 class="product-name">${product.name}</h3>
                      <p class="product-price">${formatPrice(product.price)}</p>
                      <p class="product-description">${product.description}</p>
                      <div class="product-actions">
                          <button class="btn btn-small add-to-cart" data-id="${product.id}">Add to Cart</button>
                          <a href="product-detail.html?id=${product.id}" class="btn btn-small btn-secondary">View Details</a>
                      </div>
                  </div>
              `
        container.appendChild(productCard)
  
        // Add event listener to Add to Cart button
        const addToCartBtn = productCard.querySelector(".add-to-cart")
        addToCartBtn.addEventListener("click", function () {
          const productId = Number.parseInt(this.getAttribute("data-id"))
          addToCart(productId)
        })
      })
    }
  
    // Function to render cart items
    function renderCartItems() {
      const cartItemsContainer = document.querySelector(".cart-items")
      const totalPriceElement = document.querySelector(".total-price")
  
      if (cartItemsContainer) {
        cartItemsContainer.innerHTML = ""
  
        if (cart.length === 0) {
          cartItemsContainer.innerHTML = "<p>Your cart is empty.</p>"
          totalPriceElement.textContent = formatPrice(0)
          return
        }
  
        let totalPrice = 0
  
        cart.forEach((item) => {
          const product = getProductById(item.id)
          const itemTotal = product.price * item.quantity
          totalPrice += itemTotal
  
          const cartItem = document.createElement("div")
          cartItem.className = "cart-item"
          cartItem.innerHTML = `
                      <img src="${product.image}" alt="${product.name}" class="cart-item-image">
                      <div class="cart-item-details">
                          <h3 class="cart-item-name">${product.name}</h3>
                          <p class="cart-item-price">${formatPrice(product.price)}</p>
                          <div class="cart-item-quantity">
                              <button class="quantity-btn decrease-quantity" data-id="${product.id}">-</button>
                              <span>${item.quantity}</span>
                              <button class="quantity-btn increase-quantity" data-id="${product.id}">+</button>
                          </div>
                          <button class="cart-item-remove" data-id="${product.id}">Remove</button>
                      </div>
                  `
          cartItemsContainer.appendChild(cartItem)
  
          // Add event listeners to quantity buttons
          const decreaseBtn = cartItem.querySelector(".decrease-quantity")
          const increaseBtn = cartItem.querySelector(".increase-quantity")
          const removeBtn = cartItem.querySelector(".cart-item-remove")
  
          decreaseBtn.addEventListener("click", function () {
            const productId = Number.parseInt(this.getAttribute("data-id"))
            updateCartItemQuantity(productId, -1)
          })
  
          increaseBtn.addEventListener("click", function () {
            const productId = Number.parseInt(this.getAttribute("data-id"))
            updateCartItemQuantity(productId, 1)
          })
  
          removeBtn.addEventListener("click", function () {
            const productId = Number.parseInt(this.getAttribute("data-id"))
            removeFromCart(productId)
          })
        })
  
        totalPriceElement.textContent = formatPrice(totalPrice)
      }
    }
  
    // Function to add product to cart
    function addToCart(productId) {
      const product = getProductById(productId)
  
      if (!product) {
        console.error("Product not found")
        return
      }
  
      const existingItem = cart.find((item) => item.id === productId)
  
      if (existingItem) {
        existingItem.quantity += 1
      } else {
        cart.push({
          id: productId,
          quantity: 1,
        })
      }
  
      // Save cart to localStorage
      localStorage.setItem("cart", JSON.stringify(cart))
  
      // Update cart count
      updateCartCount()
  
      // Show confirmation
      alert(`${product.name} added to cart!`)
    }
  
    // Function to update cart item quantity
    function updateCartItemQuantity(productId, change) {
      const itemIndex = cart.findIndex((item) => item.id === productId)
  
      if (itemIndex === -1) {
        return
      }
  
      cart[itemIndex].quantity += change
  
      if (cart[itemIndex].quantity <= 0) {
        cart.splice(itemIndex, 1)
      }
  
      // Save cart to localStorage
      localStorage.setItem("cart", JSON.stringify(cart))
  
      // Update cart count
      updateCartCount()
  
      // Re-render cart items
      renderCartItems()
    }
  
    // Function to remove item from cart
    function removeFromCart(productId) {
      cart = cart.filter((item) => item.id !== productId)
  
      // Save cart to localStorage
      localStorage.setItem("cart", JSON.stringify(cart))
  
      // Update cart count
      updateCartCount()
  
      // Re-render cart items
      renderCartItems()
    }
  
    // Function to update cart count
    function updateCartCount() {
      const cartCountElement = document.querySelector(".cart-count")
  
      if (cartCountElement) {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0)
        cartCountElement.textContent = totalItems
      }
    }
  })
s  