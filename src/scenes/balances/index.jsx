import { useState, useEffect } from "react";
import axios from "axios";

const BalanceComprobacion = () => {
  const [balances, setBalances] = useState([]);
  const [presupuestos, setPresupuestos] = useState([]);
  const [nuevoBalance, setNuevoBalance] = useState({
    fecha: "",
    ingresos: "",
    gastos: "",
    utilidad: "",
    presupuesto_id: ""
  });
  const [editandoId, setEditandoId] = useState(null);
  const [filtroPresupuestoId, setFiltroPresupuestoId] = useState("");
  const [ingresosDisplay, setIngresosDisplay] = useState("");
  const [gastosDisplay, setGastosDisplay] = useState("");
  const [utilidadDisplay, setUtilidadDisplay] = useState("");

  const formatNumber = (value) => {
    return value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") : "";
  };

  const parseNumber = (value) => {
    return value.replace(/\./g, "");
  };

  useEffect(() => {
    obtenerDatos();
  }, []);

  const obtenerDatos = async () => {
    try {
      const [balancesRes, presupuestosRes] = await Promise.all([
        axios.get("http://localhost:5000/api/balances"),
        axios.get("http://localhost:5000/api/presupuestos")
      ]);
      setBalances(balancesRes.data);
      setPresupuestos(presupuestosRes.data);
    } catch (error) {
      console.error("Error al obtener datos:", error);
      alert("Error al cargar datos");
    }
  };

  const handleIngresosChange = (e) => {
    let value = e.target.value.replace(/[^\d]/g, '');
    setIngresosDisplay(value ? `$ ${formatNumber(value)}` : "");
    setNuevoBalance({ ...nuevoBalance, ingresos: value });
  };

  const handleGastosChange = (e) => {
    let value = e.target.value.replace(/[^\d]/g, '');
    setGastosDisplay(value ? `$ ${formatNumber(value)}` : "");
    setNuevoBalance({ ...nuevoBalance, gastos: value });
  };

  const handleUtilidadChange = (e) => {
    let value = e.target.value.replace(/[^\d]/g, '');
    setUtilidadDisplay(value ? `$ ${formatNumber(value)}` : "");
    setNuevoBalance({ ...nuevoBalance, utilidad: value });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevoBalance({ ...nuevoBalance, [name]: value });
  };

  const limpiarFormulario = () => {
    setNuevoBalance({
      fecha: "",
      ingresos: "",
      gastos: "",
      utilidad: "",
      presupuesto_id: ""
    });
    setIngresosDisplay("");
    setGastosDisplay("");
    setUtilidadDisplay("");
    setEditandoId(null);
  };

  const calcularUtilidad = () => {
    const ingresos = parseFloat(nuevoBalance.ingresos) || 0;
    const gastos = parseFloat(nuevoBalance.gastos) || 0;
    const utilidad = ingresos - gastos;
    setNuevoBalance(prev => ({
      ...prev,
      utilidad: utilidad.toString()
    }));
    setUtilidadDisplay(`$ ${formatNumber(utilidad)}`);
  };

  const crearOActualizarBalance = async (e) => {
    e.preventDefault();
    try {
      const datos = {
        ...nuevoBalance,
        fecha: nuevoBalance.fecha || new Date().toISOString().split('T')[0],
        ingresos: parseFloat(nuevoBalance.ingresos),
        gastos: parseFloat(nuevoBalance.gastos),
        utilidad: parseFloat(nuevoBalance.utilidad),
        presupuesto_id: nuevoBalance.presupuesto_id ? parseInt(nuevoBalance.presupuesto_id) : null
      };

      if (editandoId) {
        await axios.put(`http://localhost:5000/api/balances/${editandoId}`, datos);
      } else {
        await axios.post("http://localhost:5000/api/balances", datos);
      }
      obtenerDatos();
      limpiarFormulario();
    } catch (error) {
      console.error("Error al guardar:", error);
      alert(error.response?.data?.message || "Error al guardar");
    }
  };

  const editarBalance = (balance) => {
    setNuevoBalance({
      fecha: balance.fecha.split('T')[0],
      ingresos: balance.ingresos.toString(),
      gastos: balance.gastos.toString(),
      utilidad: balance.utilidad.toString(),
      presupuesto_id: balance.presupuesto_id ? balance.presupuesto_id.toString() : ""
    });
    setIngresosDisplay(`$ ${formatNumber(balance.ingresos)}`);
    setGastosDisplay(`$ ${formatNumber(balance.gastos)}`);
    setUtilidadDisplay(`$ ${formatNumber(balance.utilidad)}`);
    setEditandoId(balance.id);
  };

  const eliminarBalance = async (id) => {
    if (!window.confirm("¿Eliminar este balance?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/balances/${id}`);
      setBalances(balances.filter(b => b.id !== id));
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("Error al eliminar");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  return (
    <div style={{ padding: "20px", color: "white" }}>
      <h2>{editandoId ? "Editar Balance" : "Nuevo Balance"}</h2>

      <form onSubmit={crearOActualizarBalance} style={{ marginBottom: "20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
          <div>
            <label>Fecha:</label>
            <input
              type="date"
              name="fecha"
              value={nuevoBalance.fecha}
              onChange={handleChange}
              style={{ width: "100%" }}
            />
          </div>
          <div>
            <label>Ingresos:</label>
            <input
              value={ingresosDisplay}
              onChange={handleIngresosChange}
              onBlur={calcularUtilidad}
              placeholder="$ 0"
              required
              style={{ width: "100%" }}
            />
          </div>
          <div>
            <label>Gastos:</label>
            <input
              value={gastosDisplay}
              onChange={handleGastosChange}
              onBlur={calcularUtilidad}
              placeholder="$ 0"
              required
              style={{ width: "100%" }}
            />
          </div>
          <div>
            <label>Utilidad:</label>
            <input
              value={utilidadDisplay}
              onChange={handleUtilidadChange}
              placeholder="$ 0"
              required
              readOnly
              style={{ width: "100%", backgroundColor: "#333" }}
            />
          </div>
          <div>
            <label>Presupuesto Asociado:</label>
            <select
              name="presupuesto_id"
              value={nuevoBalance.presupuesto_id}
              onChange={handleChange}
              style={{ width: "100%" }}
            >
              <option value="">Ninguno</option>
              {presupuestos.map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        <button type="submit" style={{ marginTop: "10px" }}>
          {editandoId ? "Actualizar" : "Guardar"}
        </button>
        {editandoId && (
          <button type="button" onClick={limpiarFormulario} style={{ marginLeft: "10px" }}>
            Cancelar
          </button>
        )}
      </form>

      <div style={{ marginBottom: "20px" }}>
        <label>Filtrar por Presupuesto: </label>
        <select
          value={filtroPresupuestoId}
          onChange={(e) => setFiltroPresupuestoId(e.target.value)}
        >
          <option value="">Todos</option>
          {presupuestos.map(p => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </select>
      </div>

      <h2>Lista de Balances</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
        <thead>
          <tr style={{ backgroundColor: "#2c2c2e", color: "white" }}>
            <th style={{ padding: "8px", borderBottom: "1px solid #444" }}>ID</th>
            <th style={{ padding: "8px", borderBottom: "1px solid #444" }}>Fecha</th>
            <th style={{ padding: "8px", borderBottom: "1px solid #444" }}>Ingresos</th>
            <th style={{ padding: "8px", borderBottom: "1px solid #444" }}>Gastos</th>
            <th style={{ padding: "8px", borderBottom: "1px solid #444" }}>Utilidad</th>
            <th style={{ padding: "8px", borderBottom: "1px solid #444" }}>Presupuesto</th>
            <th style={{ padding: "8px", borderBottom: "1px solid #444" }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {balances
            .filter(b => !filtroPresupuestoId || (b.presupuesto_id && b.presupuesto_id.toString() === filtroPresupuestoId))
            .map(b => (
              <tr key={b.id} style={{ borderBottom: "1px solid #444", backgroundColor: "#1c1c1e" }}>
                <td style={{ padding: "8px" }}>{b.id}</td>
                <td style={{ padding: "8px" }}>{formatDate(b.fecha)}</td>
                <td style={{ padding: "8px" }}>$ {formatNumber(b.ingresos)}</td>
                <td style={{ padding: "8px" }}>$ {formatNumber(b.gastos)}</td>
                <td style={{ padding: "8px", color: b.utilidad >= 0 ? "lightgreen" : "salmon" }}>
                  $ {formatNumber(b.utilidad)}
                </td>
                <td style={{ padding: "8px" }}>
                  {presupuestos.find(p => p.id === b.presupuesto_id)?.nombre || '-'}
                </td>
                <td style={{ padding: "8px" }}>
                  <button onClick={() => editarBalance(b)} style={{ marginRight: "5px" }}>
                    Editar
                  </button>
                  <button onClick={() => eliminarBalance(b.id)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default BalanceComprobacion;