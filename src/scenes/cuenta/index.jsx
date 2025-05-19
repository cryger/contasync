import { useState, useEffect } from "react";
import axios from "axios";

const Cuenta = () => {
  const [cuentas, setCuentas] = useState([]);
  const [bancos, setBancos] = useState([]);
  const [nuevaCuenta, setNuevaCuenta] = useState({
    numero_cuenta: "",
    tipo_cuenta: "Ahorro",
    banco_id: "",
    saldo_actual: ""
  });
  const [editandoId, setEditandoId] = useState(null);
  const [filtroBancoId, setFiltroBancoId] = useState("");
  const [saldoDisplay, setSaldoDisplay] = useState("");

  // Función para formatear con puntos de miles
  const formatNumberWithDots = (value) => {
    if (!value) return "";
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Función para parsear (quitar puntos)
  const parseNumber = (value) => {
    return value.replace(/\./g, "");
  };

  useEffect(() => {
    obtenerDatos();
  }, []);

  const obtenerDatos = async () => {
    try {
      const [cuentasRes, bancosRes] = await Promise.all([
        axios.get("http://localhost:5000/api/cuentas"),
        axios.get("http://localhost:5000/api/bancos")
      ]);

      setCuentas(cuentasRes.data);
      setBancos(bancosRes.data);
    } catch (error) {
      console.error("Error al obtener datos:", error);
      alert("Error al cargar datos");
    }
  };

  const handleSaldoChange = (e) => {
    let value = e.target.value;
    
    // Permitir solo números y puntos
    value = value.replace(/[^\d\.]/g, '');
    
    // Eliminar puntos existentes para evitar conflictos
    const parsedValue = parseNumber(value);
    
    // Formatear con puntos de miles
    const formattedValue = formatNumberWithDots(parsedValue);
    
    // Actualizar estados
    setSaldoDisplay(formattedValue ? `$ ${formattedValue}` : "");
    setNuevaCuenta({
      ...nuevaCuenta,
      saldo_actual: parsedValue
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name !== "saldo_actual") {
      setNuevaCuenta({ ...nuevaCuenta, [name]: value });
    }
  };

  const limpiarFormulario = () => {
    setNuevaCuenta({
      numero_cuenta: "",
      tipo_cuenta: "Ahorro",
      banco_id: "",
      saldo_actual: ""
    });
    setSaldoDisplay("");
    setEditandoId(null);
  };

  const crearOActualizarCuenta = async (e) => {
    e.preventDefault();

    try {
      const datos = {
        numero_cuenta: nuevaCuenta.numero_cuenta,
        tipo_cuenta: nuevaCuenta.tipo_cuenta,
        banco_id: parseInt(nuevaCuenta.banco_id, 10),
        saldo_actual: parseInt(nuevaCuenta.saldo_actual, 10) || 0
      };

      if (editandoId) {
        await axios.put(`http://localhost:5000/api/cuentas/${editandoId}`, datos);
      } else {
        await axios.post("http://localhost:5000/api/cuentas", datos);
      }

      obtenerDatos();
      limpiarFormulario();
    } catch (error) {
      console.error("Error al guardar cuenta:", error);
      alert("Error al guardar cuenta");
    }
  };

  const editarCuenta = (cuenta) => {
    const saldoFormatted = formatNumberWithDots(cuenta.saldo_actual.toString());
    setNuevaCuenta({
      numero_cuenta: cuenta.numero_cuenta,
      tipo_cuenta: cuenta.tipo_cuenta,
      banco_id: cuenta.banco_id.toString(),
      saldo_actual: cuenta.saldo_actual.toString()
    });
    setSaldoDisplay(`$ ${saldoFormatted}`);
    setEditandoId(cuenta.id);
    setFiltroBancoId(cuenta.banco_id.toString());
  };

  const eliminarCuenta = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar esta cuenta?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/cuentas/${id}`);
      setCuentas(cuentas.filter((c) => c.id !== id));
    } catch (error) {
      console.error("Error al eliminar cuenta:", error);
      alert("Error al eliminar cuenta");
    }
  };

  // Función para formatear moneda para visualización en tabla
  const formatCurrency = (value) => {
    if (!value) return "";
    return `$ ${formatNumberWithDots(value.toString())}`;
  };

  return (
    <div style={{ padding: "20px", color: "white" }}>
      <h2>{editandoId ? "Editar Cuenta Bancaria" : "Registrar Nueva Cuenta Bancaria"}</h2>

      <form onSubmit={crearOActualizarCuenta} style={{ marginBottom: "20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
          <div>
            <label>Número de Cuenta:</label>
            <input
              name="numero_cuenta"
              type="text"
              value={nuevaCuenta.numero_cuenta}
              onChange={handleChange}
              required
              style={{ width: "100%" }}
            />
          </div>

          <div>
            <label>Tipo de Cuenta:</label>
            <select
              name="tipo_cuenta"
              value={nuevaCuenta.tipo_cuenta}
              onChange={handleChange}
              required
              style={{ width: "100%" }}
            >
              <option value="Ahorro">Ahorro</option>
              <option value="Corriente">Corriente</option>
            </select>
          </div>

          <div>
            <label>Banco:</label>
            <select
              name="banco_id"
              value={nuevaCuenta.banco_id}
              onChange={handleChange}
              required
              style={{ width: "100%" }}
            >
              <option value="">Seleccione...</option>
              {bancos.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Saldo Actual:</label>
            <input
              name="saldo_actual"
              type="text"
              value={saldoDisplay}
              onChange={handleSaldoChange}
              required
              style={{ width: "100%" }}
              placeholder="$ 1.000.000"
            />
          </div>
        </div>

        <button type="submit" style={{ marginTop: "10px" }}>
          {editandoId ? "Actualizar Cuenta" : "Agregar Cuenta"}
        </button>
        {editandoId && (
          <button type="button" onClick={limpiarFormulario} style={{ marginLeft: "10px" }}>
            Cancelar
          </button>
        )}
      </form>

      <div style={{ marginBottom: "20px" }}>
        <label>Filtrar por Banco: </label>
        <select
          value={filtroBancoId}
          onChange={(e) => setFiltroBancoId(e.target.value)}
        >
          <option value="">Todos los bancos</option>
          {bancos.map((b) => (
            <option key={b.id} value={b.id}>
              {b.nombre}
            </option>
          ))}
        </select>
      </div>

      <h2>Lista de Cuentas Bancarias</h2>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#2c2c2e" }}>
              <th>ID</th>
              <th>Número de Cuenta</th>
              <th>Tipo</th>
              <th>Banco</th>
              <th>Saldo Actual</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cuentas
              .filter(c => !filtroBancoId || c.banco_id.toString() === filtroBancoId)
              .map((c) => (
                <tr key={c.id} style={{ borderBottom: "1px solid #444" }}>
                  <td>{c.id}</td>
                  <td>{c.numero_cuenta}</td>
                  <td>{c.tipo_cuenta}</td>
                  <td>{bancos.find(b => b.id === c.banco_id)?.nombre || c.banco_id}</td>
                  <td>{formatCurrency(c.saldo_actual)}</td>
                  <td>
                    <button onClick={() => editarCuenta(c)} style={{ marginRight: "5px" }}>
                      Editar
                    </button>
                    <button onClick={() => eliminarCuenta(c.id)}>
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

export default Cuenta;