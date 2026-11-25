/* eslint-disable react/prop-types, react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "../api";
import { guardarToken, leerToken } from "../api/client";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [aviso, setAviso] = useState(null); // mensaje para mostrar en el login (p. ej. sesión vencida)

  // Al abrir la app: si hay token guardado, se valida con el servidor
  useEffect(() => {
    if (!leerToken()) return setCargando(false);
    authApi
      .yo()
      .then(setUsuario)
      .catch(() => guardarToken(null))
      .finally(() => setCargando(false));
  }, []);

  const entrar = useCallback(({ token, usuario: u }) => {
    guardarToken(token);
    setAviso(null);
    setUsuario(u);
  }, []);

  const login = useCallback(async (email, password) => entrar(await authApi.login({ email, password })), [entrar]);
  const configuracionInicial = useCallback(async (datos) => entrar(await authApi.configuracionInicial(datos)), [entrar]);

  const logout = useCallback((mensaje = null) => {
    guardarToken(null);
    setUsuario(null);
    setAviso(mensaje);
  }, []);

  // El cliente HTTP avisa cuando el servidor responde 401
  useEffect(() => {
    const onExpirada = (e) => logout(e.detail || "Tu sesión expiró, ingresa de nuevo");
    window.addEventListener("contasync:sesion-expirada", onExpirada);
    return () => window.removeEventListener("contasync:sesion-expirada", onExpirada);
  }, [logout]);

  const valor = useMemo(
    () => ({ usuario, cargando, aviso, esAdmin: usuario?.rol === "admin", login, logout, configuracionInicial }),
    [usuario, cargando, aviso, login, logout, configuracionInicial]
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
