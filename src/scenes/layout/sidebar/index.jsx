/* eslint-disable react/prop-types */
import {
  Avatar,
  Box,
  IconButton,
  Typography,
  useTheme,
} from "@mui/material";
import { useContext, useState } from "react";
import { tokens } from "../../../theme";
import { Menu, MenuItem, Sidebar } from "react-pro-sidebar";
import {
  ArrowBackIosNewOutlined,
  BarChartOutlined,
  BookOutlined,
  BuildOutlined,
  CalendarTodayOutlined,
  ContactsOutlined,
  DashboardOutlined,
  DonutLargeOutlined,
  HelpOutlineOutlined,
  MapOutlined,
  MenuOutlined,
  PeopleAltOutlined,
  PersonOutlined,
  ReceiptOutlined,
  TimelineOutlined,
  WavesOutlined,
  MonetizationOnOutlined,
  AccountBalance,
  AccountBalanceWalletOutlined,
  BusinessCenterOutlined,
  BadgeOutlined,
  RequestQuoteOutlined,
  LibraryBooksOutlined,
  AssessmentOutlined

} from "@mui/icons-material";
import avatar from "../../../assets/images/avatar.png";
import logo from "../../../assets/images/logo.png";
import Item from "./Item";
import { ToggledContext } from "../../../App";

const SideBar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { toggled, setToggled } = useContext(ToggledContext);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Sidebar
      backgroundColor={colors.primary[400]}
      rootStyles={{
        border: 0,
        height: "100%",
      }}
      collapsed={collapsed}
      onBackdropClick={() => setToggled(false)}
      toggled={toggled}
      breakPoint="md"
    >
      <Menu
        menuItemStyles={{
          button: { ":hover": { background: "transparent" } },
        }}
      >
        <MenuItem
          rootStyles={{
            margin: "10px 0 20px 0",
            color: colors.gray[100],
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {!collapsed && (
              <Box
                display="flex"
                alignItems="center"
                gap="12px"
                sx={{ transition: ".3s ease" }}
              >
                <img
                  style={{ width: "30px", height: "30px", borderRadius: "8px" }}
                  src={logo}
                  alt="Argon"
                />
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  textTransform="capitalize"
                  color={colors.greenAccent[500]}
                >
                  Argon
                </Typography>
              </Box>
            )}
            <IconButton onClick={() => setCollapsed(!collapsed)}>
              <MenuOutlined />
            </IconButton>
          </Box>
        </MenuItem>
      </Menu>

      {!collapsed && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "10px",
            mb: "25px",
          }}
        >
          <Avatar
            alt="avatar"
            src={avatar}
            sx={{ width: "100px", height: "100px" }}
          />
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h3" fontWeight="bold" color={colors.gray[100]}>
              Tony Stark
            </Typography>
            <Typography
              variant="h6"
              fontWeight="500"
              color={colors.greenAccent[500]}
            >
              VP Fancy Admin
            </Typography>
          </Box>
        </Box>
      )}

      <Box mb={5} pl={collapsed ? undefined : "5%"}>
        <Menu
          menuItemStyles={{
            button: {
              ":hover": {
                color: "#868dfb",
                background: "transparent",
                transition: ".4s ease",
              },
            },
          }}
        >
          <Item
            title="Inicio"
            path="/"
            colors={colors}
            icon={<DashboardOutlined />}
          />
        </Menu>

        <Typography
          variant="h6"
          color={colors.gray[300]}
          sx={{ m: "15px 0 5px 20px" }}
        >
          {!collapsed ? "Data" : " "}
        </Typography>

        <Menu
          menuItemStyles={{
            button: {
              ":hover": {
                color: "#868dfb",
                background: "transparent",
                transition: ".4s ease",
              },
            },
          }}
        >
          <Item
            title="Equipo de trabajo"
            path="/team"
            colors={colors}
            icon={<PeopleAltOutlined />}
          />

          <Item
            title="Empleados"
            path="/employees"
            colors={colors}
            icon={<BadgeOutlined />}
          />

          <Item
            title="Clientes"
            path="/contacts"
            colors={colors}
            icon={<ContactsOutlined />}
          />
          <Item
            title="Recibos"
            path="/invoices"
            colors={colors}
            icon={<ReceiptOutlined />}
          />
          <Item
            title="Proyectos"
            path="/projects"
            colors={colors}
            icon={<BookOutlined />}
          />
          <Item
            title="Proveedores"
            path="/suppliers"
            colors={colors}
            icon={<BuildOutlined />}
          />

          <Item
            title="Inversiones"
            path="/investments"
            colors={colors}
            icon={<MonetizationOnOutlined />}
          />

           <Item
            title="Bancos"
            path="/banks"
            colors={colors}
            icon={<AccountBalance />}
          />

          <Item
            title="Cuentas Bancarias"
            path="/cuenta"
            colors={colors}
            icon={<AccountBalanceWalletOutlined />}
          />

          <Item
            title="Centros_costos"
            path="/costcenter"
            colors={colors}
            icon={<BusinessCenterOutlined />}
          />

          <Item
            title="Presupuestos"
            path="/budget"
            colors={colors}
            icon={<RequestQuoteOutlined />}
          />

            <Item
            title="Balances"
            path="/balances"
            colors={colors}
            icon={<LibraryBooksOutlined />}
          />

          <Item
            title="Finanzas"
            path="/finances"
            colors={colors}
            icon={<AssessmentOutlined />}
          />

         
        </Menu>

        <Typography
          variant="h6"
          color={colors.gray[300]}
          sx={{ m: "15px 0 5px 20px" }}
        >
          {!collapsed ? "Pages" : " "}
        </Typography>

        <Menu
          menuItemStyles={{
            button: {
              ":hover": {
                color: "#868dfb",
                background: "transparent",
                transition: ".4s ease",
              },
            },
          }}
        >
          <Item
            title="Registro de Usuarios"
            path="/form"
            colors={colors}
            icon={<PersonOutlined />}
          />
          <Item
            title="Calendar"
            path="/calendar"
            colors={colors}
            icon={<CalendarTodayOutlined />}
          />
          <Item
            title="FAQ Page"
            path="/faq"
            colors={colors}
            icon={<HelpOutlineOutlined />}
          />
        </Menu>

        <Typography
          variant="h6"
          color={colors.gray[300]}
          sx={{ m: "15px 0 5px 20px" }}
        >
          {!collapsed ? "Charts" : " "}
        </Typography>

        <Menu
          menuItemStyles={{
            button: {
              ":hover": {
                color: "#868dfb",
                background: "transparent",
                transition: ".4s ease",
              },
            },
          }}
        >
          <Item
            title="Bar Chart"
            path="/bar"
            colors={colors}
            icon={<BarChartOutlined />}
          />
          <Item
            title="Pie Chart"
            path="/pie"
            colors={colors}
            icon={<DonutLargeOutlined />}
          />
          <Item
            title="Line Chart"
            path="/line"
            colors={colors}
            icon={<TimelineOutlined />}
          />
          <Item
            title="Geography Chart"
            path="/geography"
            colors={colors}
            icon={<MapOutlined />}
          />
          <Item
            title="Stream Chart"
            path="/stream"
            colors={colors}
            icon={<WavesOutlined />}
          />
        </Menu>
      </Box>
    </Sidebar>
  );
};

export default SideBar;
