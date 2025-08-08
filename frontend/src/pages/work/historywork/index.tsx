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
    Input,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar/Navbar";
import { WorkHistoryInterface } from "../../../interfaces/IHistorywork";
import { GetWorkHistory } from "../../../services/https/index";
import styles from "./HistoryWorkTablePage.module.css";

const { Title } = Typography;
const { Content } = Layout;

const WorkHistoryTablePage = () => {
    const [histories, setHistories] = useState<WorkHistoryInterface[]>([]);
    const [filteredHistories, setFilteredHistories] = useState<WorkHistoryInterface[]>([]);
    const [searchTitle, setSearchTitle] = useState("");

    const navigate = useNavigate();
    const [messageApi, contextHolder] = message.useMessage();

    const fetchHistoryList = async () => {
    const res = await GetWorkHistory();
    if (res) {
        const mapped = res.map((item: any) => ({
            ...item,
            PaidAmount: item.paid_amount,
            VolunteerHour: item.volunteer_hour,
        }));
        setHistories(mapped);
        setFilteredHistories(mapped);
    } else {
        messageApi.error("ไม่สามารถดึงข้อมูลประวัติงานได้");
    }
};


    useEffect(() => {
        fetchHistoryList();
    }, []);

    useEffect(() => {
        let filtered = histories;

        if (searchTitle.trim() !== "") {
            filtered = filtered.filter((h) =>
                h.Work?.title?.toLowerCase().includes(searchTitle.toLowerCase())
            );
        }

        setFilteredHistories(filtered);
    }, [searchTitle, histories]);

    const columns = [
        {
            title: "ลำดับ",
            key: "index",
            width: 60,
            align: "center" as const,
            render: (_: any, __: any, index: number) => index + 1,
        },
        {
            title: "หัวข้องาน",
            key: "title",
            render: (_: any, record: WorkHistoryInterface) =>
                record.Work?.title || "-",
        },
        {
            title: "รายละเอียด",
            key: "description",
            render: (_: any, record: WorkHistoryInterface) =>
                record.Work?.description || "-",
            ellipsis: true,
        },
        {
            title: "ค่าตอบแทน",
            key: "PaidAmount",
            render: (_: any, record: WorkHistoryInterface) =>
                record.PaidAmount != null ? `${record.PaidAmount} บาท` : "-",
        },
        {
            title: "ชั่วโมงจิตอาสา",
            key: "VolunteerHour",
            render: (_: any, record: WorkHistoryInterface) =>
                record.VolunteerHour != null ? `${record.VolunteerHour} ชม.` : "-",
        },


        {
            title: "ผู้ใช้งาน",
            key: "user",
            render: (_: any, record: WorkHistoryInterface) =>
                record.User ? `${record.User.FirstName} ${record.User.LastName}` : "-",
        },
    ];

    return (
        <Layout className={styles.layout}>
            <Navbar />
            <Layout >
                <Content className={styles.content}>
                    {contextHolder}
                    <Card className={styles.card}>
                        <Row
                            justify="space-between"
                            align="middle"
                            style={{
                                flexWrap: "wrap",
                                rowGap: 12,
                                columnGap: 12,
                                marginBottom: 16,
                            }}
                        >
                            <Col flex="1 1 200px">
                                <Title level={3} className={styles.pageTitle} style={{ marginBottom: 0 }}>
                                    ประวัติการทำงาน
                                </Title>
                            </Col>

                            <Col flex="1 1 200px">
                                <Input
                                    placeholder="ค้นหาหัวข้องาน"
                                    prefix={<SearchOutlined />}
                                    value={searchTitle}
                                    onChange={(e) => setSearchTitle(e.target.value)}
                                />
                            </Col>
                        </Row>

                        <Divider />

                        <div className={styles.tableWrapper}>
                            <Table
                                bordered
                                columns={columns}
                                dataSource={filteredHistories.map((item) => ({ ...item, key: item.ID?.toString() }))}
                                pagination={{ pageSize: 10 }}
                                scroll={{ x: 'max-content' }}
                            />
                        </div>
                    </Card>
                </Content>
            </Layout>
        </Layout>
    );
};

export default WorkHistoryTablePage;
