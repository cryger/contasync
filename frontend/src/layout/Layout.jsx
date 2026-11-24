import { useState } from "react";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const Layout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [toggled, setToggled] = useState(false);

  return (
    <Box display="flex" height="100vh" maxWidth="100%">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} toggled={toggled} setToggled={setToggled} />
      <Box flexGrow={1} display="flex" flexDirection="column" height="100%" minWidth={0}>
        <Navbar onToggleMenu={() => setToggled(!toggled)} />
        <Box flex={1} overflow="auto" px={{ xs: 2, md: 3 }} pb={4}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
