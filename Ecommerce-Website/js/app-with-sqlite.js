import { 
    getAllProducts, 
    getProductById, 
    getProductsByCategory,
    createOrder
  } from '../../Backend/api-client.js';
  
  document.addEventListener('DOMContentLoaded', async function() {
    // Initialize cart from localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    updateCartCount();
    
    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener('click', function() {
        navLinks.classList.toggle('show');
      });
    }
    
    // Cart sidebar toggle
    const cartIcon = document.querySelector('.cart-icon');
    const cartSidebar = document.querySelector('.cart-sidebar');
    const overlay = document.querySelector('.overlay');
    const closeCart = document.querySelector('.close-cart');
    
    if (cartIcon) {
      cartIcon.addEventListener('click', function() {
        cartSidebar.classList.add('open');
        overlay.classList.add('show');
        renderCartItems();
      });
    }
    
    if (closeCart) {
      closeCart.addEventListener('click', function() {
        cartSidebar.classList.remove('open');
        overlay.classList.remove('show');
      });
    }
    
    if (overlay) {
      overlay.addEventListener('click', function() {
        cartSidebar.classList.remove('open');
        overlay.classList.remove('show');
      });
    }
    
    // Load featured products on homepage
    const featuredProductsContainer = document.getElementById('featured-products');
    if (featuredProductsContainer) {
      try {
        const products = await getAllProducts();
        const featuredProducts = products.slice(0, 4); // Get first 4 products
        renderProducts(featuredProducts, featuredProductsContainer);
      } catch (error) {
        console.error('Error loading featured products:', error);
        featuredProductsContainer.innerHTML = '<p>Failed to load products. Please try again later.</p>';
      }
    }
    
    // Load all products on products page
    const allProductsContainer = document.getElementById('all-products');
    if (allProductsContainer) {
      try {
        const products = await getAllProducts();
        renderProducts(products, allProductsContainer);
        
        // Set up category filter
        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) {
          // Get unique categories
          const categories = [...new Set(products.map(product => product.category))];
          
          // Add category options
          categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
            categoryFilter.appendChild(option);
          });
          
          // Check if there's a category in URL
          const urlParams = new URLSearchParams(window.location.search);
          const categoryParam = urlParams.get('category');
          
          if (categoryParam) {
            categoryFilter.value = categoryParam;
            const filteredProducts = await getProductsByCategory(categoryParam);
            renderProducts(filteredProducts, allProductsContainer);
          }
          
          categoryFilter.addEventListener('change', async function() {
            const selectedCategory = this.value;
            let filteredProducts;
            
            if (selectedCategory === 'all') {
              filteredProducts = await getAllProducts();
            } else {
              filteredProducts = await getProductsByCategory(selectedCategory);
            }
            
            renderProducts(filteredProducts, allProductsContainer);
          });
        }
        
        // Set up sort filter
        const sortFilter = document.getElementById('sort-filter');
        if (sortFilter) {
          sortFilter.addEventListener('change', async function() {
            const selectedSort = this.value;
            const categoryFilter = document.getElementById('category-filter');
            const selectedCategory = categoryFilter ? categoryFilter.value : 'all';
            
            let filteredProducts;
            if (selectedCategory === 'all') {
              filteredProducts = await getAllProducts();
            } else {
              filteredProducts = await getProductsByCategory(selectedCategory);
            }
            
            switch(selectedSort) {
              case 'price-low':
                filteredProducts.sort((a, b) => a.price - b.price);
                break;
              case 'price-high':
                filteredProducts.sort((a, b) => b.price - a.price);
                break;
              case 'name-asc':
                filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
                break;
              case 'name-desc':
                filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
                break;
              default:
                // Default sorting (featured)
                break;
            }
            
            renderProducts(filteredProducts, allProductsContainer);
          });
        }
      } catch (error) {
        console.error('Error loading products:', error);
        allProductsContainer.innerHTML = '<p>Failed to load products. Please try again later.</p>';
      }
    }
    
    // Load product detail page
    const productDetailContainer = document.getElementById('product-detail-container');
    if (productDetailContainer) {
      const urlParams = new URLSearchParams(window.location.search);
      const productId = urlParams.get('id');
      
      if (!productId) {
        window.location.href = 'products.html';
        return;
      }
      
      try {
        const product = await getProductById(productId);
        
        if (!product) {
          window.location.href = 'products.html';
          return;
        }
        
        // Update page title and breadcrumb
        document.title = `${product.name} - ShopEasy`;
        const productNameElement = document.getElementById('product-name');
        if (productNameElement) {
          productNameElement.textContent = product.name;
        }
        
        productDetailContainer.innerHTML = `
          <div class="product-detail-image">
            <img src="${product.image}" alt="${product.name}">
          </div>
          <div class="product-detail-info">
            <h1>${product.name}</h1>
            <p class="product-detail-price">$${product.price.toFixed(2)}</p>
            <div class="product-detail-description">
              <p>${product.description}</p>
            </div>
            <div class="product-detail-meta">
              <p><strong>Category:</strong> ${product.category.charAt(0).toUpperCase() + product.category.slice(1)}</p>
              <p><strong>SKU:</strong> ${product.id.toString().padStart(6, '0')}</p>
              <p><strong>Availability:</strong> <span class="in-stock">${product.stock > 0 ? 'In Stock' : 'Out of Stock'}</span></p>
            </div>
            <div class="product-detail-actions">
              <div class="quantity-selector">
                <button class="decrease-quantity">-</button>
                <input type="number" value="1" min="1" max="${product.stock}" id="product-quantity">
                <button class="increase-quantity">+</button>
              </div>
              <button class="btn add-to-cart-detail" data-id="${product.id}" ${product.stock <= 0 ? 'disabled' : ''}>
                ${product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </button>
            </div>
          </div>
        `;
        
        // Add event listeners to quantity buttons
        const decreaseBtn = productDetailContainer.querySelector('.decrease-quantity');
        const increaseBtn = productDetailContainer.querySelector('.increase-quantity');
        const quantityInput = productDetailContainer.querySelector('#product-quantity');
        const addToCartBtn = productDetailContainer.querySelector('.add-to-cart-detail');
        
        decreaseBtn.addEventListener('click', function() {
          let quantity = parseInt(quantityInput.value);
          if (quantity > 1) {
            quantityInput.value = quantity - 1;
          }
        });
        
        increaseBtn.addEventListener('click', function() {
          let quantity = parseInt(quantityInput.value);
          const maxStock = parseInt(product.stock);
          if (quantity < maxStock) {
            quantityInput.value = quantity + 1;
          }
        });
        
        addToCartBtn.addEventListener('click', function() {
          const productId = parseInt(this.getAttribute('data-id'));
          const quantity = parseInt(quantityInput.value);
          addToCartWithQuantity(productId, quantity, product);
        });
        
        // Load related products
        const relatedProductsContainer = document.getElementById('related-products');
        if (relatedProductsContainer) {
          const relatedProducts = await getProductsByCategory(product.category);
          const filteredRelated = relatedProducts
            .filter(p => p.id !== parseInt(productId))
            .slice(0, 4);
          
          renderProducts(filteredRelated, relatedProductsContainer);
        }
      } catch (error) {
        console.error('Error loading product details:', error);
        productDetailContainer.innerHTML = '<p>Failed to load product details. Please try again later.</p>';
      }
    }
    
    // Newsletter form submission
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
      newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const emailInput = this.querySelector('input[type="email"]');
        alert(`Thank you for subscribing with ${emailInput.value}!`);
        emailInput.value = '';
      });
    }
    
    // Checkout button in cart
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', function() {
        if (cart.length === 0) {
          alert('Your cart is empty!');
        } else {
          window.location.href = 'checkout.html';
        }
      });
    }
    
    // Handle checkout form submission
    const shippingForm = document.getElementById('shipping-form');
    if (shippingForm) {
      try {
        // Render checkout items
        const checkoutItemsContainer = document.getElementById('checkout-items');
        const subtotalElement = document.getElementById('checkout-subtotal');
        const shippingElement = document.getElementById('checkout-shipping');
        const taxElement = document.getElementById('checkout-tax');
        const totalElement = document.getElementById('checkout-total');
        
        if (checkoutItemsContainer) {
          let subtotal = 0;
          const cartItems = [];
          
          for (const item of cart) {
            const product = await getProductById(item.id);
            const itemTotal = product.price * item.quantity;
            subtotal += itemTotal;
            
            cartItems.push({
              id: product.id,
              name: product.name,
              price: product.price,
              quantity: item.quantity,
              total: itemTotal
            });
            
            const checkoutItem = document.createElement('div');
            checkoutItem.className = 'checkout-item';
            checkoutItem.innerHTML = `
              <img src="${product.image}" alt="${product.name}" class="checkout-item-image">
              <div class="checkout-item-details">
                <h3 class="checkout-item-name">${product.name}</h3>
                <p class="checkout-item-price">$${product.price.toFixed(2)} x ${item.quantity}</p>
                <p class="checkout-item-total">$${itemTotal.toFixed(2)}</p>
              </div>
            `;
            checkoutItemsContainer.appendChild(checkoutItem);
          }
          
          // Calculate order totals
          const shipping = subtotal > 50 ? 0 : 10;
          const tax = subtotal * 0.1; // 10% tax
          const total = subtotal + shipping + tax;
          
          // Update order summary
          subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
          shippingElement.textContent = `$${shipping.toFixed(2)}`;
          taxElement.textContent = `$${tax.toFixed(2)}`;
          totalElement.textContent = `$${total.toFixed(2)}`;
          
          // Handle form submission
          shippingForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const firstName = document.getElementById('first-name').value;
            const lastName = document.getElementById('last-name').value;
            const email = document.getElementById('email').value;
            const address = document.getElementById('address').value;
            const city = document.getElementById('city').value;
            const state = document.getElementById('state').value;
            const zip = document.getElementById('zip').value;
            const country = document.getElementById('country').value;
            
            const orderData = {
              customer_name: `${firstName} ${lastName}`,
              customer_email: email,
              customer_address: `${address}, ${city}, ${state} ${zip}, ${country}`,
              total_amount: total,
              items: cartItems
            };
            
            try {
              const order = await createOrder(orderData);
              alert('Order placed successfully! Thank you for your purchase.');
              localStorage.removeItem('cart');
              window.location.href = 'index.html';
            } catch (error) {
              console.error('Error placing order:', error);
              alert('Failed to place order. Please try again later.');
            }
          });
        }
      } catch (error) {
        console.error('Error loading checkout:', error);
      }
    }
    
    // Function to render products
    function renderProducts(productsArray, container) {
      container.innerHTML = '';
      
      productsArray.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
          <img src="${product.image}" alt="${product.name}" class="product-image">
          <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-price">$${product.price.toFixed(2)}</p>
            <p class="product-description">${product.description}</p>
            <div class="product-actions">
              <button class="btn btn-small add-to-cart" data-id="${product.id}" ${product.stock <= 0 ? 'disabled' : ''}>
                ${product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </button>
              <a href="product-detail.html?id=${product.id}" class="btn btn-small btn-secondary">View Details</a>
            </div>
          </div>
        `;
        container.appendChild(productCard);
        
        // Add event listener to Add to Cart button
        const addToCartBtn = productCard.querySelector('.add-to-cart');
        if (addToCartBtn) {
          addToCartBtn.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            addToCart(productId, product);
          });
        }
      });
    }
    
    // Function to render cart items
    function renderCartItems() {
      const cartItemsContainer = document.querySelector('.cart-items');
      const totalPriceElement = document.querySelector('.total-price');
      
      if (cartItemsContainer) {
        cartItemsContainer.innerHTML = '';
        
        if (cart.length === 0) {
          cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
          totalPriceElement.textContent = '$0.00';
          return;
        }
        
        let totalPrice = 0;
        
        const renderCartItem = async (item) => {
          try {
            const product = await getProductById(item.id);
            const itemTotal = product.price * item.quantity;
            totalPrice += itemTotal;
            
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
              <img src="${product.image}" alt="${product.name}" class="cart-item-image">
              <div class="cart-item-details">
                <h3 class="cart-item-name">${product.name}</h3>
                <p class="cart-item-price">$${product.price.toFixed(2)}</p>
                <div class="cart-item-quantity">
                  <button class="quantity-btn decrease-quantity" data-id="${product.id}">-</button>
                  <span>${item.quantity}</span>
                  <button class="quantity-btn increase-quantity" data-id="${product.id}">+</button>
                </div>
                <button class="cart-item-remove" data-id="${product.id}">Remove</button>
              </div>
            `;
            cartItemsContainer.appendChild(cartItem);
            
            // Add event listeners to quantity buttons
            const decreaseBtn = cartItem.querySelector('.decrease-quantity');
            const increaseBtn = cartItem.querySelector('.increase-quantity');
            const removeBtn = cartItem.querySelector('.cart-item-remove');
            
            decreaseBtn.addEventListener('click', function() {
              const productId = parseInt(this.getAttribute('data-id'));
              updateCartItemQuantity(productId, -1);
            });
            
            increaseBtn.addEventListener('click', function() {
              const productId = parseInt(this.getAttribute('data-id'));
              updateCartItemQuantity(productId, 1);
            });
            
            removeBtn.addEventListener('click', function() {
              const productId = parseInt(this.getAttribute('data-id'));
              removeFromCart(productId);
            });
            
            // Update total price after all items are rendered
            totalPriceElement.textContent = `$${totalPrice.toFixed(2)}`;
          } catch (error) {
            console.error(`Error rendering cart item ${item.id}:`, error);
          }
        };
        
        // Use Promise.all to render all cart items
        Promise.all(cart.map(item => renderCartItem(item)));
      }
    }
    
    // Function to add product to cart
    function addToCart(productId, product) {
      const existingItem = cart.find(item => item.id === productId);
      
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.push({
          id: productId,
          quantity: 1
        });
      }
      
      // Save cart to localStorage
      localStorage.setItem('cart', JSON.stringify(cart));
      
      // Update cart count
      updateCartCount();
      
      // Show confirmation
      alert(`${product.name} added to cart!`);
    }
    
    // Function to add product to cart with specific quantity
    function addToCartWithQuantity(productId, quantity, product) {
      const existingItem = cart.find(item => item.id === productId);
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.push({
          id: productId,
          quantity: quantity
        });
      }
      
      // Save cart to localStorage
      localStorage.setItem('cart', JSON.stringify(cart));
      
      // Update cart count
      updateCartCount();
      
      // Show confirmation
      alert(`${quantity} ${product.name}${quantity > 1 ? 's' : ''} added to cart!`);
    }
    
    // Function to update cart item quantity
    function updateCartItemQuantity(productId, change) {
      const itemIndex = cart.findIndex(item => item.id === productId);
      
      if (itemIndex === -1) {
        return;
      }
      
      cart[itemIndex].quantity += change;
      
      if (cart[itemIndex].quantity <= 0) {
        cart.splice(itemIndex, 1);
      }
      
      // Save cart to localStorage
      localStorage.setItem('cart', JSON.stringify(cart));
      
      // Update cart count
      updateCartCount();
      
      // Re-render cart items
      renderCartItems();
    }
    
    // Function to remove item from cart
    function removeFromCart(productId) {
      cart = cart.filter(item => item.id !== productId);
      
      // Save cart to localStorage
      localStorage.setItem('cart', JSON.stringify(cart));
      
      // Update cart count
      updateCartCount();
      
      // Re-render cart items
      renderCartItems();
    }
    
    // Function to update cart count
    function updateCartCount() {
      const cartCountElement = document.querySelector('.cart-count');
      
      if (cartCountElement) {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCountElement.textContent = totalItems;
      }
    }
  });
  
  console.log('E-commerce app with SQLite integration initialized');