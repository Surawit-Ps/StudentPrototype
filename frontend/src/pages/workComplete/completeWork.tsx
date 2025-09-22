import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  GetBookingByWorkId,
  GetCheckIns,
  GetUserById,
  CreateWorkHistory,
  GetWorkById,
  DeleteAllBookingByWorkID,
} from "../../services/https";
import { BookingInterface } from "../../interfaces/IBooking";
import { CheckInInterface } from "../../interfaces/ICheckIn";
import { UsersInterface } from "../../interfaces/IUser";
import { WorkInterface } from "../../interfaces/IWork";
import { Card, Button, Typography, Spin, message, Row, Col } from "antd";
import Navbar from "../../components/Navbar/Navbar";
import EnhancedFooter from "../../components/Footer/EnhancedFooter";
import { IWorkHistory } from "../../interfaces/IWorkHistory";

const { Title, Text } = Typography;

interface WorkHistoryPayload {
  user_id: number | undefined;
  work_id: number;
  paid_amount: number;
  volunteer_hour: number;
}

const CompleteWork: React.FC = () => {
  const { workId } = useParams();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UsersInterface[]>([]);
  const [work, setWork] = useState<WorkInterface | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!workId) return;

      try {
        const workData = await GetWorkById(Number(workId));
        setWork(workData);

        const bookings: BookingInterface[] = await GetBookingByWorkId(Number(workId));
        const checkins: CheckInInterface[] = await GetCheckIns();

        const checkedInBookings = bookings.filter((b) => b.status === "checked-in");

        const checkedInUserIds = checkedInBookings
          .filter((b) =>
            checkins.some((c) => c.user_id === b.user_id && c.work_id === b.work_id)
          )
          .map((b) => b.user_id);

        const userList: UsersInterface[] = [];
        for (const uid of checkedInUserIds) {
          const userData = await GetUserById(uid);
          if (userData) userList.push(userData);
        }
        setUsers(userList);
      } catch (err) {
        console.error(err);
        message.error("โหลดข้อมูลล้มเหลว");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [workId]);

  const handleCreateWorkHistory = async () => {
  if (!work) {
    message.error("ไม่พบข้อมูลงาน");
    return;
  }

  try {
    for (const user of users) {
      const data: IWorkHistory = {
        user_id: Number(user),
        work_id: Number(workId),
        paid_amount: typeof work.paid === "number" ? work.paid : null,
        volunteer_hour: typeof work.volunteer === "number" ? work.volunteer : null,
      };

      console.log("กำลังส่ง WorkHistory:", data);
      await CreateWorkHistory(data);
    }

    if (workId) {
      await DeleteAllBookingByWorkID(Number(workId));
      console.log("ลบ Booking ของงานนี้เรียบร้อยแล้ว");
    }

    message.success("บันทึก Work History สำเร็จ");
    navigate("/myworks");
  } catch (err) {
    console.error(err);
    message.error("บันทึก Work History ล้มเหลว");
  }
};


  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div
  style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start", // ชิดด้านบน
    minHeight: "100vh",
    padding: "20px",
    backgroundColor: "#F9F7F7",
  }}
>
  <div style={{ maxWidth: "800px", width: "100%" }}>
    <Title level={2} style={{ textAlign: "center", color: "#112D4E", marginBottom: "20px" }}>
      สรุปผู้ทำงาน
    </Title>

    {work && (
      <Card
        style={{
          marginBottom: "25px",
          borderRadius: "12px",
          backgroundColor: "#DBE2EF",
          textAlign: "center",
        }}
      >
        <Title level={4} style={{ color: "#112D4E" }}>
          {work.title}
        </Title>
        <Text strong>ค่าจ้าง: </Text>
        <Text>{work.paid ?? 0} บาท</Text>
        <br />
        <Text strong>ชั่วโมงอาสา: </Text>
        <Text>{work.volunteer ?? 0} ชั่วโมง</Text>
      </Card>
    )}

    <Row gutter={[16, 16]} justify="center">
      {users.length === 0 && (
        <Col span={24} style={{ textAlign: "center", color: "#112D4E" }}>
          <Text>ไม่มีผู้เข้าร่วมงาน</Text>
        </Col>
      )}
      {users.map((user) => (
        <Col xs={24} sm={12} md={8} key={user.ID}>
          <Card
            hoverable
            style={{
              borderRadius: "12px",
              backgroundColor: "#3F72AF",
              color: "#F9F7F7",
              textAlign: "center",
            }}
            bodyStyle={{ color: "#F9F7F7" }}
          >
            <Title level={5} style={{ color: "#F9F7F7" }}>
              {user.FirstName} {user.LastName}
            </Title>
            <Text style={{ color: "#F9F7F7" }}>{user.Email}</Text>
          </Card>
        </Col>
      ))}
    </Row>

    <div style={{ textAlign: "center", marginTop: "30px" }}>
      <Button
        type="primary"
        style={{
          backgroundColor: "#112D4E",
          borderColor: "#112D4E",
          color: "#DBE2EF",
          padding: "0 30px",
          fontSize: "16px",
        }}
        onClick={handleCreateWorkHistory}
      >
        จบงาน
      </Button>
    </div>
  </div>
</div>
      <EnhancedFooter />
    </>
  );
};

export default CompleteWork;
