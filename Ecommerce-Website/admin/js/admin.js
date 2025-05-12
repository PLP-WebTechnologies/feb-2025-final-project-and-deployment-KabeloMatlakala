/**
 * ShopEasy Admin Dashboard JavaScript
 *
 * This file handles all the functionality for the admin dashboard including:
 * - Navigation between sections
 * - Loading and displaying products, orders, and categories
 * - CRUD operations for products and categories
 * - Order management
 * - Dashboard statistics
 */

// Wait for the page to load before running any code
document.addEventListener("DOMContentLoaded", () => {

  // Import API client functions
  const API_URL = "http://localhost:3000/api"
  // ==========================================
  // STEP 1: Authentication Check
  // ==========================================

  // For simplicity, we're using a basic authentication check
  // In a real application, you would use a more secure authentication system
  checkAuthentication()

  // ==========================================
  // STEP 2: Set up navigation
  // ==========================================

  // Get all navigation links
  const navLinks = document.querySelectorAll(".admin-nav a")

  // Add click event listeners to each navigation link
  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault()

      // Get the section to show from the data-section attribute
      const sectionToShow = this.getAttribute("data-section")

      // Hide all sections
      document.querySelectorAll(".admin-section").forEach((section) => {
        section.classList.remove("active")
      })

      // Show the selected section
      document.getElementById(sectionToShow).classList.add("active")

      // Remove active class from all nav links
      navLinks.forEach((link) => {
        link.parentElement.classList.remove("active")
      })

      // Add active class to the clicked nav link
      this.parentElement.classList.add("active")

      // Load data for the selected section
      loadSectionData(sectionToShow)
    })
  })

  // ==========================================
  // STEP 3: Set up settings navigation
  // ==========================================

  // Get all settings navigation links
  const settingsLinks = document.querySelectorAll(".settings-sidebar a")

  // Add click event listeners to each settings link
  settingsLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault()

      // Get the panel to show from the href attribute
      const panelToShow = this.getAttribute("href").substring(1)

      // Hide all panels
      document.querySelectorAll(".settings-panel").forEach((panel) => {
        panel.classList.remove("active")
      })

      // Show the selected panel
      document.getElementById(panelToShow).classList.add("active")

      // Remove active class from all settings links
      settingsLinks.forEach((link) => {
        link.parentElement.classList.remove("active")
      })

      // Add active class to the clicked settings link
      this.parentElement.classList.add("active")
    })
  })

  // ==========================================
  // STEP 4: Set up modal functionality
  // ==========================================

  // Get all modal close buttons
  const closeModalButtons = document.querySelectorAll(".close-modal")

  // Add click event listeners to each close button
  closeModalButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Get the parent modal
      const modal = this.closest(".modal")

      // Hide the modal
      modal.style.display = "none"
    })
  })

  // Close modal when clicking outside the modal content
  window.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal")) {
      e.target.style.display = "none"
    }
  })

  // ==========================================
  // STEP 5: Set up product form
  // ==========================================

  // Get the add product button
  const addProductBtn = document.getElementById("add-product-btn")

  // Get the product modal
  const productModal = document.getElementById("product-modal")

  // Get the product form
  const productForm = document.getElementById("product-form")

  // Get the cancel product button
  const cancelProductBtn = document.getElementById("cancel-product-btn")

  // Add click event listener to the add product button
  if (addProductBtn) {
    addProductBtn.addEventListener("click", () => {
      // Reset the form
      productForm.reset()

      // Set the form title
      document.getElementById("product-modal-title").textContent = "Add New Product"

      // Clear the product ID
      document.getElementById("product-id").value = ""

      // Show the modal
      productModal.style.display = "block"
    })
  }

  // Add click event listener to the cancel product button
  if (cancelProductBtn) {
    cancelProductBtn.addEventListener("click", () => {
      // Hide the modal
      productModal.style.display = "none"
    })
  }

  // Add submit event listener to the product form
  if (productForm) {
    productForm.addEventListener("submit", async (e) => {
      e.preventDefault()

      // Get the product ID
      const productId = document.getElementById("product-id").value

      // Get form data
      const formData = new FormData(productForm)

      // Create product data object
      const productData = {
        name: formData.get("name"),
        price: Number.parseFloat(formData.get("price")),
        category: formData.get("category"),
        stock: Number.parseInt(formData.get("stock")),
        image: formData.get("image") || "https://via.placeholder.com/300x300",
        description: formData.get("description"),
      }

      try {
        let result

        if (productId) {
          // Update existing product
          result = await updateProduct(productId, productData)
          showNotification("Product updated successfully!")
        } else {
          // Create new product
          result = await createProduct(productData)
          showNotification("Product created successfully!")
        }

        // Hide the modal
        productModal.style.display = "none"

        // Reload products
        loadProducts()
      } catch (error) {
        console.error("Error saving product:", error)
        showNotification("Error saving product. Please try again.", "error")
      }
    })
  }

  // ==========================================
  // STEP 6: Set up category form
  // ==========================================

  // Get the add category button
  const addCategoryBtn = document.getElementById("add-category-btn")

  // Get the category form
  const categoryForm = document.getElementById("category-form")

  // Get the cancel category button
  const cancelCategoryBtn = document.getElementById("cancel-category-btn")

  // Add click event listener to the add category button
  if (addCategoryBtn) {
    addCategoryBtn.addEventListener("click", () => {
      // Reset the form
      categoryForm.reset()

      // Set the form title
      document.getElementById("category-form-title").textContent = "Add New Category"

      // Show the form container
      document.querySelector(".category-form-container").style.display = "block"
    })
  }

  // Add click event listener to the cancel category button
  if (cancelCategoryBtn) {
    cancelCategoryBtn.addEventListener("click", () => {
      // Hide the form container
      document.querySelector(".category-form-container").style.display = "none"
    })
  }

  // Add submit event listener to the category form
  if (categoryForm) {
    categoryForm.addEventListener("submit", async (e) => {
      e.preventDefault()

      // Get form data
      const formData = new FormData(categoryForm)

      // Create category data object
      const categoryData = {
        name: formData.get("name"),
        description: formData.get("description"),
      }

      try {
        // Create new category
        const result = await createCategory(categoryData)

        // Show success message
        showNotification("Category created successfully!")

        // Reset the form
        categoryForm.reset()

        // Hide the form container
        document.querySelector(".category-form-container").style.display = "none"

        // Reload categories
        loadCategories()
      } catch (error) {
        console.error("Error saving category:", error)
        showNotification("Error saving category. Please try again.", "error")
      }
    })
  }

  // ==========================================
  // STEP 7: Set up general settings form
  // ==========================================

  // Get the general settings form
  const generalSettingsForm = document.getElementById("general-settings-form")

  // Add submit event listener to the general settings form
  if (generalSettingsForm) {
    generalSettingsForm.addEventListener("submit", (e) => {
      e.preventDefault()

      // Get form data
      const formData = new FormData(generalSettingsForm)

      // Create settings data object
      const settingsData = {
        store_name: formData.get("store_name"),
        store_email: formData.get("store_email"),
        store_phone: formData.get("store_phone"),
        store_address: formData.get("store_address"),
      }

      // For now, just show a success message
      // In a real application, you would save this to the database
      showNotification("Settings saved successfully!")
    })
  }

  // ==========================================
  // STEP 8: Set up order status form
  // ==========================================

  // Get the status form
  const statusForm = document.getElementById("status-form")

  // Get the status modal
  const statusModal = document.getElementById("status-modal")

  // Get the cancel status button
  const cancelStatusBtn = document.getElementById("cancel-status-btn")

  // Add click event listener to the cancel status button
  if (cancelStatusBtn) {
    cancelStatusBtn.addEventListener("click", () => {
      // Hide the modal
      statusModal.style.display = "none"
    })
  }

  // Add submit event listener to the status form
  if (statusForm) {
    statusForm.addEventListener("submit", async (e) => {
      e.preventDefault()

      // Get the order ID
      const orderId = document.getElementById("status-order-id").value

      // Get form data
      const formData = new FormData(statusForm)

      // Create status data object
      const statusData = {
        status: formData.get("status"),
        notes: formData.get("notes"),
      }

      try {
        // Update the order status
        await updateOrder(orderId, { status: statusData.status })

        // Show success message
        showNotification("Order status updated successfully!")

        // Hide the modal
        statusModal.style.display = "none"

        // Reload orders
        loadOrders()

        // Reload dashboard data
        loadDashboardData()
      } catch (error) {
        console.error("Error updating order status:", error)
        showNotification("Error updating order status. Please try again.", "error")
      }
    })
  }

  // ==========================================
  // STEP 9: Set up order filters
  // ==========================================

  // Get the order status filter
  const orderStatusFilter = document.getElementById("order-status-filter")

  // Get the order date filter
  const orderDateFilter = document.getElementById("order-date-filter")

  // Get the order sort filter
  const orderSortFilter = document.getElementById("order-sort")

  // Get the order search input
  const orderSearchInput = document.getElementById("order-search")

  // Get the order search button
  const orderSearchBtn = document.getElementById("order-search-btn")

  // Add change event listeners to the filters
  if (orderStatusFilter) {
    orderStatusFilter.addEventListener("change", loadOrders)
  }

  if (orderDateFilter) {
    orderDateFilter.addEventListener("change", loadOrders)
  }

  if (orderSortFilter) {
    orderSortFilter.addEventListener("change", loadOrders)
  }

  // Add click event listener to the search button
  if (orderSearchBtn) {
    orderSearchBtn.addEventListener("click", loadOrders)
  }

  // Add keyup event listener to the search input for Enter key
  if (orderSearchInput) {
    orderSearchInput.addEventListener("keyup", (e) => {
      if (e.key === "Enter") {
        loadOrders()
      }
    })
  }

  // ==========================================
  // STEP 10: Load initial data
  // ==========================================

  // Load dashboard data
  loadSectionData("dashboard")


  // ==========================================
  // STEP 11: Set up logout functionality
  // ==========================================

  // Get the logout button
  const logoutBtn = document.getElementById("logout-btn")

  // Add click event listener to the logout button
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault()

      // Clear authentication
      localStorage.removeItem("admin_authenticated")

      // Redirect to login page
      window.location.href = "login.html"
    })
  }

  // ==========================================
  // FUNCTIONS
  // ==========================================

  // Function to check authentication
  function checkAuthentication() {
    // For simplicity, we're using localStorage to check if the user is authenticated
    // In a real application, you would use a more secure authentication system
    const isAuthenticated = localStorage.getItem("admin_authenticated")

    // If not authenticated, redirect to login page
    if (!isAuthenticated) {
      // For demo purposes, we'll just set the authentication flag
      // In a real application, you would redirect to a login page
      localStorage.setItem("admin_authenticated", "true")

      // Uncomment the line below to redirect to a login page
      // window.location.href = "login.html";
    }
  }

  // Function to load data for a specific section
  function loadSectionData(section) {
    switch (section) {
      case "dashboard":
        loadDashboardData()
        break
      case "products":
        loadProducts()
        break
      case "orders":
        loadOrders()
        break
      case "categories":
        loadCategories()
        break
      case "settings":
        // Settings data is static for now
        break
    }
  }

  // Function to load dashboard data
  async function loadDashboardData() {
    try {
      // Get dashboard elements
      const totalProductsElement = document.getElementById("total-products")
      const totalOrdersElement = document.getElementById("total-orders")
      const totalRevenueElement = document.getElementById("total-revenue")
      const conversionRateElement = document.getElementById("conversion-rate")
      const recentOrdersTable = document.getElementById("recent-orders-table")

      // Show loading state
      if (totalProductsElement) totalProductsElement.textContent = "Loading..."
      if (totalOrdersElement) totalOrdersElement.textContent = "Loading..."
      if (totalRevenueElement) totalRevenueElement.textContent = "Loading..."
      if (conversionRateElement) conversionRateElement.textContent = "Loading..."
      if (recentOrdersTable)
        recentOrdersTable.innerHTML = '<tr><td colspan="6" class="loading-message">Loading recent orders...</td></tr>'

      // Fetch products
      const products = await getAllProducts()

      // Fetch orders
      const orders = await getAllOrders()

      // Calculate total revenue
      let totalRevenue = 0
      orders.forEach((order) => {
        totalRevenue += order.total_amount
      })

      // Update dashboard elements
      if (totalProductsElement) totalProductsElement.textContent = products.length
      if (totalOrdersElement) totalOrdersElement.textContent = orders.length
      if (totalRevenueElement) totalRevenueElement.textContent = formatPrice(totalRevenue)
      if (conversionRateElement) conversionRateElement.textContent = "2.5%" // Placeholder value

      // Load recent orders
      if (recentOrdersTable) {
        // Sort orders by date (newest first)
        const recentOrders = [...orders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5)

        if (recentOrders.length === 0) {
          recentOrdersTable.innerHTML = '<tr><td colspan="6" class="loading-message">No orders found.</td></tr>'
          return
        }

        // Clear the table
        recentOrdersTable.innerHTML = ""

        // Add each order to the table
        recentOrders.forEach((order) => {
          const row = document.createElement("tr")

          // Format the date
          const orderDate = new Date(order.created_at)
          const formattedDate = orderDate.toLocaleDateString() + " " + orderDate.toLocaleTimeString()

          row.innerHTML = `
              <td>#${order.id}</td>
              <td>${order.customer_name}</td>
              <td>${formattedDate}</td>
              <td>${formatPrice(order.total_amount)}</td>
              <td><span class="status-badge ${order.status}">${order.status}</span></td>
              <td>
                <button type="button" class="action-btn view-btn" data-id="${order.id}" title="View Order">👁️</button>
              </td>
            `

          // Add the row to the table
          recentOrdersTable.appendChild(row)

          // Add click event listener to the view button
          const viewBtn = row.querySelector(".view-btn")
          viewBtn.addEventListener("click", function () {
            viewOrder(this.getAttribute("data-id"))
          })
        })
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error)
      showNotification("Error loading dashboard data. Please try again.", "error")
    }
  }

  // Function to load products
  async function loadProducts() {
    try {
      // Get the products table
      const productsTable = document.getElementById("products-table")

      // Get the category filter
      const categoryFilter = document.getElementById("product-category-filter")

      // Show loading state
      if (productsTable) {
        productsTable.innerHTML = '<tr><td colspan="6" class="loading-message">Loading products...</td></tr>'
      }

      // Fetch products
      const products = await getAllProducts()

      // Fetch categories for the filter
      const categories = getUniqueCategories(products)

      // Update category filter options
      if (categoryFilter) {
        // Clear existing options except the first one (All Categories)
        while (categoryFilter.options.length > 1) {
          categoryFilter.remove(1)
        }

        // Add each category as an option
        categories.forEach((category) => {
          const option = document.createElement("option")
          option.value = category
          option.textContent = category.charAt(0).toUpperCase() + category.slice(1)
          categoryFilter.appendChild(option)
        })
      }

      // Update product category select in the form
      const productCategorySelect = document.getElementById("product-category")
      if (productCategorySelect) {
        // Clear existing options except the first one
        while (productCategorySelect.options.length > 1) {
          productCategorySelect.remove(1)
        }

        // Add each category as an option
        categories.forEach((category) => {
          const option = document.createElement("option")
          option.value = category
          option.textContent = category.charAt(0).toUpperCase() + category.slice(1)
          productCategorySelect.appendChild(option)
        })
      }

      // Check if there are products to display
      if (products.length === 0) {
        if (productsTable) {
          productsTable.innerHTML = '<tr><td colspan="6" class="loading-message">No products found.</td></tr>'
        }
        return
      }

      // Clear the table
      if (productsTable) {
        productsTable.innerHTML = ""

        // Add each product to the table
        products.forEach((product) => {
          const row = document.createElement("tr")

          row.innerHTML = `
              <td><img src="${product.image}" alt="${product.name}" width="50" height="50"></td>
              <td>${product.name}</td>
              <td>${product.category}</td>
              <td>${formatPrice(product.price)}</td>
              <td>${product.stock}</td>
              <td>
                <button type="button" class="action-btn edit-btn" data-id="${product.id}" title="Edit Product">✏️</button>
                <button type="button" class="action-btn delete-btn" data-id="${product.id}" title="Delete Product">🗑️</button>
              </td>
            `

          // Add the row to the table
          productsTable.appendChild(row)

          // Add click event listener to the edit button
          const editBtn = row.querySelector(".edit-btn")
          editBtn.addEventListener("click", function () {
            editProduct(this.getAttribute("data-id"))
          })

          // Add click event listener to the delete button
          const deleteBtn = row.querySelector(".delete-btn")
          deleteBtn.addEventListener("click", function () {
            deleteProduct(this.getAttribute("data-id"))
          })
        })
      }
    } catch (error) {
      console.error("Error loading products:", error)
      showNotification("Error loading products. Please try again.", "error")
    }
  }

  // Function to load orders
  async function loadOrders() {
    try {
      // Get the orders table
      const ordersTable = document.getElementById("orders-table")

      // Show loading state
      if (ordersTable) {
        ordersTable.innerHTML = '<tr><td colspan="7" class="loading-message">Loading orders...</td></tr>'
      }

      // Fetch orders
      const orders = await getAllOrders()

      // Check if there are orders to display
      if (orders.length === 0) {
        if (ordersTable) {
          ordersTable.innerHTML = '<tr><td colspan="7" class="loading-message">No orders found.</td></tr>'
        }
        return
      }

      // Sort orders by date (newest first)
      const sortedOrders = [...orders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

      // Clear the table
      if (ordersTable) {
        ordersTable.innerHTML = ""

        // Add each order to the table
        sortedOrders.forEach((order) => {
          const row = document.createElement("tr")

          // Format the date
          const orderDate = new Date(order.created_at)
          const formattedDate = orderDate.toLocaleDateString() + " " + orderDate.toLocaleTimeString()

          row.innerHTML = `
              <td>#${order.id}</td>
              <td>${order.customer_name}</td>
              <td>${formattedDate}</td>
              <td>${order.items ? order.items.length : "N/A"}</td>
              <td>${formatPrice(order.total_amount)}</td>
              <td><span class="status-badge ${order.status}">${order.status}</span></td>
              <td>
                <button type="button" class="action-btn view-btn" data-id="${order.id}" title="View Order">👁️</button>
                <button type="button" class="action-btn edit-btn" data-id="${order.id}" title="Update Status">📝</button>
              </td>
            `

          // Add the row to the table
          ordersTable.appendChild(row)

          // Add click event listener to the view button
          const viewBtn = row.querySelector(".view-btn")
          viewBtn.addEventListener("click", function () {
            viewOrder(this.getAttribute("data-id"))
          })

          // Add click event listener to the edit button
          const editBtn = row.querySelector(".edit-btn")
          editBtn.addEventListener("click", function () {
            updateOrderStatus(this.getAttribute("data-id"))
          })
        })
      }
    } catch (error) {
      console.error("Error loading orders:", error)
      showNotification("Error loading orders. Please try again.", "error")
    }
  }

  // Function to load categories
  async function loadCategories() {
    try {
      // Get the categories list
      const categoriesList = document.getElementById("categories-list")

      // Show loading state
      if (categoriesList) {
        categoriesList.innerHTML = '<div class="loading-message">Loading categories...</div>'
      }

      // Fetch products to extract categories
      const products = await getAllProducts()

      // Get unique categories
      const categories = getUniqueCategories(products)

      // Check if there are categories to display
      if (categories.length === 0) {
        if (categoriesList) {
          categoriesList.innerHTML = '<div class="loading-message">No categories found.</div>'
        }
        return
      }

      // Clear the list
      if (categoriesList) {
        categoriesList.innerHTML = ""

        // Add each category to the list
        categories.forEach((category) => {
          const categoryItem = document.createElement("div")
          categoryItem.className = "category-item"

          // Count products in this category
          const productCount = products.filter((product) => product.category === category).length

          categoryItem.innerHTML = `
              <div class="category-info">
                <h3>${category.charAt(0).toUpperCase() + category.slice(1)}</h3>
                <p>${productCount} products</p>
              </div>
              <div class="category-actions">
                <button type="button" class="action-btn edit-btn" data-category="${category}" title="Edit Category">✏️</button>
                <button type="button" class="action-btn delete-btn" data-category="${category}" title="Delete Category">🗑️</button>
              </div>
            `

          // Add the category item to the list
          categoriesList.appendChild(categoryItem)

          // Add click event listener to the edit button
          const editBtn = categoryItem.querySelector(".edit-btn")
          editBtn.addEventListener("click", function () {
            editCategory(this.getAttribute("data-category"))
          })

          // Add click event listener to the delete button
          const deleteBtn = categoryItem.querySelector(".delete-btn")
          deleteBtn.addEventListener("click", function () {
            deleteCategory(this.getAttribute("data-category"))
          })
        })
      }
    } catch (error) {
      console.error("Error loading categories:", error)
      showNotification("Error loading categories. Please try again.", "error")
    }
  }

  // Function to get unique categories from products
  function getUniqueCategories(products) {
    const categories = []

    products.forEach((product) => {
      if (product.category && !categories.includes(product.category)) {
        categories.push(product.category)
      }
    })

    return categories.sort()
  }

  // Function to edit a product
  async function editProduct(productId) {
    try {
      // Fetch the product
      const product = await getProductById(productId)

      if (!product) {
        showNotification("Product not found.", "error")
        return
      }

      // Get the product form
      const productForm = document.getElementById("product-form")

      // Set the form title
      document.getElementById("product-modal-title").textContent = "Edit Product"

      // Set the product ID
      document.getElementById("product-id").value = product.id

      // Set form values
      document.getElementById("product-name").value = product.name
      document.getElementById("product-price").value = product.price
      document.getElementById("product-category").value = product.category
      document.getElementById("product-stock").value = product.stock
      document.getElementById("product-image").value = product.image
      document.getElementById("product-description").value = product.description

      // Show the modal
      document.getElementById("product-modal").style.display = "block"
    } catch (error) {
      console.error("Error editing product:", error)
      showNotification("Error loading product details. Please try again.", "error")
    }
  }

  // Function to delete a product
  async function deleteProduct(productId) {
    // Confirm deletion
    if (!confirm("Are you sure you want to delete this product?")) {
      return
    }

    try {
      // Delete the product
      await deleteProductById(productId)

      // Show success message
      showNotification("Product deleted successfully!")

      // Reload products
      loadProducts()
    } catch (error) {
      console.error("Error deleting product:", error)
      showNotification("Error deleting product. Please try again.", "error")
    }
  }

  // Function to view an order
  async function viewOrder(orderId) {
    try {
      // Get the order detail content
      const orderDetailContent = document.getElementById("order-detail-content")

      // Show loading state
      if (orderDetailContent) {
        orderDetailContent.innerHTML = '<div class="loading-message">Loading order details...</div>'
      }

      // Show the modal
      document.getElementById("order-modal").style.display = "block"

      // Fetch the order
      const order = await getOrderById(orderId)

      if (!order) {
        if (orderDetailContent) {
          orderDetailContent.innerHTML = '<div class="error-message">Order not found.</div>'
        }
        return
      }

      // Format the date
      const orderDate = new Date(order.created_at)
      const formattedDate = orderDate.toLocaleDateString() + " " + orderDate.toLocaleTimeString()

      // Create the order details HTML
      let orderDetailsHTML = `
          <div class="order-details">
            <div class="order-header">
              <h3>Order #${order.id}</h3>
              <p><strong>Date:</strong> ${formattedDate}</p>
              <p><strong>Status:</strong> <span class="status-badge ${order.status}">${order.status}</span></p>
            </div>
            
            <div class="order-customer">
              <h4>Customer Information</h4>
              <p><strong>Name:</strong> ${order.customer_name}</p>
              <p><strong>Email:</strong> ${order.customer_email}</p>
              <p><strong>Address:</strong> ${order.customer_address}</p>
            </div>
            
            <div class="order-items">
              <h4>Order Items</h4>
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
        `

      // Check if order has items
      if (order.items && order.items.length > 0) {
        // Add each item to the table
        order.items.forEach((item) => {
          orderDetailsHTML += `
              <tr>
                <td>${item.name || `Product #${item.product_id}`}</td>
                <td>${formatPrice(item.price)}</td>
                <td>${item.quantity}</td>
                <td>${formatPrice(item.price * item.quantity)}</td>
              </tr>
            `
        })
      } else {
        orderDetailsHTML += `
            <tr>
              <td colspan="4" class="loading-message">No items found for this order.</td>
            </tr>
          `
      }

      orderDetailsHTML += `
                </tbody>
              </table>
            </div>
            
            <div class="order-summary">
              <h4>Order Summary</h4>
              <p><strong>Subtotal:</strong> ${formatPrice(order.total_amount * 0.9)}</p>
              <p><strong>Tax:</strong> ${formatPrice(order.total_amount * 0.1)}</p>
              <p><strong>Total:</strong> ${formatPrice(order.total_amount)}</p>
            </div>
            
            <div class="order-actions">
              <button type="button" id="update-status-btn" class="primary-btn" data-id="${order.id}">Update Status</button>
            </div>
          </div>
        `

      // Update the order detail content
      if (orderDetailContent) {
        orderDetailContent.innerHTML = orderDetailsHTML

        // Add click event listener to the update status button
        const updateStatusBtn = orderDetailContent.querySelector("#update-status-btn")
        if (updateStatusBtn) {
          updateStatusBtn.addEventListener("click", function () {
            // Hide the order modal
            document.getElementById("order-modal").style.display = "none"

            // Update the order status
            updateOrderStatus(this.getAttribute("data-id"))
          })
        }
      }
    } catch (error) {
      console.error("Error viewing order:", error)
      showNotification("Error loading order details. Please try again.", "error")
    }
  }

  // Function to update order status
  function updateOrderStatus(orderId) {
    // For simplicity, we'll just show an alert
    // In a real application, you would show a modal with a form to update the status
    const newStatus = prompt("Enter new status (pending, processing, shipped, delivered, cancelled):")

    if (!newStatus) return

    // Validate the status
    const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"]
    if (!validStatuses.includes(newStatus.toLowerCase())) {
      showNotification("Invalid status. Please enter a valid status.", "error")
      return
    }

    // Update the order status
    updateOrder(orderId, { status: newStatus.toLowerCase() })
      .then(() => {
        showNotification("Order status updated successfully!")
        loadOrders()
        loadDashboardData()
      })
      .catch((error) => {
        console.error("Error updating order status:", error)
        showNotification("Error updating order status. Please try again.", "error")
      })
  }

  // Function to edit a category
  function editCategory(category) {
    // Get the category form
    const categoryForm = document.getElementById("category-form")

    // Set the form title
    document.getElementById("category-form-title").textContent = "Edit Category"

    // Set form values
    document.getElementById("category-name").value = category
    document.getElementById("category-description").value = "" // We don't have descriptions stored yet

    // Show the form container
    document.querySelector(".category-form-container").style.display = "block"
  }

  // Function to delete a category
  function deleteCategory(category) {
    // Confirm deletion
    if (!confirm(`Are you sure you want to delete the category "${category}"?`)) {
      return
    }

    // For simplicity, we'll just show a success message
    // In a real application, you would update all products in this category
    showNotification(`Category "${category}" deleted successfully!`)

    // Reload categories
    loadCategories()
  }

  // Function to create a product
  async function createProduct(productData) {
    try {
      const API_URL = "http://localhost:3000/api"

      // Send a POST request to create a product
      const response = await fetch(`${API_URL}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      })

      // Check if the request was successful
      if (!response.ok) {
        throw new Error(`Failed to create product: ${response.status}`)
      }

      // Parse the JSON response
      return await response.json()
    } catch (error) {
      console.error("Error creating product:", error)
      throw error
    }
  }

  // Function to update a product
  async function updateProduct(productId, productData) {
    try {
      // const API_URL = "http://localhost:3000/api"

      // Send a PUT request to update a product
      const response = await fetch(`${API_URL}/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      })

      // Check if the request was successful
      if (!response.ok) {
        throw new Error(`Failed to update product: ${response.status}`)
      }

      // Parse the JSON response
      return await response.json()
    } catch (error) {
      console.error("Error updating product:", error)
      throw error
    }
  }

  // Function to delete a product
  async function deleteProductById(productId) {
    try {
      // const API_URL = "http://localhost:3000/api"

      // Send a DELETE request to delete a product
      const response = await fetch(`${API_URL}/products/${productId}`, {
        method: "DELETE",
      })

      // Check if the request was successful
      if (!response.ok) {
        throw new Error(`Failed to delete product: ${response.status}`)
      }

      // Parse the JSON response
      return await response.json()
    } catch (error) {
      console.error("Error deleting product:", error)
      throw error
    }
  }

  // Function to create a category
  async function createCategory(categoryData) {
    // For simplicity, we'll just return the category data
    // In a real application, you would send a request to the server
    return categoryData
  }

  // Function to update an order
  async function updateOrder(orderId, orderData) {
    try {
      // const API_URL = "http://localhost:3000/api"

      // Send a PUT request to update an order
      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      })

      // Check if the request was successful
      if (!response.ok) {
        throw new Error(`Failed to update order: ${response.status}`)
      }

      // Parse the JSON response
      return await response.json()
    } catch (error) {
      console.error("Error updating order:", error)
      throw error
    }
  }

  // Function to show a notification
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

  // Use the API client functions directly
  // These functions are already defined in api-client.js which is imported in the HTML
  async function getAllProducts() {
    try {
      const response = await fetch(`${API_URL}/products`)
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error("Error fetching products:", error)
      showNotification("Error fetching products. Please try again.", "error")
      return []
    }
  }

  async function getProductById(productId) {
    try {
      const response = await fetch(`${API_URL}/products/${productId}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch product: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error("Error fetching product:", error)
      showNotification("Error fetching product. Please try again.", "error")
      return null
    }
  }

  async function getAllOrders() {
    try {
      const response = await fetch(`${API_URL}/orders`)
      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error("Error fetching orders:", error)
      showNotification("Error fetching orders. Please try again.", "error")
      return []
    }
  }

  async function getOrderById(orderId) {
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch order: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error("Error fetching order:", error)
      showNotification("Error fetching order. Please try again.", "error")
      return null
    }
  }

  function formatPrice(price) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }
})
