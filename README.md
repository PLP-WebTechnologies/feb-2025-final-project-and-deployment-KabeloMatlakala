# Final Project and Deployment

## Objectives
Build a fully functional web application.
Apply HTML, CSS, and JavaScript concepts learned.
Deploy the project using GitHub Pages, Netlify, or Vercel.

## Instructions
Choose one of the following project ideas:
Blog Website: Implement a multi-page site with navigation.
Ecommerce Website: Implement a multi-page site with navigation.

>[!NOTE]
> - Include at least:
> - A responsive design.
> - JavaScript interactivity.
> - A deployment link.

## Tasks

Create a well-structured HTML5 document.
Use at least 5 different HTML elements.
Ensure semantic correctness.
---

# ShopEasy E-commerce Application

A beginner-friendly e-commerce application built with HTML, CSS, JavaScript, Node.js, Express, and SQLite.

## ✨ Features

- **Product Management**
  - Product listing and filtering
  - Detailed product pages with descriptions and images
  - Related products suggestions

- **Shopping Experience**
  - Shopping cart functionality
  - Seamless checkout process
  - Order management

- **User Accounts**
  - Secure user registration and login
  - Profile management
  - Order history tracking

- **Design & UX**
  - Responsive design for all devices
  - Beginner mode with helpful tooltips
  - Intuitive navigation

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript
- **Backend**: Node.js, Express
- **Database**: SQLite
- **Authentication**: JWT, bcrypt

## 🗂️ Project Structure

The project is organized into two main folders:

```
ShopEasy/
├── Ecommerce-Website/  # Frontend files
│   ├── admin/          # Admin dashboard
│   ├── css/            # Stylesheets
│   ├── js/             # JavaScript files
│   └── *.html          # HTML pages
│
└── Backend/            # Backend files
    ├── api-client.js   # Database operations
    └── server.js       # Express server
```

## 🚀 Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- A modern web browser

### Installation

1. Clone this repository or download the ZIP file
2. Run the setup script:

    ```bash
    node setup.js
    ```

3. Install dependencies:

    ```bash
    npm install
    ```
4. Set up environment variables:
   Create a `.env` file in the root directory with:
   ```
   PORT=3000
   JWT_SECRET=your_jwt_secret_key
   ```

5. Start the server:

    ```bash
    npm start
    ```

6. Open your browser and navigate to `http://localhost:3000`

## 📱 Usage

### For Shoppers

1. Browse products on the homepage or products page
2. Click on a product to view details
3. Add products to your cart
4. Register or login to your account
5. Complete checkout with shipping and payment details
6. View your order history in your profile

### For Administrators

1. Access the admin panel at `/admin`
2. Login with admin credentials
3. Manage products, orders, and users
4. View sales data and analytics

## 🔌 API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/category/:category` - Get products by category

### Users
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order by ID

## 🔐 Authentication

ShopEasy uses JWT (JSON Web Tokens) for secure authentication:
- Passwords are hashed using bcrypt
- JWTs are stored in HTTP-only cookies
- Protected routes require valid authentication

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Contact

For questions or support, please contact:
- Email: matlakalakabelo1@gmail.com
- GitHub: [Kabelo Matlakala](https://github.com/KabeloMatlakala)

---

Made with ❤️ by Kabelo Matlakala


