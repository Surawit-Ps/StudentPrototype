import React, { useEffect, useState } from "react";
import { UserOutlined, DashboardOutlined, FileTextOutlined, LogoutOutlined  } from "@ant-design/icons";
import { Layout, Menu } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import "./AdminSidebar.css";
import LogoImg from "../../components/Sider/logojob.png";

const { Sider } = Layout;

type CustomMenuItem = {
  key: string;
  icon: React.ReactNode;
  label: string;
  className?: string;
};

const items: CustomMenuItem[] = [
  { key: "/work", label: "งานทั้งหมด", icon: <FileTextOutlined />, className: "menu-work" },
  { key: "/dashboard", label: "แดชบอร์ด", icon: <DashboardOutlined />, className: "menu-dashboard" },
  { key: "/account", label: "ผู้ใช้งานทั้งหมด", icon: <UserOutlined />, className: "menu-work" },
  { key: "/home", label: "ออก", icon: <LogoutOutlined  />, className: "menu-logout" },
];

const AdminSidebar: React.FC = () => {
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setSelectedKeys([location.pathname]);
  }, [location.pathname]);

  const handleMenuClick = (e: { key: string }) => {
    navigate(e.key);
  };

  return (
    <div className="admin">
      <Sider width={250} className="sider" theme="light">
        <div className="logo">
          <img
            src={LogoImg}
            alt="Logo"
            style={{
              width: "200px",
              height: "60px",
              objectFit: "contain",
              marginBottom: 10,
            }}
          />
        </div>

        <Menu
          mode="inline"
          selectedKeys={selectedKeys}
          className="menu"
          onClick={handleMenuClick}
        >
          {items.map((item) => (
            <Menu.Item
              key={item.key}
              icon={<span className="icon-style">{item.icon}</span>}
              className={`menu-item ${item.className || ""}`}
            >
              {item.label}
            </Menu.Item>
          ))}
        </Menu>
      </Sider>
    </div>
  );
};

export default AdminSidebar;
