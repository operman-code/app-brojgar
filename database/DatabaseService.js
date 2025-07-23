// database/DatabaseService.js
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
      
      // SDK 53 API - Use openDatabaseAsync
      this.db = await SQLite.openDatabaseAsync(this.DATABASE_NAME);
      
      // Enable foreign keys
      await this.db.execAsync('PRAGMA foreign_keys = ON;');
      
      // Create all tables
      await this.createTables();
      
      // Run migrations if needed
      await this.runMigrations();
      
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
    if (!this.isInitialized) {
      await this.init();
    }
    return this.db;
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
        { key: 'business_name', value: 'Brojgar Business', type: 'string' },
        { key: 'owner_name', value: 'Business Owner', type: 'string' },
        { key: 'gst_number', value: '27XXXXX1234X1Z5', type: 'string' },
        { key: 'phone', value: '+91 98765 43210', type: 'string' },
        { key: 'email', value: 'business@brojgar.com', type: 'string' },
        { key: 'address', value: 'Business Address, City, State', type: 'string' },
        { key: 'currency', value: 'INR', type: 'string' },
        { key: 'tax_rate', value: '18', type: 'number' },
        { key: 'invoice_prefix', value: 'INV', type: 'string' },
        { key: 'invoice_starting_number', value: '1', type: 'number' }
      ];

      for (const setting of defaultSettings) {
        await this.db.runAsync(
          'INSERT INTO settings (key, value, type) VALUES (?, ?, ?)',
          [setting.key, setting.value, setting.type]
        );
      }

      console.log('✅ Initial configuration inserted');
    } catch (error) {
      console.error('❌ Error inserting initial data:', error);
      throw error;
    }
  }

  // Utility method to execute raw SQL
  async executeQuery(sql, params = []) {
    if (Platform.OS === 'web') {
      console.log('⚠️  Database query skipped on web:', sql);
      return null;
    }

    try {
      const db = await this.getDatabase();
      return await db.getAllAsync(sql, params);
    } catch (error) {
      console.error('❌ Query execution error:', error);
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
