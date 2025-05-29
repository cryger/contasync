import { useState, useEffect } from "react";
import axios from "axios";

const EstadosFinancieros = () => {
  const [estados, setEstados] = useState([]);
  const [balances, setBalances] = useState([]);
  const [nuevoEstado, setNuevoEstado] = useState({
    balance_id: "",
    tipo: "Balance General",
    fecha: "",
    descripcion: ""
  });
  const [editandoId, setEditandoId] = useState(null);
  const [filtroTipo, setFiltroTipo] = useState("");

  useEffect(() => {
    obtenerDatos();
  }, []);

  const obtenerDatos = async () => {
    try {
      const [estadosRes, balancesRes] = await Promise.all([
        axios.get("http://localhost:5000/api/estados-financieros"),
        axios.get("http://localhost:5000/api/balances")
      ]);
      setEstados(estadosRes.data);
      setBalances(balancesRes.data);
    } catch (error) {
      console.error("Error al obtener datos:", error);
      alert("Error al cargar datos");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevoEstado({ ...nuevoEstado, [name]: value });
  };

  const limpiarFormulario = () => {
    setNuevoEstado({
      balance_id: "",
      tipo: "Balance General",
      fecha: "",
      descripcion: ""
    });
    setEditandoId(null);
  };

  const crearOActualizarEstado = async (e) => {
    e.preventDefault();
    try {
      const datos = {
        ...nuevoEstado,
        fecha: nuevoEstado.fecha || new Date().toISOString().split('T')[0],
        balance_id: nuevoEstado.balance_id ? parseInt(nuevoEstado.balance_id) : null
      };

      if (editandoId) {
        await axios.put(`http://localhost:5000/api/estados-financieros/${editandoId}`, datos);
      } else {
        await axios.post("http://localhost:5000/api/estados-financieros", datos);
      }
      obtenerDatos();
      limpiarFormulario();
    } catch (error) {
      console.error("Error al guardar:", error);
      alert(error.response?.data?.message || "Error al guardar");
    }
  };

  const editarEstado = (estado) => {
    setNuevoEstado({
      balance_id: estado.balance_id ? estado.balance_id.toString() : "",
      tipo: estado.tipo,
      fecha: estado.fecha.split('T')[0],
      descripcion: estado.descripcion
    });
    setEditandoId(estado.id);
  };

  const eliminarEstado = async (id) => {
    if (!window.confirm("¿Eliminar este estado financiero?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/estados-financieros/${id}`);
      setEstados(estados.filter(e => e.id !== id));
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("Error al eliminar");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const obtenerDatosBalance = (balanceId) => {
    if (!balanceId) return "-";
    const balance = balances.find(b => b.id === balanceId);
    if (!balance) return "-";
    
    return (
      <div>
        <div>Ingresos: $ {formatNumber(balance.ingresos)}</div>
        <div>Gastos: $ {formatNumber(balance.gastos)}</div>
        <div>Utilidad: $ {formatNumber(balance.utilidad)}</div>
      </div>
    );
  };

  const formatNumber = (value) => {
    return value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") : "0";
  };

  return (
    <div style={{ padding: "20px", color: "white" }}>
      <h2>{editandoId ? "Editar Estado Financiero" : "Nuevo Estado Financiero"}</h2>

      <form onSubmit={crearOActualizarEstado} style={{ marginBottom: "20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
          <div>
            <label>Tipo:</label>
            <select
              name="tipo"
              value={nuevoEstado.tipo}
              onChange={handleChange}
              style={{ width: "100%" }}
              required
            >
              <option value="Balance General">Balance General</option>
              <option value="Estado de Resultados">Estado de Resultados</option>
            </select>
          </div>
          <div>
            <label>Fecha:</label>
            <input
              type="date"
              name="fecha"
              value={nuevoEstado.fecha}
              onChange={handleChange}
              style={{ width: "100%" }}
            />
          </div>
          <div>
            <label>Balance Asociado:</label>
            <select
              name="balance_id"
              value={nuevoEstado.balance_id}
              onChange={handleChange}
              style={{ width: "100%" }}
            >
              <option value="">Ninguno</option>
              {balances.map(b => (
                <option key={b.id} value={b.id}>
                  {formatDate(b.fecha)} - $ {formatNumber(b.utilidad)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Descripción:</label>
            <textarea
              name="descripcion"
              value={nuevoEstado.descripcion}
              onChange={handleChange}
              style={{ width: "100%", minHeight: "80px" }}
            />
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
        <label>Filtrar por Tipo: </label>
        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
        >
          <option value="">Todos</option>
          <option value="Balance General">Balance General</option>
          <option value="Estado de Resultados">Estado de Resultados</option>
        </select>
      </div>

      <h2>Lista de Estados Financieros</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
        <thead>
          <tr style={{ backgroundColor: "#2c2c2e", color: "white" }}>
            <th style={{ padding: "8px", borderBottom: "1px solid #444" }}>ID</th>
            <th style={{ padding: "8px", borderBottom: "1px solid #444" }}>Tipo</th>
            <th style={{ padding: "8px", borderBottom: "1px solid #444" }}>Fecha</th>
            <th style={{ padding: "8px", borderBottom: "1px solid #444" }}>Datos del Balance</th>
            <th style={{ padding: "8px", borderBottom: "1px solid #444" }}>Descripción</th>
            <th style={{ padding: "8px", borderBottom: "1px solid #444" }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {estados
            .filter(e => !filtroTipo || e.tipo === filtroTipo)
            .map(e => (
              <tr key={e.id} style={{ borderBottom: "1px solid #444", backgroundColor: "#1c1c1e" }}>
                <td style={{ padding: "8px" }}>{e.id}</td>
                <td style={{ padding: "8px" }}>{e.tipo}</td>
                <td style={{ padding: "8px" }}>{formatDate(e.fecha)}</td>
                <td style={{ padding: "8px" }}>
                  {obtenerDatosBalance(e.balance_id)}
                </td>
                <td style={{ padding: "8px" }}>{e.descripcion || '-'}</td>
                <td style={{ padding: "8px" }}>
                  <button onClick={() => editarEstado(e)} style={{ marginRight: "5px" }}>
                    Editar
                  </button>
                  <button onClick={() => eliminarEstado(e.id)}>
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

export default EstadosFinancieros;