import { useState, useEffect } from "react";
import axios from "axios";

const Costcenter = () => {
  const [centrosCostos, setCentrosCostos] = useState([]);
  const [nuevoCentroCosto, setNuevoCentroCosto] = useState({
    nombre: "",
    descripcion: ""
  });
  const [editandoId, setEditandoId] = useState(null);

  useEffect(() => {
    obtenerDatos();
  }, []);

  const obtenerDatos = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/centros-costos");
      setCentrosCostos(response.data);
    } catch (error) {
      console.error("Error al obtener datos:", error);
      alert("Error al cargar centros de costos");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevoCentroCosto({ ...nuevoCentroCosto, [name]: value });
  };

  const limpiarFormulario = () => {
    setNuevoCentroCosto({
      nombre: "",
      descripcion: ""
    });
    setEditandoId(null);
  };

  const crearOActualizarCentroCosto = async (e) => {
    e.preventDefault();
    try {
      if (editandoId) {
        await axios.put(`http://localhost:5000/api/centros-costos/${editandoId}`, nuevoCentroCosto);
      } else {
        await axios.post("http://localhost:5000/api/centros-costos", nuevoCentroCosto);
      }
      obtenerDatos();
      limpiarFormulario();
    } catch (error) {
      console.error("Error al guardar centro de costos:", error);
      alert(error.response?.data?.message || "Error al guardar centro de costos");
    }
  };

  const editarCentroCosto = (centroCosto) => {
    setNuevoCentroCosto({
      nombre: centroCosto.nombre,
      descripcion: centroCosto.descripcion
    });
    setEditandoId(centroCosto.id);
  };

  const eliminarCentroCosto = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este centro de costos?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/centros-costos/${id}`);
      setCentrosCostos(centrosCostos.filter((c) => c.id !== id));
    } catch (error) {
      console.error("Error al eliminar centro de costos:", error);
      alert("Error al eliminar centro de costos");
    }
  };

  return (
    <div style={{ padding: "20px", color: "white", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ fontSize: "28px", marginBottom: "20px" }}>
        {editandoId ? "Editar Centro de Costos" : "Registrar Nuevo Centro de Costos"}
      </h1>

      <form onSubmit={crearOActualizarCentroCosto} style={{ marginBottom: "30px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "10px", maxWidth: "500px" }}>
          <div>
            <label>Nombre:</label>
            <input
              name="nombre"
              type="text"
              value={nuevoCentroCosto.nombre}
              onChange={handleChange}
              required
              style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
            />
          </div>

          <div>
            <label>Descripción:</label>
            <textarea
              name="descripcion"
              value={nuevoCentroCosto.descripcion}
              onChange={handleChange}
              style={{ width: "100%", minHeight: "100px", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
            />
          </div>
        </div>

        <button
          type="submit"
          style={{
            marginTop: "15px",
            padding: "10px 15px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          {editandoId ? "Actualizar Centro de Costos" : "Agregar Centro de Costos"}
        </button>

        {editandoId && (
          <button
            type="button"
            onClick={limpiarFormulario}
            style={{
              marginLeft: "10px",
              padding: "10px 15px",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Cancelar
          </button>
        )}
      </form>

      <h2 style={{ fontSize: "24px", marginBottom: "15px" }}>Lista de Centros de Costos</h2>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "#1c1c1e", color: "#fff" }}>
          <thead>
            <tr style={{ backgroundColor: "#343a40", textAlign: "left" }}>
              <th style={{ padding: "12px", borderBottom: "2px solid #555" }}>ID</th>
              <th style={{ padding: "12px", borderBottom: "2px solid #555" }}>Nombre</th>
              <th style={{ padding: "12px", borderBottom: "2px solid #555" }}>Descripción</th>
              <th style={{ padding: "12px", borderBottom: "2px solid #555" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {centrosCostos.map((c) => (
              <tr key={c.id} style={{ borderBottom: "1px solid #444" }}>
                <td style={{ padding: "10px" }}>{c.id}</td>
                <td style={{ padding: "10px" }}>{c.nombre}</td>
                <td style={{ padding: "10px" }}>{c.descripcion}</td>
                <td style={{ padding: "10px" }}>
                  <button
                    onClick={() => editarCentroCosto(c)}
                    style={{
                      marginRight: "8px",
                      padding: "6px 10px",
                      backgroundColor: "#ffc107",
                      color: "#000",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer"
                    }}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => eliminarCentroCosto(c.id)}
                    style={{
                      padding: "6px 10px",
                      backgroundColor: "#dc3545",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer"
                    }}
                  >
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

export default Costcenter;
