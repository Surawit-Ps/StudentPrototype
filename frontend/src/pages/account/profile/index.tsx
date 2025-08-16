import React, { useEffect, useState } from "react";
import { Card, Col, Row, Typography, Divider, Avatar, message, Button, Statistic } from "antd";
import { UserOutlined, EditOutlined, ArrowLeftOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import { GetUserById } from "../../../services/https";
import { UsersInterface } from "../../../interfaces/IUser";
import { GetWorkHistory } from "../../../services/https";
// import { WorkHistoryInterface } from "../../../interfaces/IHistorywork";
// import { GendersInterface } from "../../../interfaces/IGender";
// import { UserStatusInterface } from "../../../interfaces/IUserStatus";

const { Title, Text } = Typography;

const ProfileView = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<UsersInterface>({});
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const [paidAmountTotal, setPaidAmountTotal] = useState<number>(0);
  const [volunteerHourTotal, setVolunteerHourTotal] = useState<number>(0);


  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        // 1. ดึงข้อมูลผู้ใช้
        const data = await GetUserById(Number(id));
        if (data && data.ID) {
          setUser(data);

          // 2. ดึงข้อมูล WorkHistory ทั้งหมด
          const histories = await GetWorkHistory();

          if (histories && Array.isArray(histories)) {
            // ดึงเฉพาะของ user คนนี้
            const userHistories = histories.filter(
              (h: any) => h.User?.ID === data.ID
            );

            // รวมค่าตอบแทน (paid) และชั่วโมงจิตอาสา (volunteer)
            const totalPaid = userHistories.reduce(
              (sum: number, h: any) => sum + (h.Work?.paid || 0),
              0
            );
            const totalVolunteer = userHistories.reduce(
              (sum: number, h: any) => sum + (h.Work?.volunteer || 0),
              0
            );

            setPaidAmountTotal(totalPaid);
            setVolunteerHourTotal(totalVolunteer);
          }
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


  const calculateAge = (birthdate: string): number => {
    const birth = new Date(birthdate);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div style={{ padding: 80, background: "linear-gradient(to bottom right, #f0f4ff, #fafbff)", minHeight: "100vh" }}>
      {contextHolder}
      <Card style={{ maxWidth: 1000, margin: "0 auto", borderRadius: 16 }} bodyStyle={{ padding: 40 }}>
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
          onClick={() => navigate("/")}
        />

        <Button
          type="primary"
          icon={<EditOutlined />}
          style={{ position: "absolute", top: 16, right: 16 }}
          onClick={() => navigate(`/account/edit/${user.ID}`)}
        />
        <div style={{
          position: "absolute",
          top: 64,
          right: 16,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 16,
          width: 200
        }}>
          <Card
            bordered={false}
            style={{
              borderRadius: 12,
              backgroundColor: "#e8f5e9",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              textAlign: "center"
            }}
          >
            <Statistic
  title="ค่าตอบแทน"
  value={paidAmountTotal}
  precision={0}
  prefix="฿"
  suffix="บาท"
  valueStyle={{ color: "#2e7d32", fontWeight: "bold" }}
/>

          </Card>

          <Card
            bordered={false}
            style={{
              borderRadius: 12,
              backgroundColor: "#e3f2fd",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              textAlign: "center"
            }}
          >
            <Statistic
              title="ชั่วโมงจิตอาสา"
              value={volunteerHourTotal}
              precision={0}
              prefix={<ClockCircleOutlined style={{ color: "#1890ff" }} />}
              suffix="ชม."
              valueStyle={{ color: "#1565c0", fontWeight: "bold" }}
            />
          </Card>
        </div>



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
            <Text type="secondary">
              อายุ {user.BirthDay ? calculateAge(user.BirthDay) : "-"} ปี
            </Text>
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
            <Text strong>🎂 วันเกิด</Text>
            <div>{user.BirthDay ? new Date(user.BirthDay).toLocaleDateString("th-TH") : "-"}</div>
          </Col>
          <Col span={12}>
            <Text strong>⚧ เพศ</Text>
            <div>{user.Gender?.Name ?? "-"}</div>
          </Col>
          {/* <Col span={12}>
            <Text strong>📞 เบอร์ติดต่อ</Text>
            <div>{user.Contact}</div>
          </Col> */}
        </Row>

        <Divider />
        {/* <Row gutter={[16, 8]}>
          <Col span={24}>
            <Text strong>งานล่าสุด</Text>
            <div>-</div>
          </Col>
          <Col span={8}>
            <Text strong>การสร้างงาน</Text>
            <div>-</div>
          </Col>
        </Row> */}
      </Card>
    </div>
  );
};

export default ProfileView;
