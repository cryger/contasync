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

  // Estilos mejorados para tabla y encabezados
  const estilosTabla = {
    width: "100%",
    borderCollapse: "collapse",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    fontSize: "14px",
  };

  const estilosTh = {
    backgroundColor: "#1e2a38",
    color: "white",
    textAlign: "center",
    padding: "12px 15px",
    borderBottom: "2px solid #4a90e2",
    userSelect: "none"
  };

  const estilosTd = {
    padding: "10px 15px",
    borderBottom: "1px solid #ddd",
  };

  const estilosTdNumericos = {
    ...estilosTd,
    textAlign: "right",
    fontVariantNumeric: "tabular-nums"
  };

  const estilosFilaHover = {
    cursor: "pointer",
    backgroundColor: "#f5f7fa"
  };

  return (
    <div style={{ padding: "20px", color: "#333", backgroundColor: "#f0f2f5", minHeight: "100vh" }}>
      <h2 style={{ marginBottom: "20px", color: "#1e2a38" }}>{editandoId ? "Editar Inversión" : "Registrar Nueva Inversión"}</h2>

      <form onSubmit={crearOActualizarInversion} style={{ marginBottom: "30px", backgroundColor: "white", padding: "15px", borderRadius: "8px", boxShadow: "0 0 10px rgba(0,0,0,0.1)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", color: "#1e2a38" }}>Inversionista:</label>
            <select
              name="usuario_id"
              value={nuevaInversion.usuario_id}
              onChange={handleChange}
              required
              style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
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
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", color: "#1e2a38" }}>Proyecto:</label>
            <select
              name="proyecto_id"
              value={nuevaInversion.proyecto_id}
              onChange={handleChange}
              required
              style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
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
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", color: "#1e2a38" }}>Monto Invertido:</label>
            <input
              name="monto_invertido"
              type="text"
              value={formatearMoneda(nuevaInversion.monto_invertido)}
              onChange={handleChange}
              required
              style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", textAlign: "right" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", color: "#1e2a38" }}>Porcentaje (%):</label>
            <input
              name="porcentaje_participacion"
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={nuevaInversion.porcentaje_participacion}
              onChange={handleChange}
              required
              style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", textAlign: "right" }}
            />
          </div>
        </div>

        <div style={{ marginTop: "20px" }}>
          <button
            type="submit"
            style={{
              padding: "10px 18px",
              backgroundColor: "#4a90e2",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "600"
            }}
          >
            {editandoId ? "Actualizar Inversión" : "Agregar Inversión"}
          </button>
          {editandoId && (
            <button
              type="button"
              onClick={limpiarFormulario}
              style={{
                marginLeft: "12px",
                padding: "10px 18px",
                backgroundColor: "#ccc",
                color: "#333",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontWeight: "600"
              }}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div style={{ marginBottom: "20px", color: "#1e2a38", fontWeight: "600" }}>
        <label htmlFor="filtroUsuario" style={{ marginRight: "10px" }}>Filtrar por Inversionista:</label>
        <select
          id="filtroUsuario"
          value={filtroUsuarioId}
          onChange={(e) => setFiltroUsuarioId(e.target.value)}
          style={{ padding: "6px 10px", borderRadius: "4px", border: "1px solid #ccc" }}
        >
          <option value="">Todos los inversionistas</option>
          {usuarios.map((u) => (
            <option key={u.id} value={u.id}>
              {u.nombre}
            </option>
          ))}
        </select>
      </div>

      <h2 style={{ marginBottom: "15px", color: "#1e2a38" }}>Lista de Inversiones</h2>
      <div style={{ overflowX: "auto", backgroundColor: "white", borderRadius: "8px", boxShadow: "0 0 10px rgba(0,0,0,0.1)" }}>
        <table style={estilosTabla}>
          <thead>
            <tr>
              <th style={{ ...estilosTh, width: "5%" }}>ID</th>
              <th style={{ ...estilosTh, width: "25%", textAlign: "left" }}>Inversionista</th>
              <th style={{ ...estilosTh, width: "25%", textAlign: "left" }}>Proyecto</th>
              <th style={{ ...estilosTh, width: "15%" }}>Monto</th>
              <th style={{ ...estilosTh, width: "15%" }}>Participación</th>
              <th style={{ ...estilosTh, width: "15%" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {inversiones
              .filter(inv => !filtroUsuarioId || inv.usuario_id.toString() === filtroUsuarioId)
              .map((inv) => (
                <tr key={inv.id} style={{ borderBottom: "1px solid #ddd" }}>
                  <td style={{ ...estilosTdNumericos }}>{inv.id}</td>
                  <td style={{ ...estilosTd, textAlign: "left" }}>
                    {usuarios.find(u => u.id === inv.usuario_id)?.nombre || inv.usuario_id}
                  </td>
                  <td style={{ ...estilosTd, textAlign: "left" }}>
                    {proyectos.find(p => p.id === inv.proyecto_id)?.nombre || inv.proyecto_id}
                  </td>
                  <td style={estilosTdNumericos}>{formatearMoneda(inv.monto_invertido)}</td>
                  <td style={estilosTdNumericos}>{inv.porcentaje_participacion}%</td>
                  <td style={{ ...estilosTd, textAlign: "center" }}>
                    <button
                      onClick={() => editarInversion(inv)}
                      style={{
                        marginRight: "8px",
                        padding: "6px 10px",
                        backgroundColor: "#4a90e2",
                        border: "none",
                        color: "white",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "13px"
                      }}
                      aria-label={`Editar inversión ${inv.id}`}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => eliminarInversion(inv.id)}
                      style={{
                        padding: "6px 10px",
                        backgroundColor: "#e74c3c",
                        border: "none",
                        color: "white",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "13px"
                      }}
                      aria-label={`Eliminar inversión ${inv.id}`}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            {inversiones.filter(inv => !filtroUsuarioId || inv.usuario_id.toString() === filtroUsuarioId).length === 0 && (
              <tr>
                <td colSpan="6" style={{ padding: "15px", textAlign: "center", color: "#999" }}>
                  No hay inversiones que mostrar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Investments;
