// database/DatabaseService.js
import { Platform } from 'react-native';

let SQLite;
if (Platform.OS !== 'web') {
  SQLite = require('expo-sqlite');
}

class DatabaseService {
  constructor() {
    this.db = null;
    this.isInitialized = false;
    this.DATABASE_NAME = 'brojgar_business.db';
    this.DATABASE_VERSION = 1;
  }

  // Initialize database connection
  async init() {
    try {
      if (Platform.OS === 'web') {
        console.log('⚠️  SQLite not available on web, using mock data');
        this.isInitialized = true;
        return null;
      }

      if (this.isInitialized) return this.db;

      console.log('🔌 Connecting to SQLite database...');
      
      // SDK 53 API - Use openDatabaseAsync
      this.db = await SQLite.openDatabaseAsync(this.DATABASE_NAME);
      
      console.log('🗄️  Creating database tables...');
      await this.createTables();
      
      console.log('✅ All tables created successfully');
      await this.runMigrations();
      
      console.log('✅ Migrations completed');
      await this.insertInitialData();
      
      this.isInitialized = true;
      console.log('✅ Database connected successfully');
      
      return this.db;
    } catch (error) {
      console.error('❌ Database initialization error:', error);
      throw error;
    }
  }

  // Get database instance
  async getDatabase() {
    if (Platform.OS === 'web') {
      console.log('⚠️  SQLite not available on web');
      return null;
    }

    if (!this.isInitialized) {
      await this.init();
    }
    return this.db;
  }

  // Create all database tables
  async createTables() {
    if (Platform.OS === 'web') return;

    const tables = [
      // Business settings table
      `CREATE TABLE IF NOT EXISTS business_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        setting_key TEXT UNIQUE NOT NULL,
        setting_value TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        deleted_at DATETIME
      );`,

      // Categories table
      `CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        type TEXT NOT NULL DEFAULT 'item',
        icon TEXT DEFAULT '📦',
        color TEXT DEFAULT '#3b82f6',
        description TEXT,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        deleted_at DATETIME
      );`,

      // Parties table (customers and suppliers)
      `CREATE TABLE IF NOT EXISTS parties (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'Customer',
        email TEXT,
        phone TEXT,
        gst_number TEXT,
        pan_number TEXT,
        address TEXT,
        city TEXT,
        state TEXT,
        pincode TEXT,
        country TEXT DEFAULT 'India',
        outstanding_balance REAL DEFAULT 0,
        credit_limit REAL DEFAULT 0,
        credit_days INTEGER DEFAULT 30,
        is_active INTEGER DEFAULT 1,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        deleted_at DATETIME
      );`,

      // Inventory Items table
      `CREATE TABLE IF NOT EXISTS inventory_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        category_id INTEGER,
        sku TEXT UNIQUE,
        barcode TEXT,
        hsn_code TEXT,
        brand TEXT,
        unit TEXT DEFAULT 'pcs',
        purchase_price REAL DEFAULT 0,
        sale_price REAL DEFAULT 0,
        mrp REAL DEFAULT 0,
        current_stock REAL DEFAULT 0,
        min_stock REAL DEFAULT 0,
        max_stock REAL DEFAULT 1000,
        location TEXT,
        supplier_id INTEGER,
        tax_rate REAL DEFAULT 18,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        deleted_at DATETIME,
        FOREIGN KEY (category_id) REFERENCES categories(id),
        FOREIGN KEY (supplier_id) REFERENCES parties(id)
      );`,

      // Invoices table
      `CREATE TABLE IF NOT EXISTS invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_number TEXT UNIQUE NOT NULL,
        party_id INTEGER NOT NULL,
        invoice_date DATE NOT NULL,
        due_date DATE,
        subtotal REAL DEFAULT 0,
        discount_amount REAL DEFAULT 0,
        tax_amount REAL DEFAULT 0,
        total REAL DEFAULT 0,
        paid_amount REAL DEFAULT 0,
        status TEXT DEFAULT 'pending',
        notes TEXT,
        terms TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        deleted_at DATETIME,
        FOREIGN KEY (party_id) REFERENCES parties(id)
      );`,

      // Invoice Items table
      `CREATE TABLE IF NOT EXISTS invoice_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_id INTEGER NOT NULL,
        item_id INTEGER,
        item_name TEXT NOT NULL,
        quantity REAL NOT NULL,
        unit_price REAL NOT NULL,
        discount REAL DEFAULT 0,
        tax_rate REAL DEFAULT 18,
        total REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        deleted_at DATETIME,
        FOREIGN KEY (invoice_id) REFERENCES invoices(id),
        FOREIGN KEY (item_id) REFERENCES inventory_items(id)
      );`,

      // Transactions table
      `CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reference_number TEXT,
        party_id INTEGER,
        type TEXT NOT NULL,
        amount REAL NOT NULL,
        payment_method TEXT DEFAULT 'cash',
        transaction_date DATE NOT NULL,
        description TEXT,
        invoice_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        deleted_at DATETIME,
        FOREIGN KEY (party_id) REFERENCES parties(id),
        FOREIGN KEY (invoice_id) REFERENCES invoices(id)
      );`,

      // Notifications table
      `CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT DEFAULT 'info',
        priority TEXT DEFAULT 'medium',
        action_url TEXT,
        related_id INTEGER,
        related_type TEXT,
        read_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        deleted_at DATETIME
      );`,

      // Recent searches table
      `CREATE TABLE IF NOT EXISTS recent_searches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        query TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );`,

      // Backups table
      `CREATE TABLE IF NOT EXISTS backups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        backup_name TEXT NOT NULL,
        backup_size INTEGER DEFAULT 0,
        record_count INTEGER DEFAULT 0,
        include_images INTEGER DEFAULT 0,
        backup_data TEXT,
        status TEXT DEFAULT 'completed',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        deleted_at DATETIME
      );`
    ];

    try {
      for (const tableQuery of tables) {
        await this.db.execAsync(tableQuery);
      }
    } catch (error) {
      console.error('❌ Error creating tables:', error);
      throw error;
    }
  }

  // Run database migrations
  async runMigrations() {
    if (Platform.OS === 'web') return;

    try {
      // Add any future migrations here
      console.log('✅ All migrations executed successfully');
    } catch (error) {
      console.error('❌ Migration error:', error);
      throw error;
    }
  }

  // Insert initial data
  async insertInitialData() {
    if (Platform.OS === 'web') return;

    try {
      console.log('⚙️  Inserting initial configuration...');
      
      // Check if settings already exist
      const existingSettings = await this.db.getFirstAsync(
        'SELECT COUNT(*) as count FROM business_settings'
      );
      
      if (existingSettings.count > 0) {
        console.log('ℹ️  Initial data already exists');
        return;
      }

      // Insert default settings
      const defaultSettings = [
        { setting_key: 'business_name', setting_value: 'Your Business Name' },
        { setting_key: 'owner_name', setting_value: 'Business Owner' },
        { setting_key: 'gst_number', setting_value: '27XXXXX1234X1Z5' },
        { setting_key: 'phone', setting_value: '+91 98765 43210' },
        { setting_key: 'email', setting_value: 'business@example.com' },
        { setting_key: 'address', setting_value: 'Business Address, City, State' },
        { setting_key: 'currency', setting_value: 'INR' },
        { setting_key: 'tax_rate', setting_value: '18' },
        { setting_key: 'invoice_prefix', setting_value: 'INV' },
        { setting_key: 'last_invoice_number', setting_value: '1' }
      ];

      for (const setting of defaultSettings) {
        await this.db.runAsync(
          'INSERT OR IGNORE INTO business_settings (setting_key, setting_value) VALUES (?, ?)',
          [setting.setting_key, setting.setting_value]
        );
      }

      console.log('✅ Initial data inserted successfully');
    } catch (error) {
      console.error('❌ Error inserting initial data:', error);
      throw error;
    }
  }

  // Execute query with error handling
  async executeQuery(query, params = []) {
    try {
      if (Platform.OS === 'web') {
        console.log('⚠️  Database query skipped on web');
        return { rows: { _array: [] } };
      }

      const db = await this.getDatabase();
      if (!db) {
        throw new Error('Database not available');
      }

      let result;
      if (query.trim().toUpperCase().startsWith('SELECT')) {
        // For SELECT queries, use getAllAsync
        const rows = await db.getAllAsync(query, params);
        result = { rows: { _array: rows } };
      } else {
        // For INSERT, UPDATE, DELETE, use runAsync
        const runResult = await db.runAsync(query, params);
        result = { 
          insertId: runResult.lastInsertRowId,
          changes: runResult.changes,
          rows: { _array: [] }
        };
      }

      return result;
    } catch (error) {
      console.error('❌ Query execution error:', error);
      throw error;
    }
  }

  // Get setting value
  async getSetting(key, defaultValue = null) {
    try {
      const db = await this.getDatabase();
      const result = await db.getFirstAsync(
        'SELECT setting_value FROM business_settings WHERE setting_key = ?',
        [key]
      );
      return result ? result.setting_value : defaultValue;
    } catch (error) {
      console.error(`❌ Error getting setting ${key}:`, error);
      return defaultValue;
    }
  }

  // Set setting value
  async setSetting(key, value, type = 'string') {
    try {
      const db = await this.getDatabase();
      await db.runAsync(
        'INSERT OR REPLACE INTO business_settings (setting_key, setting_value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
        [key, value]
      );
      console.log(`✅ Setting ${key} updated`);
      return true;
    } catch (error) {
      console.error(`❌ Error setting ${key}:`, error);
      return false;
    }
  }

  // Get next invoice number
  async getNextInvoiceNumber() {
    try {
      const prefix = await this.getSetting('invoice_prefix', 'INV');
      const lastNumber = await this.getSetting('last_invoice_number', '0');
      const nextNumber = parseInt(lastNumber) + 1;
      
      await this.setSetting('last_invoice_number', nextNumber.toString());
      
      return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
    } catch (error) {
      console.error('❌ Error generating invoice number:', error);
      return `INV-${String(Date.now()).slice(-4)}`;
    }
  }

  // Close database connection
  async close() {
    try {
      if (this.db && Platform.OS !== 'web') {
        await this.db.closeAsync();
        this.isInitialized = false;
        console.log('✅ Database connection closed');
      }
    } catch (error) {
      console.error('❌ Error closing database:', error);
    }
  }

  // Clear all data (for testing/reset)
  async clearAllData() {
    try {
      if (Platform.OS === 'web') return;

      const tables = [
        'parties', 'inventory_items', 'categories', 'invoices', 
        'invoice_items', 'transactions', 'notifications'
      ];

      for (const table of tables) {
        await this.db.runAsync(`DELETE FROM ${table}`);
      }

      console.log('✅ All data cleared');
      return true;
    } catch (error) {
      console.error('❌ Error clearing data:', error);
      return false;
    }
  }
}

// Export singleton instance
const databaseService = new DatabaseService();
export default databaseService;
