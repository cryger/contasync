/* eslint-disable react/prop-types */
import { Box, TextField } from "@mui/material";

/** Selector desde / hasta. value = { desde, hasta } */
const PeriodoFiltro = ({ value, onChange, children }) => (
  <Box display="flex" gap={1.5} alignItems="center" flexWrap="wrap">
    {["desde", "hasta"].map((k) => (
      <TextField
        key={k}
        size="small"
        type="date"
        label={k === "desde" ? "Desde" : "Hasta"}
        value={value[k] || ""}
        onChange={(e) => onChange({ ...value, [k]: e.target.value })}
        InputLabelProps={{ shrink: true }}
      />
    ))}
    {children}
  </Box>
);

export default PeriodoFiltro;
