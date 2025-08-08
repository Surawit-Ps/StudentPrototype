import { useEffect, useState } from "react";
import {
  Button, Col, Row, Card, Table, Typography, Divider, message, Layout, Modal
} from "antd";
import {
  PlusOutlined, EditOutlined, DeleteOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { UsersInterface } from "../../interfaces/IUser";
import {
  GetUsers, DeleteUserByID
} from "../../services/https";
import AdminSidebar from "../../components/Sider/AdminSidebar";
import styles from "./AccountTablePage.module.css";
import dayjs from "dayjs";

const { Title } = Typography;
const { Content } = Layout;

const UserTablePage = () => {
  const [users, setUsers] = useState<UsersInterface[]>([]);
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const fetchUsers = async () => {
    const res = await GetUsers();
    if (res) {
      setUsers(res);
    } else {
      messageApi.error("ไม่สามารถโหลดข้อมูลผู้ใช้ได้");
    }
  };

  const handleDelete = async (id?: number, name?: string) => {
    Modal.confirm({
      title: "ยืนยันการลบ",
      content: `คุณต้องการลบผู้ใช้ "${name}" ใช่หรือไม่?`,
      okText: "ลบ",
      okType: "danger",
      cancelText: "ยกเลิก",
      onOk: async () => {
        const res = await DeleteUserByID(id);
        if (res) {
          messageApi.success("ลบข้อมูลสำเร็จ");
          fetchUsers();
        } else {
          messageApi.error("เกิดข้อผิดพลาด");
        }
      },
    });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const columns = [
    {
      title: "ลำดับ",
      key: "index",
      width: 60,
      align: "center" as const,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: "รูปประจำตัว",
      dataIndex: "Profile",
      key: "Profile",
      width: 100,
      render: (profile: string) =>
        profile ? (
          <img src={profile} alt="profile" className={styles.photo} />
        ) : (
          "-"
        ),
    },
    {
      title: "ชื่อ",
      dataIndex: "FirstName",
      key: "FirstName",
      align: "center" as const,
    },
    {
      title: "นามสกุล",
      dataIndex: "LastName",
      key: "LastName",
      align: "center" as const,
    },
    {
      title: "อีเมล",
      dataIndex: "Email",
      key: "Email",
      align: "center" as const,
    },
    {
      title: "วันเกิด",
      dataIndex: "BirthDay",
      key: "BirthDay",
      align: "center" as const,
      render: (value: string) => dayjs(value).format("DD/MM/YYYY"),
    },
    {
      title: "เพศ",
      dataIndex: "Gender",
      key: "Gender",
      align: "center" as const,
      render: (gender: any) => gender?.Name ?? "-",
    },
    {
      title: "การจัดการ",
      key: "actions",
      align: "center" as const,
      render: (_: any, record: UsersInterface) => (
        <div className={styles.actions}>
          {/* <Button
            icon={<EditOutlined />}
            onClick={() => navigate(`/account/edit/${record.ID}`)}
            className={styles.editButton}
          /> */}
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDelete(record.ID, `${record.FirstName} ${record.LastName}`)}
            className={styles.deleteButton}
            style={{ marginLeft: 8 }}
          />
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
            <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
              <Col>
                <Title level={3} className={styles.pageTitle}>
                  จัดการบัญชีผู้ใช้
                </Title>
              </Col>
              <Col>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => navigate("/account/create")}
                  className={styles.createButton}
                >
                  สร้างบัญชี
                </Button>
              </Col>
            </Row>
            <Divider />
            <Table
              bordered
              rowKey="ID"
              columns={columns}
              dataSource={users}
              pagination={{ pageSize: 10 }}
              scroll={{ x: "max-content" }}
            />
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default UserTablePage;
