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
      const existingItems = await DatabaseService.executeQuery('SELECT COUNT(*) as count FROM inventory_items');
      
      if (existingItems[0]?.count > 0) {
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
      // Populate in order due to foreign key constraints
      await this.populateCategories();
      await this.populateParties();
      await this.populateItems();
      await this.populateSampleTransactions();
      
      console.log('✅ Sample business data populated successfully!');
    } catch (error) {
      console.error('❌ Error populating business data:', error);
      throw error;
    }
  }

  // Populate categories
  async populateCategories() {
    console.log('📂 Adding product categories...');
    
    const categories = [
      { name: 'Electronics', description: 'Electronic devices and accessories' },
      { name: 'Clothing', description: 'Apparel and fashion items' },
      { name: 'Food & Beverages', description: 'Food items and drinks' },
      { name: 'Books', description: 'Books and educational materials' },
      { name: 'Home & Garden', description: 'Home improvement and garden items' },
      { name: 'Sports', description: 'Sports equipment and accessories' },
      { name: 'Automotive', description: 'Car parts and automotive accessories' },
      { name: 'Health & Beauty', description: 'Health and beauty products' }
    ];

    for (const category of categories) {
      await DatabaseService.executeQuery(
        'INSERT INTO categories (name, description) VALUES (?, ?)',
        [category.name, category.description]
      );
    }
  }

  // Populate parties (customers and suppliers)
  async populateParties() {
    console.log('👥 Adding customers and suppliers...');
    
    const parties = [
      // Customers
      {
        name: 'Rajesh Kumar',
        type: 'customer',
        email: 'rajesh.kumar@email.com',
        phone: '+91 98765 43210',
        address: '123 MG Road, Mumbai, Maharashtra 400001',
        gst_number: null,
        credit_limit: 50000,
        balance: 0
      },
      {
        name: 'Priya Sharma',
        type: 'customer',
        email: 'priya.sharma@email.com',
        phone: '+91 87654 32109',
        address: '456 Park Street, Delhi, Delhi 110001',
        gst_number: null,
        credit_limit: 30000,
        balance: 0
      },
      {
        name: 'ABC Electronics Ltd',
        type: 'customer',
        email: 'sales@abcelectronics.com',
        phone: '+91 76543 21098',
        gst_number: '27ABCDE1234F1Z5',
        address: '789 Business Park, Bangalore, Karnataka 560001',
        credit_limit: 100000,
        balance: 0
      },
      // Suppliers
      {
        name: 'Tech Suppliers Pvt Ltd',
        type: 'supplier',
        email: 'info@techsuppliers.com',
        phone: '+91 65432 10987',
        gst_number: '29FGHIJ5678K2L6',
        address: '321 Industrial Area, Chennai, Tamil Nadu 600001',
        credit_limit: 0,
        balance: 0
      },
      {
        name: 'Fashion Wholesale',
        type: 'supplier',
        email: 'orders@fashionwholesale.com',
        phone: '+91 54321 09876',
        address: '654 Textile Market, Ahmedabad, Gujarat 380001',
        gst_number: null,
        credit_limit: 0,
        balance: 0
      }
    ];

    for (const party of parties) {
      await DatabaseService.executeQuery(
        `INSERT INTO parties (name, type, email, phone, gst_number, address, credit_limit, balance) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          party.name, party.type, party.email, party.phone, party.gst_number,
          party.address, party.credit_limit, party.balance
        ]
      );
    }
  }

  // Populate items
  async populateItems() {
    console.log('📦 Adding inventory items...');
    
    const items = [
      // Electronics
      {
        name: 'iPhone 15 Pro',
        description: 'Latest iPhone with Pro camera system',
        category: 'Electronics',
        item_code: 'IPH15PRO001',
        cost_price: 80000,
        selling_price: 125000,
        stock_quantity: 25,
        min_stock_level: 5,
        hsn_code: '8517'
      },
      {
        name: 'Samsung Galaxy S24',
        description: 'Flagship Android smartphone',
        category: 'Electronics',
        item_code: 'SAM24001',
        cost_price: 65000,
        selling_price: 85000,
        stock_quantity: 18,
        min_stock_level: 5,
        hsn_code: '8517'
      },
      // Clothing
      {
        name: 'Cotton T-Shirt',
        description: 'Premium quality cotton t-shirt',
        category: 'Clothing',
        item_code: 'TSHIRT001',
        cost_price: 200,
        selling_price: 450,
        stock_quantity: 100,
        min_stock_level: 20,
        hsn_code: '6104'
      },
      {
        name: 'Denim Jeans',
        description: 'Classic fit denim jeans',
        category: 'Clothing',
        item_code: 'JEANS001',
        cost_price: 800,
        selling_price: 1500,
        stock_quantity: 45,
        min_stock_level: 10,
        hsn_code: '6203'
      },
      // Low stock items for notifications
      {
        name: 'Wireless Earbuds',
        description: 'Bluetooth wireless earbuds',
        category: 'Electronics',
        item_code: 'EARBUDS001',
        cost_price: 1500,
        selling_price: 2500,
        stock_quantity: 3, // Low stock
        min_stock_level: 5,
        hsn_code: '8517'
      }
    ];

    for (const item of items) {
      await DatabaseService.executeQuery(
        `INSERT INTO inventory_items (item_name, item_code, category, description, cost_price, selling_price, stock_quantity, min_stock_level, hsn_code) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          item.name, item.item_code, item.category, item.description,
          item.cost_price, item.selling_price, item.stock_quantity, item.min_stock_level, item.hsn_code
        ]
      );
    }
  }

  // Populate sample transactions
  async populateSampleTransactions() {
    console.log('💰 Adding sample transactions...');
    
    // Get party and item IDs for references
    const customer1 = await DatabaseService.executeQuery('SELECT id FROM parties WHERE name = ?', ['Rajesh Kumar']);
    const customer2 = await DatabaseService.executeQuery('SELECT id FROM parties WHERE name = ?', ['ABC Electronics Ltd']);
    const iphone = await DatabaseService.executeQuery('SELECT id FROM inventory_items WHERE item_code = ?', ['IPH15PRO001']);
    const samsung = await DatabaseService.executeQuery('SELECT id FROM inventory_items WHERE item_code = ?', ['SAM24001']);

    if (customer1.length > 0 && iphone.length > 0) {
      // Create sample invoice 1
      await DatabaseService.executeQuery(
        `INSERT INTO invoices (invoice_number, party_id, date, due_date, subtotal, tax_amount, total, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['INV-001', customer1[0].id, '2024-01-15', '2024-02-15', 125000, 22500, 147500, 'paid']
      );

      // Get the invoice ID
      const invoice1 = await DatabaseService.executeQuery('SELECT id FROM invoices WHERE invoice_number = ?', ['INV-001']);
      
      if (invoice1.length > 0) {
        await DatabaseService.executeQuery(
          'INSERT INTO invoice_items (invoice_id, item_id, item_name, quantity, rate, tax_rate, tax_amount, total) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [invoice1[0].id, iphone[0].id, 'iPhone 15 Pro', 1, 125000, 18, 22500, 147500]
        );
      }
    }

    if (customer2.length > 0 && samsung.length > 0) {
      // Create sample invoice 2
      await DatabaseService.executeQuery(
        `INSERT INTO invoices (invoice_number, party_id, date, due_date, subtotal, tax_amount, total, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['INV-002', customer2[0].id, '2024-01-20', '2024-02-20', 170000, 30600, 200600, 'pending']
      );

      // Get the invoice ID
      const invoice2 = await DatabaseService.executeQuery('SELECT id FROM invoices WHERE invoice_number = ?', ['INV-002']);
      
      if (invoice2.length > 0) {
        await DatabaseService.executeQuery(
          'INSERT INTO invoice_items (invoice_id, item_id, item_name, quantity, rate, tax_rate, tax_amount, total) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [invoice2[0].id, samsung[0].id, 'Samsung Galaxy S24', 2, 85000, 18, 30600, 200600]
        );
      }
    }

    // Add sample transactions
    if (customer1.length > 0) {
      await DatabaseService.executeQuery(
        `INSERT INTO transactions (reference, party_id, type, amount, date, description, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ['TXN001', customer1[0].id, 'income', 147500, '2024-01-15', 'Sale of iPhone 15 Pro', 'completed']
      );
    }

    if (customer2.length > 0) {
      await DatabaseService.executeQuery(
        `INSERT INTO transactions (reference, party_id, type, amount, date, description, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ['TXN002', customer2[0].id, 'income', 200600, '2024-01-20', 'Sale of Samsung Galaxy S24', 'pending']
      );
    }

    // Add sample notification
    await DatabaseService.executeQuery(
      `INSERT INTO notifications (title, message, type, related_id, related_type) 
       VALUES (?, ?, ?, ?, ?)`,
      ['Welcome!', 'Welcome to Brojgar Business App', 'info', null, null]
    );
  }
}

// Export singleton instance
export default new DatabaseInitializer();
