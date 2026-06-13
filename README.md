# 🍗 A1 Chicken's — Freshly Yours

A modern, high-performance, and beautifully designed single-page web application for **A1 Chicken's**, a neighborhood premium fresh chicken store. This app features real-time dynamic pricing, multi-language support (English, हिन्दी, తెలుగు), saved user delivery addresses, order placement with sandbox online payments, and live order status tracking with a visual delivery progress bar.

Built using **React**, **Vite**, **TypeScript**, **Tailwind CSS**, and **Firebase** (Firestore and Authentication).

---

## 📸 Visual Overview

### Main Banner & Ordering Interface
![A1 Chicken Banner](src/assets/hero-chicken.png)

### Quality Cuts & Live Pricing Stocks
The landing page displays live mandi rates alongside detailed quality checks and fresh stock:
<p align="center">
  <img src="src/assets/live-chicken.png" width="48%" alt="Live Chicken Stock" />
  <img src="src/assets/live-nattu.png" width="48%" alt="Live Nattu Kodi Stock" />
</p>

---

## ✨ Features

- **⚡ Real-Time Government & Shop Pricing**: Automatic synchronization of daily chicken prices (Tender Broiler, Standard Broiler, Nattu Kodi) from the Admin dashboard using Firestore reactive subscriptions.
- **🗺️ Language Selector**: Complete localization in **English**, **हिन्दी (Hindi)**, and **తెలుగు (Telugu)** with instant layout updates.
- **🛒 Interactive Shopping Drawer**: Dynamic weight picker (kg), custom cutting options (with skin, skinless, curry cut, wings, legs, boneless), instant price calculator, and bulk discount alerts.
- **💳 Secured COD Advance Payments**: Standard Cash on Delivery (COD) orders require a static ₹5 advance online payment, completed via an integrated secure payment gateway simulator.
- **📍 Saved Address Manager**: Interactive delivery address dropdown. Users can save, edit, and select from multiple addresses stored in their private Firestore profile.
- **🚚 Live Order Status & History Tracker**: An interactive order history list page tracking orders in real-time (Placed, Preparing, Out for Delivery, Delivered) via a live progress bar.
- **🔒 Admin Management Portal**: Protected portal at `/admin` for store owners to accept or cancel orders, update live stock rates, and customize pricing tier discounts.

---

## 🛠️ Tech Stack

- **Framework**: [Vite](https://vite.dev/) with [React](https://react.dev/)
- **Routing**: [TanStack Router](https://tanstack.com/router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with custom typography ([Google Fonts](https://fonts.google.com/))
- **Database & Auth**: [Firebase Firestore](https://firebase.google.com/docs/firestore) & [Firebase Authentication](https://firebase.google.com/docs/auth)
- **Hosting**: [Firebase Hosting](https://firebase.google.com/docs/hosting)

---

## 🚀 Getting Started

### 1. Prerequisites
Make sure you have **Node.js** (v18 or higher) installed on your machine.

### 2. Install Dependencies
Clone the repository, navigate to the project root, and install node modules:
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the root of your project by copying the template file:
```bash
cp .env.example .env
```
Fill in your own Firebase project configuration credentials:
```env
VITE_FIREBASE_API_KEY="your-api-key-here"
VITE_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-project-id.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="your-messaging-sender-id"
VITE_FIREBASE_APP_ID="your-app-id"
VITE_FIREBASE_MEASUREMENT_ID="your-measurement-id"
```

### 4. Running the Development Server
Start the local Vite development server:
```bash
npm run dev
```
Open your browser to `http://localhost:5173`.

### 5. Build for Production
To compile and optimize your project for production:
```bash
npm run build
```
This output is bundled into the `dist/client` directory, which is ready for static deployment.

### 6. Firebase Hosting Deploy
To publish the build output to your live Firebase project environment:
```bash
npx firebase deploy --only hosting
```

---

## 🔒 Security & Safety

API keys and config parameters are fully externalized to environment variables (`.env`) and excluded from source control using `.gitignore` templates. Never commit your `.env` files to git repositories.
