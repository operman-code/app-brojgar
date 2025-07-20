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
