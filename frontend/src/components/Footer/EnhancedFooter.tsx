// src/components/Footer/EnhancedFooter.tsx
import { Layout, Row, Col, Typography, Divider } from "antd";
// import {
//   RocketOutlined,
//   EnvironmentOutlined,
//   GlobalOutlined,
// } from "@ant-design/icons";
import { Link } from "react-router-dom";

const { Footer } = Layout;
const { Title, Text } = Typography;

const EnhancedFooter = () => (
  <Footer style={{ backgroundColor: '#112D4E', color: 'white', padding: '60px 24px 30px' }}>
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      <Row gutter={[32, 32]}>
        <Col xs={24} sm={12} lg={6}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <Text strong style={{ color: 'white', fontSize: 18, marginTop: 25 }}>
                StudentJobHub
              </Text>
            </div>
            <Text style={{ color: '#DBE2EF', fontSize: 14, lineHeight: 1.6 }}>
              แพลตฟอร์มหางานเฉพาะสำหรับนักศึกษามหาวิทยาลัยเทคโนโลยีสุรนารี
            </Text>
          </div>
        </Col>

        <Col xs={12} sm={6} lg={4}>
          <Title level={5} style={{ color: 'white', marginBottom: 16 }}>เมนูหลัก</Title>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'left' }}>
            <Link to="/" style={{ color: '#DBE2EF' }}>หน้าแรก</Link>
            <Link to="/dashboard/view" style={{ color: '#DBE2EF' }}>กระดานข่าว</Link>
            <Link to="/work/view" style={{ color: '#DBE2EF' }}>ค้นหางาน</Link>
            <a href="https://www.sut.ac.th" target="_blank" rel="noopener noreferrer" style={{ color: '#DBE2EF' }}>ติดต่อ</a>
          </div>
        </Col>

        <Col xs={12} sm={6} lg={4}>
          <Title level={5} style={{ color: 'white', marginBottom: 16 }}>หมวดงาน</Title>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Text style={{ color: '#DBE2EF' }}>งานจิตอาสา</Text>
            <Text style={{ color: '#DBE2EF' }}>งานพาร์ทไทม์</Text>
            <Text style={{ color: '#DBE2EF' }}>งานวิจัย</Text>
            <Text style={{ color: '#DBE2EF' }}>งานการสอน</Text>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Title level={5} style={{ color: 'white', marginBottom: 16 }}>ติดต่อเรา</Title>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* <EnvironmentOutlined style={{ color: '#3F72AF' }} /> */}
              <Text style={{ color: '#DBE2EF', fontSize: 14 }}>
                มหาวิทยาลัยเทคโนโลยีสุรนารี<br />
                111 ถ.มหาวิทยาลัย ต.สุรนารี<br />
                อ.เมือง จ.นครราชสีมา 30000
              </Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* <GlobalOutlined style={{ color: '#3F72AF' }} /> */}
              <Text style={{ color: '#DBE2EF', fontSize: 14 }}>
                <a href="https://www.sut.ac.th" target="_blank" rel="noopener noreferrer" style={{ color: '#DBE2EF' }}>www.sut.ac.th</a>
              </Text>
            </div>
          </div>
        </Col>

        <Col xs={24} lg={4}>
          <Title level={5} style={{ color: 'white', marginBottom: 16 }}>ช่องทางร้องเรียน</Title>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Text style={{ color: '#DBE2EF', fontSize: 14, lineHeight: 1.6 }}>
              หากพบปัญหาหรือมีข้อเสนอแนะ<br />
              กรุณาติดต่อที่
            </Text>
            <Text strong style={{ color: 'white', fontSize: 14 }}>
              <a
                href="mailto:projectstudentjobhub@gmail.com"
                style={{ fontSize: '13px', color: '#DBE2EF', textDecoration: 'underline' }}
              >
                projectstudentjobhub@gmail.com
              </a>

            </Text>
          </div>
        </Col>

      </Row>

      <Divider style={{ borderColor: '#3F72AF', margin: '40px 0 20px' }} />

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <Text style={{ color: '#DBE2EF', fontSize: 14 }}>
          © {new Date().getFullYear()} StudentJobHub - มหาวิทยาลัยเทคโนโลยีสุรนารี | พัฒนาโดยนักศึกษา เพื่อนักศึกษา
        </Text>
        <div style={{ display: 'flex', gap: 16 }}>
          <Text style={{ color: '#DBE2EF', fontSize: 12 }}>นโยบายความเป็นส่วนตัว</Text>
          <Text style={{ color: '#DBE2EF', fontSize: 12 }}>เงื่อนไขการใช้งาน</Text>
          <Text style={{ color: '#DBE2EF', fontSize: 12 }}>คู่มือการใช้งาน</Text>
        </div>
      </div>
    </div>
  </Footer>
);

export default EnhancedFooter;
