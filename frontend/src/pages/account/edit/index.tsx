import { useState, useEffect } from "react";
import {
  Space,
  Button,
  Col,
  Row,
  Divider,
  Form,
  Input,
  Card,
  message,
  DatePicker,
  Select,
  Upload,
  notification,
} from "antd";
import dayjs from "dayjs";
import { PlusOutlined, CameraOutlined } from "@ant-design/icons";
import { UsersInterface } from "../../../interfaces/IUser";
import { GendersInterface } from "../../../interfaces/IGender";
import { GetGenders, GetUserById, UpdateUser } from "../../../services/https";
import { useNavigate, useParams } from "react-router-dom";
import { RcFile } from "antd/es/upload";
const { Option } = Select;

function CustomerEdit() {
  const navigate = useNavigate();
  // const [messageApi, contextHolder] = message.useMessage();
  const openNotification = (type: "success" | "error", description: string) => {
    notification[type]({
      message: type === "success" ? "สำเร็จ" : "ผิดพลาด",
      description,
      placement: "bottomRight",
    });
  };
  const [user, setUser] = useState<UsersInterface>();
  const [genders, setGenders] = useState<GendersInterface[]>([]);

  // รับข้อมูลจาก params
  let { id } = useParams();
  // อ้างอิง form กรอกข้อมูล
  const [form] = Form.useForm();

  const onFinish = async (values: UsersInterface) => {
    values.ID = user?.ID;
    if (!values.Profile) {
      values.Profile = user?.Profile || ""; // ถ้าไม่ได้เปลี่ยน ให้ใช้ของเดิม
    }

    let res = await UpdateUser(values);

    if (res) {
      openNotification("success", res.message || "อัปเดตข้อมูลสำเร็จ");
      setTimeout(() => {
        navigate(`/account/profile/${user?.ID}`);
      }, 1500);
    } else {
      openNotification("error", res.message || "เกิดข้อผิดพลาด !");
    }
  };


  const getGendet = async () => {
    let res = await GetGenders();
    if (res) {
      setGenders(res);
    }
  };

  const getUserById = async () => {
    let res = await GetUserById(Number(id));
    if (res) {
      setUser(res);
      // set form ข้อมูลเริ่มของผู่้ใช้ที่เราแก้ไข
      form.setFieldsValue({
        FirstName: res.FirstName,
        LastName: res.LastName,
        GenderID: res.GenderID,
        Email: res.Email,
        BirthDay: dayjs(res.BirthDay),
        Contact: res.Contact,
        Role: res.Role,
      });
    }
  };

  useEffect(() => {
    getGendet();
    getUserById();
  }, []);

  return (
    <div>
      <Card>
        <h2> แก้ไขข้อมูลผู้ใช้งาน</h2>
        <Divider />
        <Form
          name="basic"
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <Form.Item name="Profile" valuePropName="file">
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                    <Upload
                      accept=".png,.jpg"
                      showUploadList={false}
                      beforeUpload={(file: RcFile) => {
                        const isValidType = ["image/jpeg", "image/png"].includes(file.type);
                        if (!isValidType) {
                          message.error("อนุญาตเฉพาะไฟล์ .png และ .jpg เท่านั้น");
                          return Upload.LIST_IGNORE;
                        }
                        const reader = new FileReader();
                        reader.onload = e => {
                          const result = e.target?.result as string;
                          form.setFieldsValue({ Profile: result });
                          setUser((prev) => ({ ...prev!, Profile: result }));
                        };
                        reader.readAsDataURL(file);
                        return false;
                      }}
                    >
                      <div style={{ position: "relative", width: 150, height: 150, border: "1px dashed #ccc", borderRadius: 8 }}>
                        {user?.Profile ? (
                          <>
                            <img
                              src={user.Profile}
                              alt="avatar"
                              style={{
                                width: "100%",
                                height: "100%",
                                borderRadius: 8,
                                objectFit: "cover",
                              }}
                            />
                            <CameraOutlined
                              style={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                                fontSize: 28,
                                color: "#fff",
                                backgroundColor: "rgba(0,0,0,0.4)",
                                borderRadius: "50%",
                                padding: 8,
                              }}
                            />
                          </>
                        ) : (
                          <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                            <PlusOutlined style={{ fontSize: 24 }} />
                            <div>อัปโหลด</div>
                          </div>
                        )}
                      </div>

                      {user?.Profile && (
                        <div style={{ textAlign: "center", marginTop: 8 }}>
                          <Button type="link">เปลี่ยนรูป</Button>
                        </div>
                      )}
                    </Upload>
                  </div>
                </Form.Item>
              </div>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label="ชื่อจริง" name="FirstName" rules={[{ required: true, message: "กรุณากรอกชื่อ!" }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="นามสกุล" name="LastName" rules={[{ required: true, message: "กรุณากรอกนามสกุล!" }]}>
                <Input />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label="อีเมล" name="Email" rules={[{ type: "email" }, { required: true, message: "กรุณากรอกอีเมล!" }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="วัน/เดือน/ปี เกิด" name="BirthDay" rules={[{ required: true, message: "กรุณาเลือกวันเกิด!" }]}>
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="GenderID" label="เพศ" rules={[{ required: true, message: "กรุณาระบุเพศ!" }]}>
                <Select allowClear>
                  {genders.map((item) => (
                    <Option value={item.ID} key={item.Name}>{item.Name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Role" name="Role" style={{ display: "none" }}>
                <Input />
              </Form.Item>
            </Col>

          </Row>

          <Row justify="end">
            <Col style={{ marginTop: "40px" }}>
              <Form.Item>
                <Space>
                  <Button
                    htmlType="button"
                    style={{ marginRight: "10px" }}
                    onClick={() => navigate(-1)}
                  >
                    ยกเลิก
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<PlusOutlined />}
                  >
                    ยืนยัน
                  </Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
}

export default CustomerEdit;
