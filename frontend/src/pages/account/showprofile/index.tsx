import { useEffect, useState } from "react";
import { Card, Col, Row, Typography, Divider, Avatar, message, Button, Rate } from "antd";
import { UserOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import { GetUserById, GetWorkHistory } from "../../../services/https";
import { UsersInterface } from "../../../interfaces/IUser";

const { Title, Text } = Typography;

const ProfileView = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<UsersInterface>({});
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        const data = await GetUserById(Number(id));
        if (data && data.ID) {
          setUser(data);
          await GetWorkHistory(); // ถ้าไม่ได้ใช้ totalPaid/volunteer ก็ไม่ต้องเก็บ state
        } else {
          messageApi.error("ไม่สามารถโหลดข้อมูลผู้ใช้");
        }
      } catch (error) {
        messageApi.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
        console.error("Fetch error:", error);
      }
    };

    fetchData();
  }, [id]);

  return (
    <div
      style={{
        padding: 80,
        background: "linear-gradient(to bottom right, #f0f4ff, #fafbff)",
        minHeight: "100vh",
      }}
    >
      {contextHolder}
      <Card
        style={{ maxWidth: 1000, margin: "0 auto", borderRadius: 16 }}
        bodyStyle={{ padding: 40 }}
      >
        <Button
          icon={<ArrowLeftOutlined />}
          style={{
            background: "#fff",
            color: "#000",
            borderColor: "#d9d9d9",
            position: "absolute",
            top: 16,
            left: 16,
          }}
          onClick={() => navigate(-1)}
        />

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Avatar
            size={120}
            icon={<UserOutlined />}
            src={user.Profile}
            style={{
              border: "4px solid #e0e0e0",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              marginBottom: 16,
            }}
          />
          <div>
            <Title level={3} style={{ marginBottom: 0 }}>
              {`${user.FirstName ?? "-"} ${user.LastName ?? ""}`}
            </Title>
          </div>
        </div>

        <Row gutter={[24, 24]}>
          <Col span={12}>
            <Text strong>👤 ชื่อ</Text>
            <div>{user.FirstName}</div>
          </Col>
          <Col span={12}>
            <Text strong>👥 นามสกุล</Text>
            <div>{user.LastName}</div>
          </Col>
          <Col span={12}>
            <Text strong>📧 อีเมล</Text>
            <div>{user.Email}</div>
          </Col>
          <Col span={12}>
            <Text strong>⚧ เพศ</Text>
            <div>{user.Gender?.Name ?? "-"}</div>
          </Col>
        </Row>

        <Divider />
        <div style={{ marginTop: 12 }}>
          <Rate disabled value={user.TotalRating ?? 0} />
          <div>
            <Text type="secondary">({user.ReviewCount ?? 0} รีวิว)</Text>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProfileView;
