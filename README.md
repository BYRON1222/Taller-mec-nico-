# Sistema de Taller Mecánico

Aplicación web con **Node.js + Express + SQLite** para gestionar clientes, vehículos,
servicios y órdenes de trabajo de un taller mecánico.

## Cómo ejecutarlo

```bash
npm install
npm start
```

Abrir en el navegador: http://localhost:3000

## Funcionalidad

- **Clientes**: crear, listar, editar y eliminar.
- **Vehículos**: cada vehículo pertenece a un cliente (placa única).
- **Servicios**: catálogo con precio (viene con 5 servicios de ejemplo).
- **Órdenes de trabajo**: se abre una orden para un vehículo con uno o más servicios;
  el total se calcula sumando los servicios y el estado avanza
  `pendiente -> en_proceso -> finalizada`.

## API REST

| Recurso | Endpoints |
|---|---|
| `/api/clientes` | GET, POST, PUT `/:id`, DELETE `/:id` |
| `/api/vehiculos` | GET, POST, DELETE `/:id` |
| `/api/servicios` | GET, POST, DELETE `/:id` |
| `/api/ordenes` | GET, POST, PATCH `/:id/estado`, DELETE `/:id` |

## Estructura

```
src/
  server.js        Servidor Express y rutas
  db.js            Conexión SQLite y creación de tablas
  routes/          Lógica de cada recurso
public/index.html  Interfaz web
```

## Modelo de datos

clientes 1--N vehiculos 1--N ordenes N--N servicios (tabla intermedia `orden_servicios`)
