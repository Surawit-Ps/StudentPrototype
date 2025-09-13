import React, { useEffect, useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { SignIn, SignUp, GetGenders } from '../../services/https/index';
import { UsersInterface } from '../../interfaces/IUser';
import { GendersInterface } from '../../interfaces/IGender';
import { useNavigate } from 'react-router-dom';
import { Upload ,message} from 'antd';
import ImgCrop from 'antd-img-crop';
import type { UploadFile } from 'antd';

const LoginPage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [genders, setGenders] = useState<GendersInterface[]>([]);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    birthDay: '',
    genderID: '',
    role: 'user',
  });

  useEffect(() => {
    const fetchGenders = async () => {
      const res = await GetGenders();
      if (res) setGenders(res);
    };
    if (!isLogin) fetchGenders();
  }, [isLogin]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const getBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLogin) {
      try {
        const res = await SignIn(formData.email, formData.password);
        if (res) {
          message.success('เข้าสู่ระบบสำเร็จ');
          navigate('/');
        } else {
          message.error('เข้าสู่ระบบไม่สำเร็จ');
        }
      } catch (error) {
        console.error('Login error:', error);
        message.error('เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
      }
    } else {
      if (formData.password !== formData.confirmPassword) {
        message.error('รหัสผ่านไม่ตรงกัน');
        return;
      }

      if (!fileList[0] || !fileList[0].originFileObj) {
        message.error('กรุณาอัปโหลดรูปโปรไฟล์');
        return;
      }

      try {
        const base64Image = await getBase64(fileList[0].originFileObj as File);

        const payload: UsersInterface = {
          FirstName: formData.firstName,
          LastName: formData.lastName,
          Email: formData.email,
          Password: formData.password,
          BirthDay: new Date(formData.birthDay).toISOString(), // ✅ แปลงเป็น ISO string
          Profile: base64Image,
          GenderID: parseInt(formData.genderID),
          Role: formData.role,
        };

        const res = await SignUp(payload);
        console.log('API Response:', res);

        if (res?.message === "Sign-up successful") {
          message.success('สมัครสมาชิกสำเร็จ');
          setIsLogin(true);
        } else {
          message.error('สมัครสมาชิกไม่สำเร็จ');
        }





      } catch (error) {
        console.error('Signup error:', error);
        message.error('เกิดข้อผิดพลาดในการสมัครสมาชิก');
      }
    }
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.cardWrapper}>
        <div style={styles.headerContainer as React.CSSProperties}>
          <div style={styles.logoRow}>
            <h1 style={styles.title}>Studentjobhub</h1>
          </div>
          <p style={styles.subtitle}>
            {isLogin
              ? 'เข้าสู่ระบบเพื่อค้นหางานที่เหมาะสมกับคุณ'
              : 'สมัครสมาชิกเพื่อเริ่มต้นการหางาน'}
          </p>
        </div>

        <div style={styles.card}>
          <div style={styles.toggleContainer}>
            <button
              onClick={() => setIsLogin(true)}
              style={{
                ...styles.toggleButton,
                ...(isLogin ? styles.activeToggle : styles.inactiveToggle),
              }}
            >
              เข้าสู่ระบบ
            </button>
            <button
              onClick={() => setIsLogin(false)}
              style={{
                ...styles.toggleButton,
                ...(!isLogin ? styles.activeToggle : styles.inactiveToggle),
              }}
            >
              สมัครสมาชิก
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <div style={{ 
  marginBottom: 16, 
  display: 'flex', 
  justifyContent: 'center',  // กึ่งกลางแนวนอน
  alignItems: 'center',      // กึ่งกลางแนวตั้ง
  flexDirection: 'column',   // ให้ label อยู่ด้านบน upload
}}>
                  <label>รูปโปรไฟล์</label>
                  <ImgCrop rotationSlider>
                    <Upload
                      fileList={fileList}
                      onChange={({ fileList: newList }) => setFileList(newList)}
                      beforeUpload={(file) => {
                        setFileList([file]);
                        return false;
                      }}
                      listType="picture-card"
                      maxCount={1}
                    >
                      {fileList.length < 1 && <div>อัปโหลด</div>}
                    </Upload>
                  </ImgCrop>
                </div>

                <div style={styles.inputGroup}>
                  <User style={styles.icon} />
                  <input
                    type="text"
                    name="firstName"
                    placeholder="ชื่อ"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    style={styles.input}
                  />
                </div>
                <div style={styles.inputGroup}>
                  <User style={styles.icon} />
                  <input
                    type="text"
                    name="lastName"
                    placeholder="นามสกุล"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    style={styles.input}
                  />
                </div>
                <div style={styles.inputGroup}>
                  <input
                    type="date"
                    name="birthDay"
                    value={formData.birthDay}
                    onChange={handleInputChange}
                    required
                    style={styles.input}
                  />
                </div>
                <div style={styles.inputGroup}>
                  <select
                    name="genderID"
                    value={formData.genderID}
                    onChange={handleInputChange}
                    required
                    style={styles.input}
                  >
                    <option value="">เลือกเพศ</option>
                    {genders.map((g) => (
                      <option key={g.ID} value={g.ID}>
                        {g.Name}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={styles.inputGroup}>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                    style={styles.input}
                  >
                    <option value="user">นักศึกษา</option>
                    <option value="employer">บุคคลภายนอก</option>
                  </select>
                </div>
              </>
            )}

            <div style={styles.inputGroup}>
              <Mail style={styles.icon} />
              <input
                type="email"
                name="email"
                placeholder="อีเมล"
                value={formData.email}
                onChange={handleInputChange}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <Lock style={styles.icon} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="รหัสผ่าน"
                value={formData.password}
                onChange={handleInputChange}
                required
                style={styles.input}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {!isLogin && (
              <div style={styles.inputGroup}>
                <Lock style={styles.icon} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="ยืนยันรหัสผ่าน"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  style={styles.input}
                />
              </div>
            )}

            <button type="submit" style={styles.submitButton}>
              {isLogin ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const styles = {
  pageContainer: {
    minHeight: '100vh',
    background: 'linear-gradient(to bottom right, #f3e8ff, #e0f2ff)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
backgroundImage: 'url("/images/login-bg.jpg")',     backgroundSize: 'cover',         // ให้เต็มหน้าจอ
    backgroundPosition: 'center',    // จัดตรงกลาง
    backgroundRepeat: 'no-repeat',   // ไม่ซ้ำ
    
  },
  cardWrapper: {
    width: '100%',
    maxWidth: 400,
  },
  headerContainer: {
    textAlign: 'center',
    marginBottom: 32,
  },
  logoRow: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoBox: {
    width: 40,
    height: 40,
    background: 'linear-gradient(to right, #9333ea, #3b82f6)',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  subtitle: {
    color: '#6b7280',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    padding: 24,
  },
  toggleContainer: {
    display: 'flex',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    marginBottom: 24,
  },
  toggleButton: {
    flex: 1,
    padding: '12px 16px',
    fontSize: 14,
    fontWeight: '500',
    border: 'none',
    cursor: 'pointer',
    borderRadius: 6,
  },
  activeToggle: {
    backgroundColor: '#fff',
    color: '#9333ea',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  inactiveToggle: {
    backgroundColor: 'transparent',
    color: '#6b7280',
  },
  inputGroup: {
    position: 'relative' as 'relative',
    marginBottom: 16,
  },
  icon: {
    position: 'absolute' as 'absolute',
    left: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#9ca3af',
  },
  input: {
    width: '100%',
    padding: '12px 16px 12px 40px',
    borderRadius: 8,
    border: '1px solid #d1d5db',
    outline: 'none',
    fontSize: 14,
    transition: 'all 0.2s ease-in-out',
  },
  eyeButton: {
    position: 'absolute' as 'absolute',
    right: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#9ca3af',
  },
  submitButton: {
    width: '100%',
    background: 'linear-gradient(to right, #9333ea, #3b82f6)',
    color: '#fff',
    padding: 12,
    borderRadius: 8,
    fontWeight: '500',
    fontSize: 16,
    border: 'none',
    cursor: 'pointer',
    marginTop: 8,
  },
};

export default LoginPage;
