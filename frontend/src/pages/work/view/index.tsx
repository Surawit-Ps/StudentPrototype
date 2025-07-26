import { useEffect, useState } from "react";
import {
  Layout,
  Row,
  Col,
  Card,
  Typography,
  Input,
  Select,
  Button,
  Pagination,
  Space,
  Empty,
  Progress,
  message,
  Badge,
} from "antd";
import {
  SearchOutlined,
  CalendarOutlined,
  TeamOutlined,
  EnvironmentOutlined,
  FilterOutlined,
  FileSearchOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { WorkInterface } from "../../../interfaces/IWork";
import { GetWork } from "../../../services/https";
import { DollarOutlined, HeartFilled } from "@ant-design/icons";
import Navbar from "../../../components/Navbar/Navbar";

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const WorkView = () => {
  const [works, setWorks] = useState<WorkInterface[]>([]);
  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const pageSize = 9;


  const fetchWorkList = async () => {
    try {
      const res = await GetWork();
      if (res) setWorks(res);
      else messageApi.error("ไม่สามารถโหลดข้อมูลงานได้");
    } catch (err) {
      messageApi.error("เกิดข้อผิดพลาดในการโหลดงาน");
    }
  };



  useEffect(() => {
    fetchWorkList();
  }, []);

  const filteredWorks = works.filter((work) => {
    const matchesSearch = (work.title || "").toLowerCase().includes(searchText.toLowerCase());
    const matchesType =
      filterType === "" ||
      (filterType === "volunteer" && work.worktype_id === 2) ||
      (filterType === "paid" && work.worktype_id === 1);
    const matchesStatus =
      filterStatus === "" ||
      (filterStatus === "open" && work.workstatus_id === 1) ||
      (filterStatus === "closed" && work.workstatus_id === 2);
    return matchesSearch && matchesType && matchesStatus;
  });

  const paginatedWorks = filteredWorks.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getProgressColor = (used: number, total: number) => {
    const percentage = (used / total) * 100;
    if (percentage <= 40) return "#52c41a";
    if (percentage <= 70) return "#faad14";
    return "#ff4d4f";
  };

  return (
    <>
      <Navbar />
      <Layout style={{ backgroundColor: "#F9F7F7", minHeight: "100vh" }}>
        <Content style={{ padding: 0 }}>
          {contextHolder}
          <div
            style={{
              background: "linear-gradient(135deg, #3F72AF 0%, #4b7bb1ff 100%)",
              color: "white",
              padding: "1px 24px 40px",
              marginTop: 24,
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: "50%",
                height: "100%",
                background: "rgba(255,255,255,0.05)",
                transform: "skewX(-15deg)",
              }}
            />
            <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 2 }}>
              <Title level={1} style={{ color: "white", fontSize: "3rem", fontWeight: "bold", textAlign: "center" }}>
                ค้นหางานที่ใช่สำหรับคุณ
              </Title>
              <Paragraph style={{ color: "rgba(255,255,255,0.9)", fontSize: "1.2rem", textAlign: "center" }}>
                เชื่อมต่อโอกาสดีๆ ทั้งงานจิตอาสาและงานพาร์ทไทม์ในพื้นที่ของคุณ
              </Paragraph>

              <Card
                style={{
                  background: "rgba(255,255,255,0.2)",
                  backdropFilter: "blur(10px)",
                  borderRadius: 16,
                  border: "none",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                  maxWidth: 1200,
                  margin: "0 auto",
                }}
                bodyStyle={{ padding: "24px" }}
              >
                <Row gutter={[16, 16]} justify="center" align="middle">
                  <Col>
                    <Search
                      placeholder="🔍 ค้นหาชื่องาน..."
                      allowClear
                      size="large"
                      onChange={(e) => setSearchText(e.target.value)}
                      value={searchText}
                      style={{ width: 400 }}
                      prefix={<SearchOutlined style={{ color: "#3F72AF" }} />}
                    />
                  </Col>

                  <Col>
                    <Select
                      defaultValue=""
                      onChange={setFilterType}
                      size="large"
                      style={{ width: 250 }}
                      placeholder="ประเภทงาน"
                      suffixIcon={<FilterOutlined style={{ color: "#3F72AF" }} />}
                    >
                      <Option value="">ทุกประเภท</Option>
                      <Option value="volunteer">

                        งานจิตอาสา
                      </Option>

                      <Option value="paid">

                        งานค่าตอบแทน
                      </Option>
                    </Select>
                  </Col>

                  <Col>
                    <Select
                      defaultValue=""
                      onChange={setFilterStatus}
                      size="large"
                      style={{ width: 250 }}
                      placeholder="สถานะ"
                      suffixIcon={<FilterOutlined style={{ color: "#3F72AF" }} />}
                    >
                      <Option value="">ทุกสถานะ</Option>
                      <Option value="open">เปิดรับสมัคร</Option>
                      <Option value="closed"> ปิดรับสมัคร</Option>
                    </Select>
                  </Col>

                  <Col>
                    <Text strong style={{ color: "#ffffff", fontSize: "16px" }}>
                      งานที่พบ {filteredWorks.length} งาน
                    </Text>
                  </Col>
                </Row>
              </Card>
            </div>
          </div>

          <div style={{ padding: "40px 24px", maxWidth: 1200, margin: "0 auto" }}>
            {filteredWorks.length === 0 ? (
              <Empty
                description="ไม่พบงานที่ตรงกับเงื่อนไขการค้นหา"
                style={{
                  padding: "60px 0",
                  background: "white",
                  borderRadius: 16,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
                }}
              />
            ) : (
              <>
                <Row gutter={[24, 24]}>
                  {paginatedWorks.map((work) => (
                    <Col xs={24} sm={12} lg={8} key={work.ID}>
                      <Card
                        hoverable
                        style={{
                          borderRadius: 16,
                          overflow: "hidden",
                          border: "none",
                          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                          background: "white",
                        }}
                        bodyStyle={{ padding: 0 }}
                      >
                        <div style={{ position: "relative" }}>
                          <img
                            alt={work.title}
                            src={work.photo}
                            style={{ width: "100%", height: 180, objectFit: "cover" }}
                          />
                          <div
                            style={{
                              position: "absolute",
                              top: 12,
                              right: 12,
                              background: work.worktype_id === 1 ? "#faad14" : "#ff7875",
                              color: "white",
                              padding: "4px 12px",
                              borderRadius: 20,
                              fontSize: "15px",
                              fontWeight: "bold",
                            }}
                          >
                            {work.worktype_id === 1 ? (
  <>
    <DollarOutlined /> มีค่าตอบแทน
  </>
) : (
  <>
    <HeartFilled style={{ color: "white" }} /> จิตอาสา
  </>
)}
                          </div>
                          <Badge
                            count={work.workstatus_id === 1 ? "เปิดรับสมัคร" : "ปิดรับสมัคร"}
                            style={{
                              position: "absolute",
                              top: 12,
                              left: 12,
                              backgroundColor: work.workstatus_id === 1 ? "#52c41a" : "#ff4d4f",
                            }}
                          />
                        </div>

                        <div style={{ padding: "20px" }}>
                          <Title level={5} style={{ margin: "0 0 8px", color: "#112D4E", fontSize: "18px" }}>
                            {work.title}
                          </Title>
                          <Paragraph
                            ellipsis={{ rows: 2 }}
                            style={{ margin: "0 0 16px", color: "#666", lineHeight: 1.6 }}
                          >
                            {work.description}
                          </Paragraph>

                          <Space direction="vertical" size="small" style={{ width: "100%" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <CalendarOutlined style={{ color: "#3F72AF" }} />
                              <Text style={{ fontSize: "13px", color: "#666" }}>
                                {work.worktime && new Date(work.worktime).toLocaleString("th-TH", {
                                  dateStyle: "short",
                                  timeStyle: "short",
                                })}
                              </Text>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <EnvironmentOutlined style={{ color: "#3F72AF" }} />
                              <Text ellipsis style={{ fontSize: "13px", color: "#666", flex: 1 }}>
                                {work.place}
                              </Text>
                            </div>

                            <div>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <Text style={{ fontSize: "12px", color: "#666" }}>
                                  <TeamOutlined /> {work.workuse ?? 0}/{work.workcount ?? 0} คน
                                </Text>
                                <Text style={{ fontSize: "12px", color: "#666" }}>
                                  {Math.round(((work.workuse ?? 0) / (work.workcount ?? 1)) * 100)}%
                                </Text>
                              </div>
                              <Progress
                                percent={((work.workuse ?? 0) / (work.workcount ?? 1)) * 100}
                                showInfo={false}
                                strokeColor={getProgressColor(work.workuse ?? 0, work.workcount ?? 1)}
                                strokeWidth={6}
                              />
                            </div>

                            <Button
  type="primary"
  size="large"
  block
  style={{
    marginTop: 2,
    backgroundColor: "#5bace2ff",
    fontWeight: "bold",
    height: 48,
  }}
  onClick={(e) => {
    e.stopPropagation();
    navigate(`/work/info/${work.ID}`);
  }}
>
  <FileSearchOutlined style={{ fontSize: 18 }} />
                               แสดงรายละเอียดงาน
                            </Button>
                          </Space>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>

               <div style={{ textAlign: "center", marginTop: 40 }}>
  <Pagination
    current={currentPage}
    pageSize={pageSize}
    total={filteredWorks.length}
    onChange={(page) => {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" }); // ให้เลื่อนขึ้นข้างบนเวลาเปลี่ยนหน้า
    }}
    showSizeChanger={false}
    showQuickJumper={false} // ❌ เอา Go to Page ออก
    style={{ display: "inline-block" }} // ✅ ทำให้สามารถจัดตรงกลางได้
  />
</div>
              </>
            )}
          </div>
        </Content>
      </Layout>
    </>
  );
};

export default WorkView;