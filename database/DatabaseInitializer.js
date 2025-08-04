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
        gst_number: '27ABCDE1234F1Z5',
        outstanding_balance: 15000
      },
      {
        name: 'Priya Sharma',
        type: 'customer',
        email: 'priya.sharma@email.com',
        phone: '+91 87654 32109',
        address: '456 Park Street, Delhi, Delhi 110001',
        outstanding_balance: 8500
      },
      {
        name: 'ABC Electronics Ltd',
        type: 'customer',
        email: 'sales@abcelectronics.com',
        phone: '+91 76543 21098',
        gst_number: '29FGHIJ5678K2L6',
        address: '789 Business Park, Bangalore, Karnataka 560001',
        outstanding_balance: 45000,
        credit_limit: 100000
      },
      // Suppliers
      {
        name: 'Tech Suppliers Pvt Ltd',
        type: 'supplier',
        email: 'info@techsuppliers.com',
        phone: '+91 65432 10987',
        gst_number: '33KLMNO9012P3M7',
        address: '321 Industrial Area, Chennai, Tamil Nadu 600001'
      },
      {
        name: 'Fashion Wholesale',
        type: 'supplier',
        email: 'orders@fashionwholesale.com',
        phone: '+91 54321 09876',
        address: '654 Textile Market, Ahmedabad, Gujarat 380001'
      }
    ];

    for (const party of parties) {
      await DatabaseService.executeQuery(
        `INSERT INTO parties (name, type, email, phone, gst_number, address, balance, credit_limit) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          party.name, party.type, party.email, party.phone, party.gst_number || null,
          party.address, party.outstanding_balance || 0, party.credit_limit || 0
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
        item_code: 'SAMS24ULTRA001',
        cost_price: 75000,
        selling_price: 115000,
        stock_quantity: 30,
        min_stock_level: 8,
        hsn_code: '8517'
      },
      // Clothing
      {
        name: 'Cotton T-Shirt',
        description: 'Comfortable cotton t-shirt',
        category: 'Clothing',
        item_code: 'COTTONTS001',
        cost_price: 200,
        selling_price: 450,
        stock_quantity: 100,
        min_stock_level: 20,
        hsn_code: '6104'
      },
      {
        name: 'Denim Jeans',
        description: 'Classic blue denim jeans',
        category: 'Clothing',
        item_code: 'DENIMJEANS001',
        cost_price: 800,
        selling_price: 1800,
        stock_quantity: 50,
        min_stock_level: 10,
        hsn_code: '6203'
      },
      // Food & Beverages
      {
        name: 'Organic Coffee Beans',
        description: 'Premium organic coffee beans',
        category: 'Food & Beverages',
        item_code: 'COFFEEBEANS001',
        cost_price: 300,
        selling_price: 600,
        stock_quantity: 40,
        min_stock_level: 15,
        hsn_code: '0901'
      },
      // Books
      {
        name: 'Business Strategy Book',
        description: 'Comprehensive business strategy guide',
        category: 'Books',
        item_code: 'BUSINESSBOOK001',
        cost_price: 150,
        selling_price: 350,
        stock_quantity: 75,
        min_stock_level: 25,
        hsn_code: '4901'
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
    
    const transactions = [
      {
        reference: 'TXN001',
        party_id: 1,
        type: 'income',
        amount: 1180,
        date: new Date().toISOString().split('T')[0],
        description: 'Sale of iPhone 15 Pro',
        category: 'Sales',
        payment_method: 'card',
        status: 'completed'
      },
      {
        reference: 'TXN002',
        party_id: 2,
        type: 'income',
        amount: 450,
        date: new Date().toISOString().split('T')[0],
        description: 'Sale of Cotton T-Shirt',
        category: 'Sales',
        payment_method: 'cash',
        status: 'completed'
      },
      {
        reference: 'TXN003',
        party_id: 4,
        type: 'expense',
        amount: 50000,
        date: new Date().toISOString().split('T')[0],
        description: 'Purchase of Electronics',
        category: 'Purchases',
        payment_method: 'bank_transfer',
        status: 'completed'
      }
    ];

    for (const transaction of transactions) {
      await DatabaseService.executeQuery(
        `INSERT INTO transactions (reference, party_id, type, amount, date, description, category, payment_method, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          transaction.reference, transaction.party_id, transaction.type, transaction.amount,
          transaction.date, transaction.description, transaction.category, transaction.payment_method, transaction.status
        ]
      );
    }
  }
}

export default new DatabaseInitializer();
