// database/DatabaseInitializer.js
import DatabaseService from './DatabaseService';

class DatabaseInitializer {
  constructor() {
    this.isInitialized = false;
  }

  // Initialize database with sample business data
  async initializeApp() {
    try {
      console.log('🚀 Initializing Brojgar Business App...');
      
      // Step 1: Initialize database connection and create tables
      console.log('🗄️  Setting up database...');
      await DatabaseService.init();
      
      // Step 2: Insert initial configuration
      console.log('⚙️  Adding initial configuration...');
      await DatabaseService.insertInitialData();
      
      // Step 3: Check if sample data already exists
      const db = await DatabaseService.getDatabase();
      const existingItems = await db.getFirstAsync('SELECT COUNT(*) as count FROM items');
      
      if (existingItems.count > 0) {
        console.log('ℹ️  Sample business data already exists, skipping population...');
        this.isInitialized = true;
        console.log('✅ App initialization complete!');
        return true;
      }
      
      // Step 4: Populate with sample business data
      console.log('📊 Populating sample business data...');
      await this.populateBusinessData();
      
      this.isInitialized = true;
      console.log('✅ App initialization complete!');
      
      return true;
    } catch (error) {
      console.error('❌ App initialization failed:', error);
      throw error;
    }
  }

  // Populate comprehensive business data
  async populateBusinessData() {
    try {
      const db = await DatabaseService.getDatabase();
      
      // Populate in order due to foreign key constraints
      await this.populateCategories(db);
      await this.populateParties(db);
      await this.populateItems(db);
      await this.populateSampleTransactions(db);
      
      console.log('✅ Sample business data populated successfully!');
    } catch (error) {
      console.error('❌ Error populating business data:', error);
      throw error;
    }
  }

  // Populate categories
  async populateCategories(db) {
    console.log('📂 Adding product categories...');
    
    const categories = [
      { name: 'Electronics', icon: '📱', color: '#3b82f6', description: 'Electronic devices and accessories' },
      { name: 'Clothing', icon: '👕', color: '#ef4444', description: 'Apparel and fashion items' },
      { name: 'Food & Beverages', icon: '🍔', color: '#10b981', description: 'Food items and drinks' },
      { name: 'Books', icon: '📚', color: '#8b5cf6', description: 'Books and educational materials' },
      { name: 'Home & Garden', icon: '🏠', color: '#f59e0b', description: 'Home improvement and garden items' },
      { name: 'Sports', icon: '⚽', color: '#06b6d4', description: 'Sports equipment and accessories' },
      { name: 'Automotive', icon: '🚗', color: '#6b7280', description: 'Car parts and automotive accessories' },
      { name: 'Health & Beauty', icon: '💄', color: '#ec4899', description: 'Health and beauty products' }
    ];

    for (const category of categories) {
      await db.runAsync(
        'INSERT INTO categories (name, icon, color, description) VALUES (?, ?, ?, ?)',
        [category.name, category.icon, category.color, category.description]
      );
    }
  }

  // Populate parties (customers and suppliers)
  async populateParties(db) {
    console.log('👥 Adding customers and suppliers...');
    
    const parties = [
      // Customers
      {
        name: 'Rajesh Kumar',
        type: 'customer',
        email: 'rajesh.kumar@email.com',
        phone: '+91 98765 43210',
        address: '123 MG Road, Mumbai, Maharashtra 400001',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        outstanding_balance: 15000
      },
      {
        name: 'Priya Sharma',
        type: 'customer',
        email: 'priya.sharma@email.com',
        phone: '+91 87654 32109',
        address: '456 Park Street, Delhi, Delhi 110001',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001',
        outstanding_balance: 8500
      },
      {
        name: 'ABC Electronics Ltd',
        type: 'customer',
        email: 'sales@abcelectronics.com',
        phone: '+91 76543 21098',
        gst_number: '27ABCDE1234F1Z5',
        address: '789 Business Park, Bangalore, Karnataka 560001',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560001',
        outstanding_balance: 45000,
        credit_limit: 100000
      },
      // Suppliers
      {
        name: 'Tech Suppliers Pvt Ltd',
        type: 'supplier',
        email: 'info@techsuppliers.com',
        phone: '+91 65432 10987',
        gst_number: '29FGHIJ5678K2L6',
        address: '321 Industrial Area, Chennai, Tamil Nadu 600001',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600001'
      },
      {
        name: 'Fashion Wholesale',
        type: 'supplier',
        email: 'orders@fashionwholesale.com',
        phone: '+91 54321 09876',
        address: '654 Textile Market, Ahmedabad, Gujarat 380001',
        city: 'Ahmedabad',
        state: 'Gujarat',
        pincode: '380001'
      }
    ];

    for (const party of parties) {
      await db.runAsync(
        `INSERT INTO parties (name, type, email, phone, gst_number, address, city, state, pincode, outstanding_balance, credit_limit) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          party.name, party.type, party.email, party.phone, party.gst_number || null,
          party.address, party.city, party.state, party.pincode,
          party.outstanding_balance || 0, party.credit_limit || 0
        ]
      );
    }
  }

  // Populate items
  async populateItems(db) {
    console.log('📦 Adding inventory items...');
    
    const items = [
      // Electronics
      {
        name: 'iPhone 15 Pro',
        description: 'Latest iPhone with Pro camera system',
        category: 'Electronics',
        sku: 'IPH15PRO001',
        barcode: '1234567890123',
        cost_price: 80000,
        selling_price: 125000,
        mrp: 134900,
        current_stock: 25,
        reorder_level: 5
      },
      {
        name: 'Samsung Galaxy S24',
        description: 'Flagship Android smartphone',
        category: 'Electronics',
        sku: 'SAM24001',
        barcode: '2345678901234',
        cost_price: 65000,
        selling_price: 85000,
        mrp: 89999,
        current_stock: 18,
        reorder_level: 5
      },
      // Clothing
      {
        name: 'Cotton T-Shirt',
        description: 'Premium quality cotton t-shirt',
        category: 'Clothing',
        sku: 'TSHIRT001',
        barcode: '3456789012345',
        cost_price: 200,
        selling_price: 450,
        mrp: 499,
        current_stock: 100,
        reorder_level: 20
      },
      {
        name: 'Denim Jeans',
        description: 'Classic fit denim jeans',
        category: 'Clothing',
        sku: 'JEANS001',
        barcode: '4567890123456',
        cost_price: 800,
        selling_price: 1500,
        mrp: 1799,
        current_stock: 45,
        reorder_level: 10
      },
      // Low stock items for notifications
      {
        name: 'Wireless Earbuds',
        description: 'Bluetooth wireless earbuds',
        category: 'Electronics',
        sku: 'EARBUDS001',
        barcode: '5678901234567',
        cost_price: 1500,
        selling_price: 2500,
        mrp: 2999,
        current_stock: 3, // Low stock
        reorder_level: 5
      }
    ];

    for (const item of items) {
      // Get category ID
      const category = await db.getFirstAsync(
        'SELECT id FROM categories WHERE name = ?',
        [item.category]
      );
      
      await db.runAsync(
        `INSERT INTO items (name, description, category_id, sku, barcode, cost_price, selling_price, mrp, current_stock, reorder_level) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          item.name, item.description, category.id, item.sku, item.barcode,
          item.cost_price, item.selling_price, item.mrp, item.current_stock, item.reorder_level
        ]
      );
    }
  }

  // Populate sample transactions
  async populateSampleTransactions(db) {
    console.log('💰 Adding sample transactions...');
    
    // Get party and item IDs for references
    const customer1 = await db.getFirstAsync('SELECT id FROM parties WHERE name = ?', ['Rajesh Kumar']);
    const customer2 = await db.getFirstAsync('SELECT id FROM parties WHERE name = ?', ['ABC Electronics Ltd']);
    const iphone = await db.getFirstAsync('SELECT id FROM items WHERE sku = ?', ['IPH15PRO001']);
    const samsung = await db.getFirstAsync('SELECT id FROM items WHERE sku = ?', ['SAM24001']);

    // Create sample invoices
    const invoices = [
      {
        invoice_number: 'INV-001',
        party_id: customer1.id,
        invoice_date: '2024-01-15',
        due_date: '2024-02-15',
        subtotal: 125000,
        tax_amount: 22500,
        total: 147500,
        status: 'paid'
      },
      {
        invoice_number: 'INV-002',
        party_id: customer2.id,
        invoice_date: '2024-01-20',
        due_date: '2024-02-20',
        subtotal: 170000,
        tax_amount: 30600,
        total: 200600,
        status: 'pending'
      }
    ];

    for (const invoice of invoices) {
      const result = await db.runAsync(
        `INSERT INTO invoices (invoice_number, party_id, invoice_date, due_date, subtotal, tax_amount, total, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          invoice.invoice_number, invoice.party_id, invoice.invoice_date, invoice.due_date,
          invoice.subtotal, invoice.tax_amount, invoice.total, invoice.status
        ]
      );

      // Add invoice items
      if (invoice.invoice_number === 'INV-001') {
        await db.runAsync(
          'INSERT INTO invoice_items (invoice_id, item_id, quantity, unit_price, total) VALUES (?, ?, ?, ?, ?)',
          [result.lastInsertRowId, iphone.id, 1, 125000, 125000]
        );
      } else {
        await db.runAsync(
          'INSERT INTO invoice_items (invoice_id, item_id, quantity, unit_price, total) VALUES (?, ?, ?, ?, ?)',
          [result.lastInsertRowId, samsung.id, 2, 85000, 170000]
        );
      }
    }

    // Add sample payment for paid invoice
    await db.runAsync(
      'INSERT INTO payments (invoice_id, party_id, amount, payment_method, payment_date) VALUES (?, ?, ?, ?, ?)',
      [1, customer1.id, 147500, 'bank_transfer', '2024-01-16']
    );

    // Add sample expenses
    const expenses = [
      { category: 'Office Rent', amount: 25000, description: 'Monthly office rent', expense_date: '2024-01-01' },
      { category: 'Utilities', amount: 3500, description: 'Electricity and internet', expense_date: '2024-01-02' },
      { category: 'Marketing', amount: 15000, description: 'Social media advertising', expense_date: '2024-01-05' }
    ];

    for (const expense of expenses) {
      await db.runAsync(
        'INSERT INTO expenses (category, amount, description, expense_date) VALUES (?, ?, ?, ?)',
        [expense.category, expense.amount, expense.description, expense.expense_date]
      );
    }
  }
}

// Export singleton instance
export default new DatabaseInitializer();
