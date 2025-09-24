import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  GetBookingByWorkId,
  GetUserById,
  CreateWorkHistory,
  GetWorkById,
  DeleteAllCheckInByWorkID,
  UpdateWork,
} from "../../services/https";
import { BookingInterface } from "../../interfaces/IBooking";
import { UsersInterface } from "../../interfaces/IUser";
import { WorkInterface } from "../../interfaces/IWork";
import { Card, Button, Typography, Spin, message, List, Divider, Descriptions } from "antd";
import Navbar from "../../components/Navbar/Navbar";
import EnhancedFooter from "../../components/Footer/EnhancedFooter";
import { IWorkHistory } from "../../interfaces/IWorkHistory";
import dayjs from "dayjs";
import "dayjs/locale/th";

const { Title } = Typography;

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
        const checkedInBookings = bookings.filter((b) => b.status === "checked-in");

        const checkedInUserIds = checkedInBookings.map((b) => b.user_id);

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

  const handleCompleteWork = async () => {
    if (!work) {
      message.error("ไม่พบข้อมูลงาน");
      return;
    }

    try {
      // สร้าง WorkHistory สำหรับผู้เข้าร่วมทั้งหมด
      for (const user of users) {
        const data: IWorkHistory = {
          user_id: user.ID ?? 0,
          work_id: Number(workId),
          paid_amount: work.paid ?? null,
          volunteer_hour: work.volunteer ?? null,
        };
        await CreateWorkHistory(data);
      }

      // ลบ CheckIn ทั้งหมดของงานนี้
      if (workId) {
        await DeleteAllCheckInByWorkID(Number(workId));
      }

      // อัปเดต work_use เป็น 0
      await UpdateWork(Number(workId), {
        ...(work as WorkInterface),
        ID: work.ID,
        workuse: 0
      });

      message.success("จบงานสำเร็จ");
      navigate("/myworks");
    } catch (err) {
      console.error(err);
      message.error("จบงานล้มเหลว");
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
          minHeight: "100vh",
          padding: "20px",
          backgroundColor: "#F9F7F7",
        }}
      >
        <div style={{ maxWidth: "900px", width: "100%" }}>
          <Title level={2} style={{ textAlign: "center", color: "#112D4E", marginBottom: "20px" }}>
            📋 สรุปงาน
          </Title>

          {work && (
            <Card
              style={{
                marginBottom: "25px",
                borderRadius: "12px",
                backgroundColor: "#ffffff",
                boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
              }}
            >
              <Title level={4} style={{ color: "#112D4E", marginBottom: "15px" }}>
                {work.title}
              </Title>

              <Descriptions column={1} bordered size="middle">
                <Descriptions.Item label="รายละเอียด">{work.description || "-"}</Descriptions.Item>
                <Descriptions.Item label="สถานที่">{work.place || "-"}</Descriptions.Item>
                <Descriptions.Item label="วันเวลา">
                  {work.worktime
                    ? `${dayjs(work.worktime).locale("th").format("D MMMM")} ${
                        dayjs(work.worktime).year() + 543
                      } เวลา ${dayjs(work.worktime).format("HH:mm")} น.`
                    : "-"}
                </Descriptions.Item>
                <Descriptions.Item label="ค่าจ้าง">{work.paid ?? "-"} บาท</Descriptions.Item>
                <Descriptions.Item label="ชั่วโมงอาสา">{work.volunteer ?? "-"} ชั่วโมง</Descriptions.Item>
                <Descriptions.Item label="จำนวนที่รับ">{work.workcount ?? 0} คน</Descriptions.Item>
                <Descriptions.Item label="ผู้เข้าร่วมจริง">{users.length} คน</Descriptions.Item>
              </Descriptions>
            </Card>
          )}

          <Divider style={{ borderColor: "#112D4E" }}>รายชื่อผู้เข้าร่วม</Divider>

          {users.length === 0 ? (
            <p style={{ textAlign: "center", color: "#112D4E" }}>ไม่มีผู้เข้าร่วมงาน</p>
          ) : (
            <List
              itemLayout="horizontal"
              dataSource={users}
              renderItem={(user, index) => (
                <List.Item
                  style={{
                    background: index % 2 === 0 ? "#f0f4ff" : "#e6ecff",
                    borderRadius: "8px",
                    marginBottom: "8px",
                    padding: "12px 20px",
                  }}
                >
                  <span style={{ color: "#112D4E", fontWeight: 600 }}>
                    {user.FirstName} {user.LastName}
                  </span>
                  <span style={{ color: "#555", marginLeft: "10px" }}>
                    ({user.Email})
                  </span>
                </List.Item>
              )}
            />
          )}

          <div style={{ textAlign: "center", marginTop: "30px" }}>
            <Button
              type="default"
              style={{
                marginRight: "10px",
                borderColor: "#112D4E",
                color: "#112D4E",
                padding: "0 30px",
                fontSize: "16px",
              }}
              onClick={() => navigate(`/work/checkin/${workId}`)}
            >
              📝 เช็คอิน
            </Button>
            <Button
              type="primary"
              style={{
                backgroundColor: "#112D4E",
                borderColor: "#112D4E",
                color: "#fff",
                padding: "0 30px",
                fontSize: "16px",
              }}
              onClick={handleCompleteWork}
            >
              ✅ จบงาน
            </Button>
          </div>
        </div>
      </div>
      <EnhancedFooter />
    </>
  );
};

export default CompleteWork;
