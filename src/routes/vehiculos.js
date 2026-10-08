const router = require('express').Router();
const db = require('../db');

router.get('/', (req, res) => {
  res.json(db.prepare(`
    SELECT v.*, c.nombre AS cliente
    FROM vehiculos v JOIN clientes c ON c.id = v.cliente_id
    ORDER BY v.id DESC`).all());
});

router.post('/', (req, res) => {
  const { cliente_id, placa, marca, modelo, anio } = req.body;
  if (!cliente_id || !placa || !marca || !modelo)
    return res.status(400).json({ error: 'Cliente, placa, marca y modelo son obligatorios' });
  try {
    const r = db.prepare(
      'INSERT INTO vehiculos (cliente_id, placa, marca, modelo, anio) VALUES (?,?,?,?,?)'
    ).run(cliente_id, placa.trim().toUpperCase(), marca, modelo, anio || null);
    res.status(201).json({ id: r.lastInsertRowid });
  } catch (e) {
    if (String(e.message).includes('UNIQUE')) return res.status(409).json({ error: 'Ya existe un vehículo con esa placa' });
    if (String(e.message).includes('FOREIGN KEY')) return res.status(400).json({ error: 'El cliente no existe' });
    throw e;
  }
});

router.delete('/:id', (req, res) => {
  const r = db.prepare('DELETE FROM vehiculos WHERE id=?').run(req.params.id);
  if (!r.changes) return res.status(404).json({ error: 'Vehículo no encontrado' });
  res.json({ ok: true });
});

module.exports = router;
