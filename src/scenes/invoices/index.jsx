import { useState, useEffect } from "react";
import axios from "axios";

const Invoices = () => {
  // Estados para los datos
  const [recibos, setRecibos] = useState([]);
  const [ingresos, setIngresos] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [bancos, setBancos] = useState([]);
  const [cuentas, setCuentas] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [centrosCostos, setCentrosCostos] = useState([]);
  const [presupuestos, setPresupuestos] = useState([]);

  // Estados para los formularios
  const [nuevoIngreso, setNuevoIngreso] = useState({
    cliente_id: "",
    fecha: new Date().toISOString().split('T')[0],
    valor_recibido: "",
    banco_id: "",
    cuenta_id: "",
    numero_recibo: "",
    saldo_anterior: "",
    saldo_en_caja: "",
    total_ingresos: ""
  });

  const [nuevoGasto, setNuevoGasto] = useState({
    fecha: new Date().toISOString().split('T')[0],
    descripcion: "",
    monto: "",
    categoria: "",
    metodo_pago: "Efectivo",
    banco_id: "",
    cuenta_id: "",
    proveedor_id: "",
    centro_costo_id: "",
    presupuesto_id: ""
  });

  const [nuevoRecibo, setNuevoRecibo] = useState({
    ingreso_id: "",
    gasto_id: "",
    fecha: new Date().toISOString().split('T')[0],
    monto: ""
  });

  // Obtener todos los datos necesarios
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          recibosRes, 
          ingresosRes, 
          gastosRes,
          clientesRes,
          bancosRes,
          cuentasRes,
          proveedoresRes,
          centrosCostosRes,
          presupuestosRes
        ] = await Promise.all([
          axios.get("http://localhost:5000/api/recibos"),
          axios.get("http://localhost:5000/api/ingresos"),
          axios.get("http://localhost:5000/api/gastos"),
          axios.get("http://localhost:5000/api/clientes"),
          axios.get("http://localhost:5000/api/bancos"),
          axios.get("http://localhost:5000/api/cuentas"),
          axios.get("http://localhost:5000/api/proveedores"),
          axios.get("http://localhost:5000/api/centros-costos"),
          axios.get("http://localhost:5000/api/presupuestos")
        ]);

        setRecibos(recibosRes.data);
        setIngresos(ingresosRes.data);
        setGastos(gastosRes.data);
        setClientes(clientesRes.data);
        setBancos(bancosRes.data);
        setCuentas(cuentasRes.data);
        setProveedores(proveedoresRes.data);
        setCentrosCostos(centrosCostosRes.data);
        setPresupuestos(presupuestosRes.data);
      } catch (error) {
        console.error("Error al obtener datos:", error);
      }
    };
    fetchData();
  }, []);

  // Formatear moneda
  const formatCurrency = (value) => {
    if (!value) return "$ 0";
    const number = parseFloat(value.toString().replace(/[^\d]/g, ""));
    return isNaN(number) 
      ? "$ 0" 
      : `$ ${number.toLocaleString("es-CO", { minimumFractionDigits: 0 })}`;
  };

  // Manejadores de cambios
  const handleChange = (setState, state) => (e) => {
    const { name, value } = e.target;
    setState({ ...state, [name]: value });
  };

  // Calcular totales para ingresos
  const calcularTotalesIngreso = () => {
    const valorRecibido = parseFloat(nuevoIngreso.valor_recibido.replace(/[^\d]/g, "")) || 0;
    const saldoAnterior = parseFloat(nuevoIngreso.saldo_anterior.replace(/[^\d]/g, "")) || 0;
    const total = valorRecibido + saldoAnterior;
    
    setNuevoIngreso(prev => ({
      ...prev,
      saldo_en_caja: total.toString(),
      total_ingresos: total.toString()
    }));
  };

  // Crear nuevo ingreso
  const crearIngreso = async (e) => {
    e.preventDefault();
    try {
      const datos = {
        ...nuevoIngreso,
        valor_recibido: parseFloat(nuevoIngreso.valor_recibido.replace(/[^\d]/g, "")),
        saldo_anterior: parseFloat(nuevoIngreso.saldo_anterior.replace(/[^\d]/g, "")),
        saldo_en_caja: parseFloat(nuevoIngreso.saldo_en_caja.replace(/[^\d]/g, "")),
        total_ingresos: parseFloat(nuevoIngreso.total_ingresos.replace(/[^\d]/g, "")),
        cliente_id: nuevoIngreso.cliente_id || null,
        banco_id: nuevoIngreso.banco_id || null,
        cuenta_id: nuevoIngreso.cuenta_id || null
      };

      const { data } = await axios.post("http://localhost:5000/api/ingresos", datos);
      setIngresos([...ingresos, data]);
      setNuevoIngreso({
        cliente_id: "",
        fecha: new Date().toISOString().split('T')[0],
        valor_recibido: "",
        banco_id: "",
        cuenta_id: "",
        numero_recibo: "",
        saldo_anterior: "",
        saldo_en_caja: "",
        total_ingresos: ""
      });
    } catch (error) {
      console.error("Error al crear ingreso:", error);
      alert(error.response?.data?.message || "Error al crear ingreso");
    }
  };

  // Crear nuevo gasto
  const crearGasto = async (e) => {
    e.preventDefault();
    try {
      const datos = {
        ...nuevoGasto,
        monto: parseFloat(nuevoGasto.monto.replace(/[^\d]/g, "")),
        banco_id: nuevoGasto.banco_id || null,
        cuenta_id: nuevoGasto.cuenta_id || null,
        proveedor_id: nuevoGasto.proveedor_id || null,
        centro_costo_id: nuevoGasto.centro_costo_id || null,
        presupuesto_id: nuevoGasto.presupuesto_id || null
      };

      const { data } = await axios.post("http://localhost:5000/api/gastos", datos);
      setGastos([...gastos, data]);
      setNuevoGasto({
        fecha: new Date().toISOString().split('T')[0],
        descripcion: "",
        monto: "",
        categoria: "",
        metodo_pago: "Efectivo",
        banco_id: "",
        cuenta_id: "",
        proveedor_id: "",
        centro_costo_id: "",
        presupuesto_id: ""
      });
    } catch (error) {
      console.error("Error al crear gasto:", error);
      alert(error.response?.data?.message || "Error al crear gasto");
    }
  };

  // Crear nuevo recibo
  const crearRecibo = async (e) => {
    e.preventDefault();
    try {
      const datos = {
        ...nuevoRecibo,
        monto: parseFloat(nuevoRecibo.monto.replace(/[^\d]/g, ""))
      };

      const { data } = await axios.post("http://localhost:5000/api/recibos", datos);
      setRecibos([...recibos, data]);
      setNuevoRecibo({
        ingreso_id: "",
        gasto_id: "",
        fecha: new Date().toISOString().split('T')[0],
        monto: ""
      });
    } catch (error) {
      console.error("Error al crear recibo:", error);
      alert(error.response?.data?.message || "Error al crear recibo");
    }
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  return (
    <div style={{ padding: "20px", color: "white" }}>
      <h1>Gestión de Recibos</h1>

      {/* Formulario de Ingresos */}
      <div style={{ marginBottom: "30px", border: "1px solid #444", padding: "15px", borderRadius: "5px" }}>
        <h2>Registrar Ingreso</h2>
        <form onSubmit={crearIngreso}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
            <div>
              <label>Cliente:</label>
              <select
                name="cliente_id"
                value={nuevoIngreso.cliente_id}
                onChange={handleChange(setNuevoIngreso, nuevoIngreso)}
                style={{ width: "100%" }}
              >
                <option value="">Seleccionar cliente</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label>Fecha:</label>
              <input
                type="date"
                name="fecha"
                value={nuevoIngreso.fecha}
                onChange={handleChange(setNuevoIngreso, nuevoIngreso)}
                style={{ width: "100%" }}
                required
              />
            </div>

            <div>
              <label>Número de Recibo:</label>
              <input
                type="text"
                name="numero_recibo"
                value={nuevoIngreso.numero_recibo}
                onChange={handleChange(setNuevoIngreso, nuevoIngreso)}
                style={{ width: "100%" }}
                required
              />
            </div>

            <div>
              <label>Valor Recibido:</label>
              <input
                name="valor_recibido"
                value={formatCurrency(nuevoIngreso.valor_recibido)}
                onChange={(e) => {
                  handleChange(setNuevoIngreso, nuevoIngreso)(e);
                  calcularTotalesIngreso();
                }}
                placeholder="$ 0"
                style={{ width: "100%" }}
                required
              />
            </div>

            <div>
              <label>Saldo Anterior:</label>
              <input
                name="saldo_anterior"
                value={formatCurrency(nuevoIngreso.saldo_anterior)}
                onChange={(e) => {
                  handleChange(setNuevoIngreso, nuevoIngreso)(e);
                  calcularTotalesIngreso();
                }}
                placeholder="$ 0"
                style={{ width: "100%" }}
                required
              />
            </div>

            <div>
              <label>Saldo en Caja:</label>
              <input
                name="saldo_en_caja"
                value={formatCurrency(nuevoIngreso.saldo_en_caja)}
                readOnly
                style={{ width: "100%", backgroundColor: "#f0f0f0" }}
              />
            </div>

            <div>
              <label>Total Ingresos:</label>
              <input
                name="total_ingresos"
                value={formatCurrency(nuevoIngreso.total_ingresos)}
                readOnly
                style={{ width: "100%", backgroundColor: "#f0f0f0" }}
              />
            </div>

            <div>
              <label>Banco:</label>
              <select
                name="banco_id"
                value={nuevoIngreso.banco_id}
                onChange={handleChange(setNuevoIngreso, nuevoIngreso)}
                style={{ width: "100%" }}
              >
                <option value="">Seleccionar banco</option>
                {bancos.map(b => (
                  <option key={b.id} value={b.id}>{b.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label>Cuenta:</label>
              <select
                name="cuenta_id"
                value={nuevoIngreso.cuenta_id}
                onChange={handleChange(setNuevoIngreso, nuevoIngreso)}
                style={{ width: "100%" }}
              >
                <option value="">Seleccionar cuenta</option>
                {cuentas.map(c => (
                  <option key={c.id} value={c.id}>{c.numero_cuenta} - {bancos.find(b => b.id === c.banco_id)?.nombre}</option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit" style={{ marginTop: "10px" }}>Registrar Ingreso</button>
        </form>
      </div>

      {/* Formulario de Gastos */}
      <div style={{ marginBottom: "30px", border: "1px solid #444", padding: "15px", borderRadius: "5px" }}>
        <h2>Registrar Gasto</h2>
        <form onSubmit={crearGasto}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
            <div>
              <label>Fecha:</label>
              <input
                type="date"
                name="fecha"
                value={nuevoGasto.fecha}
                onChange={handleChange(setNuevoGasto, nuevoGasto)}
                style={{ width: "100%" }}
                required
              />
            </div>

            <div>
              <label>Descripción:</label>
              <input
                name="descripcion"
                value={nuevoGasto.descripcion}
                onChange={handleChange(setNuevoGasto, nuevoGasto)}
                style={{ width: "100%" }}
                required
              />
            </div>

            <div>
              <label>Monto:</label>
              <input
                name="monto"
                value={formatCurrency(nuevoGasto.monto)}
                onChange={handleChange(setNuevoGasto, nuevoGasto)}
                placeholder="$ 0"
                style={{ width: "100%" }}
                required
              />
            </div>

            <div>
              <label>Categoría:</label>
              <input
                name="categoria"
                value={nuevoGasto.categoria}
                onChange={handleChange(setNuevoGasto, nuevoGasto)}
                style={{ width: "100%" }}
                required
              />
            </div>

            <div>
              <label>Método de Pago:</label>
              <select
                name="metodo_pago"
                value={nuevoGasto.metodo_pago}
                onChange={handleChange(setNuevoGasto, nuevoGasto)}
                style={{ width: "100%" }}
                required
              >
                <option value="Efectivo">Efectivo</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>

            <div>
              <label>Proveedor:</label>
              <select
                name="proveedor_id"
                value={nuevoGasto.proveedor_id}
                onChange={handleChange(setNuevoGasto, nuevoGasto)}
                style={{ width: "100%" }}
              >
                <option value="">Seleccionar proveedor</option>
                {proveedores.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label>Banco:</label>
              <select
                name="banco_id"
                value={nuevoGasto.banco_id}
                onChange={handleChange(setNuevoGasto, nuevoGasto)}
                style={{ width: "100%" }}
              >
                <option value="">Seleccionar banco</option>
                {bancos.map(b => (
                  <option key={b.id} value={b.id}>{b.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label>Cuenta:</label>
              <select
                name="cuenta_id"
                value={nuevoGasto.cuenta_id}
                onChange={handleChange(setNuevoGasto, nuevoGasto)}
                style={{ width: "100%" }}
              >
                <option value="">Seleccionar cuenta</option>
                {cuentas.map(c => (
                  <option key={c.id} value={c.id}>{c.numero_cuenta} - {bancos.find(b => b.id === c.banco_id)?.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label>Centro de Costo:</label>
              <select
                name="centro_costo_id"
                value={nuevoGasto.centro_costo_id}
                onChange={handleChange(setNuevoGasto, nuevoGasto)}
                style={{ width: "100%" }}
              >
                <option value="">Seleccionar centro de costo</option>
                {centrosCostos.map(cc => (
                  <option key={cc.id} value={cc.id}>{cc.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label>Presupuesto:</label>
              <select
                name="presupuesto_id"
                value={nuevoGasto.presupuesto_id}
                onChange={handleChange(setNuevoGasto, nuevoGasto)}
                style={{ width: "100%" }}
              >
                <option value="">Seleccionar presupuesto</option>
                {presupuestos.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit" style={{ marginTop: "10px" }}>Registrar Gasto</button>
        </form>
      </div>

      {/* Formulario de Recibos */}
      <div style={{ marginBottom: "30px", border: "1px solid #444", padding: "15px", borderRadius: "5px" }}>
        <h2>Crear Recibo</h2>
        <form onSubmit={crearRecibo}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
            <div>
              <label>Ingreso:</label>
              <select
                name="ingreso_id"
                value={nuevoRecibo.ingreso_id}
                onChange={handleChange(setNuevoRecibo, nuevoRecibo)}
                style={{ width: "100%" }}
                required
              >
                <option value="">Seleccionar ingreso</option>
                {ingresos.map(i => (
                  <option key={i.id} value={i.id}>
                    Recibo #{i.numero_recibo} - {formatCurrency(i.valor_recibido)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Gasto:</label>
              <select
                name="gasto_id"
                value={nuevoRecibo.gasto_id}
                onChange={handleChange(setNuevoRecibo, nuevoRecibo)}
                style={{ width: "100%" }}
                required
              >
                <option value="">Seleccionar gasto</option>
                {gastos.map(g => (
                  <option key={g.id} value={g.id}>
                    {g.descripcion} - {formatCurrency(g.monto)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Fecha:</label>
              <input
                type="date"
                name="fecha"
                value={nuevoRecibo.fecha}
                onChange={handleChange(setNuevoRecibo, nuevoRecibo)}
                style={{ width: "100%" }}
                required
              />
            </div>

            <div>
              <label>Monto:</label>
              <input
                name="monto"
                value={formatCurrency(nuevoRecibo.monto)}
                onChange={handleChange(setNuevoRecibo, nuevoRecibo)}
                placeholder="$ 0"
                style={{ width: "100%" }}
                required
              />
            </div>
          </div>
          <button type="submit" style={{ marginTop: "10px" }}>Crear Recibo</button>
        </form>
      </div>

      {/* Tabla de Recibos */}
      <div>
        <h2>Lista de Recibos</h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#2c2c2e" }}>
                <th>ID</th>
                <th>Fecha</th>
                <th>Ingreso</th>
                <th>Gasto</th>
                <th>Monto</th>
              </tr>
            </thead>
            <tbody>
              {recibos.map(r => (
                <tr key={r.id} style={{ borderBottom: "1px solid #444" }}>
                  <td>{r.id}</td>
                  <td>{formatDate(r.fecha)}</td>
                  <td>
                    {ingresos.find(i => i.id === r.ingreso_id)?.numero_recibo || `Ingreso ${r.ingreso_id}`}
                  </td>
                  <td>
                    {gastos.find(g => g.id === r.gasto_id)?.descripcion || `Gasto ${r.gasto_id}`}
                  </td>
                  <td>{formatCurrency(r.monto)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Invoices;