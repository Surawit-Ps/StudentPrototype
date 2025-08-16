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
import { SearchOutlined, FilePdfOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar/Navbar";
import { WorkHistoryInterface } from "../../../interfaces/IHistorywork";
import { GetWorkHistory } from "../../../services/https/index";
import styles from "./HistoryWorkTablePage.module.css";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { thSarabunNewBase64 } from "../historywork/thaibase64";
import logo from "../historywork/logojob.png";

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

    const generatePDF = (record: WorkHistoryInterface) => {
        const doc = new jsPDF("p", "mm", "a4");

        // === ฟอนต์ไทย ===
        doc.addFileToVFS("THSarabunNew.ttf", thSarabunNewBase64);
        doc.addFont("THSarabunNew.ttf", "THSarabunNew", "normal");
        doc.setFont("THSarabunNew", "normal");

        const pdfWidth = doc.internal.pageSize.getWidth();
        const pdfHeight = doc.internal.pageSize.getHeight();

        const imgProps = doc.getImageProperties(logo);
        const logoWidth = 60;
        const logoHeight = (imgProps.height * logoWidth) / imgProps.width;
        doc.addImage(logo, "PNG", (pdfWidth - logoWidth) / 2, 25, logoWidth, logoHeight);

        // === ชื่อผู้ใช้งาน ===
        let y = 55;
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(20);
        doc.text(
            `ชื่อผู้ใช้งาน: ${record.User?.FirstName || ""} ${record.User?.LastName || ""}`,
            14,
            y
        );
        y += 8;
        doc.setFontSize(16);
        doc.text("รายงานสรุปการทำงานและชั่วโมงจิตอาสา", 14, y);

        // === กล่อง Summary ===
        y += 15;
        const boxWidth = (pdfWidth - 80) / 3; // ลดนิดหน่อยให้เล็กลง
        const boxHeight = 30;
        const gap = 20; // ระยะห่างระหว่างกล่อง

        // คำนวณตำแหน่งเริ่มต้นให้อยู่ตรงกลาง
        const totalWidth = boxWidth * 2 + gap;
        const startX = (pdfWidth - totalWidth) / 2;

        const drawBox = (x: number, title: string, value: string) => {
            doc.setDrawColor(200);
            doc.rect(x, y, boxWidth, boxHeight);
            doc.setFontSize(16);
            doc.text(value, x + boxWidth / 2, y + 14, { align: "center" });
            doc.setFontSize(16);
            doc.setTextColor(100);
            doc.text(title, x + boxWidth / 2, y + 24, { align: "center" });
            doc.setTextColor(0, 0, 0);
        };

        // กล่อง 1 (ซ้าย)
        drawBox(startX, "รายการ", "1");
        // กล่อง 2 (ขวา)
        drawBox(startX + boxWidth + gap, "ชั่วโมงจิตอาสา", record.Work?.volunteer ? `${record.Work.volunteer} ชม.` : "0");


        // === ตารางรายละเอียด ===
        y += boxHeight + 25;
        autoTable(doc, {
            startY: y,
            head: [["หัวข้องาน", "รายละเอียด", "วันเวลา", "สถานที่", "ชั่วโมงจิตอาสา"]],
            body: [[
                record.Work?.title || "-",
                record.Work?.description || "-",
                record.Work?.worktime
                    ? new Date(record.Work.worktime).toLocaleDateString("th-TH", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                    })
                    : "-",
                record.Work?.place || "-",
                record.Work?.volunteer ? `${record.Work.volunteer} ชม.` : "-"
            ]],
            styles: {
                font: "THSarabunNew",   
                fontSize: 16           
            },
            headStyles: {
                fillColor: [103, 58, 183], 
                textColor: 255,
                font: "THSarabunNew",      
                fontStyle: "normal",       
                fontSize: 16
            },
            bodyStyles: {
                font: "THSarabunNew",      
                fontSize: 16
            },
        });

        // === Footer ===
        const footerY = pdfHeight - 15;
        doc.setFontSize(10);
        doc.setTextColor(120);
        doc.text("© 2568 StudentJobHub", 14, footerY);
        doc.text(
            `สร้างเมื่อ: ${new Date().toLocaleDateString("th-TH", {
                year: "numeric",
                month: "long",
                day: "numeric",
            })}`,
            pdfWidth - 14,
            footerY,
            { align: "right" }
        );

        doc.save(`work_history_${record.ID}.pdf`);
    };

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
            title: "วันเวลา",
            key: "worktime",
            render: (_: any, record: WorkHistoryInterface) => {
                if (!record.Work?.worktime) return "-";
                const date = new Date(record.Work.worktime);
                return date.toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                });
            },
        },
        {
            title: "สถานที่",
            key: "place",
            render: (_: any, record: WorkHistoryInterface) =>
                record.Work?.place || "-",
        },
        {
            title: "ค่าตอบแทน",
            key: "PaidAmount",
            render: (_: any, record: WorkHistoryInterface) =>
                record.Work?.paid != null ? `${record.Work.paid} บาท` : "-",
        },
        {
            title: "ชั่วโมงจิตอาสา",
            key: "VolunteerHour",
            render: (_: any, record: WorkHistoryInterface) =>
                record.Work?.volunteer != null ? `${record.Work.volunteer} ชม.` : "-",
        },
        {
            title: "PDF",
            key: "pdf",
            render: (_: any, record: WorkHistoryInterface) =>
                record.Work?.volunteer != null ? (
                    <Button
                        type="primary"
                        icon={<FilePdfOutlined />}
                        size="middle"
                        onClick={() => generatePDF(record)}
                    >
                        ดาวน์โหลด PDF
                    </Button>
                ) : null,
        }
    ];

    return (
        <Layout className={styles.layout}>
            <Navbar />
            <Layout>
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
                                scroll={{ x: "max-content" }}
                            />
                        </div>
                    </Card>
                </Content>
            </Layout>
        </Layout>
    );
};

export default WorkHistoryTablePage;
