import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  GetBookingByWorkId,
  GetUserById,
  UpdateBooking,
  CreateReview,
  GetReviewsByUserAndWork, // ต้องมีฟังก์ชันนี้ใน services/https
} from "../../services/https";
import { BookingInterface } from "../../interfaces/IBooking";
import { UsersInterface } from "../../interfaces/IUser";
import { ReviewInterface } from "../../interfaces/IReview";
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
  Modal,
  Rate,
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
  hasReviewed?: boolean;
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

  // --- Review Modal ---
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [currentReviewUser, setCurrentReviewUser] = useState<CheckedUser | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(0);
  const [reviewComment, setReviewComment] = useState<string>("");

  const openReviewModal = (user: CheckedUser) => {
    setCurrentReviewUser(user);
    setReviewRating(0);
    setReviewComment("");
    setIsReviewModalVisible(true);
  };

  const handleSaveReview = async () => {
    if (!currentReviewUser) return;
    if (reviewRating === 0) {
      message.warning("กรุณาเลือกคะแนนและกรอกความคิดก่อนบันทึก");
      return;
    }

    try {
      const reviewData: ReviewInterface = {
        user_id: currentReviewUser.ID!,
        work_id: Number(workId),
        booking_id: currentReviewUser.bookingId,
        rating: reviewRating,
        comment: reviewComment,
      };
      await CreateReview(reviewData);
      message.success("บันทึกรีวิวเรียบร้อยแล้ว");

      // อัปเดตสถานะรีวิวใน state
      setUsers((prev) =>
        prev.map((u) =>
          u.ID === currentReviewUser.ID ? { ...u, hasReviewed: true } : u
        )
      );

      setIsReviewModalVisible(false);
    } catch (error) {
      console.error(error);
      message.error("เกิดข้อผิดพลาดในการบันทึกรีวิว");
    }
  };

  // --- Fetch bookings & users ---
  useEffect(() => {
    const fetchBookings = async () => {
      if (!workId) return;
      try {
        const bookings: BookingInterface[] = await GetBookingByWorkId(Number(workId));
        const userList: CheckedUser[] = [];
        for (const booking of bookings) {
          const user = await GetUserById(booking.user_id!);
          if (user) {
            // ตรวจสอบว่ามีรีวิวงานนี้แล้ว
            const reviews = await GetReviewsByUserAndWork(user.ID!, Number(workId));
            const hasReviewed = reviews.length > 0;

            userList.push({
              ...user,
              checkedIn: booking.status === "checked-in",
              checkInTime: booking.status === "checked-in" ? new Date() : undefined,
              bookingId: booking.ID!,
              hasReviewed,
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

  // --- Filter & search ---
  useEffect(() => {
    let filtered = users;
    if (searchText) {
      filtered = filtered.filter(
        (user) =>
          `${user.FirstName} ${user.LastName}`.toLowerCase().includes(searchText.toLowerCase()) ||
          user.Email?.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    if (filterStatus === "checked") filtered = filtered.filter((u) => u.checkedIn);
    else if (filterStatus === "not-checked") filtered = filtered.filter((u) => !u.checkedIn);
    setFilteredUsers(filtered);
  }, [searchText, filterStatus, users]);

  // --- Check-in functions ---
  const handleCheckIn = (userId: number) => {
    setUsers((prev) =>
      prev.map((u) => (u.ID === userId ? { ...u, checkedIn: true, checkInTime: new Date() } : u))
    );
    message.success("เช็คชื่อเรียบร้อย");
  };

  const handleUndoCheckIn = (userId: number) => {
    setUsers((prev) =>
      prev.map((u) => (u.ID === userId ? { ...u, checkedIn: false, checkInTime: undefined } : u))
    );
    message.info("ยกเลิกเช็คชื่อแล้ว");
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      for (const user of users) {
        const bookingStatus = user.checkedIn ? "checked-in" : "absent";
        const updateData = {
          user_id: user.ID,
          work_id: Number(workId),
          status: bookingStatus,
        };
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
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>
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
                    <Button type="text" danger onClick={() => handleUndoCheckIn(user.ID!)}>
                      ยกเลิก
                    </Button>
                  </Tooltip>
                ) : (
                  <Button type="primary" onClick={() => handleCheckIn(user.ID!)}>
                    เช็คชื่อ
                  </Button>
                ),
                <Button
                  type={user.hasReviewed ? "default" : "primary"}
                  onClick={() => openReviewModal(user)}
                  disabled={user.hasReviewed}
                >
                  {user.hasReviewed ? "รีวิวแล้ว" : "รีวิว"}
                </Button>,
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
                    <Link
                      to={`/account/showprofile/${user.ID}`}
                      style={{ color: "#3F72AF", fontWeight: 500, textDecoration: "none" }}
                    >
                      {user.FirstName} {user.LastName}
                    </Link>
                    {user.checkedIn && (
                      <Tag color="success" icon={<CheckCircleOutlined />} style={{ marginLeft: 8 }}>
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
          <Button type="primary" size="large" loading={saving} onClick={handleSaveAll}>
            บันทึกสถานะเช็คชื่อทั้งหมด
          </Button>
        </div>

        {/* Review Modal */}
        <Modal
          title={
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {currentReviewUser?.Profile ? (
                <Avatar src={currentReviewUser.Profile} size={40} />
              ) : (
                <Avatar icon={<UserOutlined />} size={40} />
              )}
              <div>
                <div style={{ fontWeight: 600 }}>
                  รีวิวของ {currentReviewUser?.FirstName} {currentReviewUser?.LastName}
                </div>
                <div style={{ fontSize: 12, color: "#888" }}>
                  ให้คะแนนและเขียนความคิดเห็นเกี่ยวกับการเข้าร่วมงาน
                </div>
              </div>
            </div>
          }
          visible={isReviewModalVisible}
          onOk={handleSaveReview}
          onCancel={() => setIsReviewModalVisible(false)}
          okText="บันทึก"
          cancelText="ยกเลิก"
          width={500}
          okButtonProps={{
            disabled: reviewRating === 0 || reviewComment.trim() === "", // ถ้าไม่ได้เลือกดาว หรือความคิดเห็นว่าง จะ disable
          }}
        >
          <div style={{ marginBottom: 16 }}>
            <Text strong>ให้คะแนน: </Text>
            <Rate
              value={reviewRating}
              onChange={setReviewRating}
              tooltips={["แย่มาก", "พอใช้", "ดี", "ดีมาก", "เยี่ยม"]}
            />
            {reviewRating === 0 && (
              <div style={{ color: "red", fontSize: 12, marginTop: 4 }}>
                กรุณาเลือกคะแนนและกรอกความคิดเห็นก่อนบันทึก
              </div>
            )}
          </div>
          <div>
            <Text strong>ความคิดเห็น: </Text>
            <Input.TextArea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="เขียนความคิดเห็นของคุณที่นี่..."
              autoSize={{ minRows: 4, maxRows: 6 }}
              style={{ marginTop: 8 }}
            />
            {reviewComment.trim() === "" && (
              <div style={{ color: "red", fontSize: 12, marginTop: 4 }}>

              </div>
            )}
          </div>
        </Modal>

      </div>
    </div>
  );
};

export default BookingWork;
