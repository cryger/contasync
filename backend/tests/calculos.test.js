const test = require('node:test');
const assert = require('node:assert');
const { calcularFactura } = require('../src/modules/facturas/facturas.calculos');
const { calcularReparto } = require('../src/modules/inversionistas/inversionistas.calculos');

test('totales de factura con descuento e IVA', () => {
  const r = calcularFactura([
    { cantidad: 2, precio_unitario: 50000, descuento_porcentaje: 10, iva_porcentaje: 19 },
    { cantidad: 1, precio_unitario: 20000, iva_porcentaje: 0 },
  ]);
  assert.strictEqual(r.subtotal, 120000);
  assert.strictEqual(r.descuento, 10000);
  assert.strictEqual(r.iva, 17100);   // (100000 − 10000) × 19%
  assert.strictEqual(r.total, 127100);
});

test('reparto proporcional al aporte', () => {
  const r = calcularReparto(1000000, [
    { id: 1, nombre: 'A', capital: 6000000 },
    { id: 2, nombre: 'B', capital: 4000000 },
    { id: 3, nombre: 'C', capital: 0 },
  ]);
  assert.strictEqual(r.capital_total, 10000000);
  assert.strictEqual(r.inversionistas.length, 2);
  const [a, b] = r.inversionistas;
  assert.strictEqual(a.participacion, 60);
  assert.strictEqual(a.ganancia, 600000);
  assert.strictEqual(a.rentabilidad, 10);
  assert.strictEqual(b.participacion, 40);
  assert.strictEqual(b.ganancia, 400000);
  assert.strictEqual(r.rentabilidad_total, 10);
});

test('pérdida se reparte en negativo', () => {
  const r = calcularReparto(-500000, [{ id: 1, nombre: 'A', capital: 5000000 }]);
  assert.strictEqual(r.inversionistas[0].ganancia, -500000);
  assert.strictEqual(r.inversionistas[0].rentabilidad, -10);
});

test('lectura de montos en formato colombiano', () => {
  const { toNumber } = require('../src/shared/validate');
  assert.strictEqual(toNumber('$ 1.500.000'), 1500000);
  assert.strictEqual(toNumber('1.250.000,50'), 1250000.5);
  assert.strictEqual(toNumber('2500.75'), 2500.75);
  assert.strictEqual(toNumber(19), 19);
  assert.ok(Number.isNaN(toNumber('abc')));
});

test('cobros mensuales: meses pendientes y próximo cobro', () => {
  const { periodosPendientes, proximoCobro, sumarDias } = require('../src/modules/cobros/cobros.fechas');
  const base = { dia_facturacion: 5, fecha_inicio: '2026-09-10', fecha_fin: null, ultimo_periodo: null, activo: true };

  // Inicia el 10 de sept con cobro el día 5 → sept no cuenta, primer cobro 5 de oct
  assert.deepStrictEqual(periodosPendientes(base, '2026-10-04'), []);
  assert.deepStrictEqual(periodosPendientes(base, '2026-10-05').map((x) => x.periodo), ['2026-10']);
  // Servidor apagado: se pone al día
  assert.deepStrictEqual(periodosPendientes(base, '2026-12-20').map((x) => x.periodo), ['2026-10', '2026-11', '2026-12']);
  // Ya facturado noviembre
  assert.deepStrictEqual(periodosPendientes({ ...base, ultimo_periodo: '2026-11' }, '2026-11-30'), []);
  assert.strictEqual(proximoCobro({ ...base, ultimo_periodo: '2026-11' }, '2026-11-30'), '2026-12-05');
  // Fecha fin
  assert.deepStrictEqual(periodosPendientes({ ...base, fecha_fin: '2026-11-01' }, '2027-01-10').map((x) => x.periodo), ['2026-10']);
  assert.strictEqual(proximoCobro({ ...base, ultimo_periodo: '2026-10', fecha_fin: '2026-11-01' }, '2026-10-20'), null);
  // Cambio de año y vencimiento
  assert.deepStrictEqual(periodosPendientes({ ...base, ultimo_periodo: '2026-12' }, '2027-01-05').map((x) => x.periodo), ['2027-01']);
  assert.strictEqual(sumarDias('2026-12-25', 10), '2027-01-04');
});
