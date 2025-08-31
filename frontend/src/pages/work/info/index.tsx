import { useEffect, useState } from 'react';
import {
    MapPin, Users, DollarSign, Heart,
    CheckCircle, XCircle, Calendar, Map
} from 'lucide-react';
import { useParams } from 'react-router-dom';
import { 
    GetWorkById, CreateBooking, GetBookings, UpdateWork, 
    CreateCheckIn, GetCheckIns, DeleteBooking, GetUserById 
} from '../../../services/https';
import { WorkInterface } from '../../../interfaces/IWork';
import { UsersInterface } from '../../../interfaces/IUser';
import { BookingInterface } from '../../../interfaces/IBooking';
import { CheckInInterface } from '../../../interfaces/ICheckIn';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { CheckCircleOutlined } from "@ant-design/icons";
import { message } from "antd";
import 'leaflet/dist/leaflet.css';
import Navbar from '../../../components/Navbar/Navbar';

const defaultPosition: [number, number] = [14.883451, 102.010589];

const WorkInfo = () => {
    const { id } = useParams();
    const [work, setWork] = useState<WorkInterface | null>(null);
    const [position, setPosition] = useState<[number, number]>(defaultPosition);
    const [hasBooked, setHasBooked] = useState(false);
    const [hasCheckedIn, setHasCheckedIn] = useState(false);
    const [hasOtherBooking, setHasOtherBooking] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    const [user, setUser] = useState<UsersInterface | null>(null);

    useEffect(() => {
        const fetchUserAndWork = async () => {
            const userIdStr = localStorage.getItem("user_id");
            let userId: number | null = null;
            if (userIdStr) {
                userId = Number(userIdStr);
                const userData = await GetUserById(userId);
                if (userData) setUser(userData);
            }

            if (!id) return;
            const workData = await GetWorkById(Number(id));
            if (workData) {
                setWork(workData);
                if (workData.latitude !== undefined && workData.longitude !== undefined) {
                    setPosition([workData.latitude, workData.longitude]);
                }
                if (userId !== null && workData.poster_id === userId) {
                    setIsOwner(true);
                }
            }

            await checkBookingStatus();
            await checkCheckInStatus();
        };

        fetchUserAndWork();
    }, [id]);

    const checkBookingStatus = async () => {
        const user_id = Number(localStorage.getItem("user_id"));
        if (!user_id || !id) return;

        try {
            const bookings: BookingInterface[] = await GetBookings();

            // งานนี้
            const matched = bookings.find(
                (b) => b.user_id === user_id && b.work_id === Number(id)
            );
            if (matched) setHasBooked(true);

            // งานอื่น
            const otherBooking = bookings.find(
                (b) => b.user_id === user_id && b.work_id !== Number(id) && b.status === "registered"
            );
            if (otherBooking) setHasOtherBooking(true);

        } catch (error) {
            console.error("Error fetching bookings", error);
        }
    };

    const checkCheckInStatus = async () => {
        const user_id = Number(localStorage.getItem("user_id"));
        if (!user_id || !id) return;

        try {
            const checkIns: CheckInInterface[] = await GetCheckIns();
            const matched = checkIns.find(
                (ci) => ci.user_id === user_id && ci.work_id === Number(id)
            );
            if (matched) setHasCheckedIn(true);
        } catch (error) {
            console.error("Error fetching check-ins", error);
        }
    };

    const handleRegister = async () => {
        if (!work || !id) return;

        const user_id = Number(localStorage.getItem("user_id"));
        if (!user_id) {
            message.error("กรุณาเข้าสู่ระบบก่อนลงทะเบียน");
            return;
        }

        if (hasOtherBooking) {
            message.warning("คุณมีงานที่ลงทะเบียนอยู่แล้ว ไม่สามารถลงทะเบียนงานอื่นได้");
            return;
        }

        const booking: BookingInterface = {
            user_id: user_id,
            work_id: Number(id),
            status: "registered",
        };

        try {
            const response = await CreateBooking(booking);
            if (response) {
                message.success("ลงทะเบียนสำเร็จแล้ว!");
                setHasBooked(true);

                const updatedWorkuse = (work.workuse ?? 0) + 1;
                let updatedWorkstatus = work.workstatus_id;

                if (updatedWorkuse >= (work.workcount ?? 0)) {
                    updatedWorkstatus = 2;
                }

                const updatedWork: WorkInterface = {
                    ...work,
                    workuse: updatedWorkuse,
                    workstatus_id: updatedWorkstatus,
                };

                const updateResponse = await UpdateWork(Number(id), updatedWork);
                if (updateResponse) {
                    setWork(updatedWork);
                    if (updatedWorkstatus === 2) {
                        message.info("ปิดรับสมัครแล้ว เนื่องจากครบจำนวนผู้ลงทะเบียน");
                    }
                } else {
                    message.error("อัพเดตจำนวนผู้เข้าร่วมไม่สำเร็จ");
                }

            } else {
                message.error("เกิดข้อผิดพลาดในการลงทะเบียน");
            }
        } catch (error) {
            console.error("Error creating booking or updating work:", error);
            message.error("ไม่สามารถลงทะเบียนได้");
        }
    };

    const handleCheckIn = async () => {
        const user_id = Number(localStorage.getItem("user_id"));
        if (!user_id || !id) return;

        const checkInData: CheckInInterface = {
            user_id: user_id,
            work_id: Number(id),
        };

        try {
            const response = await CreateCheckIn(checkInData);
            if (response) {
                message.success("เช็คอินสำเร็จแล้ว!");
                setHasCheckedIn(true);
            } else {
                message.error("เช็คอินไม่สำเร็จ กรุณาลองใหม่");
            }
        } catch (error) {
            console.error("Error during check-in:", error);
            message.error("เกิดข้อผิดพลาดในการเช็คอิน");
        }
    };

    const handleCancelBooking = async () => {
        const user_id = Number(localStorage.getItem("user_id"));
        if (!user_id || !id) return;

        try {
            // Find the booking for this user and work
            const bookings: BookingInterface[] = await GetBookings();
            const booking = bookings.find(
                (b) => b.user_id === user_id && b.work_id === Number(id)
            );
            if (!booking || !booking.ID) {
                message.error("ไม่พบข้อมูลการลงทะเบียนนี้");
                return;
            }
            const response = await DeleteBooking(booking.ID);
            if (response) {
                message.success("ยกเลิกการลงทะเบียนสำเร็จแล้ว");
                setHasBooked(false);
                setHasOtherBooking(false);

                // ลดจำนวนผู้เข้าร่วมงาน
                if (work) {
                    const updatedWork: WorkInterface = {
                        ...work,
                        workuse: (work.workuse ?? 1) - 1,
                        workstatus_id: 1 // เปิดรับสมัครอีกครั้งหากถูกปิดไป
                    };
                    const updateResponse = await UpdateWork(Number(id), updatedWork);
                    if (updateResponse) setWork(updatedWork);
                }
            } else {
                message.error("ยกเลิกการลงทะเบียนไม่สำเร็จ");
            }
        } catch (error) {
            console.error("Error canceling booking:", error);
            message.error("เกิดข้อผิดพลาดในการยกเลิกการลงทะเบียน");
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (!work) return null;

    return (
        <>
            <Navbar />
            <div style={{ backgroundColor: '#F9F7F7', minHeight: '100vh', padding: '40px 20px 20px 20px', marginTop: 0 }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 400px', gap: '32px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div style={{ backgroundColor: '#ffffff8a', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 8px 32px rgba(17, 45, 78, 0.08)', border: '1px solid #DBE2EF' }}>
                            <div style={{ position: 'relative' }}>
                                <img src={work.photo} alt={work.title} style={{ width: '100%', height: '400px', objectFit: 'cover' }} />
                                <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '12px' }}>
                                    {work.workstatus_id !== undefined && <StatusBadge status={work.workstatus_id} />}
                                    {work.worktype_id !== undefined && <TypeBadge type={work.worktype_id} />}
                                </div>
                            </div>
                            <div style={{ padding: '16px 32px 32px 32px' }}>
                                <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#112D4E', marginBottom: '8px', marginTop: '-8px' }}>{work.title}</h1>
                                <p style={{ fontSize: '16px', color: '#6B7280', marginBottom: '24px' }}>{work.description}</p>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                                    <InfoItem icon={<Calendar size={20} />} label="วันเวลา" value={formatDate(work.worktime)} />
                                    <InfoItem icon={<Users size={20} />} label="จำนวนที่ต้องการ" value={`${work.workcount ?? '-'} คน`} />
                                    <InfoItem icon={<MapPin size={20} />} label="สถานที่" value={work.place ?? '-'} />
                                    <InfoItem icon={work.worktype_id === 1 ? <DollarSign size={20} /> : <Heart size={20} />} label={work.worktype_id === 1 ? 'ค่าตอบแทน' : 'ชั่วโมงจิตอาสา'} value={work.worktype_id === 1 ? `฿ ${work.paid ?? '-'} บาท` : `${work.volunteer ?? '-'} ชั่วโมง`} />
                                </div>
                            </div>
                        </div>
                        <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '32px', boxShadow: '0 8px 32px rgba(17, 45, 78, 0.08)', border: '1px solid #DBE2EF' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                <div style={{ backgroundColor: '#3F72AF', color: 'white', padding: '12px', borderRadius: '12px' }}>
                                    <Map size={24} />
                                </div>
                                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#112D4E', margin: 0 }}>ตำแหน่งที่ตั้งสถานที่</h2>
                            </div>
                            <MapContainer center={position} zoom={14} scrollWheelZoom={false} style={{ height: 400, width: '100%', borderRadius: 16, border: '2px solid #DBE2EF' }}>
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <Marker position={position} />
                            </MapContainer>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', boxShadow: '0 8px 32px rgba(17, 45, 78, 0.08)', border: '1px solid #DBE2EF', position: 'sticky', top: '20px' }}>
                            <div style={{ backgroundColor: work.workstatus_id === 1 ? '#ECFDF5' : '#FEF2F2', color: work.workstatus_id === 1 ? '#10B981' : '#EF4444', padding: '12px', borderRadius: '12px', textAlign: 'center', fontWeight: 'bold', marginBottom: '20px' }}>
                                {work.workstatus_id === 1 ? 'เปิดรับสมัครแล้ว' : 'ปิดรับสมัครแล้ว'}
                            </div>
                            {!isOwner && user?.Role === "user" && (
                                <>
                                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                        <div style={{ color: '#6B7280' }}>{work.worktype_id === 1 ? 'คุณจะได้รับ' : 'ชั่วโมงจิตอาสา'}</div>
                                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: work.worktype_id === 1 ? '#10B981' : '#F59E0B' }}>{work.worktype_id === 1 ? `฿ ${work.paid ?? '-'} บาท` : `${work.volunteer ?? '-'} ชั่วโมง`}</div>
                                    </div>
                                    {hasBooked && !hasCheckedIn ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            <button 
                                                onClick={handleCheckIn} 
                                                style={{ fontSize: '16px', width: '100%', padding: '16px', backgroundColor: '#10B981', color: 'white', fontWeight: 'bold', border: 'none', borderRadius: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                            >
                                                <CheckCircleOutlined /> เช็คอินเข้าร่วมงาน
                                            </button>
                                            <button
                                                onClick={handleCancelBooking}
                                                style={{ fontSize: '16px', width: '100%', padding: '16px', backgroundColor: '#EF4444', color: 'white', fontWeight: 'bold', border: 'none', borderRadius: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                            >
                                                <XCircle size={16} /> ยกเลิกการลงทะเบียน
                                            </button>
                                        </div>
                                    ) : hasBooked && hasCheckedIn ? (
                                        <div style={{ textAlign: 'center', color: '#10B981', fontWeight: 'bold', fontSize: '16px' }}>
                                            คุณเช็คอินเข้าร่วมงานนี้แล้ว
                                        </div>
                                    ) : (
                                        <>
                                            <button 
                                                onClick={handleRegister} 
                                                disabled={work.workstatus_id !== 1 || hasOtherBooking} 
                                                style={{
                                                    fontSize: '16px',
                                                    width: '100%',
                                                    padding: '16px',
                                                    backgroundColor: work.workstatus_id === 1 && !hasOtherBooking ? '#3F72AF' : '#9CA3AF',
                                                    color: 'white',
                                                    fontWeight: 'bold',
                                                    border: 'none',
                                                    borderRadius: '16px',
                                                    cursor: work.workstatus_id === 1 && !hasOtherBooking ? 'pointer' : 'not-allowed',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '8px'
                                                }}
                                            >
                                                <CheckCircleOutlined /> ลงทะเบียนเข้าร่วม
                                            </button>
                                            <p style={{ fontSize: '12px', textAlign: 'center', color: '#9CA3AF', marginTop: '12px' }}>
                                                {hasOtherBooking ? 'คุณมีงานที่ลงทะเบียนอยู่แล้ว ไม่สามารถลงทะเบียนงานอื่นได้' : 'การลงทะเบียนจะมีผลทันทีหลังจากกดยืนยัน'}
                                            </p>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

const InfoItem = ({ icon, label, value }: { icon: JSX.Element; label: string; value: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#F9F7F7', padding: '16px', borderRadius: '12px' }}>
        <div style={{ backgroundColor: '#3F72AF', color: 'white', padding: '8px', borderRadius: '8px' }}>{icon}</div>
        <div>
            <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500' }}>{label}</div>
            <div style={{ fontSize: '14px', color: '#112D4E', fontWeight: 'bold' }}>{value}</div>
        </div>
    </div>
);

const StatusBadge = ({ status }: { status: number }) => (
    <div style={{ backgroundColor: status === 1 ? '#10B981' : '#EF4444', color: 'white', padding: '14px 16px', borderRadius: '50px', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
        {status === 1 ? <CheckCircle size={16} /> : <XCircle size={16} />}
        {status === 1 ? 'เปิดรับสมัคร' : 'ปิดรับสมัคร'}
    </div>
);

const TypeBadge = ({ type }: { type: number }) => (
    <div style={{ backgroundColor: type === 1 ? '#3F72AF' : '#F59E0B', color: 'white', padding: '14px 16px', borderRadius: '50px', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
        {type === 1 ? <DollarSign size={16} /> : <Heart size={16} />}
        {type === 1 ? 'มีค่าตอบแทน' : 'จิตอาสา'}
    </div>
);

export default WorkInfo;
