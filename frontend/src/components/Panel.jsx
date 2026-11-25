/* eslint-disable react/prop-types, react-refresh/only-export-components */
import { Box, Typography } from "@mui/material";
import { useColors } from "../theme";

/**
 * Superficie estándar (tarjeta) del sistema de diseño: fondo de superficie, borde de 1px y radio 12.
 * Props opcionales: titulo, descripcion, acciones (a la derecha del título), component="section" por defecto.
 */
const Panel = ({ titulo, descripcion, acciones, children, sx, p = 2.5, ...rest }) => {
  const colors = useColors();
  return (
    <Box
      component="section"
      bgcolor={colors.superficie}
      border={`1px solid ${colors.borde}`}
      borderRadius="12px"
      p={p}
      sx={sx}
      {...rest}
    >
      {(titulo || acciones) && (
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={2} mb={descripcion ? 0.5 : 2}>
          {titulo && <Typography component="h2" variant="h4">{titulo}</Typography>}
          {acciones && <Box display="flex" gap={1} flexShrink={0}>{acciones}</Box>}
        </Box>
      )}
      {descripcion && (
        <Typography variant="body2" color={colors.textoSuave} mb={2}>{descripcion}</Typography>
      )}
      {children}
    </Box>
  );
};

export default Panel;

/** Props de estilo de superficie para usar en un <Box> existente: <Box {...estiloPanel(colors)} /> */
export const estiloPanel = (colors, p = 2.5) => ({
  bgcolor: colors.superficie,
  border: `1px solid ${colors.borde}`,
  borderRadius: "12px",
  p,
});
