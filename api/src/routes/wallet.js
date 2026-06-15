const express = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const router = express.Router();

function autenticar(req, res, next) {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto123');
    req.usuario = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
}

// GET /api/balance
router.get('/balance', autenticar, async (req, res) => {
  const resultado = await pool.query(
    'SELECT nombre, email, saldo FROM usuarios WHERE id = $1',
    [req.usuario.id]
  );
  res.json({ ...resultado.rows[0], moneda: 'COP' });
});

// POST /api/transfer
router.post('/transfer', autenticar, async (req, res) => {
  const { receptor_email, monto } = req.body;
  const emisor_id = req.usuario.id;

  if (!receptor_email || !monto) {
    return res.status(400).json({ error: 'Destinatario y monto requeridos' });
  }

  if (monto <= 0) {
    return res.status(400).json({ error: 'El monto debe ser mayor a cero' });
  }

  if (receptor_email === req.usuario.email) {
    return res.status(400).json({ error: 'No puedes enviarte dinero a ti mismo' });
  }

  const cliente = await pool.connect();

  try {
    await cliente.query('BEGIN');

    const emisor = await cliente.query(
      'SELECT saldo FROM usuarios WHERE id = $1 FOR UPDATE',
      [emisor_id]
    );

    if (emisor.rows[0].saldo < monto) {
      await cliente.query('ROLLBACK');
      return res.status(400).json({ error: 'Saldo insuficiente' });
    }

    const receptor = await cliente.query(
      'SELECT id FROM usuarios WHERE email = $1',
      [receptor_email]
    );

    if (receptor.rows.length === 0) {
      await cliente.query('ROLLBACK');
      return res.status(400).json({ error: 'El usuario destinatario no existe' });
    }

    const receptor_id = receptor.rows[0].id;

    await cliente.query(
      'UPDATE usuarios SET saldo = saldo - $1 WHERE id = $2',
      [monto, emisor_id]
    );

    await cliente.query(
      'UPDATE usuarios SET saldo = saldo + $1 WHERE id = $2',
      [monto, receptor_id]
    );

    const tx = await cliente.query(
      'INSERT INTO transacciones (emisor_id, receptor_id, monto) VALUES ($1, $2, $3) RETURNING id',
      [emisor_id, receptor_id, monto]
    );

    const txDetalle = await cliente.query(
      `SELECT t.id, t.monto, t.fecha, e.nombre as emisor_nombre, r.nombre as receptor_nombre
       FROM transacciones t
       JOIN usuarios e ON t.emisor_id = e.id
       JOIN usuarios r ON t.receptor_id = r.id
       WHERE t.id = $1`,
      [tx.rows[0].id]
    );

    await cliente.query('COMMIT');

    res.json({
      mensaje: 'Transferencia exitosa',
      transaccion: {
        ...txDetalle.rows[0],
        moneda: 'COP',
        tipo: 'enviado',
      },
    });
  } catch (error) {
    await cliente.query('ROLLBACK');
    res.status(500).json({ error: 'Error en la transferencia' });
  } finally {
    cliente.release();
  }
});

// GET /api/transactions
router.get('/transactions', autenticar, async (req, res) => {
  const resultado = await pool.query(
    `SELECT t.id, t.monto, t.fecha,
            e.nombre as emisor, r.nombre as receptor
     FROM transacciones t
     JOIN usuarios e ON t.emisor_id = e.id
     JOIN usuarios r ON t.receptor_id = r.id
     WHERE t.emisor_id = $1 OR t.receptor_id = $1
     ORDER BY t.fecha DESC`,
    [req.usuario.id]
  );
  res.json(resultado.rows);
});

// GET /api/users
router.get('/users', autenticar, async (req, res) => {
  const resultado = await pool.query(
    'SELECT id, nombre, email FROM usuarios WHERE id != $1 ORDER BY nombre',
    [req.usuario.id]
  );
  res.json(resultado.rows);
});

module.exports = router;
