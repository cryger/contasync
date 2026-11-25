/* eslint-disable react/prop-types */
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";

const ConfirmDialog = ({ open, title = "¿Confirmar?", message, confirmLabel = "Confirmar", onCancel, onConfirm }) => (
  <Dialog open={open} onClose={onCancel}>
    <DialogTitle>{title}</DialogTitle>
    {message && (
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
    )}
    <DialogActions>
      <Button onClick={onCancel} color="inherit">Cancelar</Button>
      <Button onClick={onConfirm} color="error" variant="contained">{confirmLabel}</Button>
    </DialogActions>
  </Dialog>
);

export default ConfirmDialog;
