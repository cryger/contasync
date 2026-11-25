# Contasync v2 · Facturación rápida

Sistema de **Digital Code Group** para emitir facturas en segundos y calcular cuánto le corresponde a cada inversionista según su aporte.

## Qué hace

**Acceso con usuario y contraseña.** La primera vez que se abre, el sistema pide crear la cuenta del administrador.
Después el administrador crea más usuarios en **Ajustes → Usuarios**:

| Rol | Puede |
|---|---|
| **Administrador** | Todo: inicio con utilidades, gastos, inversionistas, empresa, apariencia, usuarios, anular facturas. |
| **Cajero** | Facturar, ver facturas, crear clientes y consultar productos. Entra directo a "Nueva factura". |

| Módulo | Para qué |
|---|---|
| **Nueva factura** | Busca productos por nombre o código (Enter los agrega, repetir suma cantidad), cliente "Consumidor final" por defecto, totales e IVA en vivo, `Ctrl + Enter` emite y descarga PDF. |
| **Cobros mensuales** | Planes de cobro recurrente por cliente (qué se cobra, día del mes, días de plazo, inicio y fin). El servidor emite la factura sola cada mes (revisa cada hora; si estuvo apagado, se pone al día sin duplicar). En **Facturas para enviar** cada cobro tiene botones de **WhatsApp** y **correo**: descargan el PDF y abren el mensaje listo con total, mes y fecha límite; al enviar queda marcada como enviada. |
| **Facturas** | Listado con filtro por fechas y estado. Detalle, PDF, marcar pagada, anular. Las facturas emitidas **no se editan ni se borran** (solo se anulan). |
| **Clientes / Productos** | Catálogos para facturar rápido. Se puede crear un cliente sin salir de la factura. |
| **Gastos** | Lo que se resta para calcular la utilidad. |
| **Inversionistas** | Aportes de capital (y retiros como aportes negativos) y reparto de utilidades del periodo con **% de participación, ganancia y rentabilidad** por socio. |
| **Empresa** | Razón social, NIT, prefijo y consecutivo, resolución y pie de factura (salen en el PDF). |
| **Apariencia** | Cada negocio pone su logo, nombre comercial y colores (10 temas listos o colores propios) y elige modo claro u oscuro por defecto. Cambia todo el sistema **y el PDF de la factura** en vivo. |

### Cómo se calcula el reparto

```
ingresos      = Σ (subtotal − descuento) de facturas del periodo (sin IVA; el IVA es de la DIAN)
utilidad      = ingresos − gastos del periodo
participación = capital del inversionista ÷ capital total        (aportes hasta la fecha final)
ganancia      = utilidad × participación
rentabilidad  = ganancia ÷ capital del inversionista
```

Se puede elegir **Facturado** (pagadas + pendientes) o **Recaudado** (solo pagadas). Si hay pérdida, se reparte en negativo.

## Sistema de diseño

Basado en la recomendación de **UI UX Pro Max** para dashboards financieros: estilo **minimalista / suizo**
(superficies planas con borde de 1 px, cuadrícula, alto contraste, movimiento sutil).

- **Tipografía:** Fira Sans (interfaz) + Fira Code (cifras y números de factura), instaladas localmente con `@fontsource` — funcionan sin internet. Base de 14 px y cifras tabulares para que los montos queden alineados.
- **Neutros:** escala *slate*. Tokens semánticos en `theme.js` (`superficie`, `borde`, `texto`, `textoSuave`, `acentoTexto`, `peligro`, `exito`…): las páginas no usan colores sueltos.
- **Contraste automático:** el texto sobre cualquier color elige blanco o negro según la relación WCAG, y los colores de marca usados como texto se ajustan solos hasta cumplir 4.5:1. Así cualquier tema que elija un negocio sigue siendo legible.
- **Accesibilidad (WCAG 2.2 AA):** foco visible con teclado, enlace "Saltar al contenido", títulos `h1/h2` reales, botones de ícono con nombre, regiones con scroll navegables, búsqueda y paginación de tablas fuera de la grilla, respeto a "reducir movimiento" del sistema. Auditado con axe-core: 0 problemas en todas las pantallas, modo claro y oscuro.
- **Componentes base:** `Panel` / `estiloPanel`, `StatCard` (con esqueleto de carga), `DataTable` (estado vacío, búsqueda, paginación), `Header`.

## Personalización (marca blanca)

Los colores se guardan en la tabla `empresa` (`color_acento`, `color_secundario`, `color_base`, `tema_modo`, `logo`, `nombre_comercial`).
`frontend/src/theme.js` genera a partir de ellos todas las escalas de color (`useColors()` → `colors.acento[500]`, `colors.base[400]`, …),
y `utils/pdfFactura.js` usa los mismos colores y el logo para la factura. El texto sobre cada color se elige solo (blanco o negro) para que siempre sea legible.

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

## Seguridad

- Contraseñas cifradas con `scrypt` (incluido en Node, sin dependencias nativas).
- Sesión con token JWT de 12 horas. Si no defines `JWT_SECRET` en `backend/.env`, el servidor genera una clave y la guarda en `backend/.jwt-secret` (no se sube a git).
- 5 intentos fallidos de login → bloqueo de 15 minutos para ese correo.
- Al desactivar un usuario pierde el acceso de inmediato, aunque tenga una sesión abierta.
- Un usuario que ya emitió facturas no se borra: se desactiva para conservar el historial ("Emitida por …").

## API

Todas las rutas exigen `Authorization: Bearer <token>` excepto `/api/auth/*` y `/api/marca`.

| Método | Ruta | |
|---|---|---|
| GET/POST | `/api/facturas` | listar (`?desde&hasta&estado&q`) / emitir |
| GET | `/api/facturas/:id` | detalle con ítems |
| PATCH | `/api/facturas/:id/estado` | `{ "estado": "pagada" \| "anulada" }` |
| CRUD | `/api/clientes`, `/api/productos`, `/api/gastos`, `/api/inversionistas` | |
| GET/POST | `/api/inversionistas/:id/aportes` | aportes de un socio |
| GET | `/api/inversionistas/reparto?desde&hasta&criterio` | reparto de utilidades |
| GET | `/api/dashboard?desde&hasta` | resumen |
| CRUD | `/api/cobros` | planes de cobro mensual con sus ítems (solo admin) |
| POST | `/api/cobros/generar` | emite ya los cobros pendientes (también corre solo cada hora) |
| PATCH | `/api/facturas/:id/enviada` | `{ enviada: true/false }` marca si ya se envió al cliente |
| GET/PUT | `/api/empresa` | datos del emisor y consecutivo (PUT solo admin) |
| GET | `/api/auth/estado` | `{ configurado }` — si hay que crear el primer administrador |
| POST | `/api/auth/configuracion-inicial` | crea el primer administrador (solo si no hay usuarios) |
| POST | `/api/auth/login` | `{ email, password }` → `{ token, usuario }` |
| GET / PUT | `/api/auth/yo` · `/api/auth/yo/password` | usuario actual · cambiar contraseña |
| CRUD | `/api/usuarios` | solo admin |
| GET | `/api/marca` | público: logo y colores para el login |

> El total de la factura **siempre lo calcula el servidor**; el consecutivo se toma dentro de una transacción para que nunca se repitan números.

## Nota

Esto genera facturas de venta internas en PDF. Para **facturación electrónica DIAN** hace falta integrarse con un proveedor tecnológico autorizado (CUFE, XML UBL, firma); la estructura de `modules/facturas` está pensada para agregar ese paso después de emitir.
