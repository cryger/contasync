import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Box, ButtonBase, Chip, Grid, Skeleton, Tooltip, Typography } from "@mui/material";
import {
  AccountBalanceWalletOutlined, ChevronRightOutlined, PendingActionsOutlined, ReceiptLongOutlined, TrendingDownOutlined,
} from "@mui/icons-material";
import Header from "../../components/Header";
import StatCard from "../../components/StatCard";
import PeriodoFiltro from "../../components/PeriodoFiltro";
import { estiloPanel } from "../../components/Panel";
import useCarga from "../../hooks/useCarga";
import { dashboardApi } from "../../api";
import { ESTADOS_FACTURA } from "../../utils/factura";
import { formatoFecha, formatoMoneda, hoy, inicioDeMes } from "../../utils/format";
import { fuenteMono, useColors } from "../../theme";

export default function DashboardPage() {
  const colors = useColors();
  const navigate = useNavigate();
  const [periodo, setPeriodo] = useState({ desde: inicioDeMes(), hasta: hoy() });
  const { data: d, cargando, error } = useCarga(() => dashboardApi.obtener(periodo), [periodo]);

  const ventas = d?.ventas_diarias || [];
  const maxDia = Math.max(1, ...ventas.map((v) => v.total));
  const mejorDia = ventas.reduce((m, v) => (v.total > (m?.total || 0) ? v : m), null);
  const topTotal = Math.max(1, ...(d?.top_clientes || []).map((c) => c.total));
  const panel = { ...estiloPanel(colors), height: "100%" };
  const carga = cargando && !d;

  return (
    <Box>
      <Header title="Inicio" subtitle="Cómo va el negocio en el periodo seleccionado">
        <PeriodoFiltro value={periodo} onChange={setPeriodo} />
      </Header>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Indicadores */}
      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard cargando={carga} title="Facturado" value={formatoMoneda(d?.facturado)}
            subtitle={`${d?.num_facturas ?? 0} facturas · IVA ${formatoMoneda(d?.iva)}`} icon={<ReceiptLongOutlined />} />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard cargando={carga} title="Gastos" value={formatoMoneda(d?.gastos)} subtitle="Registrados en el periodo"
            icon={<TrendingDownOutlined />} tone="red" />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard cargando={carga} title="Utilidad sin IVA" value={formatoMoneda(d?.utilidad)}
            subtitle={(d?.utilidad ?? 0) < 0 ? "Pérdida: los gastos superan los ingresos" : "Ingresos menos gastos"}
            icon={<AccountBalanceWalletOutlined />} tone={(d?.utilidad ?? 0) < 0 ? "red" : "green"} />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard cargando={carga} title="Por cobrar" value={formatoMoneda(d?.por_cobrar?.total)}
            subtitle={`${d?.por_cobrar?.cantidad ?? 0} facturas a crédito pendientes`} icon={<PendingActionsOutlined />} tone="blue" />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {/* Ventas por día */}
        <Grid item xs={12} lg={8}>
          <Box sx={panel}>
            <Box display="flex" justifyContent="space-between" alignItems="baseline" mb={2} gap={2} flexWrap="wrap">
              <Typography component="h2" variant="h4">Ventas por día</Typography>
              {mejorDia && (
                <Typography variant="body2" color={colors.textoSuave}>
                  Mejor día: {formatoFecha(mejorDia.fecha)} · <span className="mono">{formatoMoneda(mejorDia.total)}</span>
                </Typography>
              )}
            </Box>
            {carga ? (
              <Skeleton variant="rounded" height={240} />
            ) : ventas.length === 0 ? (
              <Box height={240} display="flex" alignItems="center" justifyContent="center" color={colors.textoSuave}>
                Sin ventas en el periodo
              </Box>
            ) : (
              <Box role="img" aria-label={`Ventas de ${ventas.length} días. Mayor venta: ${formatoMoneda(mejorDia?.total)} el ${formatoFecha(mejorDia?.fecha)}.`}
                position="relative" height={240}>
                {/* Líneas guía */}
                {[0.25, 0.5, 0.75, 1].map((t) => (
                  <Box key={t} position="absolute" left={0} right={0} bottom={`calc(${t * 85}% + 22px)`} borderTop={`1px dashed ${colors.borde}`} />
                ))}
                <Box position="relative" display="flex" alignItems="flex-end" gap={0.75} height="100%">
                  {ventas.map((v) => (
                    <Tooltip key={v.fecha} title={`${formatoFecha(v.fecha)}: ${formatoMoneda(v.total)} · ${v.cantidad} factura(s)`}>
                      <Box flex={1} maxWidth={44} height="100%" display="flex" flexDirection="column" justifyContent="flex-end" alignItems="center"
                        sx={{ "&:hover > div:first-of-type": { opacity: 1 } }}>
                        <Box width="100%" height={`${(v.total / maxDia) * 85}%`} minHeight={4} bgcolor={colors.acento[500]}
                          borderRadius="6px 6px 2px 2px" sx={{ opacity: 0.85, transition: "opacity 150ms ease" }} />
                        <Typography variant="caption" color={colors.textoSuave} mt={0.5} lineHeight="18px">{v.fecha.slice(8, 10)}</Typography>
                      </Box>
                    </Tooltip>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </Grid>

        {/* Mejores clientes */}
        <Grid item xs={12} lg={4}>
          <Box sx={panel}>
            <Typography component="h2" variant="h4" mb={2}>Mejores clientes</Typography>
            {carga && [0, 1, 2, 3].map((i) => <Skeleton key={i} height={44} />)}
            {!carga && !d?.top_clientes?.length && <Typography color={colors.textoSuave}>Sin datos en el periodo</Typography>}
            <Box component="ol" sx={{ listStyle: "none", m: 0, p: 0 }}>
              {d?.top_clientes?.map((c, i) => (
                <Box component="li" key={c.id} py={1.1} borderBottom={`1px solid ${colors.borde}`} sx={{ "&:last-of-type": { borderBottom: 0 } }}>
                  <Box display="flex" justifyContent="space-between" gap={1.5} mb={0.75}>
                    <Typography noWrap>
                      <Box component="span" color={colors.textoSuave} mr={1} className="tabular">{i + 1}.</Box>
                      {c.nombre}
                    </Typography>
                    <Typography fontFamily={fuenteMono} fontWeight={500} flexShrink={0}>{formatoMoneda(c.total)}</Typography>
                  </Box>
                  <Box height={4} borderRadius={4} bgcolor={colors.base[600]} overflow="hidden" aria-hidden>
                    <Box height="100%" width={`${(c.total / topTotal) * 100}%`} bgcolor={colors.secundario[500]} borderRadius={4} />
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Grid>

        {/* Últimas facturas */}
        <Grid item xs={12}>
          <Box sx={panel}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography component="h2" variant="h4">Últimas facturas</Typography>
              <ButtonBase onClick={() => navigate("/facturas")} sx={{ color: colors.acentoTexto, fontWeight: 600, borderRadius: 1, px: 1, py: 0.5 }}>
                Ver todas <ChevronRightOutlined fontSize="small" />
              </ButtonBase>
            </Box>
            {carga && [0, 1, 2].map((i) => <Skeleton key={i} height={48} />)}
            {!carga && !d?.ultimas_facturas?.length && <Typography color={colors.textoSuave} py={2}>Aún no hay facturas</Typography>}
            {d?.ultimas_facturas?.map((f) => (
              <ButtonBase key={f.id} onClick={() => navigate(`/facturas/${f.id}`)} aria-label={`Abrir factura ${f.numero} de ${f.cliente_nombre}`}
                sx={{
                  width: "100%", justifyContent: "flex-start", textAlign: "left", gap: 2, py: 1.25, px: 1, borderRadius: 2,
                  borderBottom: `1px solid ${colors.borde}`, transition: "background-color 150ms ease",
                  "&:hover": { bgcolor: colors.acentoSuave },
                }}>
                <Typography width={84} fontFamily={fuenteMono} fontWeight={500} color={colors.acentoTexto}>{f.numero}</Typography>
                <Typography width={90} color={colors.textoSuave} display={{ xs: "none", sm: "block" }}>{formatoFecha(f.fecha)}</Typography>
                <Typography flex={1} noWrap>{f.cliente_nombre}</Typography>
                <Chip size="small" label={ESTADOS_FACTURA[f.estado].label} color={ESTADOS_FACTURA[f.estado].color} variant="outlined" />
                <Typography width={130} textAlign="right" fontFamily={fuenteMono} fontWeight={500}>{formatoMoneda(f.total)}</Typography>
              </ButtonBase>
            ))}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
