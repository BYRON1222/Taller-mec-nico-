const router = require('express').Router();
const db = require('../db');

// Flujo permitido: pendiente -> en_proceso -> finalizada
const SIGUIENTE = { pendiente: 'en_proceso', en_proceso: 'finalizada' };

const ordenConTotal = `
  SELECT o.*, v.placa, v.marca, v.modelo, c.nombre AS cliente,
         COALESCE((SELECT SUM(precio) FROM orden_servicios WHERE orden_id = o.id), 0) AS total
  FROM ordenes o
  JOIN vehiculos v ON v.id = o.vehiculo_id
  JOIN clientes c ON c.id = v.cliente_id`;

router.get('/', (req, res) => {
  const ordenes = db.prepare(ordenConTotal + ' ORDER BY o.id DESC').all();
  const det = db.prepare(`
    SELECT s.nombre, os.precio FROM orden_servicios os
    JOIN servicios s ON s.id = os.servicio_id WHERE os.orden_id = ?`);
  ordenes.forEach(o => (o.servicios = det.all(o.id)));
  res.json(ordenes);
});

// Crear orden con sus servicios en una sola transacción
router.post('/', (req, res) => {
  const { vehiculo_id, descripcion, servicios } = req.body;
  if (!vehiculo_id) return res.status(400).json({ error: 'El vehículo es obligatorio' });
  if (!Array.isArray(servicios) || servicios.length === 0)
    return res.status(400).json({ error: 'Debe seleccionar al menos un servicio' });

  const crear = db.transaction(() => {
    const r = db.prepare('INSERT INTO ordenes (vehiculo_id, descripcion) VALUES (?, ?)')
      .run(vehiculo_id, descripcion || null);
    const getServ = db.prepare('SELECT precio FROM servicios WHERE id = ?');
    const insDet = db.prepare('INSERT INTO orden_servicios (orden_id, servicio_id, precio) VALUES (?,?,?)');
    for (const sid of servicios) {
      const s = getServ.get(sid);
      if (!s) throw new Error('SERVICIO_INVALIDO');
      insDet.run(r.lastInsertRowid, sid, s.precio); // se guarda el precio vigente
    }
    return r.lastInsertRowid;
  });

  try {
    res.status(201).json({ id: crear() });
  } catch (e) {
    if (e.message === 'SERVICIO_INVALIDO') return res.status(400).json({ error: 'Servicio inválido' });
    if (String(e.message).includes('FOREIGN KEY')) return res.status(400).json({ error: 'El vehículo no existe' });
    throw e;
  }
});

// Avanzar el estado de la orden al siguiente paso permitido
router.patch('/:id/estado', (req, res) => {
  const orden = db.prepare('SELECT estado FROM ordenes WHERE id=?').get(req.params.id);
  if (!orden) return res.status(404).json({ error: 'Orden no encontrada' });
  const nuevo = SIGUIENTE[orden.estado];
  if (!nuevo) return res.status(400).json({ error: 'La orden ya está finalizada' });
  db.prepare('UPDATE ordenes SET estado=? WHERE id=?').run(nuevo, req.params.id);
  res.json({ ok: true, estado: nuevo });
});

router.delete('/:id', (req, res) => {
  const r = db.prepare('DELETE FROM ordenes WHERE id=?').run(req.params.id);
  if (!r.changes) return res.status(404).json({ error: 'Orden no encontrada' });
  res.json({ ok: true });
});

module.exports = router;
