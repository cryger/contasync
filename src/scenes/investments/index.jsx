import { useState, useEffect } from "react";
import axios from "axios";

const Investments = () => {
  const [inversiones, setInversiones] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [nuevaInversion, setNuevaInversion] = useState({
    usuario_id: "",
    proyecto_id: "",
    monto_invertido: "",
    porcentaje_participacion: ""
  });
  const [editandoId, setEditandoId] = useState(null);
  const [filtroUsuarioId, setFiltroUsuarioId] = useState("");

  // Función para formatear moneda
  const formatearMoneda = (valor) => {
    if (!valor) return "";
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor);
  };

  // Función para parsear moneda (quitar símbolos y separadores)
  const parsearMoneda = (valorFormateado) => {
    if (!valorFormateado) return "";
    return valorFormateado.replace(/[^\d]/g, "");
  };

  useEffect(() => {
    obtenerDatos();
  }, []);

  const obtenerDatos = async () => {
    try {
      const [inversionesRes, usuariosRes, proyectosRes] = await Promise.all([
        axios.get("http://localhost:5000/api/inversiones"),
        axios.get("http://localhost:5000/api/usuarios"),
        axios.get("http://localhost:5000/api/proyectos")
      ]);

      setInversiones(inversionesRes.data);
      setUsuarios(usuariosRes.data.filter(u => u.rol_id === 3));
      setProyectos(proyectosRes.data);
    } catch (error) {
      console.error("Error al obtener datos:", error);
      alert("Error al cargar datos");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Manejo especial para el campo de monto
    if (name === "monto_invertido") {
      const valorNumerico = parsearMoneda(value);
      setNuevaInversion({ 
        ...nuevaInversion, 
        [name]: valorNumerico 
      });
    } else {
      setNuevaInversion({ ...nuevaInversion, [name]: value });
    }
  };

  const limpiarFormulario = () => {
    setNuevaInversion({
      usuario_id: "",
      proyecto_id: "",
      monto_invertido: "",
      porcentaje_participacion: ""
    });
    setEditandoId(null);
  };

  const crearOActualizarInversion = async (e) => {
    e.preventDefault();

    try {
      const datos = {
        usuario_id: parseInt(nuevaInversion.usuario_id, 10),
        proyecto_id: parseInt(nuevaInversion.proyecto_id, 10),
        monto_invertido: parseFloat(nuevaInversion.monto_invertido),
        porcentaje_participacion: parseFloat(nuevaInversion.porcentaje_participacion)
      };

      if (editandoId) {
        await axios.put(`http://localhost:5000/api/inversiones/${editandoId}`, datos);
      } else {
        await axios.post("http://localhost:5000/api/inversiones", datos);
      }

      obtenerDatos();
      limpiarFormulario();
    } catch (error) {
      console.error("Error al guardar inversión:", error);
      alert("Error al guardar inversión");
    }
  };

  const editarInversion = (inv) => {
    setNuevaInversion({
      usuario_id: inv.usuario_id.toString(),
      proyecto_id: inv.proyecto_id.toString(),
      monto_invertido: inv.monto_invertido.toString(),
      porcentaje_participacion: inv.porcentaje_participacion.toString()
    });
    setEditandoId(inv.id);
    setFiltroUsuarioId(inv.usuario_id.toString());
  };

  const eliminarInversion = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar esta inversión?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/inversiones/${id}`);
      setInversiones(inversiones.filter((i) => i.id !== id));
    } catch (error) {
      console.error("Error al eliminar inversión:", error);
      alert("Error al eliminar inversión");
    }
  };

  return (
    <div style={{ padding: "20px", color: "white" }}>
      <h2>{editandoId ? "Editar Inversión" : "Registrar Nueva Inversión"}</h2>

      <form onSubmit={crearOActualizarInversion} style={{ marginBottom: "20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
          <div>
            <label>Inversionista:</label>
            <select
              name="usuario_id"
              value={nuevaInversion.usuario_id}
              onChange={handleChange}
              required
              style={{ width: "100%" }}
            >
              <option value="">Seleccione...</option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Proyecto:</label>
            <select
              name="proyecto_id"
              value={nuevaInversion.proyecto_id}
              onChange={handleChange}
              required
              style={{ width: "100%" }}
            >
              <option value="">Seleccione...</option>
              {proyectos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Monto Invertido:</label>
            <input
              name="monto_invertido"
              type="text"
              value={formatearMoneda(nuevaInversion.monto_invertido)}
              onChange={handleChange}
              required
              style={{ width: "100%" }}
            />
          </div>

          <div>
            <label>Porcentaje (%):</label>
            <input
              name="porcentaje_participacion"
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={nuevaInversion.porcentaje_participacion}
              onChange={handleChange}
              required
              style={{ width: "100%" }}
            />
          </div>
        </div>

        <button type="submit" style={{ marginTop: "10px" }}>
          {editandoId ? "Actualizar Inversión" : "Agregar Inversión"}
        </button>
        {editandoId && (
          <button type="button" onClick={limpiarFormulario} style={{ marginLeft: "10px" }}>
            Cancelar
          </button>
        )}
      </form>

      <div style={{ marginBottom: "20px" }}>
        <label>Filtrar por Inversionista: </label>
        <select
          value={filtroUsuarioId}
          onChange={(e) => setFiltroUsuarioId(e.target.value)}
        >
          <option value="">Todos los inversionistas</option>
          {usuarios.map((u) => (
            <option key={u.id} value={u.id}>
              {u.nombre}
            </option>
          ))}
        </select>
      </div>

      <h2>Lista de Inversiones</h2>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#2c2c2e" }}>
              <th>ID</th>
              <th>Inversionista</th>
              <th>Proyecto</th>
              <th>Monto</th>
              <th>Participación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {inversiones
              .filter(inv => !filtroUsuarioId || inv.usuario_id.toString() === filtroUsuarioId)
              .map((inv) => (
                <tr key={inv.id} style={{ borderBottom: "1px solid #444" }}>
                  <td>{inv.id}</td>
                  <td>{usuarios.find(u => u.id === inv.usuario_id)?.nombre || inv.usuario_id}</td>
                  <td>{proyectos.find(p => p.id === inv.proyecto_id)?.nombre || inv.proyecto_id}</td>
                  <td>{formatearMoneda(inv.monto_invertido)}</td>
                  <td>{inv.porcentaje_participacion}%</td>
                  <td>
                    <button onClick={() => editarInversion(inv)} style={{ marginRight: "5px" }}>
                      Editar
                    </button>
                    <button onClick={() => eliminarInversion(inv.id)}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Investments;