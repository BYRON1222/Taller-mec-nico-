const router = require('express').Router();
const db = require('../db');

router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM clientes ORDER BY id DESC').all());
});

router.post('/', (req, res) => {
  const { nombre, telefono, email } = req.body;
  if (!nombre || !nombre.trim()) return res.status(400).json({ error: 'El nombre es obligatorio' });
  const r = db.prepare('INSERT INTO clientes (nombre, telefono, email) VALUES (?, ?, ?)')
    .run(nombre.trim(), telefono || null, email || null);
  res.status(201).json({ id: r.lastInsertRowid });
});

router.put('/:id', (req, res) => {
  const { nombre, telefono, email } = req.body;
  if (!nombre || !nombre.trim()) return res.status(400).json({ error: 'El nombre es obligatorio' });
  const r = db.prepare('UPDATE clientes SET nombre=?, telefono=?, email=? WHERE id=?')
    .run(nombre.trim(), telefono || null, email || null, req.params.id);
  if (!r.changes) return res.status(404).json({ error: 'Cliente no encontrado' });
  res.json({ ok: true });
});

router.delete('/:id', (req, res) => {
  const r = db.prepare('DELETE FROM clientes WHERE id=?').run(req.params.id);
  if (!r.changes) return res.status(404).json({ error: 'Cliente no encontrado' });
  res.json({ ok: true });
});

module.exports = router;
