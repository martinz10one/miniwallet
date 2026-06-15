const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const router = express.Router();

// POST /api/register
router.post('/register', async (req, res) => {
  const { nombre, email, password } = req.body;

  if (!nombre || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  const usuarioExistente = await pool.query(
    'SELECT * FROM usuarios WHERE email = $1', [email]
  );
  if (usuarioExistente.rows.length > 0) {
    return res.status(400).json({ error: 'El email ya está registrado' });
  }

  const hash = await bcrypt.hash(password, 10);

  const resultado = await pool.query(
    'INSERT INTO usuarios (nombre, email, password, saldo) VALUES ($1, $2, $3, 100000) RETURNING id, nombre, email, saldo',
    [nombre, email, hash]
  );

  res.status(201).json({ usuario: resultado.rows[0] });
});

// POST /api/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const resultado = await pool.query(
    'SELECT * FROM usuarios WHERE email = $1', [email]
  );
  const usuario = resultado.rows[0];
  if (!usuario) {
    return res.status(400).json({ error: 'Email o contraseña incorrectos' });
  }

  const valido = await bcrypt.compare(password, usuario.password);
  if (!valido) {
    return res.status(400).json({ error: 'Email o contraseña incorrectos' });
  }

  const token = jwt.sign(
    { id: usuario.id, email: usuario.email },
    process.env.JWT_SECRET || 'secreto123',
    { expiresIn: '24h' }
  );

  res.json({
    token,
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      saldo: usuario.saldo
    }
  });
});

module.exports = router;
