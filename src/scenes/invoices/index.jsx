import { useState, useEffect, useRef } from "react";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";

const Invoices = () => {
  // Estados para los datos
  const [recibos, setRecibos] = useState([]);
  const [ingresos, setIngresos] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [bancos, setBancos] = useState([]);
  const [cuentas, setCuentas] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [centrosCostos, setCentrosCostos] = useState([]);
  const [presupuestos, setPresupuestos] = useState([]);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isGeneratingExcel, setIsGeneratingExcel] = useState(false);
  
  const pdfRef = useRef();

  // Estados para los formularios
  const [nuevoIngreso, setNuevoIngreso] = useState({
    cliente_id: "",
    fecha: new Date().toISOString().split('T')[0],
    valor_recibido: "",
    banco_id: "",
    cuenta_id: "",
    numero_recibo: "",
    saldo_anterior: "",
    saldo_en_caja: "",
    total_ingresos: ""
  });

  const [nuevoGasto, setNuevoGasto] = useState({
    fecha: new Date().toISOString().split('T')[0],
    descripcion: "",
    monto: "",
    categoria: "",
    metodo_pago: "Efectivo",
    banco_id: "",
    cuenta_id: "",
    proveedor_id: "",
    centro_costo_id: "",
    presupuesto_id: ""
  });

  const [nuevoRecibo, setNuevoRecibo] = useState({
    ingreso_id: "",
    gasto_id: "",
    fecha: new Date().toISOString().split('T')[0],
    monto: ""
  });

  // Obtener todos los datos necesarios
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          recibosRes, 
          ingresosRes, 
          gastosRes,
          clientesRes,
          bancosRes,
          cuentasRes,
          proveedoresRes,
          centrosCostosRes,
          presupuestosRes
        ] = await Promise.all([
          axios.get("http://localhost:5000/api/recibos"),
          axios.get("http://localhost:5000/api/ingresos"),
          axios.get("http://localhost:5000/api/gastos"),
          axios.get("http://localhost:5000/api/clientes"),
          axios.get("http://localhost:5000/api/bancos"),
          axios.get("http://localhost:5000/api/cuentas"),
          axios.get("http://localhost:5000/api/proveedores"),
          axios.get("http://localhost:5000/api/centros-costos"),
          axios.get("http://localhost:5000/api/presupuestos")
        ]);

        setRecibos(recibosRes.data);
        setIngresos(ingresosRes.data);
        setGastos(gastosRes.data);
        setClientes(clientesRes.data);
        setBancos(bancosRes.data);
        setCuentas(cuentasRes.data);
        setProveedores(proveedoresRes.data);
        setCentrosCostos(centrosCostosRes.data);
        setPresupuestos(presupuestosRes.data);
      } catch (error) {
        console.error("Error al obtener datos:", error);
      }
    };
    fetchData();
  }, []);
// Función para formatear moneda (versión mejorada)
const formatCurrency = (value) => {
  if (value === null || value === undefined || value === '') return "$ 0";
  
  // Si el valor ya está formateado, lo devolvemos tal cual
  if (typeof value === 'string' && value.includes('$')) {
    return value;
  }
  
  // Convertimos a número
  const number = typeof value === 'number' ? value : 
    parseFloat(value.toString().replace(/[^\d.-]/g, ""));
  
  return isNaN(number) 
    ? "$ 0" 
    : `$ ${number.toLocaleString("es-CO", { 
        minimumFractionDigits: 0, 
        maximumFractionDigits: 0 
      })}`;
};

// Función para limpiar el formato de moneda y obtener el valor numérico
const cleanMoneyValue = (value) => {
  if (!value) return 0;
  
  // Si ya es un número, lo devolvemos directamente
  if (typeof value === 'number') return value;
  
  // Si es un string con formato de moneda, lo limpiamos
  const cleaned = value.toString()
    .replace(/\$\s?/g, '')  // Elimina el símbolo $
    .replace(/\./g, '')     // Elimina los puntos de mil
    .replace(',', '.');     // Reemplaza comas por puntos para decimales
  
  const number = parseFloat(cleaned);
  return isNaN(number) ? 0 : number;
};

// Función para manejar el cambio en campos monetarios (mejorada)
const handleMoneyChange = (fieldName) => (e) => {
  const rawValue = e.target.value;
  
  // Permitimos solo números, puntos y comas
  const filteredValue = rawValue
    .replace(/[^\d.,]/g, '')  // Solo permite dígitos, puntos y comas
    .replace(/(\..*)\./g, '$1') // Evita múltiples puntos decimales
    .replace(/(,.*),/g, '$1'); // Evita múltiples comas
  
  setNuevoIngreso(prev => ({
    ...prev,
    [fieldName]: filteredValue
  }));
};

// Función para formatear los campos monetarios cuando pierden el foco
const handleMoneyBlur = (fieldName) => (e) => {
  const value = e.target.value;
  const numericValue = cleanMoneyValue(value);
  
  setNuevoIngreso(prev => ({
    ...prev,
    [fieldName]: formatCurrency(numericValue)
  }));
  
  // Recalculamos los totales
  calcularTotalesIngreso();
};

  // Calcular totales para ingresos (versión mejorada)
  const calcularTotalesIngreso = () => {
    const valorRecibido = cleanMoneyValue(nuevoIngreso.valor_recibido);
    const saldoAnterior = cleanMoneyValue(nuevoIngreso.saldo_anterior);
    const saldoEnCaja = valorRecibido + saldoAnterior;
    
    setNuevoIngreso(prev => ({
      ...prev,
      saldo_en_caja: formatCurrency(saldoEnCaja),
      total_ingresos: formatCurrency(saldoEnCaja)
    }));
  };

  // Manejador de cambios para campos no monetarios
  const handleChange = (setState, state) => (e) => {
    const { name, value } = e.target;
    setState({ ...state, [name]: value });
  };

  // Crear nuevo ingreso
  const crearIngreso = async (e) => {
    e.preventDefault();
    try {
      const datos = {
        ...nuevoIngreso,
        valor_recibido: cleanMoneyValue(nuevoIngreso.valor_recibido),
        saldo_anterior: cleanMoneyValue(nuevoIngreso.saldo_anterior),
        saldo_en_caja: cleanMoneyValue(nuevoIngreso.saldo_en_caja),
        total_ingresos: cleanMoneyValue(nuevoIngreso.total_ingresos),
        cliente_id: nuevoIngreso.cliente_id || null,
        banco_id: nuevoIngreso.banco_id || null,
        cuenta_id: nuevoIngreso.cuenta_id || null
      };

      const { data } = await axios.post("http://localhost:5000/api/ingresos", datos);
      setIngresos([...ingresos, data]);
      setNuevoIngreso({
        cliente_id: "",
        fecha: new Date().toISOString().split('T')[0],
        valor_recibido: "",
        banco_id: "",
        cuenta_id: "",
        numero_recibo: "",
        saldo_anterior: "",
        saldo_en_caja: "",
        total_ingresos: ""
      });
    } catch (error) {
      console.error("Error al crear ingreso:", error);
      alert(error.response?.data?.message || "Error al crear ingreso");
    }
  };

  // Función para manejar el cambio en campos monetarios de gastos
  const handleGastoMoneyChange = (e) => {
    const { name, value } = e.target;
    setNuevoGasto(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Función para formatear los campos monetarios de gastos cuando pierden el foco
  const handleGastoMoneyBlur = (e) => {
    const { name, value } = e.target;
    const numericValue = cleanMoneyValue(value);
    
    setNuevoGasto(prev => ({
      ...prev,
      [name]: formatCurrency(numericValue)
    }));
  };

  // Función para manejar el cambio en campos monetarios de recibos
  const handleReciboMoneyChange = (e) => {
    const { name, value } = e.target;
    setNuevoRecibo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Función para formatear los campos monetarios de recibos cuando pierden el foco
  const handleReciboMoneyBlur = (e) => {
    const { name, value } = e.target;
    const numericValue = cleanMoneyValue(value);
    
    setNuevoRecibo(prev => ({
      ...prev,
      [name]: formatCurrency(numericValue)
    }));
  };

  // Crear nuevo gasto
  const crearGasto = async (e) => {
    e.preventDefault();
    try {
      const datos = {
        ...nuevoGasto,
        monto: cleanMoneyValue(nuevoGasto.monto),
        banco_id: nuevoGasto.banco_id || null,
        cuenta_id: nuevoGasto.cuenta_id || null,
        proveedor_id: nuevoGasto.proveedor_id || null,
        centro_costo_id: nuevoGasto.centro_costo_id || null,
        presupuesto_id: nuevoGasto.presupuesto_id || null
      };

      const { data } = await axios.post("http://localhost:5000/api/gastos", datos);
      setGastos([...gastos, data]);
      setNuevoGasto({
        fecha: new Date().toISOString().split('T')[0],
        descripcion: "",
        monto: "",
        categoria: "",
        metodo_pago: "Efectivo",
        banco_id: "",
        cuenta_id: "",
        proveedor_id: "",
        centro_costo_id: "",
        presupuesto_id: ""
      });
    } catch (error) {
      console.error("Error al crear gasto:", error);
      alert(error.response?.data?.message || "Error al crear gasto");
    }
  };

  // Crear nuevo recibo
  const crearRecibo = async (e) => {
    e.preventDefault();
    try {
      const datos = {
        ...nuevoRecibo,
        monto: cleanMoneyValue(nuevoRecibo.monto)
      };

      const { data } = await axios.post("http://localhost:5000/api/recibos", datos);
      setRecibos([...recibos, data]);
      setNuevoRecibo({
        ingreso_id: "",
        gasto_id: "",
        fecha: new Date().toISOString().split('T')[0],
        monto: ""
      });
    } catch (error) {
      console.error("Error al crear recibo:", error);
      alert(error.response?.data?.message || "Error al crear recibo");
    }
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

   const downloadPDF = async () => {
  setIsGeneratingPDF(true);

  try {
    // Crear un contenedor temporal para el PDF con un ancho mayor
    const pdfElement = document.createElement("div");
    pdfElement.style.width = "297mm"; // Usar tamaño A4 horizontal
    pdfElement.style.padding = "15px";
    pdfElement.style.background = "white";
    pdfElement.style.color = "black";
    pdfElement.style.fontFamily = "Arial, sans-serif";
    pdfElement.style.fontSize = "10px"; // Reducir tamaño de fuente para más espacio

    // Estilos mejorados para las tablas
    const tableStyle = `
      style="
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 15px;
        page-break-inside: avoid;
      "
    `;
    const thStyle = `
      style="
        padding: 6px;
        border: 1px solid #ddd;
        background-color: #f2f2f2;
        text-align: left;
        font-size: 9px;
        white-space: nowrap;
      "
    `;
    const tdStyle = `
      style="
        padding: 6px;
        border: 1px solid #ddd;
        font-size: 9px;
        word-break: break-word;
      "
    `;
    const tdRight = `
      style="
        padding: 6px;
        border: 1px solid #ddd;
        text-align: right;
        font-size: 9px;
      "
    `;

    // Función para crear una tabla de datos con paginación
    const createTableHTML = (title, headers, rows) => {
      return `
        <h2 style="border-bottom: 1px solid #ddd; padding-bottom: 5px; font-size: 12px; margin-top: 20px;">${title}</h2>
        <table ${tableStyle}>
          <thead>
            <tr>
              ${headers.map(header => `<th ${thStyle}>${header}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      `;
    };

    // Tabla de Ingresos
    const ingresosHeaders = ['N° Recibo', 'Fecha', 'Cliente', 'Valor Recibido', 'Saldo Anterior', 'Saldo en Caja', 'Total Ingresos', 'Banco', 'Cuenta'];
    const ingresosRows = ingresos.map(i => `
      <tr>
        <td ${tdStyle}>${i.numero_recibo || 'N/A'}</td>
        <td ${tdStyle}>${formatDate(i.fecha)}</td>
        <td ${tdStyle}>${clientes.find(c => c.id === i.cliente_id)?.nombre || 'Sin cliente'}</td>
        <td ${tdRight}>${formatCurrency(i.valor_recibido)}</td>
        <td ${tdRight}>${formatCurrency(i.saldo_anterior)}</td>
        <td ${tdRight}>${formatCurrency(i.saldo_en_caja)}</td>
        <td ${tdRight}>${formatCurrency(i.total_ingresos)}</td>
        <td ${tdStyle}>${bancos.find(b => b.id === i.banco_id)?.nombre || 'N/A'}</td>
        <td ${tdStyle}>${cuentas.find(c => c.id === i.cuenta_id)?.numero_cuenta || 'N/A'}</td>
      </tr>
    `).join('');

    // Tabla de Gastos
    const gastosHeaders = ['Fecha', 'Descripción', 'Categoría', 'Método Pago', 'Monto', 'Proveedor', 'Centro Costo', 'Presupuesto'];
    const gastosRows = gastos.map(g => `
      <tr>
        <td ${tdStyle}>${formatDate(g.fecha)}</td>
        <td ${tdStyle}>${g.descripcion}</td>
        <td ${tdStyle}>${g.categoria}</td>
        <td ${tdStyle}>${g.metodo_pago}</td>
        <td ${tdRight}>${formatCurrency(g.monto)}</td>
        <td ${tdStyle}>${proveedores.find(p => p.id === g.proveedor_id)?.nombre || 'N/A'}</td>
        <td ${tdStyle}>${centrosCostos.find(cc => cc.id === g.centro_costo_id)?.nombre || 'N/A'}</td>
        <td ${tdStyle}>${presupuestos.find(p => p.id === g.presupuesto_id)?.nombre || 'N/A'}</td>
      </tr>
    `).join('');

    // Tabla de Recibos
    const recibosHeaders = ['ID', 'Fecha', 'Ingreso', 'Monto Ingreso', 'Gasto', 'Monto Gasto', 'Monto Recibo'];
    const recibosRows = recibos.map(r => {
      const ingreso = ingresos.find(i => i.id === r.ingreso_id);
      const gasto = gastos.find(g => g.id === r.gasto_id);
      return `
        <tr>
          <td ${tdStyle}>${r.id}</td>
          <td ${tdStyle}>${formatDate(r.fecha)}</td>
          <td ${tdStyle}>${ingreso ? `Recibo #${ingreso.numero_recibo}` : `ID ${r.ingreso_id}`}</td>
          <td ${tdRight}>${ingreso ? formatCurrency(ingreso.valor_recibido) : 'N/A'}</td>
          <td ${tdStyle}>${gasto ? gasto.descripcion : `ID ${r.gasto_id}`}</td>
          <td ${tdRight}>${gasto ? formatCurrency(gasto.monto) : 'N/A'}</td>
          <td ${tdRight}>${formatCurrency(r.monto)}</td>
        </tr>
      `;
    }).join('');

    // Construir el contenido HTML completo con margen inferior adicional
    pdfElement.innerHTML = `
  <div style="margin-bottom: 50px;"> <!-- Aumentamos el margen inferior -->
    <h1 style="text-align: center; margin-bottom: 13px; font-size: 14px;">Reporte Financiero Completo</h1>
    ${createTableHTML("Ingresos", ingresosHeaders, ingresosRows)}
    ${createTableHTML("Gastos", gastosHeaders, gastosRows)}
    ${createTableHTML("Recibos", recibosHeaders, recibosRows)}
  </div>
`;

    document.body.appendChild(pdfElement);

    // Configuración para html2canvas
    const canvas = await html2canvas(pdfElement, {
      scale: 1,
      logging: false,
      useCORS: true,
      width: pdfElement.offsetWidth,
      height: pdfElement.scrollHeight,
      windowWidth: pdfElement.scrollWidth,
      windowHeight: pdfElement.scrollHeight
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("l", "mm", "a4"); // Orientación horizontal
    const imgWidth = 297; // Ancho de A4 en mm (horizontal)
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    document.body.removeChild(pdfElement);

    // Agregar paginación más abajo (ajustado a 15mm desde el borde inferior)
    const totalPages = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      // Posición ajustada: x = ancho-20mm, y = alto-15mm
      pdf.text(`Página ${i} de ${totalPages}`, imgWidth - 20, imgHeight - 15);
    }

    pdf.save("reporte_financiero_completo.pdf");

  } catch (error) {
    console.error("Error al generar PDF:", error);
    alert("Error al generar el PDF. Por favor intente nuevamente.");
  } finally {
    setIsGeneratingPDF(false);
  }
};

  // Función para exportar a Excel
  const downloadExcel = async () => {
    setIsGeneratingExcel(true);
    
    try {
      const wb = XLSX.utils.book_new();
      
      const ingresosData = ingresos.map(ingreso => ({
        "N° Recibo": ingreso.numero_recibo,
        "Fecha": formatDate(ingreso.fecha),
        "Cliente": clientes.find(c => c.id === ingreso.cliente_id)?.nombre || "Sin cliente",
        "Valor Recibido": cleanMoneyValue(ingreso.valor_recibido),
        "Saldo Anterior": cleanMoneyValue(ingreso.saldo_anterior),
        "Saldo en Caja": cleanMoneyValue(ingreso.saldo_en_caja),
        "Total Ingresos": cleanMoneyValue(ingreso.total_ingresos),
        "Banco": bancos.find(b => b.id === ingreso.banco_id)?.nombre || "No aplica",
        "Cuenta": cuentas.find(c => c.id === ingreso.cuenta_id)?.numero_cuenta || "No aplica"
      }));
      
      const ingresosWS = XLSX.utils.json_to_sheet(ingresosData);
      XLSX.utils.book_append_sheet(wb, ingresosWS, "Ingresos");
      
      const gastosData = gastos.map(gasto => ({
        "Fecha": formatDate(gasto.fecha),
        "Descripción": gasto.descripcion,
        "Categoría": gasto.categoria,
        "Monto": cleanMoneyValue(gasto.monto),
        "Método de Pago": gasto.metodo_pago,
        "Proveedor": proveedores.find(p => p.id === gasto.proveedor_id)?.nombre || "Sin proveedor",
        "Centro de Costo": centrosCostos.find(cc => cc.id === gasto.centro_costo_id)?.nombre || "No aplica",
        "Presupuesto": presupuestos.find(p => p.id === gasto.presupuesto_id)?.nombre || "No aplica"
      }));
      
      const gastosWS = XLSX.utils.json_to_sheet(gastosData);
      XLSX.utils.book_append_sheet(wb, gastosWS, "Gastos");
      
      const recibosData = recibos.map(recibo => {
        const ingreso = ingresos.find(i => i.id === recibo.ingreso_id);
        const gasto = gastos.find(g => g.id === recibo.gasto_id);
        
        return {
          "ID": recibo.id,
          "Fecha": formatDate(recibo.fecha),
          "Ingreso": ingreso ? `Recibo #${ingreso.numero_recibo}` : `ID ${recibo.ingreso_id}`,
          "Monto Ingreso": ingreso ? cleanMoneyValue(ingreso.valor_recibido) : 0,
          "Gasto": gasto ? gasto.descripcion : `ID ${recibo.gasto_id}`,
          "Monto Gasto": gasto ? cleanMoneyValue(gasto.monto) : 0,
          "Monto Recibo": cleanMoneyValue(recibo.monto)
        };
      });
      
      const recibosWS = XLSX.utils.json_to_sheet(recibosData);
      XLSX.utils.book_append_sheet(wb, recibosWS, "Recibos");
      
      XLSX.writeFile(wb, "reporte_financiero.xlsx");
      
    } catch (error) {
      console.error("Error al generar Excel:", error);
      alert("Error al generar el archivo Excel. Por favor intente nuevamente.");
    } finally {
      setIsGeneratingExcel(false);
    }
  };

  return (
    <div 
      ref={pdfRef}
      style={{ 
        padding: "20px", 
        color: "white",
        '@media print': {
          transform: 'scale(0.9)',
          transformOrigin: '0 0',
          overflow: 'hidden'
        }
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1 style={{ margin: 0 }}>Gestión de Recibos</h1>
        <div>
          <button 
            onClick={downloadPDF} 
            disabled={isGeneratingPDF}
            style={{
              marginRight: "10px",
              padding: "8px 16px",
              backgroundColor: isGeneratingPDF ? "#cccccc" : "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            {isGeneratingPDF ? "Generando PDF..." : "Exportar a PDF"}
          </button>
          <button 
            onClick={downloadExcel} 
            disabled={isGeneratingExcel}
            style={{
              padding: "8px 16px",
              backgroundColor: isGeneratingExcel ? "#cccccc" : "#2196F3",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            {isGeneratingExcel ? "Generando Excel..." : "Exportar a Excel"}
          </button>
        </div>
      </div>

      {/* Formulario de Ingresos */}
      <div style={{ marginBottom: "30px", border: "1px solid #444", padding: "15px", borderRadius: "5px" }}>
        <h2>Registrar Ingreso</h2>
        <form onSubmit={crearIngreso}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
            <div>
              <label>Cliente:</label>
              <select
                name="cliente_id"
                value={nuevoIngreso.cliente_id}
                onChange={handleChange(setNuevoIngreso, nuevoIngreso)}
                style={{ width: "100%" }}
              >
                <option value="">Seleccionar cliente</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label>Fecha:</label>
              <input
                type="date"
                name="fecha"
                value={nuevoIngreso.fecha}
                onChange={handleChange(setNuevoIngreso, nuevoIngreso)}
                style={{ width: "100%" }}
                required
              />
            </div>

            <div>
              <label>Número de Recibo:</label>
              <input
                type="text"
                name="numero_recibo"
                value={nuevoIngreso.numero_recibo}
                onChange={handleChange(setNuevoIngreso, nuevoIngreso)}
                style={{ width: "100%" }}
                required
              />
            </div>

            <div>
              <label>Valor Recibido:</label>
              <input
                name="valor_recibido"
                value={nuevoIngreso.valor_recibido}
                onChange={handleMoneyChange('valor_recibido')}
                onBlur={handleMoneyBlur('valor_recibido')}
                placeholder="$ 0"
                style={{ width: "100%" }}
                required
              />
            </div>

            <div>
              <label>Saldo Anterior:</label>
              <input
                name="saldo_anterior"
                value={nuevoIngreso.saldo_anterior}
                onChange={handleMoneyChange('saldo_anterior')}
                onBlur={handleMoneyBlur('saldo_anterior')}
                placeholder="$ 0"
                style={{ width: "100%" }}
                required
              />
            </div>

            <div>
              <label>Saldo en Caja:</label>
              <input
                name="saldo_en_caja"
                value={nuevoIngreso.saldo_en_caja}
                readOnly
                style={{ width: "100%", backgroundColor: "#f0f0f0" }}
              />
            </div>

            <div>
              <label>Total Ingresos:</label>
              <input
                name="total_ingresos"
                value={nuevoIngreso.total_ingresos}
                readOnly
                style={{ width: "100%", backgroundColor: "#f0f0f0" }}
              />
            </div>

            <div>
              <label>Banco:</label>
              <select
                name="banco_id"
                value={nuevoIngreso.banco_id}
                onChange={handleChange(setNuevoIngreso, nuevoIngreso)}
                style={{ width: "100%" }}
              >
                <option value="">Seleccionar banco</option>
                {bancos.map(b => (
                  <option key={b.id} value={b.id}>{b.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label>Cuenta:</label>
              <select
                name="cuenta_id"
                value={nuevoIngreso.cuenta_id}
                onChange={handleChange(setNuevoIngreso, nuevoIngreso)}
                style={{ width: "100%" }}
              >
                <option value="">Seleccionar cuenta</option>
                {cuentas.map(c => (
                  <option key={c.id} value={c.id}>{c.numero_cuenta} - {bancos.find(b => b.id === c.banco_id)?.nombre}</option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit" style={{ marginTop: "10px" }}>Registrar Ingreso</button>
        </form>
      </div>

      {/* Lista de Ingresos - Versión Modificada */}
<div style={{ marginBottom: "30px", border: "1px solid #444", padding: "15px", borderRadius: "5px" }}>
  <h2>Lista de Ingresos</h2>
  <div style={{ overflowX: "auto" }}>
    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
      <thead>
        <tr style={{ backgroundColor: "#2c2c2e", color: "#fff", textAlign: "left" }}>
          <th style={{ padding: "10px" }}>N° Recibo</th>
          <th style={{ padding: "10px" }}>Fecha</th>
          <th style={{ padding: "10px" }}>Cliente</th>
          <th style={{ padding: "10px", textAlign: "right" }}>Valor Recibido</th>
          <th style={{ padding: "10px", textAlign: "right" }}>Saldo Anterior</th>
          <th style={{ padding: "10px", textAlign: "right" }}>Saldo en Caja</th>
          <th style={{ padding: "10px", textAlign: "right" }}>Total Ingresos</th>
          <th style={{ padding: "10px" }}>Banco</th>
          <th style={{ padding: "10px" }}>Cuenta</th>
        </tr>
      </thead>
      <tbody>
        {ingresos.map((i) => (
          <tr key={i.id} style={{ borderBottom: "1px solid #ccc" }}>
            <td style={{ padding: "10px" }}>{i.numero_recibo}</td>
            <td style={{ padding: "10px" }}>{formatDate(i.fecha)}</td>
            <td style={{ padding: "10px" }}>
              {clientes.find(c => c.id === i.cliente_id)?.nombre || "Sin cliente"}
            </td>
            <td style={{ padding: "10px", textAlign: "right" }}>{formatCurrency(i.valor_recibido)}</td>
            <td style={{ padding: "10px", textAlign: "right" }}>{formatCurrency(i.saldo_anterior)}</td>
            <td style={{ padding: "10px", textAlign: "right" }}>{formatCurrency(i.saldo_en_caja)}</td>
            <td style={{ padding: "10px", textAlign: "right" }}>{formatCurrency(i.total_ingresos)}</td>
            <td style={{ padding: "10px" }}>
              {bancos.find(b => b.id === i.banco_id)?.nombre || "N/A"}
            </td>
            <td style={{ padding: "10px" }}>
              {cuentas.find(c => c.id === i.cuenta_id)?.numero_cuenta || "N/A"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>

      {/* Formulario de Gastos */}
      <div style={{ marginBottom: "30px", border: "1px solid #444", padding: "15px", borderRadius: "5px" }}>
        <h2>Registrar Gasto</h2>
        <form onSubmit={crearGasto}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
            <div>
              <label>Fecha:</label>
              <input
                type="date"
                name="fecha"
                value={nuevoGasto.fecha}
                onChange={handleChange(setNuevoGasto, nuevoGasto)}
                style={{ width: "100%" }}
                required
              />
            </div>

            <div>
              <label>Descripción:</label>
              <input
                name="descripcion"
                value={nuevoGasto.descripcion}
                onChange={handleChange(setNuevoGasto, nuevoGasto)}
                style={{ width: "100%" }}
                required
              />
            </div>

            <div>
              <label>Monto:</label>
              <input
                name="monto"
                value={nuevoGasto.monto}
                onChange={handleGastoMoneyChange}
                onBlur={handleGastoMoneyBlur}
                placeholder="$ 0"
                style={{ width: "100%" }}
                required
              />
            </div>

            <div>
              <label>Categoría:</label>
              <input
                name="categoria"
                value={nuevoGasto.categoria}
                onChange={handleChange(setNuevoGasto, nuevoGasto)}
                style={{ width: "100%" }}
                required
              />
            </div>

            <div>
              <label>Método de Pago:</label>
              <select
                name="metodo_pago"
                value={nuevoGasto.metodo_pago}
                onChange={handleChange(setNuevoGasto, nuevoGasto)}
                style={{ width: "100%" }}
                required
              >
                <option value="Efectivo">Efectivo</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>

            <div>
              <label>Proveedor:</label>
              <select
                name="proveedor_id"
                value={nuevoGasto.proveedor_id}
                onChange={handleChange(setNuevoGasto, nuevoGasto)}
                style={{ width: "100%" }}
              >
                <option value="">Seleccionar proveedor</option>
                {proveedores.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label>Banco:</label>
              <select
                name="banco_id"
                value={nuevoGasto.banco_id}
                onChange={handleChange(setNuevoGasto, nuevoGasto)}
                style={{ width: "100%" }}
              >
                <option value="">Seleccionar banco</option>
                {bancos.map(b => (
                  <option key={b.id} value={b.id}>{b.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label>Cuenta:</label>
              <select
                name="cuenta_id"
                value={nuevoGasto.cuenta_id}
                onChange={handleChange(setNuevoGasto, nuevoGasto)}
                style={{ width: "100%" }}
              >
                <option value="">Seleccionar cuenta</option>
                {cuentas.map(c => (
                  <option key={c.id} value={c.id}>{c.numero_cuenta} - {bancos.find(b => b.id === c.banco_id)?.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label>Centro de Costo:</label>
              <select
                name="centro_costo_id"
                value={nuevoGasto.centro_costo_id}
                onChange={handleChange(setNuevoGasto, nuevoGasto)}
                style={{ width: "100%" }}
              >
                <option value="">Seleccionar centro de costo</option>
                {centrosCostos.map(cc => (
                  <option key={cc.id} value={cc.id}>{cc.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label>Presupuesto:</label>
              <select
                name="presupuesto_id"
                value={nuevoGasto.presupuesto_id}
                onChange={handleChange(setNuevoGasto, nuevoGasto)}
                style={{ width: "100%" }}
              >
                <option value="">Seleccionar presupuesto</option>
                {presupuestos.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit" style={{ marginTop: "10px" }}>Registrar Gasto</button>
        </form>
      </div>

      {/* Lista de Gastos - Versión Modificada */}
<div style={{ marginBottom: "30px", border: "1px solid #444", padding: "15px", borderRadius: "5px" }}>
  <h2>Lista de Gastos</h2>
  <div style={{ overflowX: "auto" }}>
    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "900px" }}>
      <thead>
        <tr style={{ backgroundColor: "#2c2c2e", color: "#fff", textAlign: "left" }}>
          <th style={{ padding: "10px" }}>Fecha</th>
          <th style={{ padding: "10px" }}>Descripción</th>
          <th style={{ padding: "10px" }}>Categoría</th>
          <th style={{ padding: "10px" }}>Método Pago</th>
          <th style={{ padding: "10px" }}>Proveedor</th>
          <th style={{ padding: "10px", textAlign: "right" }}>Monto</th>
          <th style={{ padding: "10px" }}>Centro Costo</th>
          <th style={{ padding: "10px" }}>Presupuesto</th>
        </tr>
      </thead>
      <tbody>
        {gastos.map((g) => (
          <tr key={g.id} style={{ borderBottom: "1px solid #ccc" }}>
            <td style={{ padding: "10px" }}>{formatDate(g.fecha)}</td>
            <td style={{ padding: "10px" }}>{g.descripcion}</td>
            <td style={{ padding: "10px" }}>{g.categoria}</td>
            <td style={{ padding: "10px" }}>{g.metodo_pago}</td>
            <td style={{ padding: "10px" }}>
              {proveedores.find(p => p.id === g.proveedor_id)?.nombre || "N/A"}
            </td>
            <td style={{ padding: "10px", textAlign: "right" }}>{formatCurrency(g.monto)}</td>
            <td style={{ padding: "10px" }}>
              {centrosCostos.find(cc => cc.id === g.centro_costo_id)?.nombre || "N/A"}
            </td>
            <td style={{ padding: "10px" }}>
              {presupuestos.find(p => p.id === g.presupuesto_id)?.nombre || "N/A"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>

      {/* Formulario de Recibos */}
      <div style={{ marginBottom: "30px", border: "1px solid #444", padding: "15px", borderRadius: "5px" }}>
        <h2>Crear Recibo</h2>
        <form onSubmit={crearRecibo}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
            <div>
              <label>Ingreso:</label>
              <select
                name="ingreso_id"
                value={nuevoRecibo.ingreso_id}
                onChange={handleChange(setNuevoRecibo, nuevoRecibo)}
                style={{ width: "100%" }}
                required
              >
                <option value="">Seleccionar ingreso</option>
                {ingresos.map(i => (
                  <option key={i.id} value={i.id}>
                    Recibo #{i.numero_recibo} - {formatCurrency(i.valor_recibido)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Gasto:</label>
              <select
                name="gasto_id"
                value={nuevoRecibo.gasto_id}
                onChange={handleChange(setNuevoRecibo, nuevoRecibo)}
                style={{ width: "100%" }}
                required
              >
                <option value="">Seleccionar gasto</option>
                {gastos.map(g => (
                  <option key={g.id} value={g.id}>
                    {g.descripcion} - {formatCurrency(g.monto)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Fecha:</label>
              <input
                type="date"
                name="fecha"
                value={nuevoRecibo.fecha}
                onChange={handleChange(setNuevoRecibo, nuevoRecibo)}
                style={{ width: "100%" }}
                required
              />
            </div>

            <div>
              <label>Monto:</label>
              <input
                name="monto"
                value={nuevoRecibo.monto}
                onChange={handleReciboMoneyChange}
                onBlur={handleReciboMoneyBlur}
                placeholder="$ 0"
                style={{ width: "100%" }}
                required
              />
            </div>
          </div>
          <button type="submit" style={{ marginTop: "10px" }}>Crear Recibo</button>
        </form>
      </div>

      {/* Tabla de Recibos */}
      <div>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Lista de Recibos</h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
            <thead>
              <tr style={{ backgroundColor: "#2c2c2e", color: "#fff", textAlign: "left" }}>
                <th style={{ padding: "10px" }}>ID</th>
                <th style={{ padding: "10px" }}>Fecha</th>
                <th style={{ padding: "10px" }}>Ingreso</th>
                <th style={{ padding: "10px" }}>Gasto</th>
                <th style={{ padding: "10px", textAlign: "right" }}>Monto</th>
              </tr>
            </thead>
            <tbody>
              {recibos.map((r) => {
                const ingreso = ingresos.find(i => i.id === r.ingreso_id);
                const gasto = gastos.find(g => g.id === r.gasto_id);
                
                return (
                  <tr key={r.id} style={{ borderBottom: "1px solid #ccc" }}>
                    <td style={{ padding: "10px" }}>{r.id}</td>
                    <td style={{ padding: "10px" }}>{formatDate(r.fecha)}</td>
                    <td style={{ padding: "10px" }}>
                      {ingreso ? `Recibo #${ingreso.numero_recibo} - ${formatCurrency(ingreso.valor_recibido)}` : `Ingreso ${r.ingreso_id}`}
                    </td>
                    <td style={{ padding: "10px" }}>
                      {gasto ? `${gasto.descripcion} - ${formatCurrency(gasto.monto)}` : `Gasto ${r.gasto_id}`}
                    </td>
                    <td style={{ padding: "10px", textAlign: "right" }}>{formatCurrency(r.monto)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Invoices;