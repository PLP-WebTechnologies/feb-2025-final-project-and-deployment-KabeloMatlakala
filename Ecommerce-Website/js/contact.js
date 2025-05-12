/**
 * Contact Page JavaScript
 *
 * This file handles the functionality of the contact page including:
 * - Contact form submission
 * - FAQ accordion
 */

document.addEventListener("DOMContentLoaded", () => {
  // Get the contact form
  const contactForm = document.getElementById("contact-form")

  // Get message elements
  const successMessage = document.getElementById("contact-success-message")
  const errorMessage = document.getElementById("contact-error-message")

  // Get FAQ items
  const faqItems = document.querySelectorAll(".faq-item")

  // Add submit event listener to the contact form
  if (contactForm) {
    contactForm.addEventListener("submit", handleContactSubmission)
  }

  // Add click event listeners to FAQ questions
  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question")

    if (question) {
      question.addEventListener("click", () => {
        // Toggle active class on the FAQ item
        item.classList.toggle("active")
      })
    }
  })

  // Function to handle contact form submission
  async function handleContactSubmission(e) {
    e.preventDefault()

    try {
      // Hide any previous messages
      hideMessage(successMessage)
      hideMessage(errorMessage)

      // Get form data
      const name = document.getElementById("name").value
      const email = document.getElementById("email").value
      const subject = document.getElementById("subject").value
      const message = document.getElementById("message").value

      // Validate input
      if (!name || !email || !subject || !message) {
        showError("Please fill in all fields")
        return
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        showError("Please enter a valid email address")
        return
      }

      // Show loading state
      const submitBtn = contactForm.querySelector('button[type="submit"]')
      const originalBtnText = submitBtn.textContent
      submitBtn.disabled = true
      submitBtn.textContent = "Sending..."

      // Simulate form submission (in a real application, you would send this to a server)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Show success message
      showSuccess("Your message has been sent successfully. We'll get back to you soon!")

      // Reset form
      contactForm.reset()

      // Reset submit button
      submitBtn.disabled = false
      submitBtn.textContent = originalBtnText
    } catch (error) {
      // Show error message
      showError("Failed to send message. Please try again.")

      // Reset submit button
      const submitBtn = contactForm.querySelector('button[type="submit"]')
      submitBtn.disabled = false
      submitBtn.textContent = "Send Message"
    }
  }

  // Function to show error message
  function showError(message) {
    if (errorMessage) {
      errorMessage.textContent = message
      errorMessage.classList.add("show")

      // Scroll to error message
      errorMessage.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  // Function to show success message
  function showSuccess(message) {
    if (successMessage) {
      successMessage.textContent = message
      successMessage.classList.add("show")

      // Scroll to success message
      successMessage.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  // Function to hide message
  function hideMessage(element) {
    if (element) {
      element.classList.remove("show")
    }
  }
})
