# 11jersey.com - E-commerce Platform

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://example.com/build-status) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) A full-stack e-commerce application built with the MERN stack (MongoDB, Express, React, Node.js) for selling football jerseys online. Includes features for both customers and administrators.

## Table of Contents

- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## Key Features

### User Features:

- **Authentication:** User Signup (with OTP), Login, Forgot Password, Google/Facebook SSO.
- **Product Discovery:** Homepage, Product Listing with Search, Sort & Filters (Category, Price), Product Details Page with Image Zoom.
- **Shopping Experience:** Add to Cart, Update Quantity, Remove from Cart, Add/Remove from Wishlist, Move Wishlist Item to Cart.
- **Promotions:** View Available Coupons, Apply/Remove Coupons from Cart.
- **Checkout:** Multi-step checkout, Address Management (CRUD), Payment Gateway Integration (Razorpay), Wallet Payment.
- **Post-Purchase:** Order History, Order Details & Tracking Timeline, Invoice Download, Submit Product Reviews, Cancel/Return Requests.
- **Account Management:** View/Edit Profile, Change Password, Manage Addresses, View Wallet Balance & Transactions.

### Admin Features:

- **Secure Authentication:** Separate Admin Login.
- **Dashboard:** Sales analytics, KPIs, best-selling products.
- **User Management:** View all users, Block/Unblock users, View user details & order history.
- **Category Management:** CRUD operations, List/Unlist categories.
- **Product Management:** CRUD operations (including multiple image uploads), List/Unlist products, Manage variants & stock.
- **Coupon Management:** CRUD operations, Activate/Deactivate coupons.
- **Order Management:** View all orders, Filter/Search orders, Update order status (Ship, Deliver, etc.), Review/Approve/Reject Cancellation & Return requests.
- **Transaction Management:** View all payment transactions.
- **Global Search:** Search across orders, users, products within the admin panel.

## Technology Stack

- **Frontend:** React, Redux Toolkit, React Router, Axios, Tailwind CSS (or your choice of styling)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (with Mongoose)
- **Authentication:** JWT (JSON Web Tokens), OAuth 2.0 (Passport.js or similar)
- **Image Management:** Cloudinary, Multer
- **Payment Gateway:** Razorpay
- **Real-time Updates (Optional):** Socket.IO (for admin dashboard or notifications)

## Project Structure

The project follows a monorepo structure with separate directories for the backend and frontend.

```plaintext
11jersey-ecommerce/
├── server/                 # Backend (Node.js / Express)
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── client/                 # Frontend (React / Redux)
    ├── public/
    ├── src/
    │   ├── api/
    │   ├── app/
    │   ├── assets/
    │   ├── components/
    │   ├── features/
    │   ├── hooks/
    │   ├── pages/
    │   ├── routes/
    │   ├── styles/
    │   ├── utils/
    │   ├── App.jsx
    │   └── main.jsx
    ├── .env.example
    ├── index.html
    ├── package.json
    └── vite.config.js
```
