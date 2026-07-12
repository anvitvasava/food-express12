# FoodExpress – Modern Premium Food Delivery Application

FoodExpress is a production-ready, fully responsive food delivery application with a premium UI/UX reminiscent of modern platforms like Uber Eats, Swiggy, Zomato, and DoorDash. The application supports mobile browsers, tablets, and desktop displays.

---

## 🚀 Features

### 1. Authentication
* **Splash Screen**: Engaging logo animation with spring physics using Framer Motion. Auto-redirects based on user auth status.
* **Credentials & OTP login**: Fully implemented email + password validation, custom OTP requests and verifications.
* **Responsive Layouts**: Designed to be responsive, aesthetic, and functional on all screen sizes.

### 2. Ordering Workflow
* **Discovery/Home Page**:
  - Promotional carousel banner with active code indicators.
  - Interactive categories (Pizza, Burger, Biryani, Desserts, Drinks, etc.).
  - Search bar with instant filter and sorting (by rating, delivery time, distance, or fee).
  - Quick Vegetarian / Non-Vegetarian toggle filters.
* **Restaurant Details Page**:
  - Beautiful banner images, operating hours, ratings, and filters.
  - Interactive menu selection grouped by categories.
  - **Menu Customization Modal**: Choose sizes (e.g. Regular/Medium/Large), crust types (e.g. Cheese Burst), extra toppings, or portion sizes.
* **Cart Page**:
  - Item listing, quantity selectors, packing and delivery fees, and tips for the rider.
* **Checkout Page**:
  - Address book management (Add/Select Home, Work, or Other addresses).
  - Delivery instructions and schedule options.
  - Multiple payment method selections (Card, UPI, Wallet, cash on delivery).

### 3. Real-Time Tracking & Chat
* **Live Order Tracking Page**:
  - High-fidelity interactive SVG map rendering coordinates in real-time.
  - Graphical tracking timeline (`placed` -> `accepted` -> `preparing` -> `picked_up` -> `on_the_way` -> `delivered`).
  - Active rider detail card with call button.
  - **Live Chat**: Interactive chat window using Socket.io to talk to the delivery partner with automated responses.
  - **Real-Time Simulation**: When an order is placed, the backend automatically simulates rider movements, coordinates, and status updates, emitting live updates to the frontend via Socket.io.

### 4. User Profile & Preferences
* **Profile Management**: Edit name, phone, and saved addresses.
* **Favorites**: Save and bookmark favorite restaurants or dishes.
* **Theme Switcher**: Fully functional high-fidelity Light Mode and Dark Mode.

### 5. Admin Panel
* **Dashboard Stats**: Real-time sales metrics, order counts, restaurant count, and customer counts.
* **Restaurant & Menu Management**: Forms to add new restaurants and menus directly to the database.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, TypeScript, Tailwind CSS 3, Framer Motion, Lucide React, Socket.io-client, React Router DOM 6 |
| **Backend** | Node.js, Express.js, TypeScript, Socket.io, UUID |
| **Database** | Lightweight local JSON Database (`database.json`) stored on disk for simple zero-configuration local runs |

---

## 📁 Project Directory Structure

```
food-express/
├── frontend/             # Vite + React + TypeScript Frontend
│   ├── src/
│   │   ├── components/   # Layouts, Toasts, Reusable Elements
│   │   ├── context/      # AuthContext and CartContext (State Management)
│   │   ├── pages/        # Login, Signup, Home, RestaurantDetails, Cart, Checkout, OrderTracking, Profile, Wishlist, Admin, SplashScreen
│   │   ├── services/     # API request handler
│   │   ├── App.tsx       # Routing table and Providers
│   │   └── main.tsx      # Mount entrypoint
│   └── package.json
│
├── backend/              # Node.js + Express + Socket.io Backend
│   ├── src/
│   │   ├── controllers/  # authController, restaurantController, orderController, profileController, adminController
│   │   ├── middleware/   # JWT Authentication and Admin validation middlewares
│   │   ├── db.ts         # JSON database management utility
│   │   └── server.ts     # Express server & Socket.io setup
│   └── package.json
│
├── package.json          # Root orchestration package
└── database.json         # Auto-generated database storage file
```

---

## 🏃 How to Run Locally

### 1. Prerequisite
* Make sure you have **Node.js** (v18+) and **npm** installed.

### 2. Installation
Run the following script in the root directory to install dependencies for both frontend and backend:
```bash
npm run install:all
```

### 3. Running Dev Servers
To boot both the frontend and backend servers concurrently, execute:
```bash
npm run dev
```
* **Frontend** will be running at [http://localhost:5173/](http://localhost:5173/)
* **Backend** will be running at [http://localhost:5000/](http://localhost:5000/)

### 4. Build for Production
To compile and build both applications:
```bash
npm run build:all
```

---

## 🔌 API Documentation

### Authentication
* `POST /api/auth/register`: Create a new user profile.
* `POST /api/auth/login`: Authenticate with email/password and obtain JWT.
* `POST /api/auth/otp/request`: Request verification OTP for phone number.
* `POST /api/auth/otp/verify`: Verify verification OTP.
* `GET /api/auth/me`: Fetch details of the currently authenticated session.

### Restaurants & Wishlist
* `GET /api/restaurants`: Fetch all restaurants with optional search parameters.
* `GET /api/restaurants/:id`: Retrieve menu and details of a single restaurant.
* `POST /api/restaurants/favorite`: Bookmark or un-bookmark a restaurant.

### Profile & Addresses
* `PUT /api/profile`: Update name, email, and phone.
* `POST /api/profile/address`: Save a new delivery location.
* `DELETE /api/profile/address/:id`: Remove a saved address.

### Orders
* `POST /api/orders`: Submit a new order.
* `GET /api/orders`: Retrieve historical orders of the user.
* `GET /api/orders/:id`: Get detail of a specific order.
* `PATCH /api/orders/:id/status` (Admin only): Update status of a delivery.

### Admin
* `GET /api/admin/stats`: Get dashboard numbers and analytics.
* `POST /api/admin/restaurants`: Register a new restaurant.
* `POST /api/admin/restaurants/:restaurantId/menu`: Add a new dish to a restaurant menu.
