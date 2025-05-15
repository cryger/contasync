import { useState, useEffect } from "react";
import axios from "axios";

const Projects = () => {
  const [proyectos, setProyectos] = useState([]);
  const [nuevoProyecto, setNuevoProyecto] = useState({
    nombre: "",
    descripcion: "",
    presupuesto: "",
    fecha_inicio: "",
    fecha_fin: ""
  });
  const [editandoId, setEditandoId] = useState(null);

  useEffect(() => {
    obtenerProyectos();
  }, []);

  const obtenerProyectos = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/proyectos");
      setProyectos(data);
    } catch (error) {
      console.error("Error al obtener proyectos:", error);
    }
  };

  const formatCurrency = (value) => {
    const number = parseFloat(value.toString().replace(/[^\d]/g, ""));
    return isNaN(number)
      ? ""
      : number.toLocaleString("es-CO", {
          style: "currency",
          currency: "COP",
          minimumFractionDigits: 0
        });
  };

  const handleChangeProyecto = (e) => {
    const { name, value } = e.target;

    if (name === "presupuesto") {
      // Guardar solo números limpios para presupuesto
      const numeroLimpio = value.replace(/[^\d]/g, "");
      setNuevoProyecto({ ...nuevoProyecto, [name]: numeroLimpio });
    } else {
      setNuevoProyecto({ ...nuevoProyecto, [name]: value });
    }
  };

  const limpiarFormulario = () => {
    setNuevoProyecto({
      nombre: "",
      descripcion: "",
      presupuesto: "",
      fecha_inicio: "",
      fecha_fin: ""
    });
    setEditandoId(null);
  };

  const crearOActualizarProyecto = async (e) => {
    e.preventDefault();

    const proyectoData = {
      ...nuevoProyecto,
      presupuesto: parseFloat(nuevoProyecto.presupuesto)
    };

    try {
      if (editandoId) {
        // Actualizar proyecto existente
        await axios.put(`http://localhost:5000/api/proyectos/${editandoId}`, proyectoData);
        obtenerProyectos();
      } else {
        // Crear nuevo proyecto
        const { data } = await axios.post("http://localhost:5000/api/proyectos", proyectoData);
        setProyectos([...proyectos, data]);
      }

      limpiarFormulario();
    } catch (error) {
      console.error("Error al guardar proyecto:", error);
      alert("Error al guardar proyecto.");
    }
  };

  const editarProyecto = (proyecto) => {
    setNuevoProyecto({
      nombre: proyecto.nombre,
      descripcion: proyecto.descripcion,
      presupuesto: proyecto.presupuesto.toString(),
      fecha_inicio: proyecto.fecha_inicio ? proyecto.fecha_inicio.split("T")[0] : "",
      fecha_fin: proyecto.fecha_fin ? proyecto.fecha_fin.split("T")[0] : ""
    });
    setEditandoId(proyecto.id);
  };

  const eliminarProyecto = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este proyecto?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/proyectos/${id}`);
      setProyectos(proyectos.filter(p => p.id !== id));
    } catch (error) {
      console.error("Error al eliminar proyecto:", error);
      alert("Error al eliminar proyecto.");
    }
  };

  return (
    <div style={{ padding: "20px", color: "white" }}>
      <h2 style={{ marginBottom: "20px" }}>
        {editandoId ? "Editar Proyecto" : "Registrar Proyecto de Inversión"}
      </h2>

      <form
        onSubmit={crearOActualizarProyecto}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "10px",
          marginBottom: "30px"
        }}
      >
        <input
          name="nombre"
          placeholder="Nombre del proyecto"
          value={nuevoProyecto.nombre}
          onChange={handleChangeProyecto}
          required
        />

        <textarea
          name="descripcion"
          placeholder="Descripción"
          value={nuevoProyecto.descripcion}
          onChange={handleChangeProyecto}
          required
          style={{ gridColumn: "span 2", resize: "vertical" }}
        />

        <input
          name="presupuesto"
          placeholder="Presupuesto"
          value={formatCurrency(nuevoProyecto.presupuesto)}
          onChange={handleChangeProyecto}
          required
        />

        <div>
          <label htmlFor="fecha_inicio">Fecha Inicio</label>
          <input
            type="date"
            id="fecha_inicio"
            name="fecha_inicio"
            value={nuevoProyecto.fecha_inicio}
            onChange={handleChangeProyecto}
            required
            style={{ width: "100%" }}
          />
        </div>

        <div>
          <label htmlFor="fecha_fin">Fecha Fin</label>
          <input
            type="date"
            id="fecha_fin"
            name="fecha_fin"
            value={nuevoProyecto.fecha_fin}
            onChange={handleChangeProyecto}
            required
            style={{ width: "100%" }}
          />
        </div>

        <button
          type="submit"
          style={{
            gridColumn: "span 2",
            padding: "8px",
            fontWeight: "bold"
          }}
        >
          {editandoId ? "Actualizar Proyecto" : "Agregar Proyecto"}
        </button>
      </form>

      <h2>Lista de Proyectos</h2>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          color: "white"
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#2c2c2e" }}>
            <th style={{ padding: "8px" }}>ID</th>
            <th style={{ padding: "8px" }}>Nombre</th>
            <th style={{ padding: "8px" }}>Descripción</th>
            <th style={{ padding: "8px" }}>Presupuesto</th>
            <th style={{ padding: "8px" }}>Fecha Inicio</th>
            <th style={{ padding: "8px" }}>Fecha Fin</th>
            <th style={{ padding: "8px" }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {proyectos.map((p) => (
            <tr key={p.id} style={{ borderTop: "1px solid #444" }}>
              <td style={{ padding: "8px" }}>{p.id}</td>
              <td style={{ padding: "8px" }}>{p.nombre}</td>
              <td style={{ padding: "8px" }}>{p.descripcion}</td>
              <td style={{ padding: "8px" }}>{formatCurrency(p.presupuesto)}</td>
              <td style={{ padding: "8px" }}>{p.fecha_inicio ? p.fecha_inicio.split("T")[0] : ""}</td>
              <td style={{ padding: "8px" }}>{p.fecha_fin ? p.fecha_fin.split("T")[0] : ""}</td>
              <td style={{ padding: "8px" }}>
                <button onClick={() => editarProyecto(p)} style={{ marginRight: "10px" }}>
                  ✏️
                </button>
                <button onClick={() => eliminarProyecto(p.id)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Projects;
