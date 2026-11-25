/* eslint-disable react/prop-types, react-refresh/only-export-components */
import { createContext, useCallback, useContext, useState } from "react";
import { Alert, Snackbar } from "@mui/material";

const NotifierContext = createContext(() => {});

/** Proveedor de notificaciones tipo toast. Uso: const notify = useNotify(); notify("Guardado"); */
export const NotifierProvider = ({ children }) => {
  const [msg, setMsg] = useState(null);
  const notify = useCallback((texto, severity = "success") => setMsg({ texto, severity, key: Date.now() }), []);
  return (
    <NotifierContext.Provider value={notify}>
      {children}
      <Snackbar
        key={msg?.key}
        open={!!msg}
        autoHideDuration={4000}
        onClose={() => setMsg(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        {msg ? <Alert severity={msg.severity} variant="filled" onClose={() => setMsg(null)}>{msg.texto}</Alert> : undefined}
      </Snackbar>
    </NotifierContext.Provider>
  );
};

export const useNotify = () => useContext(NotifierContext);
