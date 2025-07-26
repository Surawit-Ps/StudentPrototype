import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "antd";
import "leaflet/dist/leaflet.css";

// import Home from "./pages/home";
import Work from "./pages/work";
import WorkCreate from "./pages/work/create";
import WorkEdit from "./pages/work/edit";
import WorkInfo from "./pages/work/info";
import WorkView from "./pages/work/view";

import Dashboard from "./pages/dashboard";
import DashboardCreate from "./pages/dashboard/create";
import DashboardEdit from "./pages/dashboard/edit";
import DashboardView from "./pages/dashboard/view";

import Account from "./pages/account";
import AccountrCreate from "./pages/account/create";
import AccountEdit from "./pages/account/edit";

import Login from "./pages/login/login";

const { Content, Footer } = Layout;

const App: React.FC = () => {
  return (
    <Router>
      <Layout style={{ minHeight: "100vh" }}>
        <Content
          style={{
            margin: "0 16px",
            padding: 24,
            minHeight: "calc(100vh - 134px)", // เผื่อ Footer
            background: "#F9F7F7",
          }}
        >
          <Routes>
            {/* <Route path="/" element={<Home />} /> */}
            <Route path="/work" element={<Work />} />
            <Route path="/work/create" element={<WorkCreate />} />
            <Route path="/work/edit/:id" element={<WorkEdit />} />
            <Route path="/work/info/:id" element={<WorkInfo />} />
            <Route path="/work/view" element={<WorkView />} />

            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/create" element={<DashboardCreate />} />
            <Route path="/dashboard/edit/:id" element={<DashboardEdit />} />
            <Route path="/dashboard/view" element={<DashboardView />} />

            <Route path="/account" element={<Account />} />
            <Route path="/account/create" element={<AccountrCreate />} />
            <Route path="/account/edit/:id" element={<AccountEdit />} />
            <Route path="login" element={<Login />} />
          </Routes>
        </Content>

        <Footer style={{ textAlign: "center", color: "#888", background: "#f0f2f5", lineHeight: "1.6" }}>
          STUDENT JOB HUB © {new Date().getFullYear()}<br />
          มหาวิทยาลัยเทคโนโลยีสุรนารี (SUT)<br />
          ติดต่อ: projectstudentjobhub@gmail.com
        </Footer>

      </Layout>
    </Router>
  );
};

export default App;
