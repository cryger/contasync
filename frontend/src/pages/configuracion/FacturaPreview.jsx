/* eslint-disable react/prop-types */
import { Box, Typography } from "@mui/material";
import { aclarar, contraste, mezclar } from "../../utils/color";

/** Miniatura en vivo de cómo se verá el PDF de la factura con la marca elegida. */
const FacturaPreview = ({ marca, razonSocial }) => {
  const { color_base: base, color_acento: acento } = marca;
  const tBase = contraste(base);
  const tAcento = contraste(acento);
  const suave = aclarar(acento, 0.9);
  const fila = aclarar(acento, 0.95);
  const filas = [
    ["Producto o servicio principal", "$ 321.300"],
    ["Servicio adicional", "$ 142.800"],
    ["Producto exento", "$ 65.000"],
  ];

  return (
    <Box bgcolor="#fff" color="#222" borderRadius={1.5} overflow="hidden" boxShadow="0 8px 30px rgba(0,0,0,.25)"
      sx={{ aspectRatio: "8.5 / 11", display: "flex", flexDirection: "column", fontSize: 10 }}>
      {/* Banda */}
      <Box bgcolor={base} color={tBase} px={2} py={1.5} display="flex" justifyContent="space-between" alignItems="center">
        <Box display="flex" alignItems="center" gap={1} minWidth={0}>
          {marca.logo && (
            <Box bgcolor="#fff" borderRadius={1} p={0.4} display="flex">
              <img src={marca.logo} alt="" style={{ width: 28, height: 28, objectFit: "contain" }} />
            </Box>
          )}
          <Box minWidth={0}>
            <Typography fontWeight="bold" fontSize={13} noWrap>{razonSocial || marca.nombre_comercial}</Typography>
            <Typography fontSize={8} sx={{ color: mezclar(base, tBase, 0.75) }}>NIT 900.000.000-0</Typography>
          </Box>
        </Box>
        <Box textAlign="right">
          <Typography fontSize={7} fontWeight="bold" color={acento}>FACTURA DE VENTA</Typography>
          <Typography fontSize={15} fontWeight="bold" lineHeight={1.1}>FV-0001</Typography>
        </Box>
      </Box>
      <Box height={4} bgcolor={acento} />

      <Box p={1.5} flex={1} display="flex" flexDirection="column" gap={1}>
        <Box display="flex" gap={1}>
          {["Facturado a", "Detalles del pago"].map((t) => (
            <Box key={t} flex={1} bgcolor={suave} borderLeft={`3px solid ${acento}`} borderRadius={0.5} px={1} py={0.75}>
              <Typography fontSize={7} fontWeight="bold" sx={{ color: contraste(acento) === "#ffffff" ? acento : "#444" }}>
                {t.toUpperCase()}
              </Typography>
              <Box height={5} width="70%" bgcolor="#333" borderRadius={1} mt={0.5} />
              <Box height={4} width="50%" bgcolor="#aaa" borderRadius={1} mt={0.5} />
            </Box>
          ))}
        </Box>

        <Box>
          <Box bgcolor={base} color={tBase} display="flex" justifyContent="space-between" px={1} py={0.5} fontSize={8} fontWeight="bold">
            <span>Descripción</span><span>Total</span>
          </Box>
          {filas.map(([d, t], i) => (
            <Box key={d} display="flex" justifyContent="space-between" px={1} py={0.6} fontSize={8.5}
              bgcolor={i % 2 ? fila : "#fff"}>
              <span>{d}</span><b>{t}</b>
            </Box>
          ))}
        </Box>

        <Box ml="auto" width="55%" mt={0.5}>
          {[["Subtotal", "$ 485.000"], ["IVA", "$ 74.100"]].map(([l, v]) => (
            <Box key={l} display="flex" justifyContent="space-between" fontSize={8.5} py={0.3} borderBottom="1px solid #eee">
              <span style={{ color: "#666" }}>{l}</span><span>{v}</span>
            </Box>
          ))}
          <Box bgcolor={acento} color={tAcento} borderRadius={1} px={1} py={0.75} mt={0.75} display="flex" justifyContent="space-between">
            <b style={{ fontSize: 8 }}>TOTAL A PAGAR</b><b style={{ fontSize: 12 }}>$ 529.100</b>
          </Box>
        </Box>
      </Box>
      <Box height={6} bgcolor={acento} />
    </Box>
  );
};

export default FacturaPreview;
