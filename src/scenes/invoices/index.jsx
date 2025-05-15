import { useState, useEffect } from "react";
import axios from "axios";

const Invoices = () => {
  const [recibos, setRecibos] = useState([]);
  const [ingresos, setIngresos] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [nuevoIngreso, setNuevoIngreso] = useState({
    valor_recibido: "",
    saldo_anterior: "",
    saldo_en_caja: "",
    total_ingresos: ""
  });
  const [nuevoGasto, setNuevoGasto] = useState({
    descripcion: "",
    monto: "",
    categoria: "",
    metodo_pago: "Efectivo"
  });
  const [nuevoRecibo, setNuevoRecibo] = useState({
    ingreso_id: "",
    gasto_id: "",
    fecha: "",
    monto: ""
  });
  const [editando, setEditando] = useState(null);

  useEffect(() => {
    obtenerRecibos();
    obtenerIngresos();
    obtenerGastos();
  }, []);

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

  const obtenerRecibos = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/recibos");
      setRecibos(data);
    } catch (error) {
      console.error("Error al obtener recibos:", error);
    }
  };

  const obtenerIngresos = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/ingresos");
      setIngresos(data);
    } catch (error) {
      console.error("Error al obtener ingresos:", error);
    }
  };

  const obtenerGastos = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/gastos");
      setGastos(data);
    } catch (error) {
      console.error("Error al obtener gastos:", error);
    }
  };

  const handleChangeIngreso = (e) => {
    const { name, value } = e.target;
    setNuevoIngreso({ ...nuevoIngreso, [name]: value });
  };

  const handleChangeGasto = (e) => {
    const { name, value } = e.target;
    setNuevoGasto({ ...nuevoGasto, [name]: value });
  };

  const handleChangeRecibo = (e) => {
    const { name, value } = e.target;
    if (editando) {
      setRecibos((prev) =>
        prev.map((r) => (r.id === editando ? { ...r, [name]: value } : r))
      );
    } else {
      setNuevoRecibo({ ...nuevoRecibo, [name]: value });
    }
  };

  const crearIngreso = async (e) => {
    e.preventDefault();
    try {
      const parsedIngreso = Object.fromEntries(
        Object.entries(nuevoIngreso).map(([k, v]) => [k, parseFloat(v.toString().replace(/[^\d]/g, ""))])
      );
      const { data } = await axios.post("http://localhost:5000/api/ingresos", parsedIngreso);
      setIngresos([...ingresos, data]);
      setNuevoIngreso({ valor_recibido: "", saldo_anterior: "", saldo_en_caja: "", total_ingresos: "" });
    } catch (error) {
      alert("Error al crear ingreso");
    }
  };

  const crearGasto = async (e) => {
    e.preventDefault();
    try {
      const parsedGasto = {
        ...nuevoGasto,
        monto: parseFloat(nuevoGasto.monto.toString().replace(/[^\d]/g, ""))
      };
      const { data } = await axios.post("http://localhost:5000/api/gastos", parsedGasto);
      setGastos([...gastos, data]);
      setNuevoGasto({ descripcion: "", monto: "", categoria: "", metodo_pago: "Efectivo" });
    } catch (error) {
      alert("Error al crear gasto");
    }
  };

  const crearRecibo = async (e) => {
    e.preventDefault();
    try {
      const parsedRecibo = {
        ...nuevoRecibo,
        monto: parseFloat(nuevoRecibo.monto.toString().replace(/[^\d]/g, ""))
      };
      const { data } = await axios.post("http://localhost:5000/api/recibos", parsedRecibo);
      setRecibos([...recibos, data]);
      setNuevoRecibo({ ingreso_id: "", gasto_id: "", fecha: "", monto: "" });
    } catch (error) {
      alert("Error al crear recibo");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Registrar Ingreso</h2>
      <form onSubmit={crearIngreso}>
        {Object.keys(nuevoIngreso).map((key) => (
          <input
            key={key}
            name={key}
            placeholder={key.replace("_", " ")}
            value={formatCurrency(nuevoIngreso[key])}
            onChange={handleChangeIngreso}
            required
          />
        ))}
        <button type="submit">Agregar Ingreso</button>
      </form>

      <h2>Registrar Gasto</h2>
      <form onSubmit={crearGasto}>
        <input name="descripcion" placeholder="Descripción" value={nuevoGasto.descripcion} onChange={handleChangeGasto} required />
        <input name="monto" placeholder="Monto" value={formatCurrency(nuevoGasto.monto)} onChange={handleChangeGasto} required />
        <input name="categoria" placeholder="Categoría" value={nuevoGasto.categoria} onChange={handleChangeGasto} required />
        <select name="metodo_pago" value={nuevoGasto.metodo_pago} onChange={handleChangeGasto}>
          <option value="Efectivo">Efectivo</option>
          <option value="Transferencia">Transferencia</option>
          <option value="Tarjeta">Tarjeta</option>
          <option value="Cheque">Cheque</option>
        </select>
        <button type="submit">Agregar Gasto</button>
      </form>

      <h2>Crear Recibo</h2>
      <form onSubmit={crearRecibo}>
        <select name="ingreso_id" value={nuevoRecibo.ingreso_id} onChange={handleChangeRecibo} required>
          <option value="">Seleccionar ingreso</option>
          {ingresos.map((i) => (
            <option key={i.id} value={i.id}>Ingreso #{i.id} - {formatCurrency(i.valor_recibido)}</option>
          ))}
        </select>
        <select name="gasto_id" value={nuevoRecibo.gasto_id} onChange={handleChangeRecibo} required>
          <option value="">Seleccionar gasto</option>
          {gastos.map((g) => (
            <option key={g.id} value={g.id}>Gasto #{g.id} - {g.descripcion}</option>
          ))}
        </select>
        <input type="date" name="fecha" value={nuevoRecibo.fecha} onChange={handleChangeRecibo} required />
        <input name="monto" value={formatCurrency(nuevoRecibo.monto)} onChange={handleChangeRecibo} placeholder="Monto del recibo" required />
        <button type="submit">Crear Recibo</button>
      </form>

      <h2>Lista de Recibos</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Ingreso</th>
            <th>Gasto</th>
            <th>Fecha</th>
            <th>Monto</th>
          </tr>
        </thead>
        <tbody>
          {recibos.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.ingreso_id}</td>
              <td>{r.gasto_id}</td>
              <td>{r.fecha}</td>
              <td>{formatCurrency(r.monto)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Invoices;
