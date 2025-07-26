import { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';
import Navbar from '../../../components/Navbar/Navbar';
import { GetDashboard } from '../../../services/https';
import { DashboardInterface } from '../../../interfaces/IDashboard';
import { Layout, Pagination } from 'antd';

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
  const paginated = dashboards.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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
          background: 'linear-gradient(135deg, #3F72AF 0%, #112D4E 100%)',
          marginTop: 24,
          position: 'relative',
          overflow: 'hidden',
          paddingTop: '8px',
          paddingBottom: '8px'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
          }} />
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 24px',
            textAlign: 'center',
            position: 'relative',
            zIndex: 2
          }}>
            <h1 style={{
              fontSize: '58px',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '16px',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
              ข่าวประชาสัมพันธ์
            </h1>
            <p style={{
              color: 'white',
              fontSize: '20px',
              maxWidth: '700px',
              marginInline: 'auto',
              lineHeight: 1.6,
              textShadow: '0 1px 3px rgba(0, 0, 0, 0.4)',
              fontWeight: 400
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
                      backgroundColor: '#F9F7F7',
                      borderRadius: '24px',
                      overflow: 'hidden',
                      boxShadow: '0 8px 32px rgba(17, 78, 78, 0.1)',
                      border: '1px solid #DBE2EF',
                      width: '60%',
                      minHeight: '180px',
                      margin: '0 auto'
                    }}
                  >
                    {/* Image */}
                    <div style={{
                      width: '25%',
                      minWidth: '160px',
                      maxWidth: '200px',
                      backgroundColor: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '12px'
                    }}>
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
                        {item.subject}
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
                        backgroundColor: '#ffffff',
                        padding: '6px 14px',
                        borderRadius: '24px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
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
                      window.scrollTo({ top: 0, behavior: "smooth" }); // ✅ scroll to top
                    }}
                    showSizeChanger={false}
                    showQuickJumper={false} // ✅ hide "Go to page"
                    style={{ display: "inline-block" }} // ✅ center horizontally
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
