import { useState, useEffect } from "react";
import axios from "axios";

const Budget = () => {
  const [presupuestos, setPresupuestos] = useState([]);
  const [centrosCostos, setCentrosCostos] = useState([]);
  const [nuevoPresupuesto, setNuevoPresupuesto] = useState({
    nombre: "",
    monto_total: "",
    fecha_inicio: "",
    fecha_fin: "",
    centro_costo_id: ""
  });
  const [editandoId, setEditandoId] = useState(null);
  const [filtroCentroCostoId, setFiltroCentroCostoId] = useState("");
  const [montoDisplay, setMontoDisplay] = useState("");

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
      const [presupuestosRes, centrosCostosRes] = await Promise.all([
        axios.get("http://localhost:5000/api/presupuestos"),
        axios.get("http://localhost:5000/api/centros-costos")
      ]);
      setPresupuestos(presupuestosRes.data);
      setCentrosCostos(centrosCostosRes.data);
    } catch (error) {
      console.error("Error al obtener datos:", error);
      alert("Error al cargar datos");
    }
  };

  const handleMontoChange = (e) => {
    let value = e.target.value.replace(/[^\d]/g, '');
    setMontoDisplay(value ? `$ ${formatNumber(value)}` : "");
    setNuevoPresupuesto({ ...nuevoPresupuesto, monto_total: value });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevoPresupuesto({ ...nuevoPresupuesto, [name]: value });
  };

  const limpiarFormulario = () => {
    setNuevoPresupuesto({
      nombre: "",
      monto_total: "",
      fecha_inicio: "",
      fecha_fin: "",
      centro_costo_id: ""
    });
    setMontoDisplay("");
    setEditandoId(null);
  };

  const crearOActualizarPresupuesto = async (e) => {
    e.preventDefault();
    try {
      const datos = {
        ...nuevoPresupuesto,
        monto_total: parseFloat(nuevoPresupuesto.monto_total),
        centro_costo_id: parseInt(nuevoPresupuesto.centro_costo_id)
      };

      if (editandoId) {
        await axios.put(`http://localhost:5000/api/presupuestos/${editandoId}`, datos);
      } else {
        await axios.post("http://localhost:5000/api/presupuestos", datos);
      }
      obtenerDatos();
      limpiarFormulario();
    } catch (error) {
      console.error("Error al guardar:", error);
      alert(error.response?.data?.message || "Error al guardar");
    }
  };

  const editarPresupuesto = (presupuesto) => {
    setNuevoPresupuesto({
      nombre: presupuesto.nombre,
      monto_total: presupuesto.monto_total.toString(),
      fecha_inicio: presupuesto.fecha_inicio.split('T')[0],
      fecha_fin: presupuesto.fecha_fin.split('T')[0],
      centro_costo_id: presupuesto.centro_costo_id.toString()
    });
    setMontoDisplay(`$ ${formatNumber(presupuesto.monto_total)}`);
    setEditandoId(presupuesto.id);
  };

  const eliminarPresupuesto = async (id) => {
    if (!window.confirm("¿Eliminar este presupuesto?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/presupuestos/${id}`);
      setPresupuestos(presupuestos.filter(p => p.id !== id));
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
      <h2>{editandoId ? "Editar Presupuesto" : "Nuevo Presupuesto"}</h2>

      <form onSubmit={crearOActualizarPresupuesto} style={{ marginBottom: "20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
          <div>
            <label>Nombre:</label>
            <input
              name="nombre"
              value={nuevoPresupuesto.nombre}
              onChange={handleChange}
              required
              style={{ width: "100%" }}
            />
          </div>
          <div>
            <label>Monto Total:</label>
            <input
              value={montoDisplay}
              onChange={handleMontoChange}
              placeholder="$ 0"
              required
              style={{ width: "100%" }}
            />
          </div>
          <div>
            <label>Fecha Inicio:</label>
            <input
              type="date"
              name="fecha_inicio"
              value={nuevoPresupuesto.fecha_inicio}
              onChange={handleChange}
              required
              style={{ width: "100%" }}
            />
          </div>
          <div>
            <label>Fecha Fin:</label>
            <input
              type="date"
              name="fecha_fin"
              value={nuevoPresupuesto.fecha_fin}
              onChange={handleChange}
              min={nuevoPresupuesto.fecha_inicio}
              required
              style={{ width: "100%" }}
            />
          </div>
          <div>
            <label>Centro de Costo:</label>
            <select
              name="centro_costo_id"
              value={nuevoPresupuesto.centro_costo_id}
              onChange={handleChange}
              required
              style={{ width: "100%" }}
            >
              <option value="">Seleccionar...</option>
              {centrosCostos.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
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
        <label>Filtrar por Centro: </label>
        <select
          value={filtroCentroCostoId}
          onChange={(e) => setFiltroCentroCostoId(e.target.value)}
        >
          <option value="">Todos</option>
          {centrosCostos.map(c => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>
      </div>

      <h2>Lista de Presupuestos</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
        <thead>
          <tr style={{ backgroundColor: "#2c2c2e", color: "white" }}>
            <th style={{ padding: "8px", borderBottom: "1px solid #444" }}>ID</th>
            <th style={{ padding: "8px", borderBottom: "1px solid #444" }}>Nombre</th>
            <th style={{ padding: "8px", borderBottom: "1px solid #444" }}>Monto</th>
            <th style={{ padding: "8px", borderBottom: "1px solid #444" }}>Inicio</th>
            <th style={{ padding: "8px", borderBottom: "1px solid #444" }}>Fin</th>
            <th style={{ padding: "8px", borderBottom: "1px solid #444" }}>Centro</th>
            <th style={{ padding: "8px", borderBottom: "1px solid #444" }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {presupuestos
            .filter(p => !filtroCentroCostoId || p.centro_costo_id.toString() === filtroCentroCostoId)
            .map(p => (
              <tr key={p.id} style={{ borderBottom: "1px solid #444", backgroundColor: "#1c1c1e" }}>
                <td style={{ padding: "8px" }}>{p.id}</td>
                <td style={{ padding: "8px" }}>{p.nombre}</td>
                <td style={{ padding: "8px" }}>$ {formatNumber(p.monto_total)}</td>
                <td style={{ padding: "8px" }}>{formatDate(p.fecha_inicio)}</td>
                <td style={{ padding: "8px" }}>{formatDate(p.fecha_fin)}</td>
                <td style={{ padding: "8px" }}>
                  {centrosCostos.find(c => c.id === p.centro_costo_id)?.nombre || '-'}
                </td>
                <td style={{ padding: "8px" }}>
                  <button onClick={() => editarPresupuesto(p)} style={{ marginRight: "5px" }}>
                    Editar
                  </button>
                  <button onClick={() => eliminarPresupuesto(p.id)}>
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

export default Budget;
