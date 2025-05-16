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

  return (
    <div style={{ padding: "20px", color: "white" }}>
      <h2>{editandoId ? "Editar Proveedor" : "Registrar Proveedor"}</h2>

      <form
        onSubmit={crearOActualizarProveedor}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "10px",
          marginBottom: "30px"
        }}
      >
        <input
          name="nombre"
          placeholder="Nombre completo"
          value={nuevoProveedor.nombre}
          onChange={handleChangeProveedor}
          required
        />
        <input
          name="identificacion"
          placeholder="Identificación"
          value={nuevoProveedor.identificacion}
          onChange={handleChangeProveedor}
          required
        />
        <input
          name="telefono"
          placeholder="Teléfono"
          value={nuevoProveedor.telefono}
          onChange={handleChangeProveedor}
        />
        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={nuevoProveedor.email}
          onChange={handleChangeProveedor}
        />
        <textarea
          name="direccion"
          placeholder="Dirección"
          value={nuevoProveedor.direccion}
          onChange={handleChangeProveedor}
          style={{ gridColumn: "span 2", resize: "vertical" }}
        />
        <button type="submit" style={{ gridColumn: "span 2", padding: "8px", fontWeight: "bold" }}>
          {editandoId ? "Actualizar Proveedor" : "Agregar Proveedor"}
        </button>
      </form>

      <h2>Lista de Proveedores</h2>

      <table style={{ width: "100%", borderCollapse: "collapse", color: "white" }}>
        <thead>
          <tr style={{ backgroundColor: "#2c2c2e" }}>
            <th style={{ padding: "8px" }}>ID</th>
            <th style={{ padding: "8px" }}>Nombre</th>
            <th style={{ padding: "8px" }}>Identificación</th>
            <th style={{ padding: "8px" }}>Teléfono</th>
            <th style={{ padding: "8px" }}>Email</th>
            <th style={{ padding: "8px" }}>Dirección</th>
            <th style={{ padding: "8px" }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {proveedores.map((p) => (
            <tr key={p.id} style={{ borderTop: "1px solid #444" }}>
              <td style={{ padding: "8px" }}>{p.id}</td>
              <td style={{ padding: "8px" }}>{p.nombre}</td>
              <td style={{ padding: "8px" }}>{p.identificacion}</td>
              <td style={{ padding: "8px" }}>{p.telefono}</td>
              <td style={{ padding: "8px" }}>{p.email}</td>
              <td style={{ padding: "8px" }}>{p.direccion}</td>
              <td style={{ padding: "8px" }}>
                <button onClick={() => editarProveedor(p)} style={{ marginRight: "10px" }}>✏️</button>
                <button onClick={() => eliminarProveedor(p.id)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Suppliers;
