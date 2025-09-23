import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  GetBookingByWorkId,
  GetUserById,
  UpdateBooking,
  CreateReview,
  GetReviewsByUserAndWork,
} from "../../services/https";
import { BookingInterface } from "../../interfaces/IBooking";
import { UsersInterface } from "../../interfaces/IUser";
import { ReviewInterface } from "../../interfaces/IReview";
import EnhancedFooter from "../../components/Footer/EnhancedFooter";
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
    if (reviewRating === 0 || reviewComment.trim() === "") {
      message.warning("กรุณาเลือกคะแนนและกรอกความคิดเห็นก่อนบันทึก");
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
    <>
      <div style={{ background: "#F9F7F7", minHeight: "100vh" }}>
        <Navbar />
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 16px" }}>

          {/* Header */}
          <div style={{ marginBottom: 32, textAlign: "center" }}>
            <Title level={2} style={{ color: "#112D4E" }}>
              <TeamOutlined /> รายชื่อผู้ลงทะเบียน
            </Title>
            <Text style={{ color: "#3F72AF", fontSize: 16 }}>
              จัดการการเช็คชื่อผู้เข้าร่วมงาน
            </Text>
          </div>

          {/* Search & Filter */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12}>
              <Search
                placeholder="ค้นหาชื่อหรืออีเมล"
                onChange={(e) => setSearchText(e.target.value)}
                enterButton={<SearchOutlined />}
                allowClear
                size="large"
              />
            </Col>
            <Col xs={24} sm={12}>
              <Select
                style={{ width: "100%" }}
                value={filterStatus}
                onChange={setFilterStatus}
                suffixIcon={<FilterOutlined />}
                size="large"
              >
                <Option value="all">ทั้งหมด</Option>
                <Option value="checked">เช็คชื่อแล้ว</Option>
                <Option value="not-checked">ยังไม่เช็คชื่อ</Option>
              </Select>
            </Col>
          </Row>

          {/* User List */}
          <List
            dataSource={filteredUsers}
            itemLayout="horizontal"
            split={false}
            renderItem={(user) => (
              <List.Item
                style={{
                  background: "#DBE2EF",
                  borderRadius: 12,
                  marginBottom: 12,
                  padding: "16px 24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
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
                      style={{ backgroundColor: "#3F72AF", borderColor: "#3F72AF" }}
                      onClick={() => handleCheckIn(user.ID!)}
                    >
                      เช็คชื่อ
                    </Button>
                  ),
                  <Button
                    type={user.checkedIn || user.hasReviewed ? "default" : "primary"}
                    onClick={() => openReviewModal(user)}
                    disabled={user.checkedIn || user.hasReviewed}
                    style={{
                      backgroundColor:
                        user.checkedIn || user.hasReviewed ? undefined : "#112D4E",
                      color:
                        user.checkedIn || user.hasReviewed ? undefined : "#F9F7F7",
                    }}
                  >
                    {user.checkedIn ? "รีวิวเรียบร้อย" : user.hasReviewed ? "รีวิวแล้ว" : "รีวิว"}
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Badge dot color={user.checkedIn ? "green" : "gray"}>
                      <Avatar
                        src={user.Profile}
                        icon={!user.Profile && <UserOutlined />}
                        size={48}
                      />
                    </Badge>
                  }
                  title={
                    <span>
                      <Link
                        to={`/account/showprofile/${user.ID}`}
                        style={{
                          color: "#112D4E",
                          fontWeight: 600,
                          fontSize: 16,
                        }}
                      >
                        {user.FirstName} {user.LastName}
                      </Link>
                      {user.checkedIn && (
                        <Tag
                          color="success"
                          icon={<CheckCircleOutlined />}
                          style={{ marginLeft: 12 }}
                        >
                          เช็คชื่อเรียบร้อย
                        </Tag>
                      )}
                    </span>
                  }
                  description={<Text style={{ color: "#112D4E" }}>{user.Email}</Text>}
                />
              </List.Item>
            )}
          />

          {/* Action Buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 16,
              marginTop: 32,
            }}
          >
            <Button
              size="large"
              onClick={() => navigate(-1)}
              style={{ minWidth: 220, backgroundColor: "#112D4E", color: "#F9F7F7" }}
            >
              ย้อนกลับ
            </Button>
            <Button
              type="primary"
              size="large"
              loading={saving}
              onClick={handleSaveAll}
              style={{ minWidth: 220, backgroundColor: "#3F72AF", borderColor: "#3F72AF" }}
            >
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
                  <div style={{ fontWeight: 600, color: "#112D4E" }}>
                    รีวิวของ {currentReviewUser?.FirstName} {currentReviewUser?.LastName}
                  </div>
                  <div style={{ fontSize: 12, color: "#3F72AF" }}>
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
              disabled: reviewRating === 0 || reviewComment.trim() === "",
            }}
          >
            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ color: "#112D4E" }}>
                ให้คะแนน:{" "}
              </Text>
              <Rate
                value={reviewRating}
                onChange={setReviewRating}
                tooltips={["แย่มาก", "พอใช้", "ดี", "ดีมาก", "เยี่ยม"]}
              />
            </div>
            <div>
              <Text strong style={{ color: "#112D4E" }}>
                ความคิดเห็น:{" "}
              </Text>
              <Input.TextArea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="เขียนความคิดเห็นของคุณที่นี่..."
                autoSize={{ minRows: 4, maxRows: 6 }}
                style={{ marginTop: 8 }}
              />
            </div>
          </Modal>
        </div>
      </div>
      <EnhancedFooter />
    </>
  );
};

export default BookingWork;
