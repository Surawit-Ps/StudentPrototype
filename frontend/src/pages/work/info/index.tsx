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

// ฟังก์ชันคำนวณระยะทางระหว่าง 2 จุด (เมตร)
const getDistanceInMeters = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3;
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δφ = toRad(lat2 - lat1);
    const Δλ = toRad(lon2 - lon1);
    const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const WorkInfo = () => {
    const { id } = useParams();
    const [work, setWork] = useState<WorkInterface | null>(null);
    const [position, setPosition] = useState<[number, number]>(defaultPosition);
    const [hasBooked, setHasBooked] = useState(false);
    const [hasCheckedIn, setHasCheckedIn] = useState(false);
    const [hasOtherBooking, setHasOtherBooking] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    const [user, setUser] = useState<UsersInterface | null>(null);
    const [distance, setDistance] = useState<number | null>(null);
    const [canCheckIn, setCanCheckIn] = useState(false);

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

    // ตรวจสอบตำแหน่งทุก 3 วินาที
    useEffect(() => {
        const interval = setInterval(() => {
            if (!work?.latitude || !work?.longitude) return;
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    const dist = getDistanceInMeters(latitude, longitude, work.latitude!, work.longitude!);
                    setDistance(dist);
                    setCanCheckIn(dist <= 40);
                },
                (err) => console.error("Error getting location:", err)
            );
        }, 1000);
        return () => clearInterval(interval);
    }, [work]);

    const checkBookingStatus = async () => {
        const user_id = Number(localStorage.getItem("user_id"));
        if (!user_id || !id) return;
        try {
            const bookings: BookingInterface[] = await GetBookings();
            const matched = bookings.find(b => b.user_id === user_id && b.work_id === Number(id));
            if (matched) setHasBooked(true);
            const otherBooking = bookings.find(b => b.user_id === user_id && b.work_id !== Number(id) && b.status === "registered");
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
            const matched = checkIns.find(ci => ci.user_id === user_id && ci.work_id === Number(id));
            if (matched) setHasCheckedIn(true);
        } catch (error) {
            console.error("Error fetching check-ins", error);
        }
    };

    const handleRegister = async () => {
        if (!work || !id) return;
        const user_id = Number(localStorage.getItem("user_id"));
        if (!user_id) { message.error("กรุณาเข้าสู่ระบบก่อนลงทะเบียน"); return; }
        if (hasOtherBooking) { message.warning("คุณมีงานที่ลงทะเบียนอยู่แล้ว ไม่สามารถลงทะเบียนงานอื่นได้"); return; }

        const booking: BookingInterface = { user_id, work_id: Number(id), status: "registered" };
        try {
            const response = await CreateBooking(booking);
            if (response) {
                message.success("ลงทะเบียนสำเร็จแล้ว!");
                setHasBooked(true);
                const updatedWorkuse = (work.workuse ?? 0) + 1;
                let updatedWorkstatus = work.workstatus_id;
                if (updatedWorkuse >= (work.workcount ?? 0)) updatedWorkstatus = 2;
                const updatedWork: WorkInterface = { ...work, workuse: updatedWorkuse, workstatus_id: updatedWorkstatus };
                const updateResponse = await UpdateWork(Number(id), updatedWork);
                if (updateResponse) setWork(updatedWork);
            }
        } catch (error) { console.error(error); message.error("ไม่สามารถลงทะเบียนได้"); }
    };

    const handleCheckIn = async () => {
        const user_id = Number(localStorage.getItem("user_id"));
        if (!user_id || !id) return;

        try {
            const response = await CreateCheckIn({ user_id, work_id: Number(id) });
            if (response) { message.success("เช็คอินสำเร็จแล้ว!"); setHasCheckedIn(true); }
            else message.error("เช็คอินไม่สำเร็จ กรุณาลองใหม่");
        } catch (error) { console.error(error); message.error("เกิดข้อผิดพลาดในการเช็คอิน"); }
    };

    const handleCancelBooking = async () => {
        const user_id = Number(localStorage.getItem("user_id"));
        if (!user_id || !id) return;
        try {
            const bookings: BookingInterface[] = await GetBookings();
            const booking = bookings.find(b => b.user_id === user_id && b.work_id === Number(id));
            if (!booking || !booking.ID) { message.error("ไม่พบข้อมูลการลงทะเบียนนี้"); return; }

            const response = await DeleteBooking(booking.ID);
            if (response) {
                message.success("ยกเลิกการลงทะเบียนสำเร็จแล้ว");
                setHasBooked(false); setHasOtherBooking(false);

                if (work) {
                    const updatedWork: WorkInterface = { ...work, workuse: (work.workuse ?? 1) - 1, workstatus_id: 1 };
                    const updateResponse = await UpdateWork(Number(id), updatedWork);
                    if (updateResponse) setWork(updatedWork);
                }
            }
        } catch (error) { console.error(error); message.error("เกิดข้อผิดพลาดในการยกเลิกการลงทะเบียน"); }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    if (!work) return null;

    return (
        <>
            <Navbar />
            <div style={{ backgroundColor: '#F9F7F7', minHeight: '100vh', padding: '40px 20px 20px 20px' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 400px', gap: '32px' }}>
                    {/* ข้อมูลงาน */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div style={{ backgroundColor: '#ffffff8a', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 8px 32px rgba(17, 45, 78, 0.08)', border: '1px solid #DBE2EF' }}>
                            <div style={{ position: 'relative' }}>
                                <img src={work.photo} alt={work.title} style={{ width: '100%', height: '400px', objectFit: 'cover' }} />
                            </div>
                            <div style={{ padding: '16px 32px 32px 32px' }}>
                                <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#112D4E', marginBottom: '8px' }}>{work.title}</h1>
                                <p style={{ fontSize: '16px', color: '#6B7280', marginBottom: '24px' }}>{work.description}</p>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                                    <InfoItem icon={<Calendar size={20} />} label="วันเวลา" value={formatDate(work.worktime)} />
                                    <InfoItem icon={<Users size={20} />} label="จำนวนที่ต้องการ" value={`${work.workcount ?? '-'} คน`} />
                                    <InfoItem icon={<MapPin size={20} />} label="สถานที่" value={work.place ?? '-'} />
                                    <InfoItem icon={work.worktype_id === 1 ? <DollarSign size={20} /> : <Heart size={20} />} label={work.worktype_id === 1 ? 'ค่าตอบแทน' : 'ชั่วโมงจิตอาสา'} value={work.worktype_id === 1 ? `฿ ${work.paid ?? '-'} บาท` : `${work.volunteer ?? '-'} ชั่วโมง`} />
                                </div>
                            </div>
                        </div>

                        {/* แผนที่ */}
                        <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '32px', boxShadow: '0 8px 32px rgba(17, 45, 78, 0.08)', border: '1px solid #DBE2EF' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#112D4E', marginBottom: '12px' }}>ตำแหน่งที่ตั้งสถานที่</h2>
                            <MapContainer center={position} zoom={14} scrollWheelZoom={false} style={{ height: 400, width: '100%', borderRadius: 16 }}>
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <Marker position={position} />
                            </MapContainer>
                        </div>
                    </div>

                    {/* กล่องด้านขวา */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', boxShadow: '0 8px 32px rgba(17, 45, 78, 0.08)' }}>
                            {/* ส่วนแสดงค่าตอบแทน / ชั่วโมงจิตอาสา */}
                            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                <div style={{ color: '#6B7280' }}>{work.worktype_id === 1 ? 'คุณจะได้รับ' : 'ชั่วโมงจิตอาสา'}</div>
                                <div style={{ fontSize: '28px', fontWeight: 'bold', color: work.worktype_id === 1 ? '#10B981' : '#F59E0B' }}>
                                    {work.worktype_id === 1 ? `฿ ${work.paid ?? '-'} บาท` : `${work.volunteer ?? '-'} ชั่วโมง`}
                                </div>
                            </div>

                            {/* ปุ่มลงทะเบียน / เช็คอิน / ยกเลิก */}
                            {!isOwner && user?.Role === "user" && (
                                <>
                                    {hasBooked && !hasCheckedIn ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            <button 
                                                onClick={handleCheckIn} 
                                                disabled={!canCheckIn}
                                                style={{
                                                    fontSize: '16px',
                                                    width: '100%',
                                                    padding: '16px',
                                                    backgroundColor: canCheckIn ? '#10B981' : '#9CA3AF',
                                                    color: 'white',
                                                    fontWeight: 'bold',
                                                    border: 'none',
                                                    borderRadius: '16px',
                                                    cursor: canCheckIn ? 'pointer' : 'not-allowed'
                                                }}
                                            >
                                                <CheckCircleOutlined /> เช็คอินเข้าร่วมงาน
                                            </button>
                                            <p style={{ fontSize: '12px', textAlign: 'center', color: '#6B7280' }}>
                                                {distance !== null ? `คุณอยู่ห่างจากงาน ${Math.round(distance)} เมตร` : 'กำลังตรวจสอบตำแหน่ง...'}
                                            </p>
                                            <button
                                                onClick={handleCancelBooking}
                                                style={{ fontSize: '16px', width: '100%', padding: '16px', backgroundColor: '#EF4444', color: 'white', fontWeight: 'bold', border: 'none', borderRadius: '16px' }}
                                            >
                                                <XCircle size={16} /> ยกเลิกการลงทะเบียน
                                            </button>
                                        </div>
                                    ) : hasBooked && hasCheckedIn ? (
                                        <div style={{ textAlign: 'center', color: '#10B981', fontWeight: 'bold' }}>
                                            คุณเช็คอินเข้าร่วมงานนี้แล้ว
                                        </div>
                                    ) : (
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
                                                borderRadius: '16px'
                                            }}
                                        >
                                            <CheckCircleOutlined /> ลงทะเบียนเข้าร่วม
                                        </button>
                                    )}
                                    {hasOtherBooking && !hasBooked && (
                                        <p style={{ fontSize: '12px', textAlign: 'center', color: '#9CA3AF', marginTop: '12px' }}>
                                            คุณมีงานที่ลงทะเบียนอยู่แล้ว ไม่สามารถลงทะเบียนงานอื่นได้
                                        </p>
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
            <div style={{ fontSize: '12px', color: '#6B7280' }}>{label}</div>
            <div style={{ fontSize: '14px', color: '#112D4E', fontWeight: 'bold' }}>{value}</div>
        </div>
    </div>
);

export default WorkInfo;