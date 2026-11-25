import { Chip } from "@mui/material";
import CrudPage from "../../components/CrudPage";
import { usuariosApi } from "../../api";
import { useAuth } from "../../auth/AuthContext";
import { formatoFecha } from "../../utils/format";

const ROLES = [
  { value: "admin", label: "Administrador — acceso total" },
  { value: "cajero", label: "Cajero — solo facturar, clientes y productos" },
];

const columns = [
  { field: "nombre", headerName: "Nombre", flex: 1, minWidth: 160 },
  { field: "email", headerName: "Correo", flex: 1, minWidth: 200 },
  {
    field: "rol", headerName: "Rol", width: 140,
    renderCell: ({ value }) => (
      <Chip size="small" label={value === "admin" ? "Administrador" : "Cajero"} color={value === "admin" ? "secondary" : "default"} />
    ),
  },
  {
    field: "activo", headerName: "Estado", width: 110,
    renderCell: ({ value }) => <Chip size="small" variant="outlined" label={value ? "Activo" : "Inactivo"} color={value ? "success" : "default"} />,
  },
  { field: "ultimo_acceso", headerName: "Último acceso", width: 140, valueFormatter: ({ value }) => (value ? formatoFecha(value) : "Nunca") },
];

const camposBase = [
  { name: "nombre", label: "Nombre", required: true, xs: 6 },
  { name: "email", label: "Correo (para iniciar sesión)", type: "email", required: true, xs: 6 },
  { name: "rol", label: "Rol", type: "select", options: ROLES, required: true, xs: 8 },
  { name: "activo", label: "Estado", type: "select", options: [{ value: true, label: "Activo" }, { value: false, label: "Inactivo" }], xs: 4 },
];

export default function UsuariosPage() {
  const { usuario } = useAuth();
  return (
    <CrudPage
      title="Usuarios"
      subtitle="Quién puede entrar al sistema y qué puede hacer"
      singular="Usuario"
      api={usuariosApi}
      columns={columns.map((c) =>
        c.field === "nombre" ? { ...c, valueFormatter: ({ value, id }) => (id === usuario.id ? `${value} (tú)` : value) } : c
      )}
      campos={(editando) => [
        ...camposBase,
        editando
          ? { name: "password", label: "Nueva contraseña (déjala vacía para no cambiarla)", type: "password", help: "Mínimo 8 caracteres" }
          : { name: "password", label: "Contraseña inicial", type: "password", required: true, help: "Mínimo 8 caracteres. El usuario puede cambiarla después." },
      ]}
      nuevoInicial={{ rol: "cajero", activo: true }}
      aFormulario={({ nombre, email, rol, activo }) => ({ nombre, email, rol, activo, password: "" })}
      mensajeEliminar="Si el usuario ya emitió facturas, se desactiva en lugar de borrarse para conservar el historial."
    />
  );
}
