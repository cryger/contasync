import { useState, useEffect } from "react";
import axios from "axios";

const Contacts = () => {
  const [clientes, setClientes] = useState([]);
  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: "",
    identificacion: "",
    telefono: "",
    email: "",
    direccion: ""
  });
  const [editandoId, setEditandoId] = useState(null);

  useEffect(() => {
    obtenerClientes();
  }, []);

  const obtenerClientes = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/clientes");
      setClientes(data);
    } catch (error) {
      console.error("Error al obtener clientes:", error);
    }
  };

  const handleChangeCliente = (e) => {
    const { name, value } = e.target;
    setNuevoCliente({ ...nuevoCliente, [name]: value });
  };

  const limpiarFormulario = () => {
    setNuevoCliente({
      nombre: "",
      identificacion: "",
      telefono: "",
      email: "",
      direccion: ""
    });
    setEditandoId(null);
  };

  const crearOActualizarCliente = async (e) => {
    e.preventDefault();

    try {
      if (editandoId) {
        await axios.put(`http://localhost:5000/api/clientes/${editandoId}`, nuevoCliente);
        obtenerClientes();
      } else {
        const { data } = await axios.post("http://localhost:5000/api/clientes", nuevoCliente);
        setClientes([...clientes, data]);
      }

      limpiarFormulario();
    } catch (error) {
      console.error("Error al guardar cliente:", error);
      alert("Error al guardar cliente.");
    }
  };

  const editarCliente = (cliente) => {
    setNuevoCliente({
      nombre: cliente.nombre,
      identificacion: cliente.identificacion,
      telefono: cliente.telefono,
      email: cliente.email,
      direccion: cliente.direccion
    });
    setEditandoId(cliente.id);
  };

  const eliminarCliente = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este cliente?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/clientes/${id}`);
      setClientes(clientes.filter(c => c.id !== id));
    } catch (error) {
      console.error("Error al eliminar cliente:", error);
      alert("Error al eliminar cliente.");
    }
  };

  return (
    <div style={{ padding: "20px", color: "white" }}>
      <h2>{editandoId ? "Editar Cliente" : "Registrar Cliente"}</h2>

      <form
        onSubmit={crearOActualizarCliente}
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
          value={nuevoCliente.nombre}
          onChange={handleChangeCliente}
          required
        />
        <input
          name="identificacion"
          placeholder="Identificación"
          value={nuevoCliente.identificacion}
          onChange={handleChangeCliente}
          required
        />
        <input
          name="telefono"
          placeholder="Teléfono"
          value={nuevoCliente.telefono}
          onChange={handleChangeCliente}
        />
        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={nuevoCliente.email}
          onChange={handleChangeCliente}
        />
        <textarea
          name="direccion"
          placeholder="Dirección"
          value={nuevoCliente.direccion}
          onChange={handleChangeCliente}
          style={{ gridColumn: "span 2", resize: "vertical" }}
        />
        <button type="submit" style={{ gridColumn: "span 2", padding: "8px", fontWeight: "bold" }}>
          {editandoId ? "Actualizar Cliente" : "Agregar Cliente"}
        </button>
      </form>

      <h2>Lista de Clientes</h2>

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
          {clientes.map((c) => (
            <tr key={c.id} style={{ borderTop: "1px solid #444" }}>
              <td style={{ padding: "8px" }}>{c.id}</td>
              <td style={{ padding: "8px" }}>{c.nombre}</td>
              <td style={{ padding: "8px" }}>{c.identificacion}</td>
              <td style={{ padding: "8px" }}>{c.telefono}</td>
              <td style={{ padding: "8px" }}>{c.email}</td>
              <td style={{ padding: "8px" }}>{c.direccion}</td>
              <td style={{ padding: "8px" }}>
                <button onClick={() => editarCliente(c)} style={{ marginRight: "10px" }}>✏️</button>
                <button onClick={() => eliminarCliente(c.id)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Contacts;
