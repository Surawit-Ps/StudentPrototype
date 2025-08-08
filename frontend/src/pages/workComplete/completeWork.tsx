import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  GetBookingByWorkId,
  GetCheckIns,
  GetUserById,
  CreateWorkHistory,
  GetWorkById,
} from "../../services/https";
import { BookingInterface } from "../../interfaces/IBooking";
import { CheckInInterface } from "../../interfaces/ICheckIn";
import { UsersInterface } from "../../interfaces/IUser";
import { WorkInterface } from "../../interfaces/IWork";
import { Table, Button, Typography, Spin, message } from "antd";
import Navbar from "../../components/Navbar/Navbar";

const { Title } = Typography;

// interface สำหรับส่งข้อมูล WorkHistory ไป API (ใช้ snake_case)
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
        // ดึงข้อมูลงาน
        const workData = await GetWorkById(Number(workId));
        setWork(workData);

        // ดึง booking & checkin
        const bookings: BookingInterface[] = await GetBookingByWorkId(Number(workId));
        const checkins: CheckInInterface[] = await GetCheckIns();

        // หา booking ที่ checked-in
        const checkedInBookings = bookings.filter((b) => b.status === "checked-in");

        // กรองเฉพาะที่มี check-in record
        const checkedInUserIds = checkedInBookings
          .filter((b) =>
            checkins.some(
              (c) => c.user_id === b.user_id && c.work_id === b.work_id
            )
          )
          .map((b) => b.user_id);

        // ดึงข้อมูลผู้ใช้
        const userList: UsersInterface[] = [];
        for (const uid of checkedInUserIds) {
          const userData = await GetUserById(uid);
          if (userData) {
            userList.push(userData);
          }
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
        const data: WorkHistoryPayload = {
          user_id: user.ID,
          work_id: Number(workId),
          paid_amount: typeof work.paid === "number" ? work.paid : 0,
          volunteer_hour: typeof work.volunteer === "number" ? work.volunteer : 0,
        };

        // แสดงข้อมูลใน console ก่อนบันทึก
        console.log("กำลังส่ง WorkHistory:", data);

        await CreateWorkHistory(data);
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
      <div style={{ padding: "20px" }}>
        <Title level={2}>สรุปผู้ทำงาน</Title>
        {work && (
          <div style={{ marginBottom: "15px" }}>
            <p>
              <strong>ชื่องาน:</strong> {work.title}
            </p>
            <p>
              <strong>ค่าจ้าง:</strong> {work.paid ?? 0}
            </p>
            <p>
              <strong>ชั่วโมงอาสา:</strong> {work.volunteer ?? 0}
            </p>
          </div>
        )}
        <Table
          dataSource={users}
          rowKey="ID"
          columns={[
            { title: "ชื่อ", dataIndex: "FirstName", key: "FirstName" },
            { title: "นามสกุล", dataIndex: "LastName", key: "LastName" },
            { title: "อีเมล", dataIndex: "Email", key: "Email" },
          ]}
        />
        <Button
          type="primary"
          style={{ marginTop: "20px" }}
          onClick={handleCreateWorkHistory}
        >
          บันทึกเป็น Work History
        </Button>
      </div>
    </>
  );
};

export default CompleteWork;
