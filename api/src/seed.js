const pool = require('./db');

async function crearTablas() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      saldo DECIMAL(12,2) DEFAULT 100000,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS transacciones (
      id SERIAL PRIMARY KEY,
      emisor_id INTEGER REFERENCES usuarios(id),
      receptor_id INTEGER REFERENCES usuarios(id),
      monto DECIMAL(12,2) NOT NULL,
      fecha TIMESTAMP DEFAULT NOW()
    );
  `);

  console.log('Tablas creadas');
}

module.exports = crearTablas;
