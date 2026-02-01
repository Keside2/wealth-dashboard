# 💎 WEALTHIFY: A Premium Fintech Discovery & Portfolio Engine

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/firebase-%23039BE5.svg?style=for-the-badge&logo=firebase&logoColor=white)](https://firebase.google.com/)
[![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://render.com/)

## 📖 Overview

Wealthify is a high-performance, responsive fintech application designed to replace boring spreadsheets with a "Living UI." It provides solopreneurs and creators with a centralized hub to track assets, monitor real-time transaction logs, and visualize wealth growth through an interactive, cloud-synced dashboard.

---

## 🛠 Technical Deep Dive

### 1. Secure Authentication & Protected Routes

- **Firebase Auth Integration:** Implemented a robust security layer using **Firebase Auth** for Email/Password registration and login.
- **Session Management:** Utilized `onAuthStateChanged` to handle persistent user sessions, ensuring users stay logged in across browser refreshes.
- **Security Guard:** Developed custom React "Protected Route" wrappers to prevent unauthorized access to the dashboard and profile settings.

### 2. The "Living UI" Engine (Plain CSS Mastery)

- The Transition: This project actually began with Tailwind CSS to explore the utility-first workflow. However, I ultimately decided to transition back to Plain CSS to leverage my core strengths in custom architecture.
- Why Plain CSS? By moving away from frameworks, I gained granular control over the "Living UI"—a system of organic, pulsing animations built entirely with CSS Keyframes and CSS Variables that would be cumbersome to implement with utility classes.
- Mastery over the Box Model: Demonstrates deep proficiency in Flexbox, CSS Grid, and Responsive Design without the overhead or design constraints of heavy UI libraries.

### 3. Real-Time Data Synchronization

- **Firestore Ledger:** Engineered a real-time transaction system using **Google Firestore**. Any addition or deletion of assets reflects instantly across the UI without manual refreshing.
- **Data Persistence:** User financial data is structured in a scalable NoSQL schema, ensuring fast queries even as the transaction history grows.

---

## ✨ Premium UI/UX Features

- **Glassmorphism Interface:** Leveraged `backdrop-filter: blur()` and layered transparency to create a modern, "frosted" aesthetic that remains readable in all lighting modes.
- **Dynamic Charting:** Integrated **Recharts** for interactive financial storytelling, allowing users to hover and deep-dive into their spending patterns.
- **Responsive Navigation:** A custom-built, mobile-optimized sidebar and navigation system designed for seamless use on touch-based devices.
- **Hardened Error Handling:** Real-time feedback via custom toast-style alerts for login errors, successful transactions, and data updates.

---

## 🗄 Database Schema

The app utilizes a shallow, high-performance Firestore structure:

```json
users: {
  "user_uid": {
    "profile": {
      "displayName": "Keside Izunobi",
      "currency": "USD",
      "setupComplete": true
    },
    "transactions": [
      {
        "id": "tx_9823",
        "title": "Stripe Payout",
        "amount": 1200.50,
        "category": "Income",
        "timestamp": "2026-02-01T10:00:00Z"
      }
    ],
    "assets": {
      "crypto": 4500.00,
      "savings": 12000.00,
      "investments": 8500.00
    }
  }
}
```

## 🚀 Installation & Setup

1. **Clone the repository:**

   ```bash
   git clone [https://github.com/Keside2/movie-app-tmdb.git](https://github.com/Keside2/https://github.com/Keside2/wealth-dashboard.git)
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   ```

3. **Environment Configuration:Create a .env file in the root directory and add your keys:**
   ```Code snippet
   VITE_FIREBASE_API_KEY=
   VITE_FIREBASE_AUTH_DOMAIN=
   VITE_FIREBASE_PROJECT_ID=
   VITE_FIREBASE_STORAGE_BUCKET=
   VITE_FIREBASE_SENDER_ID=
   VITE_FIREBASE_APP_ID=
   ```
4. **Install Dependencies:**
   ```bash
   npm run dev
   ```

---

### 🔗 Market Integration (Next Up)

- **The Goal:** Connect to **CoinGecko** (for Crypto) and **Alpha Vantage** (for Stocks) APIs.
- **The Function:** Instead of manually entering asset values, the app will fetch real-time market prices. This turns Wealthify from a manual tracker into a live portfolio monitor that updates your Net Worth automatically as the market moves.

### 🧠 AI Insights & Predictive Analytics

- **The Goal:** Move from _Reactive_ tracking to _Proactive_ planning.
- **The Function:** Using simple Machine Learning (Linear Regression), the app will analyze your Firestore transaction history to:
  - **Forecast Cash Flow:** Predict your end-of-month balance based on spending patterns.
  - **Anomaly Detection:** Alert you if your "Dining Out" or "Software" bills are 30% higher than your 3-month average.
  - **Smart Categorization:** Automatically tag new transactions using pattern-matching logic.

  ***

  ## 🎥 Media

  ### Login Page

![Login Page](./src/assets/Wealthify%20_%20Track%20Your%20Growth%20and%201%20more%20page%20-%20Personal%20-%20Microsoft​%20Edge%2001_02_2026%2020_23_04.png)

### Dashboard Page

![Dashboard Page](./src/assets/Wealthify%20_%20Track%20Your%20Growth%20and%201%20more%20page%20-%20Personal%20-%20Microsoft​%20Edge%2001_02_2026%2020_19_02.png)

### Analytics Page

![Analytics Page](./src/assets/Wealthify%20_%20Track%20Your%20Growth%20and%201%20more%20page%20-%20Personal%20-%20Microsoft​%20Edge%2001_02_2026%2020_19_12.png)

### Settings Page

![Settings Page](./src/assets/Wealthify%20_%20Track%20Your%20Growth%20and%201%20more%20page%20-%20Personal%20-%20Microsoft​%20Edge%2001_02_2026%2020_19_20.png)

## Project Summary

Wealthify was developed over a 20-day sprint as part of the #100DaysOfCode challenge. The project began as an exploration into utility-first styling with Tailwind CSS, but evolved into a deep-dive into custom CSS architecture to achieve a high-fidelity "Living UI." By integrating React with Firebase, I’ve built a secure, real-time environment that proves fintech dashboards can be both functionally robust and aesthetically organic.
