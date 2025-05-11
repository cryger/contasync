import { useState, useEffect } from "react";
import axios from "axios";

const Invoices = () => {
  const [facturas, setFacturas] = useState([]);
  const [editando, setEditando] = useState(null);
  const [nuevaFactura, setNuevaFactura] = useState({
    cliente: "",
    nit: "",
    fecha: "",
    total: "",
  });

  useEffect(() => {
    obtenerFacturas();
  }, []);

  const obtenerFacturas = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/facturas");
      setFacturas(response.data);
    } catch (error) {
      console.error("Error al obtener facturas:", error);
      alert("Error al cargar facturas");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editando) {
      setFacturas(
        facturas.map((factura) =>
          factura.id === editando ? { ...factura, [name]: value } : factura
        )
      );
    } else {
      setNuevaFactura({ ...nuevaFactura, [name]: value });
    }
  };

  const crearFactura = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/api/facturas",
        nuevaFactura
      );
      setFacturas([...facturas, response.data]);
      setNuevaFactura({ cliente: "", nit: "", fecha: "", total: "" });
      alert("Factura creada exitosamente");
    } catch (error) {
      console.error("Error al crear factura:", error);
      alert("Error al crear factura");
    }
  };

  const iniciarEdicion = (id) => {
    setEditando(id);
  };

  const cancelarEdicion = () => {
    setEditando(null);
    obtenerFacturas();
  };

  const actualizarFactura = async (id) => {
    try {
      const facturaEditada = facturas.find((factura) => factura.id === id);
      await axios.put(
        `http://localhost:5000/api/facturas/${id}`,
        facturaEditada
      );
      setEditando(null);
      obtenerFacturas();
      alert("Factura actualizada exitosamente");
    } catch (error) {
      console.error("Error al actualizar factura:", error);
      alert("Error al actualizar factura");
    }
  };

  // FUNCIÓN CORREGIDA PARA ELIMINAR FACTURAS
  const eliminarFactura = async (id) => {
    if (!window.confirm("¿Estás seguro que deseas eliminar esta factura?")) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/facturas/${id}`);
      setFacturas(facturas.filter(factura => factura.id !== id));
      alert("Factura eliminada exitosamente");
    } catch (error) {
      console.error("Error al eliminar factura:", error);
      
      if (error.response) {
        if (error.response.status === 404) {
          alert("La factura no fue encontrada (posiblemente ya fue eliminada)");
        } else {
          alert(`Error al eliminar: ${error.response.data?.error || error.message}`);
        }
      } else {
        alert("Error de conexión al intentar eliminar la factura");
      }
      
      obtenerFacturas();
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ fontSize: "24px", marginBottom: "20px" }}>Facturas</h1>
      
      <form onSubmit={crearFactura} style={{ marginBottom: "20px" }}>
        <input
          type="text"
          name="cliente"
          value={nuevaFactura.cliente}
          onChange={handleInputChange}
          placeholder="Cliente"
          required
          style={{ marginRight: "10px", padding: "5px" }}
        />
        <input
          type="text"
          name="nit"
          value={nuevaFactura.nit}
          onChange={handleInputChange}
          placeholder="NIT"
          required
          style={{ marginRight: "10px", padding: "5px" }}
        />
        <input
          type="date"
          name="fecha"
          value={nuevaFactura.fecha}
          onChange={handleInputChange}
          placeholder="Fecha"
          required
          style={{ marginRight: "10px", padding: "5px" }}
        />
        <input
          type="number"
          name="total"
          value={nuevaFactura.total}
          onChange={handleInputChange}
          placeholder="Total"
          step="0.01"
          required
          style={{ marginRight: "10px", padding: "5px" }}
        />
        <button 
          type="submit"
          style={{ 
            padding: "5px 10px", 
            backgroundColor: "#4CAF50", 
            color: "white", 
            border: "none", 
            borderRadius: "4px", 
            cursor: "pointer" 
          }}
        >
          Crear Factura
        </button>
      </form>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#f2f2f2" }}>
            <th style={{ padding: "10px", textAlign: "left", borderBottom: "1px solid #ddd" }}>ID</th>
            <th style={{ padding: "10px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Cliente</th>
            <th style={{ padding: "10px", textAlign: "left", borderBottom: "1px solid #ddd" }}>NIT</th>
            <th style={{ padding: "10px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Fecha</th>
            <th style={{ padding: "10px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Total</th>
            <th style={{ padding: "10px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {facturas.map((factura) => (
            <tr key={factura.id} style={{ borderBottom: "1px solid #ddd" }}>
              <td style={{ padding: "10px" }}>{factura.id}</td>
              <td style={{ padding: "10px" }}>
                {editando === factura.id ? (
                  <input
                    type="text"
                    name="cliente"
                    value={factura.cliente}
                    onChange={handleInputChange}
                    style={{ width: "100%", padding: "5px" }}
                    required
                  />
                ) : (
                  factura.cliente
                )}
              </td>
              <td style={{ padding: "10px" }}>
                {editando === factura.id ? (
                  <input
                    type="text"
                    name="nit"
                    value={factura.nit}
                    onChange={handleInputChange}
                    style={{ width: "100%", padding: "5px" }}
                    required
                  />
                ) : (
                  factura.nit
                )}
              </td>
              <td style={{ padding: "10px" }}>
                {editando === factura.id ? (
                  <input
                    type="date"
                    name="fecha"
                    value={factura.fecha}
                    onChange={handleInputChange}
                    style={{ width: "100%", padding: "5px" }}
                    required
                  />
                ) : (
                  factura.fecha
                )}
              </td>
              <td style={{ padding: "10px" }}>
                {editando === factura.id ? (
                  <input
                    type="number"
                    name="total"
                    value={factura.total}
                    onChange={handleInputChange}
                    style={{ width: "100%", padding: "5px" }}
                    step="0.01"
                    required
                  />
                ) : (
                  `$${parseFloat(factura.total).toFixed(2)}`
                )}
              </td>
              <td style={{ padding: "10px" }}>
                {editando === factura.id ? (
                  <>
                    <button 
                      onClick={() => actualizarFactura(factura.id)}
                      style={{
                        marginRight: "5px",
                        padding: "5px 10px",
                        backgroundColor: "#4CAF50",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer"
                      }}
                    >
                      Guardar
                    </button>
                    <button 
                      onClick={cancelarEdicion}
                      style={{
                        padding: "5px 10px",
                        backgroundColor: "#f44336",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer"
                      }}
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => iniciarEdicion(factura.id)}
                      style={{
                        marginRight: "5px",
                        padding: "5px 10px",
                        backgroundColor: "#2196F3",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer"
                      }}
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => eliminarFactura(factura.id)}
                      style={{
                        padding: "5px 10px",
                        backgroundColor: "#f44336",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer"
                      }}
                    >
                      Eliminar
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Invoices;