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

const { Title, Text, Paragraph } = Typography;

const MyPostedWorks: React.FC = () => {
  const [works, setWorks] = useState<WorkInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const userData = localStorage.getItem("user_id");
  const userId = userData ? Number(userData) : undefined;

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      const res = await GetWorkByPosterID(userId);
      if (res) {
        setWorks(res);
      }
      setLoading(false);
    };
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
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <Spin size="large" />
          <Title level={3} style={{ color: "white", marginTop: 20 }}>
            กำลังโหลดข้อมูล...
          </Title>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <Navbar />

      <div style={{ padding: "60px 40px 40px", textAlign: "center" }}>
        <Title
          level={1}
          style={{
            color: "white",
            fontSize: "3rem",
            fontWeight: "bold",
            marginBottom: "10px",
            textShadow: "0 4px 8px rgba(0,0,0,0.3)",
          }}
        >
          งานที่ฉันโพสต์ไว้
        </Title>
        <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: "1.2rem" }}>
          จัดการและติดตามงานที่คุณได้โพสต์ไว้
        </Text>
        {works.length > 0 && (
          <div style={{ marginTop: "20px" }}>
            <Button
              type="primary"
              size="large"
              style={{
                marginBottom: "20px",
                background: "linear-gradient(45deg, #FF6B6B, #4ECDC4)",
                border: "none",
                borderRadius: "25px",
                padding: "10px 30px",
                height: "auto",
              }}
              onClick={() => navigate("/work/create")}
            >
              สร้างงานใหม่
            </Button>
          </div>
        )}
        <div style={{ marginTop: "20px" }}>
          <Tag
            color="blue"
            style={{
              fontSize: "16px",
              padding: "8px 16px",
              borderRadius: "20px",
            }}
          >
            ทั้งหมด {works.length} งาน
          </Tag>
        </div>
      </div>

      <div
        style={{
          padding: "0 40px 60px",
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(10px)",
          borderRadius: "30px 30px 0 0",
          minHeight: "60vh",
        }}
      >
        {works.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "80px 20px",
              color: "white",
            }}
          >
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: "18px" }}>
                  คุณยังไม่ได้โพสต์งานใด ๆ
                </Text>
              }
            />
            <Button
              type="primary"
              size="large"
              style={{
                marginTop: "20px",
                background: "linear-gradient(45deg, #FF6B6B, #4ECDC4)",
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
              return (
                <Col xs={24} sm={12} lg={8} xl={6} key={work.ID}>
                  <Card
                    hoverable
                    style={{
                      borderRadius: "20px",
                      overflow: "hidden",
                      border: "none",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                      background: "linear-gradient(145deg, #ffffff, #f0f0f0)",
                      transition: "all 0.3s ease",
                      height: "100%",
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
                          }}
                        />
                        <Badge
                          count={status.text}
                          style={{
                            position: "absolute",
                            top: "10px",
                            right: "10px",
                            backgroundColor: status.color,
                            borderRadius: "15px",
                            fontSize: "12px",
                          }}
                        />
                        <div
                          style={{
                            position: "absolute",
                            bottom: "0",
                            left: "0",
                            right: "0",
                            background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
                            padding: "20px 0 10px",
                          }}
                        />
                      </div>
                    }
                    actions={[
                      <Button
                        type="text"
                        icon={<EyeOutlined />}
                        onClick={() => navigate(`/work/info/${work.ID}`)}
                        style={{ color: "#667eea" }}
                      >
                        ดู
                      </Button>,
                      <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => navigate(`/work/edit/${work.ID}`)}
                        style={{ color: "#667eea" }}
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
                          background: "linear-gradient(45deg, #667eea, #764ba2)",
                          backgroundClip: "text",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          fontSize: "18px",
                        }}
                      >
                        {work.title}
                      </Title>

                      <Space direction="vertical" size="small" style={{ width: "100%" }}>
                        <Space>
                          <EnvironmentOutlined style={{ color: "#FF6B6B" }} />
                          <Text type="secondary" style={{ fontSize: "14px" }}>
                            {work.place}
                          </Text>
                        </Space>

                        <Paragraph
                          style={{ margin: "8px 0", fontSize: "13px", lineHeight: "1.4" }}
                          ellipsis={{ rows: 2 }}
                        >
                          {work.description || "ไม่มีรายละเอียด"}
                        </Paragraph>

                        <Divider style={{ margin: "12px 0" }} />

                        <Space direction="vertical" size="small" style={{ width: "100%" }}>
                          <Space>
                            <CalendarOutlined style={{ color: "#4ECDC4" }} />
                            <Text style={{ fontSize: "13px" }}>
                              {formatWorkTime(work.worktime)}
                            </Text>
                          </Space>

                          <Space>
                            <TeamOutlined style={{ color: "#45B7D1" }} />
                            <Text style={{ fontSize: "13px" }}>
                              รับ {work.workcount ?? 0} | ใช้แล้ว {work.workuse ?? 0}
                            </Text>
                          </Space>

                          <Space>
                            {work.paid ? (
                              <>
                                <DollarOutlined style={{ color: "#96CEB4" }} />
                                <Text
                                  strong
                                  style={{ color: "#27AE60", fontSize: "14px" }}
                                >
                                  {work.paid.toLocaleString()} บาท
                                </Text>
                              </>
                            ) : (
                              <>
                                <HeartOutlined style={{ color: "#FF6B6B" }} />
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
    </div>
  );
};

export default MyPostedWorks;
