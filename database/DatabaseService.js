// database/DatabaseService.js
import * as SQLite from 'expo-sqlite';

class DatabaseService {
  constructor() {
    this.db = null;
    this.isInitialized = false;
    this.DATABASE_NAME = 'business_management.db';
    this.DATABASE_VERSION = 1;
  }

  // Initialize database connection
  async init() {
    try {
      if (this.isInitialized) return this.db;

      console.log('📁 Initializing SQLite Database...');
      this.db = await SQLite.openDatabaseAsync(this.DATABASE_NAME);
      
      // Enable foreign keys
      await this.db.execAsync('PRAGMA foreign_keys = ON;');
      
      // Create all tables
      await this.createTables();
      
      // Run migrations if needed
      await this.runMigrations();
      
      this.isInitialized = true;
      console.log('✅ Database initialized successfully');
      
      return this.db;
    } catch (error) {
      console.error('❌ Database initialization error:', error);
      throw error;
    }
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
        type TEXT NOT NULL DEFAULT 'item', -- item, party, expense
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
        type TEXT NOT NULL DEFAULT 'customer', -- customer, supplier, both
        email TEXT,
        phone TEXT,
        gst_number TEXT,
        pan_number TEXT,
        address_line1 TEXT,
        address_line2 TEXT,
        city TEXT,
        state TEXT,
        pincode TEXT,
        country TEXT DEFAULT 'India',
        opening_balance REAL DEFAULT 0,
        current_balance REAL DEFAULT 0,
        credit_limit REAL DEFAULT 0,
        credit_days INTEGER DEFAULT 30,
        is_active INTEGER DEFAULT 1,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
        tax_rate REAL DEFAULT 18,
        current_stock REAL DEFAULT 0,
        min_stock REAL DEFAULT 0,
        max_stock REAL DEFAULT 0,
        reorder_point REAL DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        is_service INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories (id)
      );`,

      // Stock movements table
      `CREATE TABLE IF NOT EXISTS stock_movements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_id INTEGER NOT NULL,
        movement_type TEXT NOT NULL, -- in, out, adjustment
        quantity REAL NOT NULL,
        rate REAL DEFAULT 0,
        total_value REAL DEFAULT 0,
        reference_type TEXT, -- purchase, sale, adjustment, opening_stock
        reference_id INTEGER,
        notes TEXT,
        movement_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (item_id) REFERENCES items (id)
      );`,

      // Invoices table
      `CREATE TABLE IF NOT EXISTS invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_number TEXT UNIQUE NOT NULL,
        invoice_type TEXT NOT NULL DEFAULT 'sale', -- sale, purchase, return
        party_id INTEGER NOT NULL,
        invoice_date DATE NOT NULL,
        due_date DATE,
        reference_number TEXT,
        subtotal REAL DEFAULT 0,
        discount_amount REAL DEFAULT 0,
        discount_percentage REAL DEFAULT 0,
        tax_amount REAL DEFAULT 0,
        total_amount REAL DEFAULT 0,
        paid_amount REAL DEFAULT 0,
        balance_amount REAL DEFAULT 0,
        status TEXT DEFAULT 'draft', -- draft, sent, paid, cancelled, overdue
        payment_status TEXT DEFAULT 'unpaid', -- unpaid, partial, paid
        notes TEXT,
        terms_conditions TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (party_id) REFERENCES parties (id)
      );`,

      // Invoice items table
      `CREATE TABLE IF NOT EXISTS invoice_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_id INTEGER NOT NULL,
        item_id INTEGER NOT NULL,
        description TEXT,
        quantity REAL NOT NULL,
        rate REAL NOT NULL,
        discount_amount REAL DEFAULT 0,
        discount_percentage REAL DEFAULT 0,
        tax_rate REAL DEFAULT 18,
        tax_amount REAL DEFAULT 0,
        total_amount REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (invoice_id) REFERENCES invoices (id) ON DELETE CASCADE,
        FOREIGN KEY (item_id) REFERENCES items (id)
      );`,

      // Payments table
      `CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        payment_number TEXT UNIQUE NOT NULL,
        party_id INTEGER NOT NULL,
        invoice_id INTEGER,
        payment_type TEXT NOT NULL DEFAULT 'received', -- received, paid
        payment_method TEXT DEFAULT 'cash', -- cash, bank, cheque, online, card
        amount REAL NOT NULL,
        payment_date DATE NOT NULL,
        reference_number TEXT,
        bank_account TEXT,
        notes TEXT,
        status TEXT DEFAULT 'completed', -- completed, pending, cancelled
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (party_id) REFERENCES parties (id),
        FOREIGN KEY (invoice_id) REFERENCES invoices (id)
      );`,

      // Expenses table
      `CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        expense_number TEXT UNIQUE NOT NULL,
        category_id INTEGER,
        description TEXT NOT NULL,
        amount REAL NOT NULL,
        payment_method TEXT DEFAULT 'cash',
        expense_date DATE NOT NULL,
        reference_number TEXT,
        vendor_name TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories (id)
      );`,

      // Audit log table
      `CREATE TABLE IF NOT EXISTS audit_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        table_name TEXT NOT NULL,
        record_id INTEGER NOT NULL,
        action TEXT NOT NULL, -- insert, update, delete
        old_values TEXT, -- JSON
        new_values TEXT, -- JSON
        user_id TEXT DEFAULT 'system',
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );`
    ];

    console.log('🔨 Creating database tables...');
    for (const table of tables) {
      await this.db.execAsync(table);
    }

    // Create indexes for better performance
    await this.createIndexes();
    
    console.log('✅ All tables created successfully');
  }

  // Create database indexes
  async createIndexes() {
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_parties_type ON parties(type);',
      'CREATE INDEX IF NOT EXISTS idx_parties_name ON parties(name);',
      'CREATE INDEX IF NOT EXISTS idx_items_category ON items(category_id);',
      'CREATE INDEX IF NOT EXISTS idx_items_sku ON items(sku);',
      'CREATE INDEX IF NOT EXISTS idx_items_barcode ON items(barcode);',
      'CREATE INDEX IF NOT EXISTS idx_stock_movements_item ON stock_movements(item_id);',
      'CREATE INDEX IF NOT EXISTS idx_stock_movements_date ON stock_movements(movement_date);',
      'CREATE INDEX IF NOT EXISTS idx_invoices_party ON invoices(party_id);',
      'CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(invoice_date);',
      'CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);',
      'CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id);',
      'CREATE INDEX IF NOT EXISTS idx_payments_party ON payments(party_id);',
      'CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);',
      'CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);',
      'CREATE INDEX IF NOT EXISTS idx_audit_log_table ON audit_log(table_name, record_id);'
    ];

    for (const index of indexes) {
      await this.db.execAsync(index);
    }
  }

  // Run database migrations
  async runMigrations() {
    try {
      // Check current database version
      const result = await this.db.getFirstAsync('PRAGMA user_version;');
      const currentVersion = result?.user_version || 0;

      if (currentVersion < this.DATABASE_VERSION) {
        console.log(`🔄 Running migrations from version ${currentVersion} to ${this.DATABASE_VERSION}`);
        
        // Add migration logic here as the app evolves
        // For now, just update the version
        await this.db.execAsync(`PRAGMA user_version = ${this.DATABASE_VERSION};`);
        
        console.log('✅ Migrations completed');
      }
    } catch (error) {
      console.error('❌ Migration error:', error);
      throw error;
    }
  }

  // Insert initial data
  async insertInitialData() {
    try {
      console.log('📊 Inserting initial data...');

      // Check if data already exists
      const settingsCount = await this.db.getFirstAsync('SELECT COUNT(*) as count FROM settings');
      if (settingsCount.count > 0) {
        console.log('ℹ️  Initial data already exists, skipping...');
        return;
      }

      // Insert default settings
      const defaultSettings = [
        { key: 'business_name', value: 'My Business', type: 'string' },
        { key: 'business_address', value: 'Business Address', type: 'string' },
        { key: 'business_phone', value: '+91 9876543210', type: 'string' },
        { key: 'business_email', value: 'info@mybusiness.com', type: 'string' },
        { key: 'business_gst', value: '', type: 'string' },
        { key: 'currency_symbol', value: '₹', type: 'string' },
        { key: 'currency_code', value: 'INR', type: 'string' },
        { key: 'tax_rate', value: '18', type: 'number' },
        { key: 'invoice_prefix', value: 'INV', type: 'string' },
        { key: 'invoice_counter', value: '1', type: 'number' },
        { key: 'payment_prefix', value: 'PAY', type: 'string' },
        { key: 'payment_counter', value: '1', type: 'number' },
        { key: 'expense_prefix', value: 'EXP', type: 'string' },
        { key: 'expense_counter', value: '1', type: 'number' }
      ];

      for (const setting of defaultSettings) {
        await this.db.runAsync(
          'INSERT INTO settings (key, value, type) VALUES (?, ?, ?)',
          [setting.key, setting.value, setting.type]
        );
      }

      // Insert default categories
      const defaultCategories = [
        { name: 'Electronics', type: 'item', icon: '⚡', color: '#3b82f6' },
        { name: 'Mobile Accessories', type: 'item', icon: '📱', color: '#10b981' },
        { name: 'Computers', type: 'item', icon: '💻', color: '#8b5cf6' },
        { name: 'Audio', type: 'item', icon: '🎵', color: '#f59e0b' },
        { name: 'Gaming', type: 'item', icon: '🎮', color: '#ef4444' },
        { name: 'Cables', type: 'item', icon: '🔌', color: '#6b7280' },
        { name: 'Office Supplies', type: 'expense', icon: '📋', color: '#06b6d4' },
        { name: 'Marketing', type: 'expense', icon: '📢', color: '#ec4899' },
        { name: 'Utilities', type: 'expense', icon: '💡', color: '#84cc16' }
      ];

      for (const category of defaultCategories) {
        await this.db.runAsync(
          'INSERT INTO categories (name, type, icon, color) VALUES (?, ?, ?, ?)',
          [category.name, category.type, category.icon, category.color]
        );
      }

      console.log('✅ Initial data inserted successfully');
    } catch (error) {
      console.error('❌ Error inserting initial data:', error);
      throw error;
    }
  }

  // Get database instance
  getDatabase() {
    if (!this.isInitialized) {
      throw new Error('Database not initialized. Call init() first.');
    }
    return this.db;
  }

  // Execute query with error handling
  async executeQuery(query, params = []) {
    try {
      const db = this.getDatabase();
      return await db.runAsync(query, params);
    } catch (error) {
      console.error('❌ Query execution error:', error);
      throw error;
    }
  }

  // Get single row
  async getFirst(query, params = []) {
    try {
      const db = this.getDatabase();
      return await db.getFirstAsync(query, params);
    } catch (error) {
      console.error('❌ Get first error:', error);
      throw error;
    }
  }

  // Get multiple rows
  async getAll(query, params = []) {
    try {
      const db = this.getDatabase();
      return await db.getAllAsync(query, params);
    } catch (error) {
      console.error('❌ Get all error:', error);
      throw error;
    }
  }

  // Transaction wrapper
  async transaction(callback) {
    const db = this.getDatabase();
    try {
      await db.execAsync('BEGIN TRANSACTION;');
      const result = await callback(db);
      await db.execAsync('COMMIT;');
      return result;
    } catch (error) {
      await db.execAsync('ROLLBACK;');
      console.error('❌ Transaction error:', error);
      throw error;
    }
  }

  // Backup database
  async backupDatabase() {
    try {
      // This would export the entire database
      // Implementation depends on specific backup requirements
      console.log('📦 Creating database backup...');
      
      const tables = ['settings', 'categories', 'parties', 'items', 'invoices', 'invoice_items', 'payments', 'expenses'];
      const backup = {};

      for (const table of tables) {
        backup[table] = await this.getAll(`SELECT * FROM ${table}`);
      }

      return {
        version: this.DATABASE_VERSION,
        timestamp: new Date().toISOString(),
        data: backup
      };
    } catch (error) {
      console.error('❌ Backup error:', error);
      throw error;
    }
  }

  // Restore database
  async restoreDatabase(backupData) {
    try {
      console.log('📥 Restoring database from backup...');
      
      await this.transaction(async (db) => {
        // Clear existing data
        const tables = ['expenses', 'payments', 'invoice_items', 'invoices', 'stock_movements', 'items', 'parties', 'categories', 'settings'];
        
        for (const table of tables) {
          await db.execAsync(`DELETE FROM ${table}`);
        }

        // Restore data
        for (const [tableName, records] of Object.entries(backupData.data)) {
          if (records.length > 0) {
            const keys = Object.keys(records[0]).filter(key => key !== 'id');
            const placeholders = keys.map(() => '?').join(', ');
            
            for (const record of records) {
              const values = keys.map(key => record[key]);
              await db.runAsync(
                `INSERT INTO ${tableName} (${keys.join(', ')}) VALUES (${placeholders})`,
                values
              );
            }
          }
        }
      });

      console.log('✅ Database restored successfully');
    } catch (error) {
      console.error('❌ Restore error:', error);
      throw error;
    }
  }

  // Close database connection
  async close() {
    if (this.db) {
      await this.db.closeAsync();
      this.isInitialized = false;
      console.log('🔒 Database connection closed');
    }
  }
}

// Export singleton instance
export default new DatabaseService();
