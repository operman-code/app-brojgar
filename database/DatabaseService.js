// database/DatabaseService.js
import * as SQLite from 'expo-sqlite';

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
      if (this.isInitialized) return this.db;

      console.log('🔌 Connecting to SQLite database...');
      this.db = await SQLite.openDatabaseAsync(this.DATABASE_NAME);
      
      console.log('✅ Database connected successfully');
      this.isInitialized = true;
      
      return this.db;
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  // Get database instance
  async getDatabase() {
    if (!this.isInitialized) {
      await this.init();
    }
    return this.db;
  }

  // Create all database tables
  async createTables() {
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
        description TEXT,
        color TEXT DEFAULT '#3B82F6',
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );`,

      // Parties table (customers/suppliers)
      `CREATE TABLE IF NOT EXISTS parties (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('customer', 'supplier', 'both')),
        phone TEXT,
        email TEXT,
        address_line1 TEXT,
        address_line2 TEXT,
        city TEXT,
        state TEXT,
        pincode TEXT,
        country TEXT DEFAULT 'India',
        gst_number TEXT,
        pan_number TEXT,
        credit_limit DECIMAL(10,2) DEFAULT 0,
        credit_days INTEGER DEFAULT 30,
        current_balance DECIMAL(10,2) DEFAULT 0,
        opening_balance DECIMAL(10,2) DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );`,

      // Items table
      `CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        sku TEXT UNIQUE,
        barcode TEXT UNIQUE,
        category_id INTEGER,
        unit TEXT DEFAULT 'pcs',
        cost_price DECIMAL(10,2) DEFAULT 0,
        selling_price DECIMAL(10,2) DEFAULT 0,
        mrp DECIMAL(10,2) DEFAULT 0,
        tax_rate DECIMAL(5,2) DEFAULT 0,
        current_stock DECIMAL(10,3) DEFAULT 0,
        minimum_stock DECIMAL(10,3) DEFAULT 0,
        maximum_stock DECIMAL(10,3) DEFAULT 0,
        reorder_point DECIMAL(10,3) DEFAULT 0,
        location TEXT,
        is_active INTEGER DEFAULT 1,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories (id)
      );`,

      // Stock movements table
      `CREATE TABLE IF NOT EXISTS stock_movements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_id INTEGER NOT NULL,
        movement_type TEXT NOT NULL CHECK (movement_type IN ('in', 'out', 'adjustment')),
        quantity DECIMAL(10,3) NOT NULL,
        reference_type TEXT,
        reference_id INTEGER,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (item_id) REFERENCES items (id)
      );`,

      // Invoices table
      `CREATE TABLE IF NOT EXISTS invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_number TEXT UNIQUE NOT NULL,
        party_id INTEGER NOT NULL,
        invoice_date DATE NOT NULL,
        due_date DATE,
        subtotal DECIMAL(10,2) DEFAULT 0,
        tax_amount DECIMAL(10,2) DEFAULT 0,
        discount_amount DECIMAL(10,2) DEFAULT 0,
        total_amount DECIMAL(10,2) DEFAULT 0,
        paid_amount DECIMAL(10,2) DEFAULT 0,
        balance_amount DECIMAL(10,2) DEFAULT 0,
        status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
        notes TEXT,
        terms TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (party_id) REFERENCES parties (id)
      );`,

      // Invoice items table
      `CREATE TABLE IF NOT EXISTS invoice_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_id INTEGER NOT NULL,
        item_id INTEGER,
        item_name TEXT NOT NULL,
        description TEXT,
        quantity DECIMAL(10,3) NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        tax_rate DECIMAL(5,2) DEFAULT 0,
        tax_amount DECIMAL(10,2) DEFAULT 0,
        line_total DECIMAL(10,2) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (invoice_id) REFERENCES invoices (id) ON DELETE CASCADE,
        FOREIGN KEY (item_id) REFERENCES items (id)
      );`,

      // Payments table
      `CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_id INTEGER,
        party_id INTEGER NOT NULL,
        payment_date DATE NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        payment_method TEXT DEFAULT 'cash' CHECK (payment_method IN ('cash', 'card', 'bank_transfer', 'cheque', 'upi', 'other')),
        reference_number TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (invoice_id) REFERENCES invoices (id),
        FOREIGN KEY (party_id) REFERENCES parties (id)
      );`,

      // Expenses table
      `CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        category TEXT,
        expense_date DATE NOT NULL,
        payment_method TEXT DEFAULT 'cash',
        reference_number TEXT,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );`,

      // Audit log table
      `CREATE TABLE IF NOT EXISTS audit_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        table_name TEXT NOT NULL,
        record_id INTEGER NOT NULL,
        action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
        old_values TEXT,
        new_values TEXT,
        user_info TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );`
    ];

    for (const tableSQL of tables) {
      await this.db.execAsync(tableSQL);
    }

    // Enable foreign keys
    await this.db.execAsync('PRAGMA foreign_keys = ON;');
    
    console.log('✅ All database tables created successfully');
  }

  // Run database migrations
  async runMigrations() {
    // Check current version
    const versionResult = await this.db.getFirstAsync('PRAGMA user_version;');
    const currentVersion = versionResult?.user_version || 0;

    if (currentVersion < this.DATABASE_VERSION) {
      console.log(`🔄 Running migrations from version ${currentVersion} to ${this.DATABASE_VERSION}`);
      
      // Add migration logic here when needed
      
      // Update version
      await this.db.execAsync(`PRAGMA user_version = ${this.DATABASE_VERSION};`);
      console.log('✅ Database migrations completed');
    }
  }

  // Close database connection
  async close() {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
      this.isInitialized = false;
      console.log('🔌 Database connection closed');
    }
  }

  // Execute raw SQL
  async execute(sql, params = []) {
    const db = await this.getDatabase();
    return await db.runAsync(sql, params);
  }

  // Get single record
  async getFirst(sql, params = []) {
    const db = await this.getDatabase();
    return await db.getFirstAsync(sql, params);
  }

  // Get multiple records
  async getAll(sql, params = []) {
    const db = await this.getDatabase();
    return await db.getAllAsync(sql, params);
  }
}

// Export singleton instance
const databaseService = new DatabaseService();
export default databaseService;
