# app-brojgar

brojgar/
├── App.js
├── assets/                   # Images, icons, logos, etc.
├── components/              # Reusable UI components (buttons, cards, etc.)
│   └── ...
├── constants/               # Colors, fonts, global styles
│   └── ...
├── navigation/              # Navigation configuration (tabs, stacks)
│   └── BottomTabNavigator.js
├── screens/                 # All screen pages
│   ├── Dashboard/           # Dashboard page and related files
│   │   └── DashboardScreen.js
│   ├── Sales/
│   │   └── SalesScreen.js
│   ├── Purchase/
│   │   └── PurchaseScreen.js
│   ├── Invoice/
│   │   └── InvoiceScreen.js
│   ├── Inventory/
│   │   └── InventoryScreen.js
│   └── ...
├── services/                # DB, API, Sync logic
│   └── ...
├── storage/                 # SQLite setup and helpers
│   └── ...
├── utils/                   # Helper functions, date utils, etc.
│   └── ...
├── tailwind.config.js       # (if using Nativewind)
└── package.json


# 📊 Brojgar – Business Accounting & Inventory App

**Brojgar** is a cross-platform business accounting app tailored for small businesses and shop owners. Inspired by tools like **Vyapar**, Brojgar helps manage sales, purchases, invoices, and (soon) inventory — all from a mobile or desktop interface.

---

## 🚀 Features

### ✅ Phase 1 – MVP Features
- **Sales Entry**  
  Record and track product/service sales.

- **Purchase Entry**  
  Log purchases from suppliers for stock management.

- **Invoice Generation**  
  Generate and download shareable invoices instantly.

- **Dashboard UI** *(in progress)*  
  Visual summary of business performance.

---

## 🛠️ Tech Stack

| Layer        | Tech Used                          |
|--------------|------------------------------------|
| Frontend     | React Native (Expo SDK 50)         |
| Routing      | `expo-router`                      |
| Backend      | (Planned) Node.js / Express        |
| Database     | (Planned) MongoDB or SQLite        |
| DevOps       | AWS EC2, GitHub Actions CI/CD      |
| Tunneling    | `ngrok` for local-to-device testing |

---

## 📦 Installation

### 1. Clone the Repo
```bash
git clone https://github.com/operman-code/app-brojgar.git
cd app-brojgar


2. Install Dependencies
bash
Copy
Edit
npm install
Note: Requires Node.js v20+ for compatibility with latest packages.

3. Run the App
bash
Copy
Edit
npx expo start
Scan the QR code with the Expo Go app (on your phone) or run in the emulator.

🌐 ngrok Setup (for local device preview)
bash
Copy
Edit
npx ngrok http 8081
Use the forwarded URL to connect devices for real-time preview.

📁 Project Structure
bash
Copy
Edit
app-brojgar/
├── app/                # Screens and app routes
├── assets/             # Images, fonts, logos
├── components/         # Reusable components (e.g., buttons, forms)
├── package.json        # Project config & dependencies
├── README.md           # Project info
🧩 Upcoming Features
Inventory Stock Management

PDF Invoice Export

GST & Tax Field Support

Customer/Supplier Database

Expense Tracking

Reports & Analytics
