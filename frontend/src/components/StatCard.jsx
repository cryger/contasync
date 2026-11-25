/* eslint-disable react/prop-types */
import { Box, Skeleton, Typography } from "@mui/material";
import { useColors, fuenteMono } from "../theme";
import { mezclar } from "../utils/color";

/**
 * Indicador (KPI): etiqueta, cifra grande con números tabulares, detalle e ícono en un recuadro de color.
 * tone: "green" (acento) | "red" | "blue" (secundario). cargando → esqueleto con el mismo tamaño (sin saltos).
 */
const StatCard = ({ title, value, subtitle, icon, tone = "green", cargando = false }) => {
  const colors = useColors();
  const color = tone === "red" ? colors.peligro : tone === "blue" ? colors.secundarioTexto : colors.acentoTexto;

  return (
    <Box bgcolor={colors.superficie} border={`1px solid ${colors.borde}`} borderRadius="12px" p={2.5} height="100%"
      display="flex" flexDirection="column" gap={1.5} minHeight={128} aria-busy={cargando}>
      <Box display="flex" alignItems="center" justifyContent="space-between" gap={1}>
        <Typography variant="overline" color={colors.textoSuave} lineHeight={1.3}>{title}</Typography>
        <Box aria-hidden width={36} height={36} borderRadius="10px" display="flex" alignItems="center" justifyContent="center"
          flexShrink={0} bgcolor={mezclar(colors.superficie, color, 0.14)} color={color} sx={{ "& svg": { fontSize: 20 } }}>
          {icon}
        </Box>
      </Box>
      {cargando ? (
        <Skeleton variant="text" width="70%" height={40} />
      ) : (
        <Typography fontFamily={fuenteMono} fontWeight={500} fontSize={{ xs: 22, xl: 26 }} lineHeight={1.15} color={colors.texto}
          sx={{ wordBreak: "break-word" }}>
          {value}
        </Typography>
      )}
      {subtitle && (
        <Typography variant="body2" color={colors.textoSuave} mt="auto">
          {cargando ? <Skeleton width="50%" /> : subtitle}
        </Typography>
      )}
    </Box>
  );
};

export default StatCard;
