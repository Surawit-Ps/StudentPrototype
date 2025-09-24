import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  GetBookingByWorkId,
  GetUserById,
  CreateCheckIn,
  GetWorkById,
  GetCheckIns,
  DeleteAllCheckInByWorkID,
} from "../../../services/https";
import { BookingInterface } from "../../../interfaces/IBooking";
import { UsersInterface } from "../../../interfaces/IUser";
import { WorkInterface } from "../../../interfaces/IWork";
import {
  Card,
  Button,
  Typography,
  Spin,
  message,
  List,
  Divider,
  Descriptions,
} from "antd";
import Navbar from "../../../components/Navbar/Navbar";
import EnhancedFooter from "../../../components/Footer/EnhancedFooter";
import dayjs from "dayjs";
import "dayjs/locale/th";

const { Title } = Typography;

const CreateCheckInPage: React.FC = () => {
  const { workId } = useParams();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UsersInterface[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [work, setWork] = useState<WorkInterface | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!workId) return;

      try {
        const workData = await GetWorkById(Number(workId));
        setWork(workData);

        const bookings: BookingInterface[] = await GetBookingByWorkId(Number(workId));
        const checkins = await GetCheckIns();

        // เลือก user ที่ยังไม่มี checkin
        const unCheckedInUserIds = bookings
          .filter(
            (b) =>
              !checkins.some(
                (c: { user_id: number | undefined; work_id: number | undefined; }) => c.user_id === b.user_id && c.work_id === b.work_id
              )
          )
          .map((b) => b.user_id);

        const userList: UsersInterface[] = [];
        for (const uid of unCheckedInUserIds) {
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

  // toggle เช็คอิน/เลิกเช็คอิน
  const toggleCheckIn = (userId: number) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  // ยิง API เช็คอินทั้งหมด
  const handleConfirmCheckIn = async () => {
    if (!workId) return;
    if (selectedUsers.length === 0) {
      message.warning("กรุณาเลือกผู้เข้าร่วมก่อน");
      return;
    }

    try {
      for (const uid of selectedUsers) {
        await CreateCheckIn({
          user_id: uid,
          work_id: Number(workId),
        });
      }
      message.success("เช็คอินทั้งหมดสำเร็จ");
      navigate(`/work/complete/${workId}`);
    } catch (err) {
      console.error(err);
      message.error("เช็คอินล้มเหลว");
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
          <Title
            level={2}
            style={{
              textAlign: "center",
              color: "#112D4E",
              marginBottom: "20px",
            }}
          >
            📝 เช็คอินผู้เข้าร่วม
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
              <Title
                level={4}
                style={{ color: "#112D4E", marginBottom: "15px" }}
              >
                {work.title}
              </Title>

              <Descriptions column={1} bordered size="middle">
                <Descriptions.Item label="รายละเอียด">
                  {work.description || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="สถานที่">
                  {work.place || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="วันเวลา">
                  {work.worktime
                    ? `${dayjs(work.worktime)
                        .locale("th")
                        .format("D MMMM")} ${
                        dayjs(work.worktime).year() + 543
                      } เวลา ${dayjs(work.worktime).format("HH:mm")} น.`
                    : "-"}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          )}

          <Divider style={{ borderColor: "#112D4E" }}>
            รายชื่อผู้ยังไม่ได้เช็คอิน
          </Divider>

          {users.length === 0 ? (
            <p style={{ textAlign: "center", color: "#112D4E" }}>
              ไม่มีผู้เข้าร่วมที่ยังไม่ได้เช็คอิน
            </p>
          ) : (
            <List
              itemLayout="horizontal"
              dataSource={users}
              renderItem={(user, index) => {
                const isSelected = selectedUsers.includes(user.ID ?? -1);
                return (
                  <List.Item
                    style={{
                      background: index % 2 === 0 ? "#f0f4ff" : "#e6ecff",
                      borderRadius: "8px",
                      marginBottom: "8px",
                      padding: "12px 20px",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <span style={{ color: "#112D4E", fontWeight: 600 }}>
                        {user.FirstName} {user.LastName}
                      </span>
                      <span style={{ color: "#555", marginLeft: "10px" }}>
                        ({user.Email})
                      </span>
                    </div>
                    <Button
                      type={isSelected ? "default" : "primary"}
                      style={{
                        backgroundColor: isSelected ? "#fff" : "#112D4E",
                        borderColor: "#112D4E",
                        color: isSelected ? "#112D4E" : "#fff",
                      }}
                      onClick={() => user.ID && toggleCheckIn(user.ID)}
                    >
                      {isSelected ? "เลิกเช็คอิน" : "เช็คอิน"}
                    </Button>
                  </List.Item>
                );
              }}
            />
          )}

          {users.length > 0 && (
            <div style={{ textAlign: "center", marginTop: "30px" }}>
              <Button
                type="primary"
                style={{
                  backgroundColor: "#112D4E",
                  borderColor: "#112D4E",
                  color: "#fff",
                  padding: "0 30px",
                  fontSize: "16px",
                }}
                onClick={handleConfirmCheckIn}
              >
                ✅ ยืนยันเช็คอินทั้งหมด
              </Button>
            </div>
          )}
        </div>
      </div>
      <EnhancedFooter />
    </>
  );
};

export default CreateCheckInPage;
