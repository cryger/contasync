import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Box, Chip, Grid, Tooltip, Typography } from "@mui/material";
import {
  AccountBalanceWalletOutlined, PendingActionsOutlined, ReceiptLongOutlined, TrendingDownOutlined,
} from "@mui/icons-material";
import Header from "../../components/Header";
import StatCard from "../../components/StatCard";
import PeriodoFiltro from "../../components/PeriodoFiltro";
import useCarga from "../../hooks/useCarga";
import { dashboardApi } from "../../api";
import { ESTADOS_FACTURA } from "../../utils/factura";
import { formatoFecha, formatoMoneda, hoy, inicioDeMes } from "../../utils/format";
import { useColors } from "../../theme";

export default function DashboardPage() {
  const colors = useColors();
  const navigate = useNavigate();
  const [periodo, setPeriodo] = useState({ desde: inicioDeMes(), hasta: hoy() });
  const { data: d, error } = useCarga(() => dashboardApi.obtener(periodo), [periodo]);

  const maxDia = Math.max(1, ...(d?.ventas_diarias || []).map((v) => v.total));
  const panel = { bgcolor: colors.base[400], p: 2.5, borderRadius: 2, height: "100%" };

  return (
    <Box>
      <Header title="Inicio" subtitle="Cómo va el negocio en el periodo">
        <PeriodoFiltro value={periodo} onChange={setPeriodo} />
      </Header>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {d && (
        <>
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard title="Facturado" value={formatoMoneda(d.facturado)} subtitle={`${d.num_facturas} facturas · IVA ${formatoMoneda(d.iva)}`} icon={<ReceiptLongOutlined />} />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard title="Gastos" value={formatoMoneda(d.gastos)} icon={<TrendingDownOutlined />} tone="red" />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard title="Utilidad (sin IVA)" value={formatoMoneda(d.utilidad)} icon={<AccountBalanceWalletOutlined />} tone={d.utilidad < 0 ? "red" : "green"} />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard title="Por cobrar" value={formatoMoneda(d.por_cobrar.total)} subtitle={`${d.por_cobrar.cantidad} facturas a crédito`} icon={<PendingActionsOutlined />} tone="blue" />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} lg={8}>
              <Box sx={panel}>
                <Typography variant="h5" fontWeight="bold" mb={2}>Ventas por día</Typography>
                {d.ventas_diarias.length === 0 ? (
                  <Typography color={colors.gray[300]}>Sin ventas en el periodo</Typography>
                ) : (
                  <Box display="flex" alignItems="flex-end" gap={0.75} height={240}>
                    {d.ventas_diarias.map((v) => (
                      <Tooltip key={v.fecha} title={`${formatoFecha(v.fecha)}: ${formatoMoneda(v.total)} (${v.cantidad})`}>
                        <Box flex={1} maxWidth={44} height="100%" display="flex" flexDirection="column" justifyContent="flex-end" alignItems="center">
                          <Box width="100%" height={`${(v.total / maxDia) * 85}%`} minHeight={4}
                            bgcolor={colors.acento[500]} borderRadius="4px 4px 0 0" />
                          <Typography variant="caption" color={colors.gray[300]} mt={0.5}>{v.fecha.slice(8, 10)}</Typography>
                        </Box>
                      </Tooltip>
                    ))}
                  </Box>
                )}
              </Box>
            </Grid>
            <Grid item xs={12} lg={4}>
              <Box sx={panel}>
                <Typography variant="h5" fontWeight="bold" mb={2}>Mejores clientes</Typography>
                {d.top_clientes.map((c) => (
                  <Box key={c.id} display="flex" justifyContent="space-between" py={0.75} borderBottom={`1px solid ${colors.base[500]}`}>
                    <Typography noWrap>{c.nombre}</Typography>
                    <Typography fontWeight="bold">{formatoMoneda(c.total)}</Typography>
                  </Box>
                ))}
                {!d.top_clientes.length && <Typography color={colors.gray[300]}>Sin datos</Typography>}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box sx={panel}>
                <Typography variant="h5" fontWeight="bold" mb={2}>Últimas facturas</Typography>
                {d.ultimas_facturas.map((f) => (
                  <Box key={f.id} display="flex" alignItems="center" gap={2} py={1} sx={{ cursor: "pointer" }}
                    borderBottom={`1px solid ${colors.base[500]}`} onClick={() => navigate(`/facturas/${f.id}`)}>
                    <Typography width={90} fontWeight="bold" color={colors.acento[500]}>{f.numero}</Typography>
                    <Typography width={90}>{formatoFecha(f.fecha)}</Typography>
                    <Typography flex={1} noWrap>{f.cliente_nombre}</Typography>
                    <Chip size="small" label={ESTADOS_FACTURA[f.estado].label} color={ESTADOS_FACTURA[f.estado].color} />
                    <Typography width={130} textAlign="right">{formatoMoneda(f.total)}</Typography>
                  </Box>
                ))}
                {!d.ultimas_facturas.length && <Typography color={colors.gray[300]}>Aún no hay facturas</Typography>}
              </Box>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
}
