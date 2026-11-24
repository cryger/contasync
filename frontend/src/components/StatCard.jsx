/* eslint-disable react/prop-types */
import { Box, Typography, useTheme } from "@mui/material";
import { tokens } from "../theme";

const StatCard = ({ title, value, subtitle, icon, tone = "green" }) => {
  const colors = tokens(useTheme().palette.mode);
  const accent = tone === "red" ? colors.redAccent[500] : tone === "blue" ? colors.blueAccent[400] : colors.greenAccent[500];
  return (
    <Box bgcolor={colors.primary[400]} p={2.5} borderRadius={2} display="flex" gap={2} alignItems="center" minHeight={110}>
      <Box sx={{ color: accent, "& svg": { fontSize: 34 } }}>{icon}</Box>
      <Box minWidth={0}>
        <Typography variant="h6" color={colors.gray[300]}>{title}</Typography>
        <Typography variant="h3" fontWeight="bold" color={colors.gray[100]} noWrap>{value}</Typography>
        {subtitle && <Typography variant="h6" color={accent}>{subtitle}</Typography>}
      </Box>
    </Box>
  );
};

export default StatCard;
