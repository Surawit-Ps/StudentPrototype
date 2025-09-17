import React, { useEffect, useState } from "react";
import {
    Card,
    Col,
    Row,
    Typography,
    Empty,
    Spin,
    Tag,
    Button,
    Space,
    Divider,
    Rate,
    Input,
} from "antd";
import {
    CalendarOutlined,
    EnvironmentOutlined,
    WalletOutlined,
    HeartOutlined,
    FilePdfOutlined,
    SearchOutlined,
    ClockCircleOutlined,
} from "@ant-design/icons";
import Navbar from "../../../components/Navbar/Navbar";
import { WorkHistoryInterface } from "../../../interfaces/IHistorywork";
import { GetWorkHistory } from "../../../services/https/index";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import { thSarabunNewBase64 } from "../historywork/thaibase64";
import logo from "../historywork/logojob.png";
import sutlogo from "../historywork/sutlogo.png";


const { Title, Text, Paragraph } = Typography;

const WorkHistoryPage: React.FC = () => {
    const [histories, setHistories] = useState<WorkHistoryInterface[]>([]);
    const [filtered, setFiltered] = useState<WorkHistoryInterface[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTitle, setSearchTitle] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAndFilter = async () => {
            setLoading(true);
            const res = await GetWorkHistory();
            if (!res) return setLoading(false);

            setHistories(res);

            let filteredData = res;

            // ถ้ามีการค้นหาชื่อ
            if (searchTitle.trim() !== "") {
                filteredData = res.filter((h) =>
                    h.Work?.title?.toLowerCase().includes(searchTitle.toLowerCase())
                );
            }

            filteredData.sort((a, b) => {
                // ถ้า ID ต่างกันให้เรียงตาม ID
                if (a.ID !== b.ID) {
                    return Number(b.ID) - Number(a.ID); // ใหม่ก่อน
                }
                // ถ้า ID เท่ากันค่อยดูตาม worktime
                const dateA = new Date(a.Work?.worktime || "").getTime();
                const dateB = new Date(b.Work?.worktime || "").getTime();
                return dateB - dateA;
            });



            setFiltered(filteredData);
            setLoading(false);
        };
        fetchAndFilter();
    }, [searchTitle]);


    const formatWorkTime = (worktime: string | undefined) => {
        if (!worktime) return "-";
        const date = new Date(worktime);
        return date.toLocaleDateString("th-TH", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const generatePDF = (record: WorkHistoryInterface) => {
        const doc = new jsPDF("p", "mm", "a4");
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const marginBottom = 20;

        // === ฟอนต์ไทย ===
        doc.addFileToVFS("THSarabunNew.ttf", thSarabunNewBase64);
        doc.addFont("THSarabunNew.ttf", "THSarabunNew", "normal");
        doc.addFont("THSarabunNew.ttf", "THSarabunNew", "bold");
        doc.setFont("THSarabunNew", "normal");

        // === โลโก้บนหัวกระดาษ ===
        const logoLeftWidth = 30;   // โลโก้ซ้ายคงที่
        // const logoRightWidth = 50;  // โลโก้ขวากว้างกว่า
        const logoLeftHeight = 40;
        // const spacing = 10;

        const posY = 10;

        // คำนวณความกว้างรวม
        // const totalWidth = logoLeftWidth + logoRightWidth + spacing;
        const startX = (pageWidth - logoLeftWidth) / 2;

        // โลโก้ซ้าย (sutlogo)
        doc.addImage(sutlogo, "PNG", startX, posY, logoLeftWidth, logoLeftHeight);

        let currentY = 65;

        // === หัวข้อเอกสาร ===
        doc.setFont("THSarabunNew", "bold");
        doc.setFontSize(20);
        doc.text("รายงานการทำกิจกรรมจิตอาสา", pageWidth / 2, currentY, {
            align: "center",
        });
        currentY += 15;

        // === รายละเอียดกิจกรรม ===
        doc.setFont("THSarabunNew", "normal");
        doc.setFontSize(16);

        // วันที่
        doc.text(
            `วันที่: ${record.Work?.worktime ? formatWorkTime(record.Work.worktime) : "-"}`,
            20,
            currentY
        );
        currentY += 10;

        // สถานที่
        doc.text(`สถานที่: ${record.Work?.place || "-"}`, 20, currentY);
        currentY += 10;

        // หัวข้องาน
        doc.text(`หัวข้องาน: ${record.Work?.title || "-"}`, 20, currentY);
        currentY += 10;

        // รายละเอียดงาน
        doc.text(`รายละเอียดงาน: ${record.Work?.description || "-"}`, 20, currentY);
        currentY += 10;

        // ชั่วโมงจิตอาสา
        doc.text(
            `ชั่วโมงจิตอาสา: ${record.Work?.volunteer ? record.Work.volunteer + " ชม." : "-"}`,
            20,
            currentY
        );
        currentY += 10;

        doc.text(`รับรองจาก: Studentjobhub`, 20, currentY);
        currentY += 15;

        // === ลงชื่อ ===
        // เส้น
        doc.text("....................................................", pageWidth - 80, pageHeight - marginBottom);

        // ข้อความ
        doc.text("ผู้เข้าร่วมกิจกรรม", pageWidth - 65, pageHeight - marginBottom + 7);

        doc.save("รายงานกิจกรรมจิตอาสา.pdf");
    };


    if (loading) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Spin size="large" />
                <Title level={3} style={{ color: "white", marginTop: 20 }}>
                    กำลังโหลดข้อมูล...
                </Title>
            </div>
        );
    }

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
        >
            <Navbar />

            <div style={{ padding: "60px 40px 40px", textAlign: "center" }}>
                <Title
                    level={1}
                    style={{
                        color: "white",
                        fontSize: "3rem",
                        fontWeight: "bold",
                        marginBottom: "10px",
                        textShadow: "0 4px 8px rgba(0,0,0,0.3)",
                    }}
                >
                    ประวัติการทำงาน
                </Title>
                <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: "1.2rem" }}>
                    บันทึกและดาวน์โหลดชั่วโมงการทำงานของคุณ
                </Text>

                <div style={{ marginTop: "20px" }}>
                    <Input
                        placeholder="ค้นหาหัวข้องาน"
                        prefix={<SearchOutlined />}
                        value={searchTitle}
                        onChange={(e) => setSearchTitle(e.target.value)}
                        style={{
                            width: "300px",
                            borderRadius: "25px",
                            padding: "8px 16px",
                        }}
                    />
                </div>

                <div style={{ marginTop: "20px" }}>
                    <Tag
                        color="blue"
                        style={{
                            fontSize: "16px",
                            padding: "8px 16px",
                            borderRadius: "20px",
                        }}
                    >
                        ทั้งหมด {filtered.length} งาน
                    </Tag>
                </div>
            </div>

            <div
                style={{
                    padding: "0 40px 60px",
                    background: "rgba(255,255,255,0.05)",
                    backdropFilter: "blur(10px)",
                    borderRadius: "30px 30px 0 0",
                    minHeight: "60vh",
                }}
            >
                {filtered.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "80px 20px", color: "white" }}>
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={
                                <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: "18px" }}>
                                    ไม่มีประวัติงาน
                                </Text>
                            }
                        />
                    </div>
                ) : (
                    <Row gutter={[24, 24]} style={{ paddingTop: "40px" }}>
                        {filtered.map((h) => (
                            <Col xs={24} sm={12} lg={8} xl={6} key={h.ID}>
                                <Card
                                    hoverable
                                    onClick={() => navigate(`/work/info/${h.Work?.ID}`)}
                                    style={{
                                        borderRadius: "20px",
                                        overflow: "hidden",
                                        border: "none",
                                        boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                                        background: "linear-gradient(145deg, #ffffff, #f0f0f0)",
                                        height: "100%"

                                    }}
                                    cover={
                                        <img
                                            alt="รูปงาน"
                                            src={h.Work?.photo || "/default-image.png"}
                                            style={{ height: "200px", objectFit: "cover", width: "100%" }}
                                        />
                                    }
                                    actions={

                                        h.Work?.paid
                                            ? []
                                            : [
                                                <Button
                                                    type="text"
                                                    icon={<FilePdfOutlined />}
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // ❗ ป้องกันไม่ให้กดแล้วเด้งไปหน้า work/info ด้วย
                                                        generatePDF(h);
                                                    }}
                                                    style={{ color: "#E74C3C" }}
                                                >
                                                    ดาวน์โหลด PDF
                                                </Button>,
                                            ]
                                    }
                                >
                                    <div style={{ padding: "0 8px" }}>
                                        <Title
                                            level={4}
                                            style={{
                                                margin: "0 0 8px 0",
                                                background: "linear-gradient(45deg, #667eea, #764ba2)",
                                                backgroundClip: "text",
                                                WebkitBackgroundClip: "text",
                                                WebkitTextFillColor: "transparent",
                                                fontSize: "18px",
                                            }}
                                        >
                                            {h.Work?.title}
                                        </Title>

                                        <Paragraph
                                            style={{ margin: "8px 0", fontSize: "13px", lineHeight: "1.4" }}
                                            ellipsis={{ rows: 1 }}
                                        >
                                            {h.Work?.description || "ไม่มีรายละเอียด"}
                                        </Paragraph>

                                        {h.Reviews && h.Reviews.length > 0 && (
                                            <div style={{ marginTop: "10px" }}>
                                                {h.Reviews
                                                    .filter(r => r.user_id === Number(localStorage.getItem("user_id")))
                                                    .map((r) => (
                                                        <div key={r.ID} style={{ marginBottom: "8px", textAlign: "left" }}>
                                                            <Rate disabled defaultValue={r.rating} />
                                                            <Paragraph style={{ margin: "4px 0", fontSize: "13px" }}>
                                                                {r.comment || "-"}
                                                            </Paragraph>
                                                        </div>
                                                    ))}
                                            </div>
                                        )}



                                        <Divider style={{ margin: "12px 0" }} />

                                        <Space direction="vertical" size="small" style={{ width: "100%" }}>
                                            <Space>
                                                <CalendarOutlined style={{ color: "#4ECDC4" }} />
                                                <Text style={{ fontSize: "13px" }}>
                                                    {formatWorkTime(h.Work?.worktime)}
                                                </Text>
                                            </Space>

                                            <Space>
                                                <EnvironmentOutlined style={{ color: "#FF6B6B" }} />
                                                <Text type="secondary" style={{ fontSize: "14px" }}>
                                                    {h.Work?.place}
                                                </Text>
                                            </Space>

                                            <Space>
                                                {h.Work?.paid ? (
                                                    <>
                                                        <WalletOutlined style={{ color: "#27AE60" }} />
                                                        <Text strong style={{ fontSize: "14px", color: "#27AE60" }}>
                                                            {h.Work?.paid} บาท
                                                        </Text>
                                                    </>
                                                ) : (
                                                    <>
                                                        <HeartOutlined style={{ color: "#E74C3C" }} />
                                                        <Text style={{ color: "#E74C3C", fontSize: "14px" }}>
                                                            งานจิตอาสา
                                                        </Text>
                                                    </>
                                                )}
                                            </Space>

                                            {!h.Work?.paid && (
                                                <Space>
                                                    <ClockCircleOutlined style={{ color: "#FF9800" }} />
                                                    <Text style={{ fontSize: "13px" }}>
                                                        {h.Work?.volunteer ? `${h.Work.volunteer} ชม.` : "-"}
                                                    </Text>
                                                </Space>
                                            )}
                                        </Space>
                                    </div>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
            </div>
        </div>
    );
};

export default WorkHistoryPage;