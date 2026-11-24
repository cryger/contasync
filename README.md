# Contasync v2 · Facturación rápida

Sistema de **Digital Code Group** para emitir facturas en segundos y calcular cuánto le corresponde a cada inversionista según su aporte.

## Qué hace

| Módulo | Para qué |
|---|---|
| **Nueva factura** | Busca productos por nombre o código (Enter los agrega, repetir suma cantidad), cliente "Consumidor final" por defecto, totales e IVA en vivo, `Ctrl + Enter` emite y descarga PDF. |
| **Facturas** | Listado con filtro por fechas y estado. Detalle, PDF, marcar pagada, anular. Las facturas emitidas **no se editan ni se borran** (solo se anulan). |
| **Clientes / Productos** | Catálogos para facturar rápido. Se puede crear un cliente sin salir de la factura. |
| **Gastos** | Lo que se resta para calcular la utilidad. |
| **Inversionistas** | Aportes de capital (y retiros como aportes negativos) y reparto de utilidades del periodo con **% de participación, ganancia y rentabilidad** por socio. |
| **Empresa** | Razón social, NIT, prefijo y consecutivo, resolución y pie de factura (salen en el PDF). |

### Cómo se calcula el reparto

```
ingresos      = Σ (subtotal − descuento) de facturas del periodo (sin IVA; el IVA es de la DIAN)
utilidad      = ingresos − gastos del periodo
participación = capital del inversionista ÷ capital total        (aportes hasta la fecha final)
ganancia      = utilidad × participación
rentabilidad  = ganancia ÷ capital del inversionista
```

Se puede elegir **Facturado** (pagadas + pendientes) o **Recaudado** (solo pagadas). Si hay pérdida, se reparte en negativo.

## Estructura

```
contasync/
├── package.json            ← scripts para correr todo junto
├── backend/                ← API Express + PostgreSQL
│   ├── database/
│   │   ├── schema.sql      ← tablas
│   │   └── init.js         ← npm run db:init
│   ├── src/
│   │   ├── server.js       ← arranque
│   │   ├── app.js          ← middlewares y rutas
│   │   ├── config/db.js    ← conexión (lee .env) y transacciones
│   │   ├── shared/         ← errores, validación, generador CRUD
│   │   └── modules/
│   │       ├── facturas/        routes · service · calculos
│   │       ├── inversionistas/  routes · service · calculos
│   │       ├── dashboard/
│   │       ├── clientes/  productos/  gastos/  empresa/
│   └── tests/              ← npm test (cálculos de factura y reparto)
└── frontend/               ← React + Vite + MUI
    └── src/
        ├── api/            ← un solo cliente axios + funciones por recurso
        ├── components/     ← Header, DataTable, FormDialog, CrudPage, StatCard…
        ├── hooks/          ← useCarga
        ├── layout/         ← Sidebar, Navbar, Layout
        ├── pages/          ← una carpeta por módulo
        └── utils/          ← formato COP, cálculo de factura, PDF
```

## Puesta en marcha

Requisitos: Node 18+ y PostgreSQL.

```bash
# 1. Dependencias
npm run instalar

# 2. Configuración
#    copia backend/.env.example a backend/.env y pon tu contraseña
#    (el script reestructurar.ps1 ya lo hace)

# 3. Base de datos (nueva, no toca la anterior "contasync")
psql -U postgres -p 5433 -c "CREATE DATABASE contasync_facturacion;"
npm run db:init

# 4. Correr API (puerto 5000) + web (puerto 5173)
npm run dev
```

Abre http://localhost:5173 → **Empresa** para poner tus datos y prefijo, luego **Productos** y a facturar.

## API

| Método | Ruta | |
|---|---|---|
| GET/POST | `/api/facturas` | listar (`?desde&hasta&estado&q`) / emitir |
| GET | `/api/facturas/:id` | detalle con ítems |
| PATCH | `/api/facturas/:id/estado` | `{ "estado": "pagada" \| "anulada" }` |
| CRUD | `/api/clientes`, `/api/productos`, `/api/gastos`, `/api/inversionistas` | |
| GET/POST | `/api/inversionistas/:id/aportes` | aportes de un socio |
| GET | `/api/inversionistas/reparto?desde&hasta&criterio` | reparto de utilidades |
| GET | `/api/dashboard?desde&hasta` | resumen |
| GET/PUT | `/api/empresa` | datos del emisor y consecutivo |

> El total de la factura **siempre lo calcula el servidor**; el consecutivo se toma dentro de una transacción para que nunca se repitan números.

## Nota

Esto genera facturas de venta internas en PDF. Para **facturación electrónica DIAN** hace falta integrarse con un proveedor tecnológico autorizado (CUFE, XML UBL, firma); la estructura de `modules/facturas` está pensada para agregar ese paso después de emitir.
