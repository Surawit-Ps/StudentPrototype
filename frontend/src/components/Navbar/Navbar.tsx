import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout, Menu, Dropdown, Avatar, Tooltip } from "antd";
import { UserOutlined } from "@ant-design/icons";
import logo from "../../assets/logojob.png";
import { GetUserById } from "../../services/https";
import { UsersInterface } from "../../interfaces/IUser";

const { Header } = Layout;

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(localStorage.getItem("page") || "home");
  const [user, setUser] = useState<UsersInterface | null>(null);
  const [isHover, setIsHover] = useState(false);

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
        height: 20,
        padding: 0,
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
      }}
    >
      <div
        style={{
          maxWidth: "60%",
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

        {/* Menu + Avatar */}
        <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
          {/* Navigation Links */}
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
                onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
                  e.currentTarget.style.borderBottom = "2px solid #3F72AF";
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
                  if (!isActive) {
                    e.currentTarget.style.borderBottom = "none";
                  }
                }}
              >
                {item.label}
              </Link>
            );
          })}

          {/* Avatar + First Name */}
          <Dropdown overlay={dropdownMenu} trigger={["hover", "click"]}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                cursor: "pointer",
              }}
              onMouseEnter={() => setIsHover(true)}
              onMouseLeave={() => setIsHover(false)}
            >
              <Tooltip title="เปิดเมนูโปรไฟล์" placement="bottom">
                <div
                  style={{
                    transform: isHover ? "scale(1.1)" : "scale(1)",
                    transition: "transform 0.2s ease",
                  }}
                >
                  <Avatar
                    src={user?.Profile}
                    icon={!user?.Profile ? <UserOutlined /> : undefined}
                    style={{ backgroundColor: "#3F72AF" }}
                  />
                </div>
              </Tooltip>
              <span
                style={{
                  fontSize: 16,
                  fontWeight: "bold",
                  color: "#3F72AF",
                  textTransform: "uppercase",
                }}
              >
                {user?.FirstName}
              </span>
            </div>
          </Dropdown>
        </div>
      </div>
    </Header>
  );
};

export default Navbar;
