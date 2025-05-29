import { useState, useEffect } from "react";
import axios from "axios";

const Suppliers = () => {
  const [proveedores, setProveedores] = useState([]);
  const [nuevoProveedor, setNuevoProveedor] = useState({
    nombre: "",
    identificacion: "",
    telefono: "",
    email: "",
    direccion: ""
  });
  const [editandoId, setEditandoId] = useState(null);

  useEffect(() => {
    obtenerProveedores();
  }, []);

  const obtenerProveedores = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/proveedores");
      setProveedores(data);
    } catch (error) {
      console.error("Error al obtener proveedores:", error);
    }
  };

  const handleChangeProveedor = (e) => {
    const { name, value } = e.target;
    setNuevoProveedor({ ...nuevoProveedor, [name]: value });
  };

  const limpiarFormulario = () => {
    setNuevoProveedor({
      nombre: "",
      identificacion: "",
      telefono: "",
      email: "",
      direccion: ""
    });
    setEditandoId(null);
  };

  const crearOActualizarProveedor = async (e) => {
    e.preventDefault();

    try {
      if (editandoId) {
        await axios.put(`http://localhost:5000/api/proveedores/${editandoId}`, nuevoProveedor);
        obtenerProveedores();
      } else {
        const { data } = await axios.post("http://localhost:5000/api/proveedores", nuevoProveedor);
        setProveedores([...proveedores, data]);
      }

      limpiarFormulario();
    } catch (error) {
      console.error("Error al guardar proveedor:", error);
      alert("Error al guardar proveedor.");
    }
  };

  const editarProveedor = (proveedor) => {
    setNuevoProveedor({
      nombre: proveedor.nombre,
      identificacion: proveedor.identificacion,
      telefono: proveedor.telefono,
      email: proveedor.email,
      direccion: proveedor.direccion
    });
    setEditandoId(proveedor.id);
  };

  const eliminarProveedor = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este proveedor?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/proveedores/${id}`);
      setProveedores(proveedores.filter(p => p.id !== id));
    } catch (error) {
      console.error("Error al eliminar proveedor:", error);
      alert("Error al eliminar proveedor.");
    }
  };

  // Estilos para encabezados y celdas numéricas
  const thStyle = {
    padding: "12px 10px",
    backgroundColor: "#1e1e2f",
    color: "#f0f0f0",
    borderBottom: "2px solid #444",
    textAlign: "left",
    fontWeight: "600",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
  };

  const tdStyleTexto = {
    padding: "10px",
    borderBottom: "1px solid #333",
    textAlign: "left",
    fontSize: "0.9rem",
    color: "#ddd"
  };

  const tdStyleNumero = {
    padding: "10px",
    borderBottom: "1px solid #333",
    textAlign: "center",
    fontSize: "0.9rem",
    color: "#ddd",
    minWidth: "80px",
  };

  const botonAccion = {
    marginRight: "10px",
    cursor: "pointer",
    backgroundColor: "transparent",
    border: "none",
    fontSize: "1.1rem",
    color: "#a0a0a0",
    transition: "color 0.2s",
  };

  return (
    <div style={{ padding: "20px", backgroundColor: "#121217", minHeight: "100vh", color: "white", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      <h2 style={{ marginBottom: "15px" }}>{editandoId ? "Editar Proveedor" : "Registrar Proveedor"}</h2>

      <form
        onSubmit={crearOActualizarProveedor}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "15px",
          marginBottom: "40px"
        }}
      >
        <input
          name="nombre"
          placeholder="Nombre completo"
          value={nuevoProveedor.nombre}
          onChange={handleChangeProveedor}
          required
          style={{ padding: "8px", borderRadius: "4px", border: "1px solid #444", backgroundColor: "#1c1c2e", color: "white" }}
        />
        <input
          name="identificacion"
          placeholder="Identificación"
          value={nuevoProveedor.identificacion}
          onChange={handleChangeProveedor}
          required
          style={{ padding: "8px", borderRadius: "4px", border: "1px solid #444", backgroundColor: "#1c1c2e", color: "white" }}
        />
        <input
          name="telefono"
          placeholder="Teléfono"
          value={nuevoProveedor.telefono}
          onChange={handleChangeProveedor}
          style={{ padding: "8px", borderRadius: "4px", border: "1px solid #444", backgroundColor: "#1c1c2e", color: "white" }}
        />
        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={nuevoProveedor.email}
          onChange={handleChangeProveedor}
          style={{ padding: "8px", borderRadius: "4px", border: "1px solid #444", backgroundColor: "#1c1c2e", color: "white" }}
        />
        <textarea
          name="direccion"
          placeholder="Dirección"
          value={nuevoProveedor.direccion}
          onChange={handleChangeProveedor}
          style={{ gridColumn: "span 2", resize: "vertical", padding: "8px", borderRadius: "4px", border: "1px solid #444", backgroundColor: "#1c1c2e", color: "white" }}
        />
        <button
          type="submit"
          style={{
            gridColumn: "span 2",
            padding: "12px",
            fontWeight: "700",
            borderRadius: "5px",
            border: "none",
            backgroundColor: "#4a90e2",
            color: "white",
            cursor: "pointer",
            fontSize: "1rem",
            transition: "background-color 0.3s"
          }}
          onMouseOver={e => (e.currentTarget.style.backgroundColor = "#357ABD")}
          onMouseOut={e => (e.currentTarget.style.backgroundColor = "#4a90e2")}
        >
          {editandoId ? "Actualizar Proveedor" : "Agregar Proveedor"}
        </button>
      </form>

      <h2 style={{ marginBottom: "15px" }}>Lista de Proveedores</h2>

      <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "#181824", borderRadius: "8px", overflow: "hidden" }}>
        <thead>
          <tr>
            <th style={{ ...thStyle, textAlign: "center", minWidth: "60px" }}>ID</th>
            <th style={thStyle}>Nombre</th>
            <th style={thStyle}>Identificación</th>
            <th style={{ ...thStyle, textAlign: "center" }}>Teléfono</th>
            <th style={thStyle}>Email</th>
            <th style={thStyle}>Dirección</th>
            <th style={{ ...thStyle, textAlign: "center", minWidth: "110px" }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {proveedores.map((p) => (
            <tr key={p.id} style={{ borderTop: "1px solid #333" }}>
              <td style={tdStyleNumero}>{p.id}</td>
              <td style={tdStyleTexto}>{p.nombre}</td>
              <td style={tdStyleTexto}>{p.identificacion}</td>
              <td style={tdStyleNumero}>{p.telefono}</td>
              <td style={tdStyleTexto}>{p.email}</td>
              <td style={tdStyleTexto}>{p.direccion}</td>
              <td style={{ ...tdStyleNumero, display: "flex", justifyContent: "center", gap: "10px" }}>
                <button
                  onClick={() => editarProveedor(p)}
                  style={botonAccion}
                  title="Editar Proveedor"
                  onMouseOver={e => (e.currentTarget.style.color = "#4a90e2")}
                  onMouseOut={e => (e.currentTarget.style.color = "#a0a0a0")}
                >
                  ✏️
                </button>
                <button
                  onClick={() => eliminarProveedor(p.id)}
                  style={{ ...botonAccion, color: "#e24a4a" }}
                  title="Eliminar Proveedor"
                  onMouseOver={e => (e.currentTarget.style.color = "#b83b3b")}
                  onMouseOut={e => (e.currentTarget.style.color = "#e24a4a")}
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
          {proveedores.length === 0 && (
            <tr>
              <td colSpan="7" style={{ padding: "20px", textAlign: "center", color: "#888" }}>
                No hay proveedores registrados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Suppliers;
