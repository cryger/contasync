-- =============================================================
--  Contasync · Facturación rápida + reparto a inversionistas
--  Ejecutar una vez sobre una base de datos vacía:
--    psql -U postgres -p 5433 -c "CREATE DATABASE contasync_facturacion;"
--    psql -U postgres -p 5433 -d contasync_facturacion -f database/schema.sql
-- =============================================================

-- Datos de la empresa emisora y consecutivo de facturación (una sola fila)
CREATE TABLE IF NOT EXISTS empresa (
  id                SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  razon_social      VARCHAR(150) NOT NULL DEFAULT 'Mi Empresa S.A.S.',
  nit               VARCHAR(30)  NOT NULL DEFAULT '000000000-0',
  direccion         VARCHAR(200),
  telefono          VARCHAR(40),
  email             VARCHAR(120),
  prefijo_factura   VARCHAR(10)  NOT NULL DEFAULT 'FV',
  siguiente_numero  INTEGER      NOT NULL DEFAULT 1 CHECK (siguiente_numero > 0),
  resolucion        TEXT,
  iva_por_defecto   NUMERIC(5,2) NOT NULL DEFAULT 19,
  pie_factura       TEXT
);
INSERT INTO empresa (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Apariencia / marca del negocio (interfaz y PDF de la factura)
ALTER TABLE empresa ADD COLUMN IF NOT EXISTS nombre_comercial  VARCHAR(80);
ALTER TABLE empresa ADD COLUMN IF NOT EXISTS color_acento      CHAR(7)     NOT NULL DEFAULT '#4cceac';
ALTER TABLE empresa ADD COLUMN IF NOT EXISTS color_secundario  CHAR(7)     NOT NULL DEFAULT '#6870fa';
ALTER TABLE empresa ADD COLUMN IF NOT EXISTS color_base        CHAR(7)     NOT NULL DEFAULT '#141b2d';
ALTER TABLE empresa ADD COLUMN IF NOT EXISTS tema_modo         VARCHAR(5)  NOT NULL DEFAULT 'dark';
ALTER TABLE empresa ADD COLUMN IF NOT EXISTS logo              TEXT;       -- imagen PNG en data URL (máx. ~400 KB)

CREATE TABLE IF NOT EXISTS clientes (
  id               SERIAL PRIMARY KEY,
  tipo_documento   VARCHAR(10)  NOT NULL DEFAULT 'CC',
  identificacion   VARCHAR(30)  NOT NULL UNIQUE,
  nombre           VARCHAR(150) NOT NULL,
  telefono         VARCHAR(40),
  email            VARCHAR(120),
  direccion        VARCHAR(200),
  creado_en        TIMESTAMP    NOT NULL DEFAULT NOW()
);
-- Cliente genérico para facturar sin pedir datos
INSERT INTO clientes (tipo_documento, identificacion, nombre)
VALUES ('CC', '222222222222', 'Consumidor final')
ON CONFLICT (identificacion) DO NOTHING;

CREATE TABLE IF NOT EXISTS productos (
  id              SERIAL PRIMARY KEY,
  codigo          VARCHAR(40) UNIQUE,
  nombre          VARCHAR(150)  NOT NULL,
  precio          NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (precio >= 0),
  iva_porcentaje  NUMERIC(5,2)  NOT NULL DEFAULT 19 CHECK (iva_porcentaje >= 0),
  activo          BOOLEAN       NOT NULL DEFAULT TRUE,
  creado_en       TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS facturas (
  id           SERIAL PRIMARY KEY,
  numero       VARCHAR(30)   NOT NULL UNIQUE,
  cliente_id   INTEGER       NOT NULL REFERENCES clientes(id),
  fecha        DATE          NOT NULL DEFAULT CURRENT_DATE,
  vencimiento  DATE,
  forma_pago   VARCHAR(20)   NOT NULL DEFAULT 'contado',   -- contado | credito
  medio_pago   VARCHAR(30)   NOT NULL DEFAULT 'efectivo',  -- efectivo | transferencia | tarjeta ...
  estado       VARCHAR(20)   NOT NULL DEFAULT 'pagada'
               CHECK (estado IN ('pendiente', 'pagada', 'anulada')),
  subtotal     NUMERIC(14,2) NOT NULL DEFAULT 0,  -- suma de cantidad × precio
  descuento    NUMERIC(14,2) NOT NULL DEFAULT 0,
  iva          NUMERIC(14,2) NOT NULL DEFAULT 0,
  total        NUMERIC(14,2) NOT NULL DEFAULT 0,
  notas        TEXT,
  creado_en    TIMESTAMP     NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_facturas_fecha   ON facturas(fecha);
CREATE INDEX IF NOT EXISTS idx_facturas_cliente ON facturas(cliente_id);

CREATE TABLE IF NOT EXISTS factura_items (
  id                    SERIAL PRIMARY KEY,
  factura_id            INTEGER       NOT NULL REFERENCES facturas(id) ON DELETE CASCADE,
  producto_id           INTEGER       REFERENCES productos(id),
  descripcion           VARCHAR(200)  NOT NULL,
  cantidad              NUMERIC(12,2) NOT NULL CHECK (cantidad > 0),
  precio_unitario       NUMERIC(14,2) NOT NULL CHECK (precio_unitario >= 0),
  descuento_porcentaje  NUMERIC(5,2)  NOT NULL DEFAULT 0,
  iva_porcentaje        NUMERIC(5,2)  NOT NULL DEFAULT 0,
  base                  NUMERIC(14,2) NOT NULL,  -- cantidad × precio
  descuento             NUMERIC(14,2) NOT NULL,
  iva                   NUMERIC(14,2) NOT NULL,
  total                 NUMERIC(14,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS gastos (
  id           SERIAL PRIMARY KEY,
  fecha        DATE          NOT NULL DEFAULT CURRENT_DATE,
  descripcion  VARCHAR(200)  NOT NULL,
  categoria    VARCHAR(60)   NOT NULL DEFAULT 'General',
  monto        NUMERIC(14,2) NOT NULL CHECK (monto > 0),
  medio_pago   VARCHAR(30)   NOT NULL DEFAULT 'efectivo',
  creado_en    TIMESTAMP     NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_gastos_fecha ON gastos(fecha);

CREATE TABLE IF NOT EXISTS inversionistas (
  id              SERIAL PRIMARY KEY,
  nombre          VARCHAR(150) NOT NULL,
  identificacion  VARCHAR(30)  UNIQUE,
  telefono        VARCHAR(40),
  email           VARCHAR(120),
  activo          BOOLEAN      NOT NULL DEFAULT TRUE,
  creado_en       TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Cada aporte de capital. La participación se calcula sumando aportes.
-- Un retiro de capital se registra como aporte con monto negativo.
CREATE TABLE IF NOT EXISTS aportes (
  id                SERIAL PRIMARY KEY,
  inversionista_id  INTEGER       NOT NULL REFERENCES inversionistas(id) ON DELETE CASCADE,
  fecha             DATE          NOT NULL DEFAULT CURRENT_DATE,
  monto             NUMERIC(14,2) NOT NULL CHECK (monto <> 0),
  nota              VARCHAR(200),
  creado_en         TIMESTAMP     NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_aportes_inversionista ON aportes(inversionista_id);

-- =============================================================
--  Usuarios y acceso
-- =============================================================
CREATE TABLE IF NOT EXISTS usuarios (
  id             SERIAL PRIMARY KEY,
  nombre         VARCHAR(120) NOT NULL,
  email          VARCHAR(120) NOT NULL UNIQUE,
  password_hash  TEXT         NOT NULL,
  rol            VARCHAR(20)  NOT NULL DEFAULT 'cajero' CHECK (rol IN ('admin', 'cajero')),
  activo         BOOLEAN      NOT NULL DEFAULT TRUE,
  ultimo_acceso  TIMESTAMP,
  creado_en      TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Quién emitió cada factura
ALTER TABLE facturas ADD COLUMN IF NOT EXISTS usuario_id INTEGER REFERENCES usuarios(id);

-- =============================================================
--  Cobros mensuales automáticos (planes de cobro recurrente)
-- =============================================================
CREATE TABLE IF NOT EXISTS suscripciones (
  id               SERIAL PRIMARY KEY,
  cliente_id       INTEGER      NOT NULL REFERENCES clientes(id),
  nombre           VARCHAR(120) NOT NULL,                        -- p. ej. "Plan mensual de hosting"
  dia_facturacion  SMALLINT     NOT NULL DEFAULT 1 CHECK (dia_facturacion BETWEEN 1 AND 28),
  dias_plazo       SMALLINT     NOT NULL DEFAULT 10 CHECK (dias_plazo BETWEEN 0 AND 90),
  fecha_inicio     DATE         NOT NULL DEFAULT CURRENT_DATE,
  fecha_fin        DATE,                                         -- vacío = indefinido
  activo           BOOLEAN      NOT NULL DEFAULT TRUE,
  notas            TEXT,
  ultimo_periodo   CHAR(7),                                      -- último mes facturado (AAAA-MM)
  creado_en        TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS suscripcion_items (
  id                    SERIAL PRIMARY KEY,
  suscripcion_id        INTEGER       NOT NULL REFERENCES suscripciones(id) ON DELETE CASCADE,
  producto_id           INTEGER       REFERENCES productos(id) ON DELETE SET NULL,
  descripcion           VARCHAR(200)  NOT NULL,
  cantidad              NUMERIC(12,2) NOT NULL CHECK (cantidad > 0),
  precio_unitario       NUMERIC(14,2) NOT NULL CHECK (precio_unitario >= 0),
  descuento_porcentaje  NUMERIC(5,2)  NOT NULL DEFAULT 0,
  iva_porcentaje        NUMERIC(5,2)  NOT NULL DEFAULT 0
);

ALTER TABLE facturas ADD COLUMN IF NOT EXISTS suscripcion_id INTEGER REFERENCES suscripciones(id) ON DELETE SET NULL;
ALTER TABLE facturas ADD COLUMN IF NOT EXISTS periodo        CHAR(7);    -- mes cobrado (AAAA-MM)
ALTER TABLE facturas ADD COLUMN IF NOT EXISTS enviada_en     TIMESTAMP;  -- cuándo se envió al cliente
-- Un solo cobro por plan y por mes, aunque el proceso corra varias veces
CREATE UNIQUE INDEX IF NOT EXISTS ux_facturas_suscripcion_periodo
  ON facturas (suscripcion_id, periodo) WHERE suscripcion_id IS NOT NULL;
