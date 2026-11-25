/* eslint-disable react/prop-types */
import { Box, Typography } from "@mui/material";
import { useColors } from "../theme";

/** Título de página (h1 real para lectores de pantalla) con acciones opcionales a la derecha. */
const Header = ({ title, subtitle, children }) => {
  const colors = useColors();
  return (
    <Box display="flex" justifyContent="space-between" alignItems="flex-end" flexWrap="wrap" gap={2} mb={3}>
      <Box minWidth={0}>
        {title && (
          <Typography component="h1" variant="h2" color={colors.texto}>
            {title}
          </Typography>
        )}
        {subtitle && (
          <Typography variant="body1" color={colors.textoSuave} mt={0.5}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {children && <Box display="flex" gap={1} flexWrap="wrap" alignItems="center">{children}</Box>}
    </Box>
  );
};

export default Header;
