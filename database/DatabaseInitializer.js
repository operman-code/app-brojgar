// database/DatabaseInitializer.js
import DatabaseService from './DatabaseService';
import InventoryRepository from './repositories/InventoryRepository';

class DatabaseInitializer {
  constructor() {
    this.isInitialized = false;
  }

  // Initialize database with sample business data
  async initializeApp() {
    try {
      console.log('🚀 Initializing Business Management App...');
      
      // Initialize database connection
      await DatabaseService.init();
      
      // Insert initial configuration and sample data
      await DatabaseService.insertInitialData();
      
      // Populate with comprehensive business data
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
      console.log('📊 Populating business data...');
      
      // Check if data already exists
      const existingItems = await InventoryRepository.count();
      if (existingItems > 0) {
        console.log('ℹ️  Business data already exists, skipping population...');
        return;
      }

      // Populate in order due to foreign key constraints
      await this.populateCategories();
      await this.populateItems();
      await this.populateParties();
      await this.populateSampleTransactions();
      
      console.log('✅ Business data populated successfully!');
    } catch (error) {
      console.error('❌ Error populating business data:', error);
      throw error;
    }
  }

  // Populate item categories
  async populateCategories() {
    const categories = [
      // Item categories
      { name: 'Electronics', type: 'item', icon: '⚡', color: '#3b82f6', description: 'Electronic devices and components' },
      { name: 'Mobile Accessories', type: 'item', icon: '📱', color: '#10b981', description: 'Phone cases, chargers, and accessories' },
      { name: 'Computers', type: 'item', icon: '💻', color: '#8b5cf6', description: 'Laptops, desktops, and computer parts' },
      { name: 'Audio', type: 'item', icon: '🎵', color: '#f59e0b', description: 'Headphones, speakers, and audio equipment' },
      { name: 'Gaming', type: 'item', icon: '🎮', color: '#ef4444', description: 'Gaming consoles and accessories' },
      { name: 'Cables & Adapters', type: 'item', icon: '🔌', color: '#6b7280', description: 'Various cables and adapters' },
      { name: 'Smart Home', type: 'item', icon: '🏠', color: '#06b6d4', description: 'Smart home devices and IoT products' },
      { name: 'Wearables', type: 'item', icon: '⌚', color: '#ec4899', description: 'Smartwatches and fitness trackers' },
      
      // Expense categories
      { name: 'Office Supplies', type: 'expense', icon: '📋', color: '#06b6d4', description: 'Stationery and office materials' },
      { name: 'Marketing', type: 'expense', icon: '📢', color: '#ec4899', description: 'Advertising and promotional expenses' },
      { name: 'Utilities', type: 'expense', icon: '💡', color: '#84cc16', description: 'Electricity, water, internet bills' },
      { name: 'Transportation', type: 'expense', icon: '🚗', color: '#f97316', description: 'Vehicle and travel expenses' },
      { name: 'Professional Services', type: 'expense', icon: '💼', color: '#6366f1', description: 'Legal, accounting, consulting fees' }
    ];

    for (const category of categories) {
      await DatabaseService.executeQuery(
        'INSERT INTO categories (name, type, icon, color, description) VALUES (?, ?, ?, ?, ?)',
        [category.name, category.type, category.icon, category.color, category.description]
      );
    }

    console.log('✅ Categories populated');
  }

  // Populate inventory items
  async populateItems() {
    const items = [
      // Electronics
      { name: 'iPhone 15 Pro', description: 'Latest Apple smartphone with titanium design', category_id: 1, sku: 'IPH15P001', barcode: '1234567890123', brand: 'Apple', unit: 'pcs', cost_price: 85000, selling_price: 134900, mrp: 134900, current_stock: 25, min_stock: 5, max_stock: 100 },
      { name: 'Samsung Galaxy S24 Ultra', description: 'Premium Android flagship with S Pen', category_id: 1, sku: 'SGS24U001', barcode: '1234567890124', brand: 'Samsung', unit: 'pcs', cost_price: 75000, selling_price: 124999, mrp: 124999, current_stock: 18, min_stock: 5, max_stock: 80 },
      { name: 'iPad Pro 12.9"', description: 'Professional tablet with M2 chip', category_id: 1, sku: 'IPADP001', barcode: '1234567890125', brand: 'Apple', unit: 'pcs', cost_price: 65000, selling_price: 112900, mrp: 112900, current_stock: 12, min_stock: 3, max_stock: 50 },
      
      // Mobile Accessories
      { name: 'iPhone 15 Pro Case', description: 'Premium leather case for iPhone 15 Pro', category_id: 2, sku: 'CASE001', barcode: '1234567890126', brand: 'Apple', unit: 'pcs', cost_price: 2500, selling_price: 4900, mrp: 4900, current_stock: 45, min_stock: 10, max_stock: 200 },
      { name: 'Wireless Charger 15W', description: 'Fast wireless charging pad', category_id: 2, sku: 'WCHG001', barcode: '1234567890127', brand: 'Belkin', unit: 'pcs', cost_price: 1200, selling_price: 2999, mrp: 2999, current_stock: 30, min_stock: 8, max_stock: 150 },
      { name: 'USB-C Cable 2m', description: 'High-speed USB-C to USB-C cable', category_id: 6, sku: 'USBC001', barcode: '1234567890128', brand: 'Anker', unit: 'pcs', cost_price: 800, selling_price: 1499, mrp: 1499, current_stock: 60, min_stock: 15, max_stock: 300 },
      
      // Computers
      { name: 'MacBook Air M3', description: '13-inch laptop with M3 chip', category_id: 3, sku: 'MBA001', barcode: '1234567890129', brand: 'Apple', unit: 'pcs', cost_price: 85000, selling_price: 114900, mrp: 114900, current_stock: 8, min_stock: 2, max_stock: 30 },
      { name: 'Dell XPS 15', description: 'High-performance Windows laptop', category_id: 3, sku: 'DXPS001', barcode: '1234567890130', brand: 'Dell', unit: 'pcs', cost_price: 120000, selling_price: 159999, mrp: 159999, current_stock: 5, min_stock: 2, max_stock: 20 },
      { name: 'Logitech MX Master 3S', description: 'Advanced wireless mouse', category_id: 3, sku: 'LGMX001', barcode: '1234567890131', brand: 'Logitech', unit: 'pcs', cost_price: 6000, selling_price: 8995, mrp: 8995, current_stock: 22, min_stock: 5, max_stock: 100 },
      
      // Audio
      { name: 'AirPods Pro 2nd Gen', description: 'Premium wireless earbuds with ANC', category_id: 4, sku: 'APP001', barcode: '1234567890132', brand: 'Apple', unit: 'pcs', cost_price: 18000, selling_price: 24900, mrp: 24900, current_stock: 35, min_stock: 8, max_stock: 150 },
      { name: 'Sony WH-1000XM5', description: 'Industry-leading noise canceling headphones', category_id: 4, sku: 'SWHN001', barcode: '1234567890133', brand: 'Sony', unit: 'pcs', cost_price: 22000, selling_price: 29990, mrp: 29990, current_stock: 15, min_stock: 4, max_stock: 80 },
      { name: 'JBL Flip 6', description: 'Portable waterproof speaker', category_id: 4, sku: 'JBLF001', barcode: '1234567890134', brand: 'JBL', unit: 'pcs', cost_price: 8000, selling_price: 12999, mrp: 12999, current_stock: 28, min_stock: 6, max_stock: 120 },
      
      // Gaming
      { name: 'PlayStation 5', description: 'Latest Sony gaming console', category_id: 5, sku: 'PS5001', barcode: '1234567890135', brand: 'Sony', unit: 'pcs', cost_price: 45000, selling_price: 54990, mrp: 54990, current_stock: 3, min_stock: 1, max_stock: 20 },
      { name: 'Xbox Series X', description: 'Microsoft next-gen console', category_id: 5, sku: 'XBOX001', barcode: '1234567890136', brand: 'Microsoft', unit: 'pcs', cost_price: 45000, selling_price: 52990, mrp: 52990, current_stock: 4, min_stock: 1, max_stock: 20 },
      { name: 'Nintendo Switch OLED', description: 'Portable gaming console with OLED screen', category_id: 5, sku: 'NSW001', barcode: '1234567890137', brand: 'Nintendo', unit: 'pcs', cost_price: 28000, selling_price: 37980, mrp: 37980, current_stock: 12, min_stock: 3, max_stock: 50 },
      
      // Smart Home
      { name: 'Amazon Echo Dot 5th Gen', description: 'Smart speaker with Alexa', category_id: 7, sku: 'ECHO001', barcode: '1234567890138', brand: 'Amazon', unit: 'pcs', cost_price: 3500, selling_price: 5499, mrp: 5499, current_stock: 40, min_stock: 10, max_stock: 200 },
      { name: 'Philips Hue Bulb', description: 'Smart color-changing LED bulb', category_id: 7, sku: 'PHB001', barcode: '1234567890139', brand: 'Philips', unit: 'pcs', cost_price: 2800, selling_price: 4299, mrp: 4299, current_stock: 25, min_stock: 8, max_stock: 150 },
      
      // Wearables
      { name: 'Apple Watch Series 9', description: 'Advanced smartwatch with health tracking', category_id: 8, sku: 'AWS001', barcode: '1234567890140', brand: 'Apple', unit: 'pcs', cost_price: 32000, selling_price: 41900, mrp: 41900, current_stock: 20, min_stock: 5, max_stock: 100 },
      { name: 'Samsung Galaxy Watch 6', description: 'Feature-rich Android smartwatch', category_id: 8, sku: 'SGW001', barcode: '1234567890141', brand: 'Samsung', unit: 'pcs', cost_price: 18000, selling_price: 27999, mrp: 27999, current_stock: 15, min_stock: 4, max_stock: 80 },
      { name: 'Fitbit Versa 4', description: 'Fitness-focused smartwatch', category_id: 8, sku: 'FBV001', barcode: '1234567890142', brand: 'Fitbit', unit: 'pcs', cost_price: 12000, selling_price: 19999, mrp: 19999, current_stock: 18, min_stock: 5, max_stock: 100 }
    ];

    for (const item of items) {
      await DatabaseService.executeQuery(
        `INSERT INTO items (
          name, description, category_id, sku, barcode, brand, unit, 
          cost_price, selling_price, mrp, current_stock, min_stock, max_stock
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          item.name, item.description, item.category_id, item.sku, item.barcode, 
          item.brand, item.unit, item.cost_price, item.selling_price, item.mrp,
          item.current_stock, item.min_stock, item.max_stock
        ]
      );
    }

    console.log('✅ Items populated');
  }

  // Populate parties (customers and suppliers)
  async populateParties() {
    const parties = [
      // Customers
      { name: 'Tech Solutions Pvt Ltd', type: 'customer', email: 'orders@techsolutions.com', phone: '+91 9876543210', gst_number: '29ABCDE1234F1Z5', address_line1: '123 Tech Park', city: 'Bangalore', state: 'Karnataka', pincode: '560001', opening_balance: 0, current_balance: -25000, credit_limit: 100000 },
      { name: 'Digital Marketing Co', type: 'customer', email: 'purchase@digitalmarketing.in', phone: '+91 9876543211', gst_number: '27FGHIJ5678K2X1', address_line1: '456 Business Center', city: 'Mumbai', state: 'Maharashtra', pincode: '400001', opening_balance: 0, current_balance: -15000, credit_limit: 75000 },
      { name: 'Smart Retail Chain', type: 'customer', email: 'procurement@smartretail.co.in', phone: '+91 9876543212', gst_number: '06KLMNO9012P3Y2', address_line1: '789 Shopping Complex', city: 'Delhi', state: 'Delhi', pincode: '110001', opening_balance: 0, current_balance: 0, credit_limit: 200000 },
      { name: 'Education Hub', type: 'customer', email: 'admin@educationhub.edu', phone: '+91 9876543213', gst_number: '33PQRST3456U4Z3', address_line1: '321 Academic Street', city: 'Chennai', state: 'Tamil Nadu', pincode: '600001', opening_balance: 0, current_balance: -8000, credit_limit: 50000 },
      { name: 'Gaming Zone', type: 'customer', email: 'orders@gamingzone.net', phone: '+91 9876543214', gst_number: '24UVWXY7890V5A4', address_line1: '654 Entertainment District', city: 'Pune', state: 'Maharashtra', pincode: '411001', opening_balance: 0, current_balance: -32000, credit_limit: 150000 },
      
      // Suppliers
      { name: 'Apple India Distribution', type: 'supplier', email: 'orders@apple-dist.in', phone: '+91 9876543215', gst_number: '29APPLE1234A1B2', address_line1: 'Apple Distribution Center', city: 'Bangalore', state: 'Karnataka', pincode: '560001', opening_balance: 0, current_balance: 125000, credit_limit: 0 },
      { name: 'Samsung Electronics Supply', type: 'supplier', email: 'supply@samsung-elec.co.in', phone: '+91 9876543216', gst_number: '27SAMSG5678C3D4', address_line1: 'Samsung Supply Hub', city: 'Mumbai', state: 'Maharashtra', pincode: '400001', opening_balance: 0, current_balance: 95000, credit_limit: 0 },
      { name: 'Tech Accessories Wholesale', type: 'supplier', email: 'wholesale@techacc.com', phone: '+91 9876543217', gst_number: '06TECHW9012E5F6', address_line1: 'Wholesale Electronics Market', city: 'Delhi', state: 'Delhi', pincode: '110001', opening_balance: 0, current_balance: 45000, credit_limit: 0 },
      { name: 'Audio Equipment Suppliers', type: 'supplier', email: 'supply@audioequip.in', phone: '+91 9876543218', gst_number: '33AUDIO3456G7H8', address_line1: 'Audio District', city: 'Chennai', state: 'Tamil Nadu', pincode: '600001', opening_balance: 0, current_balance: 38000, credit_limit: 0 }
    ];

    for (const party of parties) {
      await DatabaseService.executeQuery(
        `INSERT INTO parties (
          name, type, email, phone, gst_number, address_line1, city, state, pincode,
          opening_balance, current_balance, credit_limit
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          party.name, party.type, party.email, party.phone, party.gst_number,
          party.address_line1, party.city, party.state, party.pincode,
          party.opening_balance, party.current_balance, party.credit_limit
        ]
      );
    }

    console.log('✅ Parties populated');
  }

  // Populate sample transactions
  async populateSampleTransactions() {
    // Sample invoices
    const invoices = [
      { invoice_number: 'INV-001', party_id: 1, invoice_date: '2024-01-15', subtotal: 159800, tax_amount: 28764, total_amount: 188564, status: 'paid', payment_status: 'paid' },
      { invoice_number: 'INV-002', party_id: 2, invoice_date: '2024-01-20', subtotal: 89900, tax_amount: 16182, total_amount: 106082, status: 'sent', payment_status: 'partial' },
      { invoice_number: 'INV-003', party_id: 3, invoice_date: '2024-01-25', subtotal: 249800, tax_amount: 44964, total_amount: 294764, status: 'sent', payment_status: 'unpaid' }
    ];

    for (const invoice of invoices) {
      await DatabaseService.executeQuery(
        `INSERT INTO invoices (
          invoice_number, party_id, invoice_date, subtotal, tax_amount, total_amount, status, payment_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          invoice.invoice_number, invoice.party_id, invoice.invoice_date,
          invoice.subtotal, invoice.tax_amount, invoice.total_amount,
          invoice.status, invoice.payment_status
        ]
      );
    }

    // Sample stock movements
    const stockMovements = [
      { item_id: 1, movement_type: 'in', quantity: 30, rate: 85000, total_value: 2550000, reference_type: 'opening_stock', notes: 'Opening stock' },
      { item_id: 2, movement_type: 'in', quantity: 25, rate: 75000, total_value: 1875000, reference_type: 'opening_stock', notes: 'Opening stock' },
      { item_id: 1, movement_type: 'out', quantity: 5, rate: 134900, total_value: 674500, reference_type: 'sale', reference_id: 1, notes: 'Sale to Tech Solutions' },
      { item_id: 10, movement_type: 'out', quantity: 10, rate: 24900, total_value: 249000, reference_type: 'sale', reference_id: 2, notes: 'Sale to Digital Marketing' }
    ];

    for (const movement of stockMovements) {
      await DatabaseService.executeQuery(
        `INSERT INTO stock_movements (
          item_id, movement_type, quantity, rate, total_value, reference_type, reference_id, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          movement.item_id, movement.movement_type, movement.quantity, movement.rate,
          movement.total_value, movement.reference_type, movement.reference_id, movement.notes
        ]
      );
    }

    console.log('✅ Sample transactions populated');
  }

  // Get initialization status
  isAppInitialized() {
    return this.isInitialized;
  }

  // Reset database (for development/testing)
  async resetDatabase() {
    try {
      console.log('🔄 Resetting database...');
      
      const tables = ['stock_movements', 'invoice_items', 'invoices', 'payments', 'expenses', 'items', 'parties', 'categories', 'settings'];
      
      for (const table of tables) {
        await DatabaseService.executeQuery(`DELETE FROM ${table}`);
      }
      
      // Reset sequences
      await DatabaseService.executeQuery(`DELETE FROM sqlite_sequence`);
      
      this.isInitialized = false;
      console.log('✅ Database reset complete');
    } catch (error) {
      console.error('❌ Database reset failed:', error);
      throw error;
    }
  }
}

export default new DatabaseInitializer();
