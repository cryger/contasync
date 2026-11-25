import { useCallback, useEffect, useState } from "react";
import { mensajeError } from "../api/client";

/**
 * Carga datos con estado de cargando/error y función para recargar.
 * const { data, cargando, error, recargar } = useCarga(() => api.listar(filtros), [filtros]);
 */
export default function useCarga(fn, deps = [], inicial = null) {
  const [data, setData] = useState(inicial);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const recargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      setData(await fn());
    } catch (err) {
      setError(mensajeError(err));
    } finally {
      setCargando(false);
    }
  }, deps);

  useEffect(() => {
    recargar();
  }, [recargar]);

  return { data, setData, cargando, error, recargar };
}
