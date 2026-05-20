# 🛒 PrimeBasket - Web Client

A modern, full-stack e-commerce web application providing a seamless shopping experience. PrimeBasket features a responsive product catalog, secure authentication, cart management, seamless checkout, and a dedicated administrative dashboard for inventory and order management.

🌐 **Live Website:** [primebasket-web.vercel.app](https://primebasket-web.vercel.app)
⚙️ **Backend Repository:** [PrimeBasket Backend](https://github.com/mohitladhe/primebasket-backend)

## ✨ Key Features

PrimeBasket's frontend interfaces directly with its Express.js backend API to deliver a rich, interactive user experience:

### 🛍️ Customer Experience
* **Product Discovery:** Browse products with dynamic filtering, search capabilities, and detailed product views.
* **Shopping Cart:** Real-time cart state management for adding, removing, and updating item quantities.
* **Secure Checkout & Orders:** Seamless checkout process with robust order history tracking and multi-address management.
* **User Authentication:** Secure user registration, login, and profile management utilizing Supabase integration.

### ⚙️ Admin Dashboard
* **Inventory Management:** Admin-only protected routes to add, edit, or remove products from the catalog.
* **Order Tracking:** View, update, and manage global order statuses.
* **Analytics & Dashboard:** High-level overview of store performance and sales metrics.

## 🛠️ Tech Stack & Architecture

* **Frontend Framework:** [React.js](https://react.dev/)
* **Build Tool:** [Vite](https://vitejs.dev/) for rapid development and optimized production builds.
* **Backend API Integration:** RESTful integration with the `primebasket-backend` Node.js/Express server.
* **Database & Auth:** [Supabase](https://supabase.com/) utilized for robust data structuring and authentication flows.
* **Hosting:** Frontend deployed seamlessly on [Vercel](https://vercel.com/).

## 🚀 Getting Started

### Prerequisites
* Node.js (v16 or higher)
* A running local instance of the `primebasket-backend` API
* Supabase project credentials

### Installation
1. Clone the repository:
   ```bash
   git clone [https://github.com/mohitladhe/primebasket-web.git](https://github.com/mohitladhe/primebasket-web.git)
   ```
2. Navigate to the project directory and install dependencies:
   ```bash
   cd primebasket-web
   npm install
   ```
3. Create a `.env` file in the root directory and add your required environment variables:
   ```env
   VITE_API_URL="http://localhost:5000" # URL of your local Node/Express backend
   VITE_SUPABASE_URL="your_supabase_project_url"
   VITE_SUPABASE_ANON_KEY="your_supabase_anon_key"
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
5. The application will be available locally at `http://localhost:5173`.

## 📡 API Integration Structure

This React client is configured to communicate with the following core REST endpoints on the Express backend:
* `/api/products` - Product fetching and catalog management
* `/api/cart` - User cart state
* `/api/auth` - Authentication handshakes
* `/api/orders` & `/api/addresses` - Checkout and logistics
* `/api/dashboard` & `/api/admin` - Administrative controls and metrics
* `/api/profile` - User settings and history

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page if you want to contribute to the project.

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. Copyright (c) 2026 Mohit Ladhe.
