// Database service using expo-sqlite for persistent storage
import * as SQLite from 'expo-sqlite';
import { Palace } from '../types';

const DB_NAME = 'mempal.db';

class DatabaseServiceClass {
  private db: SQLite.SQLiteDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    // Prevent multiple initializations
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this.doInit();
    return this.initPromise;
  }

  private async doInit(): Promise<void> {
    try {
      this.db = await SQLite.openDatabaseAsync(DB_NAME);

      // Create tables if they don't exist
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS palaces (
          id TEXT PRIMARY KEY NOT NULL,
          data TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        );
      `);
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Database initialization failed:', error);
      this.initPromise = null;
      throw error;
    }
  }

  private async getDb(): Promise<SQLite.SQLiteDatabase> {
    if (!this.db) {
      await this.init();
    }
    return this.db!;
  }

  async getAllPalaces(): Promise<Palace[]> {
    const db = await this.getDb();
    const rows = await db.getAllAsync<{ id: string; data: string }>(
      'SELECT * FROM palaces ORDER BY updated_at DESC'
    );
    return rows.map((row) => JSON.parse(row.data) as Palace);
  }

  async getPalace(id: string): Promise<Palace | null> {
    const db = await this.getDb();
    const row = await db.getFirstAsync<{ id: string; data: string }>(
      'SELECT * FROM palaces WHERE id = ?',
      [id]
    );
    return row ? (JSON.parse(row.data) as Palace) : null;
  }

  async savePalace(palace: Palace): Promise<void> {
    const db = await this.getDb();
    const data = JSON.stringify(palace);

    await db.runAsync(
      `INSERT OR REPLACE INTO palaces (id, data, created_at, updated_at)
       VALUES (?, ?, ?, ?)`,
      [palace.id, data, palace.createdAt, palace.updatedAt]
    );
  }

  async deletePalace(id: string): Promise<void> {
    const db = await this.getDb();
    await db.runAsync('DELETE FROM palaces WHERE id = ?', [id]);
  }

  async clearAll(): Promise<void> {
    const db = await this.getDb();
    await db.runAsync('DELETE FROM palaces');
  }
}

export const DatabaseService = new DatabaseServiceClass();
