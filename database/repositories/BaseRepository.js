// database/repositories/BaseRepository.js
import DatabaseService from '../DatabaseService';

class BaseRepository {
  constructor(tableName) {
    this.tableName = tableName;
    this.db = DatabaseService;
  }

  // Create a new record
  async create(data) {
    try {
      const keys = Object.keys(data);
      const values = Object.values(data);
      const placeholders = keys.map(() => '?').join(', ');
      
      const query = `INSERT INTO ${this.tableName} (${keys.join(', ')}) VALUES (${placeholders})`;
      const result = await this.db.executeQuery(query, values);
      
      // Get the created record
      return await this.findById(result.lastInsertRowId);
    } catch (error) {
      console.error(`❌ Error creating ${this.tableName}:`, error);
      throw error;
    }
  }

  // Find record by ID
  async findById(id) {
    try {
      const query = `SELECT * FROM ${this.tableName} WHERE id = ?`;
      return await this.db.getFirst(query, [id]);
    } catch (error) {
      console.error(`❌ Error finding ${this.tableName} by ID:`, error);
      throw error;
    }
  }

  // Find all records with optional conditions
  async findAll(conditions = {}, orderBy = 'id', orderDirection = 'ASC', limit = null) {
    try {
      let query = `SELECT * FROM ${this.tableName}`;
      const params = [];

      // Add WHERE conditions
      if (Object.keys(conditions).length > 0) {
        const whereClause = Object.keys(conditions)
          .map(key => `${key} = ?`)
          .join(' AND ');
        query += ` WHERE ${whereClause}`;
        params.push(...Object.values(conditions));
      }

      // Add ORDER BY
      if (orderBy) {
        query += ` ORDER BY ${orderBy} ${orderDirection}`;
      }

      // Add LIMIT
      if (limit) {
        query += ` LIMIT ?`;
        params.push(limit);
      }

      return await this.db.getAll(query, params);
    } catch (error) {
      console.error(`❌ Error finding all ${this.tableName}:`, error);
      throw error;
    }
  }

  // Update record by ID
  async update(id, data) {
    try {
      const keys = Object.keys(data);
      const values = Object.values(data);
      const setClause = keys.map(key => `${key} = ?`).join(', ');
      
      const query = `UPDATE ${this.tableName} SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
      await this.db.executeQuery(query, [...values, id]);
      
      return await this.findById(id);
    } catch (error) {
      console.error(`❌ Error updating ${this.tableName}:`, error);
      throw error;
    }
  }

  // Delete record by ID
  async delete(id) {
    try {
      const query = `DELETE FROM ${this.tableName} WHERE id = ?`;
      const result = await this.db.executeQuery(query, [id]);
      return result.changes > 0;
    } catch (error) {
      console.error(`❌ Error deleting ${this.tableName}:`, error);
      throw error;
    }
  }

  // Soft delete (mark as inactive)
  async softDelete(id) {
    try {
      return await this.update(id, { is_active: 0 });
    } catch (error) {
      console.error(`❌ Error soft deleting ${this.tableName}:`, error);
      throw error;
    }
  }

  // Count records with optional conditions
  async count(conditions = {}) {
    try {
      let query = `SELECT COUNT(*) as count FROM ${this.tableName}`;
      const params = [];

      if (Object.keys(conditions).length > 0) {
        const whereClause = Object.keys(conditions)
          .map(key => `${key} = ?`)
          .join(' AND ');
        query += ` WHERE ${whereClause}`;
        params.push(...Object.values(conditions));
      }

      const result = await this.db.getFirst(query, params);
      return result?.count || 0;
    } catch (error) {
      console.error(`❌ Error counting ${this.tableName}:`, error);
      throw error;
    }
  }

  // Search records with LIKE query
  async search(searchFields, searchTerm, conditions = {}) {
    try {
      let query = `SELECT * FROM ${this.tableName}`;
      const params = [];

      // Build WHERE clause
      const whereClauses = [];

      // Add search conditions
      if (searchTerm && searchFields.length > 0) {
        const searchClause = searchFields
          .map(field => `${field} LIKE ?`)
          .join(' OR ');
        whereClauses.push(`(${searchClause})`);
        searchFields.forEach(() => params.push(`%${searchTerm}%`));
      }

      // Add other conditions
      if (Object.keys(conditions).length > 0) {
        const conditionClause = Object.keys(conditions)
          .map(key => `${key} = ?`)
          .join(' AND ');
        whereClauses.push(conditionClause);
        params.push(...Object.values(conditions));
      }

      if (whereClauses.length > 0) {
        query += ` WHERE ${whereClauses.join(' AND ')}`;
      }

      query += ` ORDER BY id DESC`;

      return await this.db.getAll(query, params);
    } catch (error) {
      console.error(`❌ Error searching ${this.tableName}:`, error);
      throw error;
    }
  }

  // Execute custom query
  async executeQuery(query, params = []) {
    try {
      return await this.db.executeQuery(query, params);
    } catch (error) {
      console.error(`❌ Error executing custom query on ${this.tableName}:`, error);
      throw error;
    }
  }

  // Get first record with custom query
  async getFirst(query, params = []) {
    try {
      return await this.db.getFirst(query, params);
    } catch (error) {
      console.error(`❌ Error getting first record from ${this.tableName}:`, error);
      throw error;
    }
  }

  // Get all records with custom query
  async getAll(query, params = []) {
    try {
      return await this.db.getAll(query, params);
    } catch (error) {
      console.error(`❌ Error getting all records from ${this.tableName}:`, error);
      throw error;
    }
  }

  // Batch insert
  async batchInsert(records) {
    try {
      const results = [];
      
      await this.db.transaction(async (db) => {
        for (const record of records) {
          const keys = Object.keys(record);
          const values = Object.values(record);
          const placeholders = keys.map(() => '?').join(', ');
          
          const query = `INSERT INTO ${this.tableName} (${keys.join(', ')}) VALUES (${placeholders})`;
          const result = await db.runAsync(query, values);
          results.push(result.lastInsertRowId);
        }
      });

      return results;
    } catch (error) {
      console.error(`❌ Error batch inserting ${this.tableName}:`, error);
      throw error;
    }
  }

  // Batch update
  async batchUpdate(updates) {
    try {
      const results = [];
      
      await this.db.transaction(async (db) => {
        for (const { id, data } of updates) {
          const keys = Object.keys(data);
          const values = Object.values(data);
          const setClause = keys.map(key => `${key} = ?`).join(', ');
          
          const query = `UPDATE ${this.tableName} SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
          const result = await db.runAsync(query, [...values, id]);
          results.push({ id, success: result.changes > 0 });
        }
      });

      return results;
    } catch (error) {
      console.error(`❌ Error batch updating ${this.tableName}:`, error);
      throw error;
    }
  }

  // Get records by date range
  async findByDateRange(dateField, startDate, endDate, conditions = {}) {
    try {
      let query = `SELECT * FROM ${this.tableName} WHERE ${dateField} BETWEEN ? AND ?`;
      const params = [startDate, endDate];

      if (Object.keys(conditions).length > 0) {
        const conditionClause = Object.keys(conditions)
          .map(key => `${key} = ?`)
          .join(' AND ');
        query += ` AND ${conditionClause}`;
        params.push(...Object.values(conditions));
      }

      query += ` ORDER BY ${dateField} DESC`;

      return await this.db.getAll(query, params);
    } catch (error) {
      console.error(`❌ Error finding ${this.tableName} by date range:`, error);
      throw error;
    }
  }

  // Get aggregate data
  async getAggregate(aggregateField, aggregateFunction = 'SUM', conditions = {}) {
    try {
      let query = `SELECT ${aggregateFunction}(${aggregateField}) as result FROM ${this.tableName}`;
      const params = [];

      if (Object.keys(conditions).length > 0) {
        const whereClause = Object.keys(conditions)
          .map(key => `${key} = ?`)
          .join(' AND ');
        query += ` WHERE ${whereClause}`;
        params.push(...Object.values(conditions));
      }

      const result = await this.db.getFirst(query, params);
      return result?.result || 0;
    } catch (error) {
      console.error(`❌ Error getting aggregate for ${this.tableName}:`, error);
      throw error;
    }
  }
}

export default BaseRepository;
