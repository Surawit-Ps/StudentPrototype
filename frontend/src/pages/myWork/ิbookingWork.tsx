import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  GetBookingByWorkId,
  GetUserById,
  UpdateBooking,
} from "../../services/https";
import { BookingInterface } from "../../interfaces/IBooking";
import { UsersInterface } from "../../interfaces/IUser";
import Navbar from "../../components/Navbar/Navbar";
import {
  List,
  Avatar,
  Typography,
  Button,
  message,
  Spin,
  Row,
  Col,
  Input,
  Select,
  Tag,
  Badge,
  Tooltip,
} from "antd";
import {
  UserOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  SearchOutlined,
  FilterOutlined,
  TeamOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

interface CheckedUser extends UsersInterface {
  checkedIn: boolean;
  checkInTime?: Date;
  bookingId: number;
}

const BookingWork: React.FC = () => {
  const { workId } = useParams<{ workId: string }>();
  const navigate = useNavigate();

  const [users, setUsers] = useState<CheckedUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<CheckedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!workId) return;
      try {
        const bookings: BookingInterface[] = await GetBookingByWorkId(Number(workId));
        const userList: CheckedUser[] = [];
        for (const booking of bookings) {
          const user = await GetUserById(booking.user_id!);
          if (user) {
            userList.push({
              ...user,
              checkedIn: booking.status === "checked-in",
              checkInTime: booking.status === "checked-in" ? new Date() : undefined,
              bookingId: booking.ID!, // booking ID
            });
          }
        }
        setUsers(userList);
        setFilteredUsers(userList);
      } catch {
        message.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      }
      setLoading(false);
    };
    fetchBookings();
  }, [workId]);

  useEffect(() => {
    let filtered = users;
    if (searchText) {
      filtered = filtered.filter(
        (user) =>
          `${user.FirstName} ${user.LastName}`.toLowerCase().includes(searchText.toLowerCase()) ||
          user.Email?.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    if (filterStatus === "checked") {
      filtered = filtered.filter((user) => user.checkedIn);
    } else if (filterStatus === "not-checked") {
      filtered = filtered.filter((user) => !user.checkedIn);
    }
    setFilteredUsers(filtered);
  }, [searchText, filterStatus, users]);

  const handleCheckIn = (userId: number) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.ID === userId ? { ...u, checkedIn: true, checkInTime: new Date() } : u
      )
    );
    message.success("เช็คชื่อเรียบร้อย");
  };

  const handleUndoCheckIn = (userId: number) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.ID === userId ? { ...u, checkedIn: false, checkInTime: undefined } : u
      )
    );
    message.info("ยกเลิกเช็คชื่อแล้ว");
  };

  const handleSaveAll = async () => {
  setSaving(true);
  try {
    for (const user of users) {
      const bookingStatus = user.checkedIn ? "checked-in" : "absent";
      const updateData = {
        user_id: user.ID,       // ส่ง user_id ด้วย
        work_id: Number(workId), // ส่ง work_id ด้วย (มาจาก useParams)
        status: bookingStatus,   // ส่ง status ด้วย
      };
      console.log(`Updating Booking ID: ${user.bookingId} with Data:`, updateData);
      await UpdateBooking(user.bookingId, updateData);
    }
    message.success("บันทึกสถานะเช็คชื่อเรียบร้อยแล้ว");
  } catch (error) {
    console.error(error);
    message.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
  }
  setSaving(false);
};


  if (loading) {
    return (
      <div
        style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ background: "#f0f2f5", minHeight: "100vh" }}>
      <Navbar />
      <div style={{ padding: "24px 16px" }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          style={{ marginBottom: 16 }}
        >
          กลับ
        </Button>

        <Title level={2}>
          <TeamOutlined /> รายชื่อผู้ลงทะเบียน
        </Title>
        <Text>จัดการการเช็คชื่อผู้เข้าร่วมงาน</Text>

        <Row gutter={16} style={{ marginTop: 24, marginBottom: 16 }}>
          <Col xs={24} sm={12}>
            <Search
              placeholder="ค้นหาชื่อหรืออีเมล"
              onChange={(e) => setSearchText(e.target.value)}
              enterButton={<SearchOutlined />}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12}>
            <Select
              style={{ width: "100%" }}
              value={filterStatus}
              onChange={setFilterStatus}
              suffixIcon={<FilterOutlined />}
            >
              <Option value="all">ทั้งหมด</Option>
              <Option value="checked">เช็คชื่อแล้ว</Option>
              <Option value="not-checked">ยังไม่เช็คชื่อ</Option>
            </Select>
          </Col>
        </Row>

        <List
          dataSource={filteredUsers}
          renderItem={(user) => (
            <List.Item
              style={{ background: "white", borderRadius: 8, marginBottom: 12, padding: 16 }}
              actions={[
                user.checkedIn ? (
                  <Tooltip title="ยกเลิกเช็คชื่อ" key="undo-checkin">
                    <Button
                      type="text"
                      danger
                      onClick={() => handleUndoCheckIn(user.ID!)}
                    >
                      ยกเลิก
                    </Button>
                  </Tooltip>
                ) : (
                  <Button
                    type="primary"
                    key="checkin"
                    onClick={() => handleCheckIn(user.ID!)}
                  >
                    เช็คชื่อ
                  </Button>
                ),
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Badge dot color={user.checkedIn ? "green" : "gray"}>
                    <Avatar src={user.Profile} icon={!user.Profile && <UserOutlined />} />
                  </Badge>
                }
                title={
                  <span>
                    {user.FirstName} {user.LastName}{" "}
                    {user.checkedIn && (
                      <Tag
                        color="success"
                        icon={<CheckCircleOutlined />}
                        style={{ marginLeft: 8 }}
                      >
                        มาแล้ว
                      </Tag>
                    )}
                  </span>
                }
                description={user.Email}
              />
            </List.Item>
          )}
        />

        <div style={{ textAlign: "center", marginTop: 24 }}>
          <Button
            type="primary"
            size="large"
            loading={saving}
            onClick={handleSaveAll}
          >
            บันทึกสถานะเช็คชื่อทั้งหมด
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookingWork;
