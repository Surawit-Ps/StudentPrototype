import { useEffect, useState } from "react";
import { Col, Row, Card, Button, Layout, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import bannerImage from "../../assets/banner.png";
import {
    DollarOutlined,
    HeartFilled,
    CalendarOutlined,
    EnvironmentOutlined,
    TeamOutlined,
    FileSearchOutlined,
    //   TeamOutlined, 
    //   SearchOutlined,
    RocketOutlined,
    PlayCircleOutlined,
    BookOutlined,
    GlobalOutlined,
} from "@ant-design/icons";
import { WorkInterface } from "../../interfaces/IWork";
import { GetWork, GetDashboard } from "../../services/https";
import { DashboardInterface } from "../../interfaces/IDashboard";
import { Calendar } from "lucide-react";
import { Carousel, Progress, Badge, Space } from "antd";
const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

// const { Search } = Input;


export default function Home() {
    const navigate = useNavigate();
    const [highlightWorks, setHighlightWorks] = useState<WorkInterface[]>([]);
    const [dashboardItems, setDashboardItems] = useState<DashboardInterface[]>([]);
    const [currentStats, setCurrentStats] = useState({
        totalJobs: 0,
        activeStudents: 0,
        completedJobs: 0,
        satisfaction: 95
    });

    useEffect(() => {
        const fetch = async () => {
            try {
                const workRes = await GetWork();
                if (workRes) {
                    const top = workRes
                        .filter(
                            (w: WorkInterface) =>
                                w.workstatus_id === 1 && (w.workuse ?? 0) < (w.workcount ?? 0)
                        )
                        .slice(0, 12); // แสดงแค่ 9 งานแรก
                    setHighlightWorks(top);
                    setCurrentStats(prev => ({
                        ...prev,
                        totalJobs: workRes.length,
                        activeStudents: Math.floor(Math.random() * 500) + 200,
                        completedJobs: workRes.filter((w: WorkInterface) => w.workstatus_id === 3).length
                    }));
                }
                const newsRes = await GetDashboard();
                if (newsRes) {
                    setDashboardItems(newsRes.slice(0, 100));
                }
            } catch (err) {
                console.error("load error", err);
            }
        };
        fetch();
    }, []);

    const isLargeScreen = window.innerWidth >= 992;
    const chunkSize = isLargeScreen ? 3 : window.innerWidth >= 576 ? 2 : 1;

    const chunkArray = <T,>(array: T[], size: number): T[][] => {
        const result: T[][] = [];
        for (let i = 0; i < array.length; i += size) {
            result.push(array.slice(i, i + size));
        }
        return result;
    };

    const slides = chunkArray<WorkInterface>(highlightWorks, chunkSize);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("th-TH", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    const sutFacts = [
        { icon: "🎓", title: "ก่อตั้งปี 2533", desc: "มหาวิทยาลัยเฉพาะทาง" },
        { icon: "🏆", title: "อันดับโลก", desc: "QS Rankings 2024" },
        { icon: "🔬", title: "18 หลักสูตร", desc: "ระดับปริญญาตรี-เอก" },
        { icon: "🌍", title: "นานาชาติ", desc: "นักศึกษา 50+ ประเทศ" },
        { icon: "💡", title: "นวัตกรรม", desc: "สิทธิบัตรมากกว่า 500 ชิ้น" },
        { icon: "🤝", title: "พันธมิตร", desc: "300+ องค์กรทั่วโลก" }
    ];

    const jobCategories = [
        { name: "เทคโนโลยี", count: 45, color: "#3F72AF", icon: "💻" },
        { name: "วิศวกรรม", count: 38, color: "#10B981", icon: "⚙️" },
        { name: "การแพทย์", count: 22, color: "#F59E0B", icon: "🏥" },
        { name: "วิจัย", count: 31, color: "#EF4444", icon: "🔬" },
        { name: "ธุรกิจ", count: 28, color: "#8B5CF6", icon: "💼" },
        { name: "อื่นๆ", count: 15, color: "#6B7280", icon: "📋" }
    ];

    return (
        <>
            <Navbar />
            <Layout style={{ backgroundColor: "#F9F7F7", minHeight: "100vh" }}>
                <Content>
                    {/* Enhanced Hero Section */}
                    <div
                        style={{
                            background: `linear-gradient(135deg, rgba(18, 52, 94, 0.9), rgba(17, 45, 78, 0.8)), url(${bannerImage}) center/cover no-repeat`,
                            height: "50vh",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            textAlign: "center",
                            color: "white",
                            position: "relative",
                            overflow: "hidden"
                        }}
                    >
                        {/* Animated Background Elements */}
                        <div style={{
                            position: "absolute",
                            top: "10%",
                            left: "10%",
                            width: "100px",
                            height: "100px",
                            borderRadius: "50%",
                            background: "rgba(219, 226, 239, 0.1)",
                            animation: "float 6s ease-in-out infinite"
                        }} />
                        <div style={{
                            position: "absolute",
                            top: "6%",
                            right: "15%",
                            width: "150px",
                            height: "150px",
                            borderRadius: "50%",
                            background: "rgba(219, 226, 239, 0.05)",
                            animation: "float 4s ease-in-out infinite reverse"
                        }} />

                        <div style={{
                            maxWidth: "900px",
                            width: "1500px",
                            padding: "12px 90px",
                            background: "rgba(17, 45, 78, 0.1)",
                            backdropFilter: "blur(10px)",
                            borderRadius: "24px",
                            border: "1px solid rgba(255, 255, 255, 0.1)"
                        }}>
                            <Title style={{
                                color: "white",
                                fontSize: "3rem",
                                marginBottom: "24px",
                                fontWeight: "800",
                                textShadow: "0 4px 8px rgba(0,0,0,0.3)"
                            }}>
                                เริ่มต้นเส้นทางอนาคตที่ SUT
                            </Title>
                            <Paragraph style={{
                                fontSize: "20px",
                                color: "#DBE2EF",
                                marginBottom: "40px",
                                lineHeight: "1.6"
                            }}>
                                ค้นหาโอกาสงานที่ใช่ เสริมสร้างประสบการณ์จริง และพัฒนาทักษะอาชีพผ่านระบบจัดหางานเพื่อสนับสนุนความก้าวหน้านักศึกษามหาวิทยาลัยเทคโนโลยีสุรนารี
                            </Paragraph>


                            <div style={{ display: "flex", gap: "20px", justifyContent: "center", flexWrap: "wrap" }}>
                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<RocketOutlined />}
                                    onClick={() => navigate("/work/view")}
                                    style={{
                                        height: "60px",
                                        fontSize: "20px",
                                        padding: "0 40px",
                                        borderRadius: "16px",
                                        background: "#F9F7F7",
                                        color: "#112D4E",
                                        border: "none",
                                        fontWeight: "700",
                                        boxShadow: "0 8px 25px rgba(249, 247, 247, 0.3)"
                                    }}
                                >
                                    เริ่มหางานเลย
                                </Button>
                                <Button
                                    size="large"
                                    icon={<BookOutlined />}
                                    onClick={() => navigate("/dashboard/view")}
                                    style={{
                                        height: "60px",
                                        fontSize: "20px",
                                        padding: "0 40px",
                                        borderRadius: "16px",
                                        background: "rgba(255, 255, 255, 0.1)",
                                        color: "white",
                                        border: "2px solid rgba(255, 255, 255, 0.3)",
                                        fontWeight: "700",
                                        backdropFilter: "blur(10px)"
                                    }}
                                >
                                    อ่านข่าวสาร
                                </Button>

                            </div>
                        </div>

                        {/* Scroll indicator */}
                        <div style={{
                            position: "absolute",
                            bottom: "10px",
                            left: "50%",
                            transform: "translateX(-50%)",
                            animation: "bounce 2s infinite"
                        }}>
                            <div style={{
                                width: "30px",
                                height: "50px",
                                border: "2px solid rgba(255, 255, 255, 0.5)",
                                borderRadius: "25px",
                                position: "relative"
                            }}>
                                <div style={{
                                    width: "6px",
                                    height: "10px",
                                    background: "rgba(255, 255, 255, 0.8)",
                                    borderRadius: "3px",
                                    position: "absolute",
                                    top: "8px",
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                    animation: "scroll 2s infinite"
                                }} />
                            </div>
                        </div>
                    </div>

                    {/* Enhanced About SUT Section */}
                    <section style={{

                        background: "linear-gradient(135deg, #c0e2ec7e 0%, #f4f9fc7c 50%, #1f6adb57 100%)",
                        position: "relative",
                        overflow: "hidden"
                    }}>
                        {/* Background decorations */}
                        <div style={{
                            position: "absolute",
                            top: "-50px",
                            right: "-50px",
                            width: "200px",
                            height: "200px",
                            background: "rgba(63, 114, 175, 0.05)",
                            borderRadius: "50%"
                        }} />

                        <div style={{ maxWidth: "1400px", margin: "0 auto", marginBottom: 20 }}>
                            <div style={{ textAlign: "center", marginBottom: "80px" }}>
                                <Title level={1} style={{ color: "#112D4E", fontSize: "3.5rem" }}>
                                    มหาวิทยาลัยเทคโนโลยีสุรนารี
                                </Title>
                                <Title level={3} style={{ color: "#3F72AF", fontWeight: "400" }}>
                                    SUT - Suranaree University of Technology
                                </Title>
                                <Paragraph style={{
                                    fontSize: "20px",
                                    color: "#112D4E",
                                    maxWidth: "10000px",
                                    margin: "0 auto",
                                    lineHeight: "1.8"
                                }}>
                                    เป็นมหาวิทยาลัยเฉพาะทางด้านวิทยาศาสตร์และเทคโนโลยีชั้นนำของประเทศไทย
                                    ที่มุ่งมั่นในการพัฒนาศักยภาพของนักศึกษาให้เป็นกำลังสำคัญของประเทศ
                                    ผ่านการเรียนรู้แบบบูรณาการระหว่างวิชาการและการปฏิบัติจริง พร้อมสร้างสรรค์นวัตกรรมและองค์ความรู้ใหม่ ๆ
                                    ที่ตอบสนองต่อความต้องการของสังคมและภาคอุตสาหกรรม

                                </Paragraph>
                            </div>

                            <Row gutter={[40, 40]} align="middle">
                                <Col xs={24} lg={16}>
                                    <div style={{ position: "relative" }}>
                                        {/* Main SUT Image */}
                                        <img
                                            src="https://i.ytimg.com/vi/-K-APhYfUBI/maxresdefault.jpg"
                                            alt="SUT Campus"
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                borderRadius: "20px",
                                                boxShadow: "0 20px 60px rgba(17, 45, 78, 0.15)",
                                                position: "relative",
                                                zIndex: 2
                                            }}
                                        />
                                        <div style={{ marginTop: "40px", textAlign: "center" }}>
                                            <Button
                                                type="primary"
                                                size="large"
                                                icon={<GlobalOutlined />}
                                                href="https://www.sut.ac.th/"
                                                target="_blank"
                                                style={{
                                                    height: "50px",
                                                    borderRadius: "12px",
                                                    fontSize: "16px",
                                                    background: "#3F72AF",
                                                    border: "none",
                                                    boxShadow: "0 4px 15px rgba(63, 114, 175, 0.4)"
                                                }}
                                            >
                                                เยี่ยมชมเว็บไซต์ SUT
                                            </Button>
                                        </div>
                                    </div>
                                </Col>

                                <Col xs={24} lg={8}>
                                    <div style={{ paddingLeft: "20px" }}>


                                        <Row gutter={[16, 24]}>
                                            {sutFacts.map((fact, index) => (
                                                <Col xs={24} sm={12} key={index}>
                                                    <Card
                                                        style={{
                                                            borderRadius: "16px",
                                                            border: "2px solid #DBE2EF",
                                                            transition: "all 0.3s ease",
                                                            height: "100%"
                                                        }}
                                                        bodyStyle={{ padding: "20px" }}
                                                        hoverable
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.borderColor = "#3F72AF";
                                                            e.currentTarget.style.transform = "translateY(-4px)";
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.borderColor = "#DBE2EF";
                                                            e.currentTarget.style.transform = "translateY(0)";
                                                        }}
                                                    >
                                                        <div style={{ textAlign: "center" }}>
                                                            <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>
                                                                {fact.icon}
                                                            </div>
                                                            <Title level={4} style={{ color: "#112D4E", marginBottom: "8px" }}>
                                                                {fact.title}
                                                            </Title>
                                                            <Text style={{ color: "#3F72AF", fontSize: "14px" }}>
                                                                {fact.desc}
                                                            </Text>
                                                        </div>
                                                    </Card>
                                                </Col>
                                            ))}
                                        </Row>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    </section>

                    {/* Enhanced Featured Jobs Section */}
                    <section style={{ padding: "1px 24px", background: "#ffffff" }}>
                        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
                            <div style={{ textAlign: "center", marginBottom: "30px" }}>
                                <Title level={2} style={{ color: "#112D4E", fontSize: "3rem" }}>
                                    งานแนะนำสำหรับคุณ
                                </Title>
                                <Text style={{ fontSize: "18px", color: "#3F72AF" }}>
                                    โอกาสงานจิตอาสาและงานพิเศษจากโครงการของมหาวิทยาลัย เพื่อให้นักศึกษาได้เรียนรู้ พัฒนาทักษะ และสร้างประสบการณ์จริง
                                </Text>
                            </div>
                            <Carousel autoplay dots={true}>
                                {slides.map((slide: WorkInterface[], slideIndex: number) => (
                                    <div key={slideIndex}>
                                        <Row gutter={[32, 32]} justify="center">
                                            {slide.map((work: WorkInterface, index: number) => (
                                                <Col xs={24} sm={24 / chunkSize} key={work.ID}>
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
                                                            {/* ประเภทงาน */}
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
                                                            {/* สถานะ */}

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
                                                                        {work.worktime &&
                                                                            new Date(work.worktime).toLocaleString("th-TH", {
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
                                                                    <div
                                                                        style={{
                                                                            display: "flex",
                                                                            justifyContent: "space-between",
                                                                            alignItems: "center",
                                                                        }}
                                                                    >
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
                                                                        strokeColor={
                                                                            ((used, total) => {
                                                                                const percent = (used / total) * 100;
                                                                                if (percent <= 40) return "#52c41a";
                                                                                if (percent <= 70) return "#faad14";
                                                                                return "#ff4d4f";
                                                                            })(work.workuse ?? 0, work.workcount ?? 1)
                                                                        }
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
                                                                        height: 44,
                                                                    }}
                                                                    onClick={() => navigate(`/work/info/${work.ID}`)}
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
                                    </div>
                                ))}
                            </Carousel>

                            <div style={{ textAlign: "center", marginTop: "6px", marginBottom: "30px" }}>
                                <Button
                                    size="large"
                                    onClick={() => navigate("/work/view")}
                                    style={{
                                        height: "50px",
                                        borderRadius: "12px",
                                        fontSize: "16px",
                                        border: "2px solid #3F72AF",
                                        color: "#3F72AF",
                                        fontWeight: "600",
                                        marginTop: "70px"
                                    }}
                                >
                                    ดูงานทั้งหมด
                                </Button>
                            </div>
                        </div>
                    </section>

                    {/* Enhanced News Section */}
                    <section style={{
                        padding: "1px 24px",
                        background: "linear-gradient(135deg, #DBE2EF  0%, #278ff069 100%)"
                    }}>
                        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
                            <div style={{ textAlign: "center", marginBottom: "60px" }}>
                                <Title level={2} style={{ color: "#112D4E", fontSize: "3rem" }}>
                                    ข่าวประชาสัมพันธ์ล่าสุด
                                </Title>
                                <Text style={{ fontSize: "23px", color: "#162858ff" }}>
                                    อัพเดทข่าวสารและกิจกรรมจาก SUT
                                </Text>
                            </div>

                            <Row gutter={[32, 32]}>
                                {[...dashboardItems]
                                    .sort((a, b) => b.ID! - a.ID!)  // เรียงจาก ID มาก → น้อย (ข่าวใหม่สุดอยู่ข้างหน้า)
                                    .slice(0, 3)                    // เอา 3 อันดับแรก = ID มากสุด 3 อัน
                                    .map((item, index) => (
                                        <Col xs={24} md={8} key={item.ID}>
                                            <Card
                                                hoverable
                                                style={{
                                                    borderRadius: "20px",
                                                    overflow: "hidden",
                                                    border: "none",
                                                    boxShadow: "0 10px 30px rgba(17, 45, 78, 0.1)",
                                                    transition: "all 0.3s ease",
                                                    height: "100%",
                                                    background: index === 0 ? "linear-gradient(135deg, #3F72AF, #112D4E)" : "#ffffff"
                                                }}
                                                cover={
                                                    <div style={{ position: "relative", overflow: "hidden" }}>
                                                        <img
                                                            src={item.image || "https://via.placeholder.com/400x250/3F72AF/white?text=SUT+News"}
                                                            alt={item.subject || "ข่าว"}
                                                            style={{
                                                                height: "250px",
                                                                objectFit: "cover",
                                                                width: "100%",
                                                                transition: "transform 0.3s ease"
                                                            }}
                                                        />
                                                        {index === 0 && (
                                                            <div style={{
                                                                position: "absolute",
                                                                top: "16px",
                                                                left: "16px",
                                                                background: "linear-gradient(45deg, #F59E0B, #EF4444)",
                                                                color: "white",
                                                                padding: "8px 16px",
                                                                borderRadius: "20px",
                                                                fontSize: "14px",
                                                                fontWeight: "700",
                                                                boxShadow: "0 4px 15px rgba(239, 68, 68, 0.4)"
                                                            }}>
                                                                🔥 ข่าวเด่น
                                                            </div>
                                                        )}
                                                    </div>
                                                }
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = "translateY(-10px) scale(1.02)";
                                                    e.currentTarget.style.boxShadow = "0 25px 50px rgba(17, 45, 78, 0.2)";
                                                    const img = e.currentTarget.querySelector('img');
                                                    if (img) img.style.transform = "scale(1.1)";
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = "translateY(0) scale(1)";
                                                    e.currentTarget.style.boxShadow = "0 10px 30px rgba(17, 45, 78, 0.1)";
                                                    const img = e.currentTarget.querySelector('img');
                                                    if (img) img.style.transform = "scale(1)";
                                                }}
                                            >
                                                <div style={{ padding: "8px" }}>
                                                    <Title
                                                        level={4}
                                                        style={{
                                                            marginBottom: "16px",
                                                            color: index === 0 ? "#F9F7F7" : "#112D4E",
                                                            fontSize: "20px",
                                                            lineHeight: "1.4"
                                                        }}
                                                    >
                                                        {item.subject}
                                                    </Title>
                                                    <Paragraph
                                                        ellipsis={{ rows: 3 }}
                                                        style={{
                                                            color: index === 0 ? "#DBE2EF" : "#3F72AF",
                                                            marginBottom: "20px",
                                                            fontSize: "15px",
                                                            lineHeight: "1.6",
                                                            minHeight: "72px"
                                                        }}
                                                    >
                                                        {item.information}
                                                    </Paragraph>

                                                    <div style={{
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        alignItems: "center"
                                                    }}>
                                                        <div style={{
                                                            fontSize: '14px',
                                                            color: index === 0 ? "#DBE2EF" : "#666",
                                                            backgroundColor: index === 0 ? "rgba(255,255,255,0.1)" : "#F9F7F7",
                                                            padding: '8px 16px',
                                                            borderRadius: '20px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '8px',
                                                            backdropFilter: index === 0 ? "blur(10px)" : "none"
                                                        }}>
                                                            <Calendar size={16} />
                                                            {formatDate(item.dashboardtime || '')}
                                                        </div>

                                                        <Button
                                                            type={index === 0 ? "default" : "primary"}
                                                            size="small"
                                                            style={{
                                                                borderRadius: "12px",
                                                                background: index === 0 ? "rgba(255,255,255,0.2)" : "#3F72AF",
                                                                border: index === 0 ? "1px solid rgba(255,255,255,0.3)" : "none",
                                                                color: index === 0 ? "#F9F7F7" : "white",
                                                                backdropFilter: index === 0 ? "blur(10px)" : "none"
                                                            }}
                                                            onClick={() => navigate(`/dashboard/view`)}
                                                        >
                                                            อ่านต่อ
                                                        </Button>
                                                    </div>
                                                </div>
                                            </Card>
                                        </Col>
                                    ))}
                            </Row>

                            {/* Additional News Cards */}
                            <Row gutter={[24, 24]} style={{ marginTop: "40px" }}>
                                {[...dashboardItems]
                                    .sort((a, b) => b.ID! - a.ID!) // เรียง ID มาก → น้อย (ข่าวใหม่สุดก่อน)
                                    .slice(3, 6)                    // ข่าวลำดับ 4–6 (3 อันถัดจากข่าวเด่น)
                                    .map((item) => (
                                        <Col xs={24} sm={12} lg={8} key={item.ID}>
                                            <Card
                                                hoverable
                                                size="small"
                                                style={{
                                                    borderRadius: "16px",
                                                    border: "2px solid #DBE2EF",
                                                    transition: "all 0.3s ease"
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.borderColor = "#3F72AF";
                                                    e.currentTarget.style.transform = "translateY(-4px)";
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.borderColor = "#DBE2EF";
                                                    e.currentTarget.style.transform = "translateY(0)";
                                                }}
                                            >
                                                <div style={{ display: "flex", gap: "16px" }}>
                                                    <img
                                                        src={item.image && item.image.trim() !== "" ? item.image : "https://via.placeholder.com/80x80/DBE2EF/3F72AF?text=SUT"}
                                                        alt={item.subject}
                                                        style={{
                                                            width: "80px",
                                                            height: "80px",
                                                            marginTop: 10,
                                                            borderRadius: "12px",
                                                            objectFit: "cover",
                                                            flexShrink: 0
                                                        }}
                                                    />
                                                    <div style={{ flex: 1 }}>
                                                        <Title level={5} style={{
                                                            marginBottom: "8px",
                                                            color: "#112D4E",
                                                            fontSize: "16px"
                                                        }}>
                                                            {item.subject}
                                                        </Title>
                                                        <Text style={{
                                                            color: "#3F72AF",
                                                            fontSize: "13px",
                                                            display: "block",
                                                            marginBottom: "8px"
                                                        }}>
                                                            {formatDate(item.dashboardtime || '')}
                                                        </Text>
                                                        <Button
                                                            type="link"
                                                            style={{
                                                                padding: "0",
                                                                color: "#3F72AF",
                                                                fontSize: "14px"
                                                            }}
                                                            onClick={() => navigate(`/dashboard/view`)}
                                                        >
                                                            อ่านต่อ →
                                                        </Button>
                                                    </div>
                                                </div>
                                            </Card>
                                        </Col>
                                    ))}
                            </Row>

                            <div style={{ textAlign: "center", marginTop: "60px" }}>
                                <Button
                                    size="large"
                                    onClick={() => navigate("/dashboard/view")}
                                    style={{
                                        height: "50px",
                                        marginBottom: 30,
                                        borderRadius: "12px",
                                        fontSize: "16px",
                                        border: "2px solid #3F72AF",
                                        color: "#3F72AF",
                                        fontWeight: "600"
                                    }}
                                >
                                    ดูข่าวทั้งหมด
                                </Button>
                            </div>
                        </div>
                    </section>

                    {/* SUT Media Gallery */}
                    <section style={{ padding: "1px 24px", background: "#ffffff", marginBottom: 20 }}>
                        <div style={{ maxWidth: "1400px",height: 760, margin: "0 auto" }}>
                            <div style={{ textAlign: "center", marginBottom: "60px" }}>
                                <Title level={2} style={{ color: "#112D4E", fontSize: "3rem" }}>
                                    บรรยากาศในรั้วมหาวิทยาลัย
                                </Title>
                                <Text style={{ fontSize: "18px", color: "#0f223aff" }}>
                                    ภาพและวิดีโอจากกิจกรรมต่างๆ ภายในมหาวิทยาลัย
                                </Text>
                            </div>

                            <Row gutter={[24, 24]}>
                                {/* Video Section */}
                                <Col xs={24} lg={12}>
                                    <Card
                                        style={{
                                            borderRadius: "20px",
                                            overflow: "hidden",
                                            border: "none",
                                            boxShadow: "0 15px 35px rgba(17, 45, 78, 0.1)",
                                            height: "100%"
                                        }}
                                    >
                                        <div style={{ position: "relative" }}>
                                            <img
                                                src="https://i.ytimg.com/vi/OH9ovUbFbEQ/maxresdefault.jpg"
                                                alt="SUT Introduction Video"
                                                style={{
                                                    width: "100%",
                                                    height: "300px",
                                                    objectFit: "cover"
                                                }}
                                            />
                                            <div
                                                style={{
                                                    position: "absolute",
                                                    top: "50%",
                                                    left: "50%",
                                                    transform: "translate(-50%, -50%)",
                                                    background: "rgba(63, 114, 175, 0.9)",
                                                    borderRadius: "50%",
                                                    width: "80px",
                                                    height: "80px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    cursor: "pointer",
                                                    transition: "all 0.3s ease"
                                                }}
                                                onClick={() => window.open("https://www.youtube.com/watch?v=yv8iJ-G9vOM&ab_channel=SUTnews", "_blank")}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = "translate(-50%, -50%) scale(1.1)";
                                                    e.currentTarget.style.background = "#112D4E";
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = "translate(-50%, -50%) scale(1)";
                                                    e.currentTarget.style.background = "rgba(63, 114, 175, 0.9)";
                                                }}
                                            >
                                                <PlayCircleOutlined style={{ fontSize: "32px", color: "white" }} />
                                            </div>
                                        </div>
                                        <div style={{ padding: "24px" }}>
                                            <Title level={3} style={{ color: "#112D4E", marginBottom: "16px" }}>
                                                🎓 32 ปีแห่งความภาคภูมิใจ มทส.
                                            </Title>
                                            <Paragraph style={{ color: "#3F72AF", fontSize: "16px", marginBottom: "20px" }}>
                                                ร่วมย้อนเส้นทางแห่งความสำเร็จของมหาวิทยาลัยเทคโนโลยีสุรนารี ตลอดระยะเวลา 32 ปี กับบทบาทในการพัฒนาวิชาการ งานวิจัย และบริการสังคมอย่างยั่งยืน
                                            </Paragraph>
                                            <Button
                                                type="primary"
                                                icon={<PlayCircleOutlined />}
                                                onClick={() => window.open("https://www.youtube.com/watch?v=yv8iJ-G9vOM&ab_channel=SUTnews", "_blank")}
                                                style={{
                                                    borderRadius: "12px",
                                                    background: "#3F72AF",
                                                    border: "none"
                                                }}
                                            >
                                                ดูวิดีโอเต็ม
                                            </Button>
                                        </div>
                                    </Card>
                                </Col>

                                {/* Image Gallery */}
                                <Col xs={24} lg={12}>
                                    <div style={{ height: "400px", display: "flex", flexDirection: "column", gap: "12px" }}>

                                        {/* 🔼 บน: 2 รูปเล็ก ซ้าย/ขวา */}
                                        <div style={{ flex: 1 }}>
                                            <Row gutter={[12, 12]} style={{ height: "100%" }}>
                                                <Col xs={12}>
                                                    <Card
                                                        hoverable
                                                        style={{
                                                            borderRadius: "16px",
                                                            overflow: "hidden",
                                                            border: "none",
                                                            height: "100%"
                                                        }}
                                                        bodyStyle={{ padding: 0 }}
                                                        cover={
                                                            <img
                                                                src="https://web.sut.ac.th/dbg/assets/blog_unseen_sut/unseen_04/010.jpg"
                                                                alt="SUT Library"
                                                                style={{ height: 254, width: "100%", objectFit: "cover" }}
                                                            />
                                                        }
                                                    />
                                                </Col>
                                                <Col xs={12}>
                                                    <Card
                                                        hoverable
                                                        style={{
                                                            borderRadius: "16px",
                                                            overflow: "hidden",
                                                            border: "none",
                                                            height: "100%"
                                                        }}
                                                        bodyStyle={{ padding: 0 }}
                                                        cover={
                                                            <img
                                                                src="https://beta.sut.ac.th/ces/wp-content/uploads/sites/150/2020/06/B2.jpg"
                                                                alt="SUT Laboratory"
                                                                style={{ height: "100%", width: "100%", objectFit: "cover" }}
                                                            />
                                                        }
                                                    />
                                                </Col>
                                            </Row>
                                        </div>

                                        {/* 🔽 ล่าง: 1 รูปแนวนอน เต็มความกว้าง */}
                                        <div style={{ flex: 1 }}>
                                            <Card
                                                hoverable
                                                style={{
                                                    borderRadius: "16px",
                                                    overflow: "hidden",
                                                    border: "none",
                                                    height: "100%"
                                                }}
                                                bodyStyle={{ padding: 0 }}
                                                cover={
                                                    <img
                                                        src="https://pbs.twimg.com/media/GaFrB1Zb0AIlF1Q.jpg"
                                                        alt="SUT Campus Life"
                                                        style={{ height: 310, width: "100%", objectFit: "cover" }}
                                                    />
                                                }
                                            />
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    </section>

                    {/* CSS Animations */}
                    <style>
                        {`
              @keyframes float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-20px); }
              }
              
              @keyframes bounce {
                0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                40% { transform: translateY(-10px); }
                60% { transform: translateY(-5px); }
              }
              
              @keyframes scroll {
                0% { opacity: 0; }
                10% { transform: translateY(0); opacity: 1; }
                100% { transform: translateY(15px); opacity: 0; }
              }
              
              .ant-carousel .slick-dots {
                bottom: -50px;
              }
              
              .ant-carousel .slick-dots li button {
                background: #3F72AF;
                border-radius: 50%;
              }
              
              .ant-carousel .slick-dots li.slick-active button {
                background: #112D4E;
              }
            `}
                    </style>
                </Content>
            </Layout>
        </>
    );
}