// database/DatabaseService.js
import * as SQLite from 'expo-sqlite';

class DatabaseService {
  static db = null;

  static async init() {
    try {
      console.log('🔌 Connecting to SQLite database...');
      this.db = await SQLite.openDatabaseAsync('brojgar_business.db');
      
      console.log('🗄️ Creating database tables...');
      await this.createTables();
      
      console.log('✅ All tables created successfully');
      
      await this.runMigrations();
      console.log('✅ All migrations executed successfully');
      console.log('✅ Migrations completed');
      
      console.log('⚙️ Inserting initial configuration...');
      await this.insertInitialData();
      
      console.log('✅ Database connected successfully');
      return true;
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  static async createTables() {
    const tables = [
      // Business Settings Table
      `CREATE TABLE IF NOT EXISTS business_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        deleted_at DATETIME NULL
      )`,

      // Categories Table
      `CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        deleted_at DATETIME NULL
      )`,

      // Parties Table (Customers & Suppliers)
      `CREATE TABLE IF NOT EXISTS parties (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        address TEXT,
        gst_number TEXT,
        pan_number TEXT,
        type TEXT NOT NULL DEFAULT 'customer',
        credit_limit REAL DEFAULT 0,
        credit_days INTEGER DEFAULT 30,
        opening_balance REAL DEFAULT 0,
        balance REAL DEFAULT 0,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        deleted_at DATETIME NULL
      )`,

      // Inventory Items Table
      `CREATE TABLE IF NOT EXISTS inventory_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_name TEXT NOT NULL,
        item_code TEXT UNIQUE,
        category TEXT,
        description TEXT,
        stock_quantity INTEGER DEFAULT 0,
        min_stock_level INTEGER DEFAULT 5,
        cost_price REAL DEFAULT 0,
        selling_price REAL DEFAULT 0,
        tax_rate REAL DEFAULT 18,
        unit TEXT DEFAULT 'pcs',
        hsn_code TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        deleted_at DATETIME NULL
      )`,

      // Invoices Table
      `CREATE TABLE IF NOT EXISTS invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_number TEXT UNIQUE NOT NULL,
        party_id INTEGER,
        date TEXT NOT NULL,
        due_date TEXT,
        subtotal REAL DEFAULT 0,
        tax_amount REAL DEFAULT 0,
        discount_amount REAL DEFAULT 0,
        total REAL DEFAULT 0,
        paid_amount REAL DEFAULT 0,
        status TEXT DEFAULT 'draft',
        notes TEXT,
        terms TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        deleted_at DATETIME NULL,
        FOREIGN KEY (party_id) REFERENCES parties (id)
      )`,

      // Invoice Items Table
      `CREATE TABLE IF NOT EXISTS invoice_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_id INTEGER NOT NULL,
        item_id INTEGER NOT NULL,
        item_name TEXT,
        quantity REAL DEFAULT 1,
        rate REAL DEFAULT 0,
        tax_rate REAL DEFAULT 18,
        tax_amount REAL DEFAULT 0,
        total REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        deleted_at DATETIME NULL,
        FOREIGN KEY (invoice_id) REFERENCES invoices (id),
        FOREIGN KEY (item_id) REFERENCES inventory_items (id)
      )`,

      // Transactions Table (Income & Expenses)
      `CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reference TEXT,
        party_id INTEGER,
        type TEXT NOT NULL DEFAULT 'income',
        amount REAL DEFAULT 0,
        date TEXT NOT NULL,
        description TEXT,
        category TEXT,
        payment_method TEXT DEFAULT 'cash',
        status TEXT DEFAULT 'completed',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        deleted_at DATETIME NULL,
        FOREIGN KEY (party_id) REFERENCES parties (id)
      )`,

      // Notifications Table
      `CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        message TEXT,
        type TEXT DEFAULT 'info',
        action_url TEXT,
        related_id INTEGER,
        related_type TEXT,
        read_at DATETIME NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        deleted_at DATETIME NULL
      )`,

      // Recent Searches Table
      `CREATE TABLE IF NOT EXISTS recent_searches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        query TEXT NOT NULL,
        type TEXT,
        results_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        deleted_at DATETIME NULL
      )`,

      // Backups Table
      `CREATE TABLE IF NOT EXISTS backups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL,
        file_path TEXT,
        file_size INTEGER DEFAULT 0,
        backup_type TEXT DEFAULT 'manual',
        status TEXT DEFAULT 'completed',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        deleted_at DATETIME NULL
      )`
    ];

    for (const table of tables) {
      await this.db.execAsync(table);
    }
  }

  static async runMigrations() {
    // Migrations are handled by the reset in App.js
    console.log('✅ Schema is fresh, no migrations needed');
  }

  static async insertInitialData() {
    try {
      // Check if business settings already exist
      const existingSettings = await this.executeQuery(
        'SELECT COUNT(*) as count FROM business_settings WHERE deleted_at IS NULL'
      );

      if (existingSettings[0]?.count > 0) {
        console.log('ℹ️ Initial data already exists');
        return;
      }

      // Insert default business settings
      const defaultSettings = [
        { key: 'business_name', value: 'Brojgar Business' },
        { key: 'business_email', value: '' },
        { key: 'business_phone', value: '' },
        { key: 'business_address', value: '' },
        { key: 'tax_rate', value: '18' },
        { key: 'currency', value: 'INR' },
        { key: 'invoice_prefix', value: 'INV' },
        { key: 'last_invoice_number', value: '0' },
        { key: 'theme', value: 'light' },
        { key: 'auto_backup', value: 'true' }
      ];

      for (const setting of defaultSettings) {
        await this.executeQuery(
          'INSERT INTO business_settings (key, value) VALUES (?, ?)',
          [setting.key, setting.value]
        );
      }

      await this.insertSampleData();
      console.log('✅ Initial data inserted successfully');
    } catch (error) {
      console.error('❌ Error inserting initial data:', error);
      throw error;
    }
  }

  static async insertSampleData() {
    try {
      // Insert sample customer
      await this.executeQuery(
        `INSERT INTO parties (name, phone, email, type, credit_limit, balance) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        ['Sample Customer', '+91 9876543210', 'customer@example.com', 'customer', 50000, 0]
      );

      // Insert sample category
      await this.executeQuery(
        'INSERT INTO categories (name, description) VALUES (?, ?)',
        ['General', 'General category for items']
      );

      // Insert sample product
      await this.executeQuery(
        `INSERT INTO inventory_items (item_name, item_code, category, stock_quantity, min_stock_level, cost_price, selling_price) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ['Sample Product', 'SP001', 'General', 100, 10, 50, 75]
      );

      // Insert sample invoice
      await this.executeQuery(
        `INSERT INTO invoices (invoice_number, party_id, date, due_date, subtotal, tax_amount, total, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['INV001', 1, new Date().toISOString().split('T')[0], 
         new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0], 
         100, 18, 118, 'sent']
      );

      // Insert sample invoice item
      await this.executeQuery(
        `INSERT INTO invoice_items (invoice_id, item_id, item_name, quantity, rate, tax_rate, tax_amount, total) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [1, 1, 'Sample Product', 2, 50, 18, 18, 118]
      );

      // Insert sample transaction
      await this.executeQuery(
        `INSERT INTO transactions (reference, party_id, type, amount, date, description, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ['TXN001', 1, 'income', 118, new Date().toISOString().split('T')[0], 'Sample sale', 'completed']
      );

      // Insert sample notification
      await this.executeQuery(
        `INSERT INTO notifications (title, message, type, related_id, related_type) 
         VALUES (?, ?, ?, ?, ?)`,
        ['Welcome!', 'Welcome to Brojgar Business App', 'info', null, null]
      );

      console.log('✅ Sample data inserted successfully');
    } catch (error) {
      console.error('❌ Error inserting sample data:', error);
    }
  }

  static async executeQuery(sql, params = []) {
    try {
      if (!this.db) {
        throw new Error('Database not initialized');
      }

      // Determine if this is a SELECT query or a modification query
      const isSelect = sql.trim().toUpperCase().startsWith('SELECT');
      
      if (isSelect) {
        const result = await this.db.getAllAsync(sql, params);
        return result || [];
      } else {
        return await this.db.runAsync(sql, params);
      }
    } catch (error) {
      console.error('❌ Query execution error:', error);
      throw error;
    }
  }

  static async getSetting(key) {
    try {
      const result = await this.executeQuery(
        'SELECT value FROM business_settings WHERE key = ? AND deleted_at IS NULL',
        [key]
      );
      return result[0]?.value || null;
    } catch (error) {
      console.error('❌ Error getting setting:', error);
      return null;
    }
  }

  static async setSetting(key, value) {
    try {
      const existing = await this.executeQuery(
        'SELECT id FROM business_settings WHERE key = ? AND deleted_at IS NULL',
        [key]
      );

      if (existing.length > 0) {
        await this.executeQuery(
          'UPDATE business_settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ? AND deleted_at IS NULL',
          [value, key]
        );
      } else {
        await this.executeQuery(
          'INSERT INTO business_settings (key, value) VALUES (?, ?)',
          [key, value]
        );
      }

      console.log(`✅ Setting ${key} updated`);
      return true;
    } catch (error) {
      console.error('❌ Error setting value:', error);
      return false;
    }
  }

  static async getNextInvoiceNumber() {
    try {
      const lastNumber = await this.getSetting('last_invoice_number');
      const nextNumber = parseInt(lastNumber || '0') + 1;
      
      await this.setSetting('last_invoice_number', nextNumber.toString());
      
      const prefix = await this.getSetting('invoice_prefix') || 'INV';
      return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
    } catch (error) {
      console.error('❌ Error getting next invoice number:', error);
      return `INV${Date.now()}`;
    }
  }

  static async clearAllData() {
    try {
      const tables = [
        'notifications', 'recent_searches', 'backups', 'invoice_items', 
        'invoices', 'transactions', 'inventory_items', 'parties', 
        'categories', 'business_settings'
      ];

      for (const table of tables) {
        await this.db.execAsync(`DELETE FROM ${table}`);
      }

      console.log('✅ All data cleared');
      return true;
    } catch (error) {
      console.error('❌ Error clearing data:', error);
      return false;
    }
  }

  static async close() {
    try {
      if (this.db) {
        await this.db.closeAsync();
        this.db = null;
        console.log('✅ Database connection closed');
      }
    } catch (error) {
      console.error('❌ Error closing database:', error);
    }
  }

  // Add backup method for file operations
  static async backup() {
    try {
      // For SQLite, we can export the data as JSON
      const tables = [
        'business_settings', 'categories', 'parties', 'inventory_items',
        'invoices', 'invoice_items', 'transactions', 'notifications'
      ];

      const backup = {};
      
      for (const table of tables) {
        backup[table] = await this.executeQuery(`SELECT * FROM ${table} WHERE deleted_at IS NULL`);
      }

      return {
        timestamp: new Date().toISOString(),
        version: '1.0',
        data: backup
      };
    } catch (error) {
      console.error('❌ Error creating backup:', error);
      throw error;
    }
  }

  static async restore(backupData) {
    try {
      if (!backupData || !backupData.data) {
        throw new Error('Invalid backup data');
      }

      // Clear existing data
      await this.clearAllData();

      // Restore data
      for (const [tableName, tableData] of Object.entries(backupData.data)) {
        if (Array.isArray(tableData) && tableData.length > 0) {
          const columns = Object.keys(tableData[0]).filter(col => col !== 'id');
          const placeholders = columns.map(() => '?').join(',');
          
          for (const row of tableData) {
            const values = columns.map(col => row[col]);
            await this.executeQuery(
              `INSERT INTO ${tableName} (${columns.join(',')}) VALUES (${placeholders})`,
              values
            );
          }
        }
      }

      console.log('✅ Database restored from backup');
      return true;
    } catch (error) {
      console.error('❌ Error restoring backup:', error);
      throw error;
    }
  }
}

export default DatabaseService;
