import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "antd";
import "leaflet/dist/leaflet.css";

import Home from "./pages/home";
import Work from "./pages/work";
import WorkCreate from "./pages/work/create";
import WorkEdit from "./pages/work/edit";
import WorkInfo from "./pages/work/info";
import WorkView from "./pages/work/view";
import HistoryWork from "./pages/work/historywork";

import Dashboard from "./pages/dashboard";
import DashboardCreate from "./pages/dashboard/create";
import DashboardEdit from "./pages/dashboard/edit";
import DashboardView from "./pages/dashboard/view";

import Account from "./pages/account";
import AccountrCreate from "./pages/account/create";
import AccountEdit from "./pages/account/edit";
import AccountProfile from "./pages/account/profile";

import MyPostedWorks from "./pages/myWork/myWorks";
import BookingWork from "./pages/myWork/ิbookingWork";

import Login from "./pages/login/login";
import EnhancedFooter from "./components/Footer/EnhancedFooter";
import CompleteWork from "./pages/workComplete/completeWork";
const { Content } = Layout;

const App: React.FC = () => {
  return (
    <Router>
      <Layout style={{ minHeight: "100vh" }}>
        <Content
          style={{
            // margin: "0 16px",
            // padding: 24,
            minHeight: "calc(100vh - 134px)", // เผื่อ Footer
            background: "#F9F7F7",
          }}
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/work" element={<Work />} />
            <Route path="/work/create" element={<WorkCreate />} />
            <Route path="/work/edit/:id" element={<WorkEdit />} />
            <Route path="/work/info/:id" element={<WorkInfo />} />
            <Route path="/work/view" element={<WorkView />} />
            <Route path="/work/historywork/:userId" element={<HistoryWork />} />

            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/create" element={<DashboardCreate />} />
            <Route path="/dashboard/edit/:id" element={<DashboardEdit />} />
            <Route path="/dashboard/view" element={<DashboardView />} />

            <Route path="/account" element={<Account />} />
            <Route path="/account/create" element={<AccountrCreate />} />
            <Route path="/account/edit/:id" element={<AccountEdit />} />
            <Route path="/account/profile/:id" element={<AccountProfile />} />
            <Route path="login" element={<Login />} />
            <Route path="/myworks" element={<MyPostedWorks />} />
            <Route path="/myworks/booking/:workId" element={<BookingWork />} />
            <Route path="/work/complete/:workId" element={<CompleteWork />} />
          </Routes>
        </Content>
      </Layout>
    </Router>
  );
};

export default App;
