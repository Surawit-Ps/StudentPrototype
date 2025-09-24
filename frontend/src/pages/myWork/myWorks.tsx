import React, { useEffect, useState } from "react";
import { WorkInterface } from "../../interfaces/IWork";
import { GetWorkByPosterID } from "../../services/https/index";
import {
  Card,
  Col,
  Row,
  Typography,
  Empty,
  Spin,
  Tag,
  Button,
  Space,
  Divider,
  Badge,
  Progress,
} from "antd";
import {
  CalendarOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  DollarOutlined,
  HeartOutlined,
  EyeOutlined,
  EditOutlined,
  CheckCircleOutlined,
  FileDoneOutlined,
} from "@ant-design/icons";
import Navbar from "../../components/Navbar/Navbar";
import { useNavigate } from "react-router-dom";
import EnhancedFooter from "../../components/Footer/EnhancedFooter";
import banner from '../../assets/banner.png'

const { Title, Text, Paragraph } = Typography;

const MyPostedWorks: React.FC = () => {
  const [works, setWorks] = useState<WorkInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const userData = localStorage.getItem("user_id");
  const userId = userData ? Number(userData) : undefined;

  const fetchData = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    const res = await GetWorkByPosterID(userId);
    if (res) {
      const sortedWorks = res.sort(
        (a: { ID: any }, b: { ID: any }) => (b.ID ?? 0) - (a.ID ?? 0)
      );
      setWorks(sortedWorks);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  const getWorkStatus = (work: WorkInterface) => {
    const remaining = (work.workcount ?? 0) - (work.workuse ?? 0);
    if (remaining <= 0) {
      return { color: "red", text: "เต็มแล้ว" };
    } else if (remaining <= (work.workcount ?? 0) * 0.3) {
      return { color: "orange", text: "เหลือน้อย" };
    } else {
      return { color: "green", text: "เปิดรับ" };
    }
  };

  const formatWorkTime = (worktime: string | undefined) => {
    if (!worktime) return "-";
    const date = new Date(worktime);
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#F9F7F7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <Spin size="large" />
          <Title level={3} style={{ color: "#112D4E", marginTop: 20 }}>
            กำลังโหลดข้อมูล...
          </Title>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F9F7F7" }}>
      <Navbar />

      {/* ✅ Banner Section */}
      <div
        style={{
          background: `linear-gradient(135deg, rgba(63,114,175,0.5) 0%, rgba(17,45,78,0.5) 100%), url(${banner}) center/cover no-repeat`,
          color: "white",
          padding: "10px 20px 20px 20px",
          textAlign: "center",
        }}
      >
        <Title
          level={2}
          style={{
            color: "white",
            fontSize: "50px",
            fontWeight: "bold",
            marginBottom: "4px",
          }}
        >
          งานที่ฉันโพสต์ไว้
        </Title>

        <Text style={{ color: "#F9F7F7", fontSize: "18px", display: "block", marginBottom: "12px" }}>
          จัดการและติดตามงานของฉันทั้งหมด {works.length} งาน
        </Text>


        {works.length > 0 && (
          <Button
            type="primary"
            size="middle"
            style={{
              marginTop: "10px",
              background: "#e9eceeff",
              border: "none",
              borderRadius: "25px", // เพิ่มให้โค้งมนขึ้น
              padding: "12px 36px", // เพิ่มขนาดปุ่ม
              height: "auto",
              fontSize: "16px", // เพิ่มขนาดตัวอักษร
              color: "#112D4E",
              fontWeight: "bold",
            }}
            onClick={() => navigate("/work/create")}
          >
            สร้างงานใหม่
          </Button>
        )}
      </div>

      {/* ✅ End Banner Section */}
      <div
        style={{
          padding: "0 40px 60px",
          background: "#DBE2EF",
          minHeight: "60vh",
        }}
      >
        {works.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "80px 20px",
              color: "#112D4E",
            }}
          >
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <Text style={{ color: "#112D4E", fontSize: "18px" }}>
                  คุณยังไม่ได้โพสต์งานใด ๆ
                </Text>
              }
            />
            <Button
              type="primary"
              size="large"
              style={{
                marginTop: "20px",
                background: "#3F72AF",
                border: "none",
                borderRadius: "25px",
                padding: "10px 30px",
                height: "auto",
              }}
              onClick={() => navigate("/work/create")}
            >
              เริ่มโพสต์งานแรก
            </Button>
          </div>
        ) : (
          <Row gutter={[24, 24]} style={{ paddingTop: "40px" }}>
            {works.map((work) => {
              const status = getWorkStatus(work);
              const progress =
                work.workcount && work.workcount > 0
                  ? ((work.workuse ?? 0) / work.workcount) * 100
                  : 0;

              return (
                <Col xs={24} sm={12} lg={8} xl={6} key={work.ID}>
                  <Card
                    hoverable
                    style={{
                      borderRadius: "16px",
                      border: "1px solid #DBE2EF",
                      background: "#fff",
                      boxShadow: "0 6px 15px rgba(0,0,0,0.08)",
                      height: "100%",
                      transition: "all 0.3s ease",
                    }}
                    cover={
                      <div style={{ position: "relative" }}>
                        <img
                          alt="รูปงาน"
                          src={work.photo || "/default-image.png"}
                          style={{
                            height: "200px",
                            objectFit: "cover",
                            width: "100%",
                            borderTopLeftRadius: "16px",
                            borderTopRightRadius: "16px",
                          }}
                        />
                        <Badge
                          count={status.text}
                          style={{
                            position: "absolute",
                            top: "10px",
                            right: "10px",
                            backgroundColor: status.color,
                            borderRadius: "12px",
                            fontSize: "12px",
                          }}
                        />
                      </div>
                    }
                    actions={[
                      <Button
                        type="text"
                        icon={<EyeOutlined />}
                        onClick={() => navigate(`/work/info/${work.ID}`)}
                        style={{ color: "#3F72AF" }}
                      >
                        ดู
                      </Button>,
                      <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => navigate(`/work/edit/${work.ID}`)}
                        style={{ color: "#3F72AF" }}
                      >
                        แก้ไข
                      </Button>,
                      <Button
                        type="text"
                        icon={<CheckCircleOutlined />}
                        onClick={() => navigate(`/myworks/booking/${work.ID}`)}
                        style={{ color: "#27AE60" }}
                      >
                        เช็คชื่อ
                      </Button>,
                      <Button
                        type="text"
                        icon={<FileDoneOutlined />}
                        onClick={() => navigate(`/work/complete/${work.ID}`)}
                        style={{ color: "#FF9800" }}
                      >
                        สรุปงาน
                      </Button>,
                    ]}
                  >
                    <div style={{ padding: "0 8px" }}>
                      <Title
                        level={4}
                        style={{
                          marginBottom: "8px",
                          color: "#112D4E",
                          fontSize: "18px",
                        }}
                      >
                        {work.title}
                      </Title>

                      <Space
                        direction="vertical"
                        size="small"
                        style={{ width: "100%" }}
                      >
                        <Space>
                          <EnvironmentOutlined style={{ color: "#3F72AF" }} />
                          <Text type="secondary" style={{ fontSize: "14px" }}>
                            {work.place}
                          </Text>
                        </Space>

                        <Paragraph
                          style={{
                            margin: "8px 0",
                            fontSize: "13px",
                            lineHeight: "1.4",
                          }}
                          ellipsis={{ rows: 1 }}
                        >
                          {work.description || "ไม่มีรายละเอียด"}
                        </Paragraph>

                        <Divider style={{ margin: "12px 0" }} />

                        <Space
                          direction="vertical"
                          size="small"
                          style={{ width: "100%" }}
                        >
                          <Space>
                            <CalendarOutlined style={{ color: "#3F72AF" }} />
                            <Text style={{ fontSize: "13px" }}>
                              {formatWorkTime(work.worktime)}
                            </Text>
                          </Space>

                          <Space>
                            <TeamOutlined style={{ color: "#3F72AF" }} />
                            <Text style={{ fontSize: "13px" }}>
                              รับ {work.workcount ?? 0} | ใช้แล้ว{" "}
                              {work.workuse ?? 0}
                            </Text>
                          </Space>

                          <Progress
                            percent={Math.round(progress)}
                            size="small"
                            strokeColor="#3F72AF"
                          />

                          <Space>
                            {work.paid ? (
                              <>
                                <DollarOutlined style={{ color: "#27AE60" }} />
                                <Text
                                  strong
                                  style={{
                                    color: "#27AE60",
                                    fontSize: "14px",
                                  }}
                                >
                                  {work.paid.toLocaleString()} บาท
                                </Text>
                              </>
                            ) : (
                              <>
                                <HeartOutlined style={{ color: "#E74C3C" }} />
                                <Text
                                  style={{
                                    color: "#E74C3C",
                                    fontSize: "14px",
                                    fontWeight: "500",
                                  }}
                                >
                                  งานจิตอาสา
                                </Text>
                              </>
                            )}
                          </Space>
                        </Space>
                      </Space>
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </div>
      <EnhancedFooter />
    </div>
  );
};

export default MyPostedWorks;
