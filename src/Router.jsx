import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import App from "./App";
import {
  Dashboard,
  Team,
  Invoices,
  Projects,
  Contacts,
  Suppliers,
  Investments,
  Banks,
  Employees,
  Cuenta,
  Costcenter,
  Form,
  Bar,
  Line,
  Pie,
  FAQ,
  Geography,
  Calendar,
  Stream,
  Budget,
  Balances,
  Finances,

 
  } from "./scenes";

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/team" element={<Team />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/investments" element={<Investments />} />
          <Route path="/banks" element={<Banks/>} />
          <Route path="/employees" element={<Employees/>} />
          <Route path="/cuenta" element={<Cuenta/>} />
          <Route path="/costcenter" element={<Costcenter/>} />
          <Route path="/budget" element={<Budget/>} />
          <Route path="/balances" element={<Balances/>} />
          <Route path="/finances" element={<Finances/>} />
          <Route path="/form" element={<Form />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/bar" element={<Bar />} />
          <Route path="/pie" element={<Pie />} />
          <Route path="/stream" element={<Stream />} />
          <Route path="/line" element={<Line />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/geography" element={<Geography />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRouter;
