/* eslint-disable react/prop-types */
import { useState } from "react";
import { Alert, Box, Button, IconButton, Tooltip } from "@mui/material";
import { AddOutlined, DeleteOutline, EditOutlined } from "@mui/icons-material";
import Header from "./Header";
import DataTable from "./DataTable";
import FormDialog from "./FormDialog";
import ConfirmDialog from "./ConfirmDialog";
import { useNotify } from "./Notifier";
import useCarga from "../hooks/useCarga";
import { mensajeError } from "../api/client";

/**
 * Página de listado + crear/editar/eliminar para recursos simples.
 * Props: title, subtitle, singular, api, columns, campos, nuevoInicial, aFormulario(row), extraHeader,
 *        accionesExtra(row) → botones adicionales por fila, recargarKey → cambia para forzar recarga
 */
const CrudPage = ({ title, subtitle, singular, api, columns, campos, nuevoInicial = {}, aFormulario = (r) => r, extraHeader, onCambio, accionesExtra, recargarKey }) => {
  const notify = useNotify();
  const { data: filas, cargando, error, recargar } = useCarga(() => api.listar(), [recargarKey], []);
  const [editando, setEditando] = useState(null); // null | {} nuevo | fila
  const [borrando, setBorrando] = useState(null);

  const guardar = async (valores) => {
    try {
      if (editando?.id) await api.actualizar(editando.id, valores);
      else await api.crear(valores);
      notify(`${singular} guardado`);
      setEditando(null);
      await recargar();
      onCambio?.();
    } catch (err) {
      notify(mensajeError(err), "error");
    }
  };

  const eliminar = async () => {
    try {
      await api.eliminar(borrando.id);
      notify(`${singular} eliminado`);
      setBorrando(null);
      await recargar();
      onCambio?.();
    } catch (err) {
      setBorrando(null);
      notify(mensajeError(err), "error");
    }
  };

  const columnas = [
    ...columns,
    {
      field: "_acciones",
      headerName: "",
      width: accionesExtra ? 140 : 100,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => (
        <Box>
          {accionesExtra?.(row)}
          <Tooltip title="Editar"><IconButton size="small" onClick={() => setEditando(row)}><EditOutlined fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Eliminar"><IconButton size="small" onClick={() => setBorrando(row)}><DeleteOutline fontSize="small" /></IconButton></Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Header title={title} subtitle={subtitle}>
        {extraHeader}
        <Button variant="contained" color="secondary" startIcon={<AddOutlined />} onClick={() => setEditando({})}>
          Nuevo
        </Button>
      </Header>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <DataTable rows={filas} columns={columnas} loading={cargando} onRowDoubleClick={({ row }) => setEditando(row)} />

      <FormDialog
        open={!!editando}
        title={editando?.id ? `Editar ${singular.toLowerCase()}` : `Nuevo ${singular.toLowerCase()}`}
        campos={campos}
        inicial={editando?.id ? aFormulario(editando) : nuevoInicial}
        onClose={() => setEditando(null)}
        onSubmit={guardar}
      />
      <ConfirmDialog
        open={!!borrando}
        title={`Eliminar ${singular.toLowerCase()}`}
        message="Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        onCancel={() => setBorrando(null)}
        onConfirm={eliminar}
      />
    </Box>
  );
};

export default CrudPage;
