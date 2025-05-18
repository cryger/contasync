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

  useEffect(() => {
    obtenerInversiones();
    obtenerUsuarios();
    obtenerProyectos();
  }, []);

  const obtenerInversiones = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/inversiones");
      setInversiones(data);
    } catch (error) {
      console.error("Error al obtener inversiones:", error);
    }
  };

  const obtenerUsuarios = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/usuarios/inversionistas");
      setUsuarios(data);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
    }
  };

  const obtenerProyectos = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/proyectos");
      setProyectos(data);
    } catch (error) {
      console.error("Error al obtener proyectos:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevaInversion({ ...nuevaInversion, [name]: value });
  };

  const limpiarFormulario = () => {
    setNuevaInversion({
      usuario_id: "",
      proyecto_id: "",
      monto_invertido: "",
      porcentaje_participacion: ""
    });
    setEditandoId(null);
    setFiltroUsuarioId(""); // limpiar filtro también
  };

  const crearOActualizarInversion = async (e) => {
    e.preventDefault();

    // Validación de tipos
    const datos = {
      usuario_id: parseInt(nuevaInversion.usuario_id, 10),
      proyecto_id: parseInt(nuevaInversion.proyecto_id, 10),
      monto_invertido: parseFloat(nuevaInversion.monto_invertido),
      porcentaje_participacion: parseFloat(nuevaInversion.porcentaje_participacion)
    };

    if (isNaN(datos.usuario_id) || isNaN(datos.proyecto_id)) {
      alert("Selecciona un inversionista y un proyecto válidos.");
      return;
    }

    try {
      if (editandoId) {
        await axios.put(`http://localhost:5000/api/inversiones/${editandoId}`, datos);
      } else {
        await axios.post("http://localhost:5000/api/inversiones", datos);
      }

      obtenerInversiones();
      limpiarFormulario();
    } catch (error) {
      console.error("Error al guardar inversión:", error);
      alert("Error al guardar inversión.");
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
    setFiltroUsuarioId(inv.usuario_id.toString()); // para que se muestre filtrado
  };

  const eliminarInversion = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar esta inversión?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/inversiones/${id}`);
      setInversiones(inversiones.filter((i) => i.id !== id));
    } catch (error) {
      console.error("Error al eliminar inversión:", error);
      alert("Error al eliminar inversión.");
    }
  };

  return (
    <div style={{ padding: "20px", color: "white" }}>
      <h2>{editandoId ? "Editar Inversión" : "Registrar Nueva Inversión"}</h2>

      <form
        onSubmit={crearOActualizarInversion}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "10px",
          marginBottom: "30px"
        }}
      >
        <select
          name="usuario_id"
          value={nuevaInversion.usuario_id}
          onChange={(e) => {
            handleChange(e);
            setFiltroUsuarioId(e.target.value);
          }}
          required
        >
          <option value="">Selecciona un Inversionista</option>
          {usuarios.map((u) => (
            <option key={u.id} value={u.id}>
              {u.nombre}
            </option>
          ))}
        </select>

        <select
          name="proyecto_id"
          value={nuevaInversion.proyecto_id}
          onChange={handleChange}
          required
        >
          <option value="">Selecciona un Proyecto</option>
          {proyectos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </select>

        <input
          name="monto_invertido"
          placeholder="Monto Invertido"
          type="number"
          value={nuevaInversion.monto_invertido}
          onChange={handleChange}
          required
        />

        <input
          name="porcentaje_participacion"
          placeholder="Porcentaje (%)"
          type="number"
          step="0.01"
          value={nuevaInversion.porcentaje_participacion}
          onChange={handleChange}
          required
        />

        <button type="submit" style={{ gridColumn: "span 2" }}>
          {editandoId ? "Actualizar Inversión" : "Agregar Inversión"}
        </button>
      </form>

      <h2>Lista de Inversiones</h2>

      <table
        style={{ width: "100%", borderCollapse: "collapse", color: "white" }}
      >
        <thead>
          <tr style={{ backgroundColor: "#2c2c2e" }}>
            <th>ID</th>
            <th>Inversionista</th>
            <th>Proyecto</th>
            <th>Monto</th>
            <th>Participación (%)</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {inversiones
            .filter((inv) => {
              if (!filtroUsuarioId) return true;
              return inv.usuario_id.toString() === filtroUsuarioId;
            })
            .map((inv) => (
              <tr key={inv.id} style={{ borderTop: "1px solid #444" }}>
                <td>{inv.id}</td>
                <td>{usuarios.find((u) => u.id === inv.usuario_id)?.nombre || inv.usuario_id}</td>
                <td>{proyectos.find((p) => p.id === inv.proyecto_id)?.nombre || inv.proyecto_id}</td>
                <td>
                  {parseFloat(inv.monto_invertido).toLocaleString("es-CO", {
                    style: "currency",
                    currency: "COP"
                  })}
                </td>
                <td>{inv.porcentaje_participacion}%</td>
                <td>
                  <button
                    onClick={() => editarInversion(inv)}
                    style={{ marginRight: "10px" }}
                  >
                    ✏️
                  </button>
                  <button onClick={() => eliminarInversion(inv.id)}>🗑️</button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default Investments;
