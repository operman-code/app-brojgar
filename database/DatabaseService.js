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
      
      // Enable foreign keys
      await this.db.execAsync('PRAGMA foreign_keys = ON;');
      
      // Create all tables
      await this.createTables();
      
      // Run migrations if needed
      await this.runMigrations();
      
      // Insert initial data if needed
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
      // Settings table
      `CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL,
        type TEXT DEFAULT 'string',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );`,

      // Parties table (customers and suppliers)
      `CREATE TABLE IF NOT EXISTS parties (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'customer',
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

      // Items table (inventory/products)
      `CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        category_id INTEGER,
        sku TEXT UNIQUE,
        barcode TEXT,
        hsn_code TEXT,
        brand TEXT,
        unit TEXT DEFAULT 'pcs',
        cost_price REAL DEFAULT 0,
        selling_price REAL DEFAULT 0,
        mrp REAL DEFAULT 0,
        current_stock REAL DEFAULT 0,
        minimum_stock REAL DEFAULT 0,
        reorder_level REAL DEFAULT 5,
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

      // Stock movements table
      `CREATE TABLE IF NOT EXISTS stock_movements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_id INTEGER NOT NULL,
        movement_type TEXT NOT NULL,
        quantity REAL NOT NULL,
        reference_type TEXT,
        reference_id INTEGER,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (item_id) REFERENCES items(id)
      );`,

      // Invoices table
      `CREATE TABLE IF NOT EXISTS invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_number TEXT UNIQUE NOT NULL,
        party_id INTEGER NOT NULL,
        invoice_date DATE NOT NULL,
        due_date DATE,
        subtotal REAL DEFAULT 0,
        tax_rate REAL DEFAULT 18,
        tax_amount REAL DEFAULT 0,
        discount_amount REAL DEFAULT 0,
        total REAL DEFAULT 0,
        status TEXT DEFAULT 'pending',
        notes TEXT,
        terms_conditions TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        deleted_at DATETIME,
        FOREIGN KEY (party_id) REFERENCES parties(id)
      );`,

      // Invoice items table
      `CREATE TABLE IF NOT EXISTS invoice_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_id INTEGER NOT NULL,
        item_id INTEGER NOT NULL,
        quantity REAL NOT NULL,
        unit_price REAL NOT NULL,
        discount REAL DEFAULT 0,
        total REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (invoice_id) REFERENCES invoices(id),
        FOREIGN KEY (item_id) REFERENCES items(id)
      );`,

      // Payments table
      `CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_id INTEGER,
        party_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        payment_method TEXT DEFAULT 'cash',
        payment_date DATE NOT NULL,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (invoice_id) REFERENCES invoices(id),
        FOREIGN KEY (party_id) REFERENCES parties(id)
      );`,

      // Expenses table
      `CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT NOT NULL,
        amount REAL NOT NULL,
        description TEXT,
        expense_date DATE NOT NULL,
        payment_method TEXT DEFAULT 'cash',
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );`,

      // Notifications table
      `CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'info',
        priority TEXT DEFAULT 'medium',
        read INTEGER DEFAULT 0,
        data TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );`,

      // Audit log table
      `CREATE TABLE IF NOT EXISTS audit_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        table_name TEXT NOT NULL,
        record_id INTEGER NOT NULL,
        action TEXT NOT NULL,
        old_values TEXT,
        new_values TEXT,
        user_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );`
    ];

    console.log('🗄️  Creating database tables...');
    for (const sql of tables) {
      await this.db.execAsync(sql);
    }
    console.log('✅ All tables created successfully');
  }

  // Run database migrations
  async runMigrations() {
    if (Platform.OS === 'web') return;
    console.log('✅ Migrations completed');
  }

  // Insert initial configuration data
  async insertInitialData() {
    if (Platform.OS === 'web') return;

    try {
      console.log('⚙️  Inserting initial configuration...');
      
      // Check if settings already exist
      const existingSettings = await this.db.getFirstAsync(
        'SELECT COUNT(*) as count FROM settings'
      );
      
      if (existingSettings.count > 0) {
        console.log('ℹ️  Initial data already exists');
        return;
      }

      // Insert default settings
      const defaultSettings = [
        { key: 'business_name', value: 'Your Business Name', type: 'string' },
        { key: 'owner_name', value: 'Business Owner', type: 'string' },
        { key: 'gst_number', value: '27XXXXX1234X1Z5', type: 'string' },
        { key: 'phone', value: '+91 98765 43210', type: 'string' },
        { key: 'email', value: 'business@example.com', type: 'string' },
        { key: 'address', value: 'Business Address, City, State', type: 'string' },
        { key: 'currency', value: 'INR', type: 'string' },
        { key: 'tax_rate', value: '18', type: 'number' },
        { key: 'invoice_prefix', value: 'INV', type: 'string' },
        { key: 'invoice_starting_number', value: '1', type: 'number' }
      ];

      for (const setting of defaultSettings) {
        await this.db.runAsync(
          'INSERT OR IGNORE INTO settings (key, value, type) VALUES (?, ?, ?)',
          [setting.key, setting.value, setting.type]
        );
      }

      // Insert default categories
      const defaultCategories = [
        { name: 'Electronics', type: 'item', icon: '📱', color: '#3b82f6' },
        { name: 'Clothing', type: 'item', icon: '👕', color: '#10b981' },
        { name: 'Food & Beverages', type: 'item', icon: '🍽️', color: '#f59e0b' },
        { name: 'Books & Stationery', type: 'item', icon: '📚', color: '#8b5cf6' },
        { name: 'Office Supplies', type: 'item', icon: '🏢', color: '#ef4444' }
      ];

      for (const category of defaultCategories) {
        await this.db.runAsync(
          'INSERT OR IGNORE INTO categories (name, type, icon, color) VALUES (?, ?, ?, ?)',
          [category.name, category.type, category.icon, category.color]
        );
      }

      console.log('✅ Initial configuration inserted');
    } catch (error) {
      console.error('❌ Error inserting initial data:', error);
      throw error;
    }
  }

  // Generic CRUD Operations
  async create(table, data) {
    if (Platform.OS === 'web') return null;
    try {
      const db = await this.getDatabase();
      const keys = Object.keys(data);
      const values = Object.values(data);
      const placeholders = keys.map(() => '?').join(', ');
      
      const result = await db.runAsync(
        `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`,
        values
      );
      
      console.log(`✅ Created ${table} record with ID: ${result.lastInsertRowId}`);
      return result.lastInsertRowId;
    } catch (error) {
      console.error(`❌ Error creating ${table}:`, error);
      throw error;
    }
  }

  async findAll(table, conditions = '', params = []) {
    if (Platform.OS === 'web') return [];
    try {
      const db = await this.getDatabase();
      const sql = `SELECT * FROM ${table} ${conditions}`;
      const results = await db.getAllAsync(sql, params);
      return results || [];
    } catch (error) {
      console.error(`❌ Error fetching ${table}:`, error);
      throw error;
    }
  }

  async findById(table, id) {
    if (Platform.OS === 'web') return null;
    try {
      const db = await this.getDatabase();
      const result = await db.getFirstAsync(
        `SELECT * FROM ${table} WHERE id = ?`,
        [id]
      );
      return result || null;
    } catch (error) {
      console.error(`❌ Error finding ${table} by ID:`, error);
      throw error;
    }
  }

  async update(table, id, data) {
    if (Platform.OS === 'web') return null;
    try {
      const db = await this.getDatabase();
      const keys = Object.keys(data);
      const values = Object.values(data);
      const setClause = keys.map(key => `${key} = ?`).join(', ');
      
      const result = await db.runAsync(
        `UPDATE ${table} SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [...values, id]
      );
      
      console.log(`✅ Updated ${table} record ID: ${id}`);
      return result.changes;
    } catch (error) {
      console.error(`❌ Error updating ${table}:`, error);
      throw error;
    }
  }

  async delete(table, id) {
    if (Platform.OS === 'web') return null;
    try {
      const db = await this.getDatabase();
      const result = await db.runAsync(
        `DELETE FROM ${table} WHERE id = ?`,
        [id]
      );
      
      console.log(`✅ Deleted ${table} record ID: ${id}`);
      return result.changes;
    } catch (error) {
      console.error(`❌ Error deleting ${table}:`, error);
      throw error;
    }
  }

  async softDelete(table, id) {
    if (Platform.OS === 'web') return null;
    try {
      const db = await this.getDatabase();
      const result = await db.runAsync(
        `UPDATE ${table} SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [id]
      );
      
      console.log(`✅ Soft deleted ${table} record ID: ${id}`);
      return result.changes;
    } catch (error) {
      console.error(`❌ Error soft deleting ${table}:`, error);
      throw error;
    }
  }

  // Utility method to execute raw SQL
  async executeQuery(sql, params = []) {
    if (Platform.OS === 'web') {
      console.log('⚠️  Database query skipped on web:', sql);
      return [];
    }

    try {
      const db = await this.getDatabase();
      return await db.getAllAsync(sql, params);
    } catch (error) {
      console.error('❌ Query execution error:', error);
      throw error;
    }
  }

  async executeRun(sql, params = []) {
    if (Platform.OS === 'web') {
      console.log('⚠️  Database run skipped on web:', sql);
      return null;
    }

    try {
      const db = await this.getDatabase();
      return await db.runAsync(sql, params);
    } catch (error) {
      console.error('❌ Run execution error:', error);
      throw error;
    }
  }

  // Get next invoice number
  async getNextInvoiceNumber() {
    if (Platform.OS === 'web') return 'INV-2024-001';
    
    try {
      const prefix = await this.getSetting('invoice_prefix', 'INV');
      const lastInvoice = await this.executeQuery(
        'SELECT invoice_number FROM invoices ORDER BY id DESC LIMIT 1'
      );
      
      if (lastInvoice.length > 0) {
        const lastNumber = lastInvoice[0].invoice_number;
        const numberPart = lastNumber.split('-').pop();
        const nextNumber = parseInt(numberPart) + 1;
        return `${prefix}-${new Date().getFullYear()}-${String(nextNumber).padStart(3, '0')}`;
      } else {
        const startingNumber = await this.getSetting('invoice_starting_number', '1');
        return `${prefix}-${new Date().getFullYear()}-${String(startingNumber).padStart(3, '0')}`;
      }
    } catch (error) {
      console.error('❌ Error getting next invoice number:', error);
      return `INV-${new Date().getFullYear()}-001`;
    }
  }

  // Settings helpers
  async getSetting(key, defaultValue = null) {
    if (Platform.OS === 'web') return defaultValue;
    
    try {
      const db = await this.getDatabase();
      const result = await db.getFirstAsync(
        'SELECT value FROM settings WHERE key = ?',
        [key]
      );
      return result ? result.value : defaultValue;
    } catch (error) {
      console.error(`❌ Error getting setting ${key}:`, error);
      return defaultValue;
    }
  }

  async setSetting(key, value, type = 'string') {
    if (Platform.OS === 'web') return;
    
    try {
      const db = await this.getDatabase();
      await db.runAsync(
        'INSERT OR REPLACE INTO settings (key, value, type, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
        [key, value, type]
      );
      console.log(`✅ Setting ${key} updated`);
    } catch (error) {
      console.error(`❌ Error setting ${key}:`, error);
      throw error;
    }
  }

  // Close database connection
  async close() {
    if (Platform.OS === 'web') return;
    
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
      this.isInitialized = false;
      console.log('🔒 Database connection closed');
    }
  }
}

// Export singleton instance
export default new DatabaseService();