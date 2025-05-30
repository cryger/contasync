import { useState, useEffect } from "react";
import axios from "axios";

const Efective = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [nuevaInversion, setNuevaInversion] = useState({
    usuario_id: "",
    proyecto_id: "",
    monto_invertido: "",
    banco: "",
    prevision: "",
    porcentaje_participacion: ""
  });

  const formatearMoneda = (valor) => {
    if (!valor) return "";
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor);
  };

  const parsearMoneda = (valorFormateado) => {
    if (!valorFormateado) return "";
    return valorFormateado.replace(/[^\d]/g, "");
  };

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const [usuariosRes, proyectosRes] = await Promise.all([
          axios.get("http://localhost:5000/api/usuarios"),
          axios.get("http://localhost:5000/api/proyectos")
        ]);
        setUsuarios(usuariosRes.data.filter(u => u.rol_id === 3));
        setProyectos(proyectosRes.data);
      } catch (error) {
        console.error("Error al obtener datos:", error);
        alert("Error al cargar datos");
      }
    };
    obtenerDatos();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "monto_invertido") {
      const valorNumerico = parsearMoneda(value);
      setNuevaInversion({ ...nuevaInversion, [name]: valorNumerico });
    } else {
      setNuevaInversion({ ...nuevaInversion, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const datos = {
        usuario_id: parseInt(nuevaInversion.usuario_id, 10),
        proyecto_id: parseInt(nuevaInversion.proyecto_id, 10),
        monto_invertido: parseFloat(nuevaInversion.monto_invertido),
        banco: nuevaInversion.banco,
        prevision: nuevaInversion.prevision,
        porcentaje_participacion: parseFloat(nuevaInversion.porcentaje_participacion)
      };

      await axios.post("http://localhost:5000/api/inversiones", datos);
      alert("Inversión guardada correctamente.");
      setNuevaInversion({
        usuario_id: "",
        proyecto_id: "",
        monto_invertido: "",
        banco: "",
        prevision: "",
        porcentaje_participacion: ""
      });
    } catch (error) {
      console.error("Error al guardar inversión:", error);
      alert("Error al guardar inversión");
    }
  };

  return (
    <div style={{ padding: "20px", backgroundColor: "#141b2d", minHeight: "100vh" }}>
      <h2 >Control de Efectivo</h2>
      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: "#141b2d",
          padding: "20px",
          borderRadius: "8px",
          maxWidth: "600px",
          margin: "0 auto",
          boxShadow: "0 0 10px rgba(0,0,0,0.5)",
          color: "white"
        }}
      >
        <div style={{ marginBottom: "15px" }}>
          <label>Usuario:</label>
          <select
            name="usuario_id"
            value={nuevaInversion.usuario_id}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              backgroundColor: "#1e2a38",
              color: "white"
            }}
          >
            <option value="">Seleccione un usuario</option>
            {usuarios.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nombre}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Nombre del Proyecto:</label>
          <select
            name="proyecto_id"
            value={nuevaInversion.proyecto_id}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              backgroundColor: "#1e2a38",
              color: "white"
            }}
          >
            <option value="">Seleccione un proyecto</option>
            {proyectos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Caja Efectiva (COP):</label>
          <input
            type="text"
            name="monto_invertido"
            value={formatearMoneda(nuevaInversion.monto_invertido)}
            onChange={handleChange}
            placeholder="$"
            required
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              backgroundColor: "#1e2a38",
              color: "white"
            }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Banco:</label>
          <input
            type="text"
            name="banco"
            value={nuevaInversion.banco}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              backgroundColor: "#1e2a38",
              color: "white"
            }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Previsión:</label>
          <input
            type="text"
            name="prevision"
            value={nuevaInversion.prevision}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              backgroundColor: "#1e2a38",
              color: "white"
            }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Inversión (% participación):</label>
          <input
            type="number"
            name="porcentaje_participacion"
            value={nuevaInversion.porcentaje_participacion}
            onChange={handleChange}
            step="0.01"
            min="0"
            max="100"
            required
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              backgroundColor: "#1e2a38",
              color: "white"
            }}
          />
        </div>

        <button
          type="submit"
          style={{
            padding: "10px 20px",
            backgroundColor: "#0f3460",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          Guardar Inversión
        </button>
      </form>
    </div>
  );
};

export default Efective;
