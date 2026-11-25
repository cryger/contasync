const { redondear } = require('../facturas/facturas.calculos');

/**
 * Reparto de utilidad proporcional al capital aportado.
 *   participación (%) = capital del inversionista / capital total × 100
 *   ganancia          = utilidad neta del periodo × participación
 *   rentabilidad (%)  = ganancia / capital del inversionista × 100
 * Si la utilidad es negativa, la "ganancia" sale negativa (pérdida proporcional).
 *
 * @param {number} utilidad  ingresos − gastos del periodo
 * @param {{id:number, nombre:string, capital:number}[]} inversionistas
 */
function calcularReparto(utilidad, inversionistas) {
  const conCapital = inversionistas.filter((i) => i.capital > 0);
  const capitalTotal = conCapital.reduce((acc, i) => acc + i.capital, 0);

  const detalle = conCapital.map((inv) => {
    const fraccion = capitalTotal > 0 ? inv.capital / capitalTotal : 0;
    const ganancia = redondear(utilidad * fraccion);
    return {
      ...inv,
      participacion: redondear(fraccion * 100),
      ganancia,
      rentabilidad: inv.capital > 0 ? redondear((ganancia / inv.capital) * 100) : 0,
    };
  });

  return {
    capital_total: redondear(capitalTotal),
    utilidad: redondear(utilidad),
    rentabilidad_total: capitalTotal > 0 ? redondear((utilidad / capitalTotal) * 100) : 0,
    inversionistas: detalle.sort((a, b) => b.participacion - a.participacion),
  };
}

module.exports = { calcularReparto };
