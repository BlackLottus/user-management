import sqlite3 from 'sqlite3';  // Importa todo el módulo sqlite3
import { open } from 'sqlite';

// Extrae la propiedad Database del módulo sqlite3
const { Database } = sqlite3;

export const connectDB = async () => {
  const db = await open({
    filename: './database.sqlite',
    driver: Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      apellido TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      dni TEXT NOT NULL,
      nick TEXT NOT NULL,
      password TEXT NOT NULL,
      rol TEXT CHECK(rol IN ('admin', 'propietario', 'usuario')) NOT NULL,
      fecha_creacion TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  return db;
};
