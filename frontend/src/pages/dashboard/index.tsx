import { useEffect, useState } from "react";
import {
  Button,
  Col,
  Row,
  Card,
  Table,
  Typography,
  Divider,
  message,
  Layout,
  Modal,
  Input,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { DashboardInterface } from "../../interfaces/IDashboard";
import {
  GetDashboard,
  DeleteDashboardByID,
} from "../../services/https/index";
import AdminSidebar from "../../components/Sider/AdminSidebar";
import styles from "./DashboardTablePage.module.css";

const { Title } = Typography;
const { Content } = Layout;

const DashboardTablePage = () => {
  const [dashboards, setDashboards] = useState<DashboardInterface[]>([]);
  const [filteredDashboards, setFilteredDashboards] = useState<DashboardInterface[]>([]);
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [tablePagination, setTablePagination] = useState({ current: 1, pageSize: 10 });
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const fetchDashboardList = async () => {
    const res = await GetDashboard();
    if (res) {
      setDashboards(res);
      setFilteredDashboards(res);
    } else {
      messageApi.error("ไม่สามารถโหลดข้อมูลกระดานข่าวได้");
    }
  };

  const handleDelete = async (id?: number, subject?: string) => {
    if (!id) return;

    Modal.confirm({
      title: "คุณแน่ใจหรือไม่?",
      content: `คุณต้องการลบข่าวเรื่อง "${subject}" ใช่หรือไม่?`,
      okText: "ลบ",
      okType: "danger",
      cancelText: "ยกเลิก",
      centered: true,
      onOk: async () => {
        const res = await DeleteDashboardByID(id);
        if (res) {
          messageApi.success("ลบสำเร็จ");
          fetchDashboardList();
        } else {
          messageApi.error("ไม่สามารถลบข้อมูลได้");
        }
      },
    });
  };

  useEffect(() => {
    fetchDashboardList();
  }, []);

  useEffect(() => {
    const filtered = dashboards.filter((d) =>
      d.subject?.toLowerCase().includes(searchKeyword.toLowerCase())
    );

    setFilteredDashboards(filtered);
  }, [searchKeyword, dashboards]);

  const columns = [
    {
      title: "ลำดับ",
      key: "index",
      width: 60,
      align: "center" as const,
      render: (_: any, __: any, index: number) => {
        const { current, pageSize } = tablePagination;
        return index + 1 + (current - 1) * pageSize; // ต่อเนื่องจากหน้าก่อน
      },
    },
    {
      title: "รูปภาพ",
      dataIndex: "image",
      key: "image",
      render: (image: string) =>
        image ? (
          <img
            src={image}
            alt="ภาพข่าว"
            style={{
              width: 80,
              height: 80,
              objectFit: "cover",
              borderRadius: 8,
            }}
          />
        ) : (
          "-"
        ),
    },
    {
      title: "หัวข้อข่าว",
      dataIndex: "subject",
      key: "subject",
    },
    {
      title: "รายละเอียด",
      dataIndex: "information",
      key: "information",
      ellipsis: true,
    },
    {
      title: "วันที่เผยแพร่",
      dataIndex: "dashboardtime",
      key: "dashboardtime",
      render: (value: string) =>
        value ? new Date(value).toLocaleDateString("th-TH") : "-",
      align: "center" as const,
    },
    {
      title: "การจัดการ",
      key: "actions",
      align: "center" as const,
      render: (_: any, record: DashboardInterface) => (
        <div className={styles.actions}>
          <Button
            icon={<EditOutlined />}
            onClick={() => navigate(`/dashboard/edit/${record.ID}`)}
            className={styles.editButton}
          >
            แก้ไข
          </Button>
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDelete(record.ID, record.subject)}
            className={styles.deleteButton}
          >
            ลบ
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Layout className={styles.layout}>
      <div className={styles.sidebarWrapper}>
        <AdminSidebar />
      </div>

      <Layout style={{ marginLeft: 250 }}>
        <Content className={styles.content}>
          {contextHolder}
          <Card className={styles.card}>
            {/* Row: title, search, button */}
            <Row
              justify="space-between"
              align="middle"
              style={{ flexWrap: "wrap", gap: 12, marginBottom: 16 }}
            >
              <Col flex="1 1 200px">
                <Title level={3} className={styles.pageTitle} style={{ marginBottom: 0 }}>
                  รายการข่าวประชาสัมพันธ์
                </Title>
              </Col>

              <Col flex="0 0 250px">
                <Input
                  placeholder="ค้นหาหัวข้อข่าว"
                  prefix={<SearchOutlined />}
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                />
              </Col>

              <Col>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => navigate("/dashboard/create")}
                  className={styles.createButton}
                >
                  เพิ่มข่าวใหม่
                </Button>
              </Col>
            </Row>

            <Divider />

            <Table
              bordered
              columns={columns}
              dataSource={filteredDashboards.map((item) => ({
                ...item,
                key: item.ID?.toString(),
              }))}
              pagination={{
                current: tablePagination.current,
                pageSize: tablePagination.pageSize,
                onChange: (page, pageSize) => setTablePagination({ current: page, pageSize }),
              }}
              scroll={{ x: "max-content" }}
            />

          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardTablePage;