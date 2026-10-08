const router = require('express').Router();
const db = require('../db');

router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM servicios ORDER BY nombre').all());
});

router.post('/', (req, res) => {
  const { nombre, precio } = req.body;
  if (!nombre || precio === undefined || precio === '' || isNaN(Number(precio)) || Number(precio) < 0)
    return res.status(400).json({ error: 'Nombre y un precio válido son obligatorios' });
  try {
    const r = db.prepare('INSERT INTO servicios (nombre, precio) VALUES (?, ?)').run(nombre.trim(), Number(precio));
    res.status(201).json({ id: r.lastInsertRowid });
  } catch (e) {
    if (String(e.message).includes('UNIQUE')) return res.status(409).json({ error: 'Ese servicio ya existe' });
    throw e;
  }
});

router.delete('/:id', (req, res) => {
  try {
    const r = db.prepare('DELETE FROM servicios WHERE id=?').run(req.params.id);
    if (!r.changes) return res.status(404).json({ error: 'Servicio no encontrado' });
    res.json({ ok: true });
  } catch (e) {
    res.status(409).json({ error: 'No se puede eliminar: el servicio está usado en órdenes' });
  }
});

module.exports = router;
