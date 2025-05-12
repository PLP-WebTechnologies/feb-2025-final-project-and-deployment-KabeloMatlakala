/**
 * Admin Login JavaScript
 *
 * This file handles the admin login functionality.
 * It validates the login credentials and redirects to the admin dashboard if successful.
 */

document.addEventListener("DOMContentLoaded", () => {
    // Get the login form
    const loginForm = document.getElementById("login-form")
  
    // Get the error message element
    const errorMessage = document.getElementById("error-message")
  
    // Check if already logged in
    if (localStorage.getItem("admin_authenticated")) {
      // Redirect to admin dashboard
      window.location.href = "index.html"
      return
    }
  
    // Add submit event listener to the login form
    if (loginForm) {
      loginForm.addEventListener("submit", (e) => {
        e.preventDefault()
  
        // Get username and password
        const username = document.getElementById("username").value
        const password = document.getElementById("password").value
  
        // Validate input
        if (!username || !password) {
          showError("Please enter both username and password")
          return
        }
  
        // For demo purposes, use a simple authentication
        // In a real application, you would send a request to the server
        if (username === "admin" && password === "admin123") {
          // Set authentication flag
          localStorage.setItem("admin_authenticated", "true")
  
          // Redirect to admin dashboard
          window.location.href = "index.html"
        } else {
          // Show error message
          showError("Invalid username or password")
        }
      })
    }
  
    // Function to show error message
    function showError(message) {
      if (errorMessage) {
        errorMessage.textContent = message
        errorMessage.style.display = "block"
  
        // Add shake animation
        errorMessage.classList.add("shake")
  
        // Remove shake animation after it completes
        setTimeout(() => {
          errorMessage.classList.remove("shake")
        }, 500)
      }
    }
  })
  