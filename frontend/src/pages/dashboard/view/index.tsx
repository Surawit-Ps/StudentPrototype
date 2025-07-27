import { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';
import Navbar from '../../../components/Navbar/Navbar';
import { GetDashboard } from '../../../services/https';
import { DashboardInterface } from '../../../interfaces/IDashboard';
import { Layout, Pagination, Tooltip, Tag } from 'antd';
import bannerImage from "../../../assets/w3.jpg";

const DashboardView = () => {
  const [dashboards, setDashboards] = useState<DashboardInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await GetDashboard();
        if (res) {
          setDashboards(res);
        }
      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const totalPages = Math.ceil(dashboards.length / pageSize);
 const sortedDashboards = dashboards.sort((a, b) => (b.ID ?? 0) - (a.ID ?? 0));
const paginated = sortedDashboards.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div style={{ backgroundColor: "#f9f7f7", minHeight: "100vh" }}>
      <Navbar />
      <Layout style={{ backgroundColor: "#F9F7F7", minHeight: "100vh" }}>
        {/* Hero Section */}
        <div style={{
          backgroundImage: `url(${bannerImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            backgroundColor: 'rgba(33, 62, 155, 0.3)',
            padding: '40px 24px',
            textAlign: 'center',
            color: 'white'
          }}>
            <h1 style={{
              fontSize: '48px',
              fontWeight: 'bold',
              marginBottom: '16px'
            }}>
              ข่าวประชาสัมพันธ์
            </h1>
            <p style={{
              fontSize: '18px',
              maxWidth: '700px',
              margin: '0 auto',
              lineHeight: 1.6
            }}>
              ศูนย์รวมข่าวสาร กิจกรรม และประกาศสำคัญจากมหาวิทยาลัยเทคโนโลยีสุรนารี
              สำหรับนักศึกษา บุคลากร และผู้สนใจทั่วไป
            </p>
          </div>
        </div>

        {/* Content */}
        <div style={{ width: '100%', padding: '48px 24px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 50 }}>กำลังโหลดข้อมูล...</div>
          ) : (
            <>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '32px',
                marginBottom: '48px'
              }}>
                {paginated.map((item) => (
                  <div
                    key={item.ID ?? Math.random()}
                    style={{
                      display: 'flex',
                      background: 'linear-gradient(145deg, #156ef598, #73d0e744)',
                      borderRadius: '24px',
                      overflow: 'hidden',
                      boxShadow: '0 8px 32px rgba(17, 78, 78, 0.1)',
                      border: '1px solid #fcfcfc60',
                      width: '60%',
                      minHeight: '180px',
                      margin: '0 auto',
                      transition: 'transform 0.3s ease',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    {/* Image */}
                    <div style={{
                      width: '25%',
                      minWidth: '160px',
                      maxWidth: '200px',
                      display: 'flex',
                      marginLeft: 10,
                      marginTop: 10,
                      marginBottom: 10,
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '12px'
                    }}>
                      <Tooltip title="ดูภาพข่าว">
                        <img
                          src={item.image ?? ''}
                          alt={item.subject ?? 'ข่าว'}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: '12px',
                            border: '2px solid #3F72AF'
                          }}
                        />
                      </Tooltip>
                    </div>

                    {/* Content */}
                    <div style={{
                      flex: 1,
                      padding: '24px 32px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center'
                    }}>
                      <h3 style={{
                        fontSize: '24px',
                        fontWeight: 'bold',
                        color: '#112D4E',
                        marginBottom: '12px'
                      }}>
                        📢 {item.subject} 
                      </h3>

                      <p style={{
                        fontSize: '16px',
                        color: '#10498fff',
                        lineHeight: 1.7,
                        marginBottom: '16px'
                      }}>
                        {item.information}
                      </p>

                      {/* Date */}
                      <div style={{
                        fontSize: '14px',
                        color: '#555',
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        padding: '6px 14px',
                        borderRadius: '24px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '10px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                      }}>
                        <Calendar size={16} /> {formatDate(item.dashboardtime ?? '')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ✅ Pagination */}
              {totalPages > 1 && (
                <div style={{ textAlign: "center", marginTop: 40 }}>
                  <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={dashboards.length}
                    onChange={(page) => {
                      setCurrentPage(page);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    showSizeChanger={false}
                    showQuickJumper={false}
                    style={{ display: "inline-block" }}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </Layout>
    </div>
  );
};

export default DashboardView;
