import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout, Menu, Dropdown, Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
import logo from "../../assets/logojob.png";
import { GetUserById } from "../../services/https";
import { UsersInterface } from "../../interfaces/IUser";

const { Header } = Layout;

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(localStorage.getItem("page") || "home");
  const [user, setUser] = useState<UsersInterface | null>(null);

  const handleMenuClick = (key: string) => {
    setCurrentPage(key);
    localStorage.setItem("page", key);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const navItems = [
    { key: "home", label: "หน้าหลัก", to: "/" },
    { key: "dashboard", label: "กระดานข่าว", to: "/dashboard/view" },
    { key: "work", label: "งานทั้งหมด", to: "/work/view" },
  ];

  const dropdownMenu = (
    <Menu>
      <Menu.Item key="admin">
        <Link to="/work" onClick={() => handleMenuClick("admin")}>แอดมิน</Link>
      </Menu.Item>
      <Menu.Item key="account">
        <Link to="/account" onClick={() => handleMenuClick("account")}>โปรไฟล์</Link>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" onClick={handleLogout}>
        ออกจากระบบ
      </Menu.Item>
    </Menu>
  );

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    if (userId) {
      GetUserById(Number(userId)).then((res) => {
        if (res) {
          setUser(res);
        }
      });
    }
  }, []);

  return (
    <Header
      style={{
        backgroundColor: "#F9F7F7",
        height: 64,
        padding: "0 24px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
      }}
    >
      <div
        style={{
          maxWidth: "100%",
          margin: "0 auto",
          height: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <img src={logo} alt="Logo" style={{ height: 40 }} />
        </div>

        {/* Main navigation items */}
        <div style={{ display: "flex", gap: 40 }}>
          {navItems.map((item) => {
            const isActive = currentPage === item.key;
            return (
              <Link
                key={item.key}
                to={item.to}
                onClick={() => handleMenuClick(item.key)}
                style={{
                  color: isActive ? "#3F72AF" : "#112D4E",
                  fontWeight: isActive ? "bold" : "normal",
                  fontSize: 17,
                  textDecoration: "none",
                  padding: "12px 0",
                  borderBottom: isActive ? "2px solid #3F72AF" : "none",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderBottom = "2px solid #3F72AF";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderBottom = "none";
                  }
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Dropdown Menu with Avatar */}
        <Dropdown overlay={dropdownMenu} trigger={["click"]}>
          <Avatar
            src={user?.Profile} // แสดงรูปถ้ามี
            icon={!user?.Profile ? <UserOutlined /> : undefined}
            style={{
              backgroundColor: "#3F72AF",
              cursor: "pointer",
            }}
          />
        </Dropdown>
      </div>
    </Header>
  );
};

export default Navbar;
