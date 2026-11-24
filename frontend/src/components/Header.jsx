/* eslint-disable react/prop-types */
import { Box, Typography, useTheme } from "@mui/material";
import { tokens } from "../theme";

/** Título de página con acciones opcionales a la derecha. */
const Header = ({ title, subtitle, children }) => {
  const colors = tokens(useTheme().palette.mode);
  return (
    <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={3}>
      <Box>
        <Typography variant="h2" fontWeight="bold" color={colors.gray[100]} mb="5px">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="h5" color={colors.greenAccent[400]}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {children && <Box display="flex" gap={1} flexWrap="wrap">{children}</Box>}
    </Box>
  );
};

export default Header;
