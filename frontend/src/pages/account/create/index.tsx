import React, { useState, useEffect } from "react";
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
  Select,
  DatePicker,
  Upload,
  notification,
} from "antd";
import { PlusOutlined, EditOutlined } from "@ant-design/icons";
import { UsersInterface } from "../../../interfaces/IUser";
import { GendersInterface } from "../../../interfaces/IGender";
import { CreateUser, GetGenders } from "../../../services/https";
import { useNavigate } from "react-router-dom";
import type { GetProp, UploadFile, UploadProps } from "antd";
import ImgCrop from "antd-img-crop";
import { RcFile } from 'antd/es/upload';

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

const { Option } = Select;

function CustomerCreate() {
  const navigate = useNavigate();
  const openNotification = (type: "success" | "error", description: string) => {
    notification[type]({
      message: type === "success" ? "สำเร็จ" : "เกิดข้อผิดพลาด",
      description,
      placement: "bottomRight",
    });
  };

  const [genders, setGenders] = useState<GendersInterface[]>([]);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const onChange: UploadProps["onChange"] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const onPreview = async (file: UploadFile) => {
    let src = file.url as string;
    if (!src) {
      src = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj as FileType);
        reader.onload = () => resolve(reader.result as string);
      });
    }
    const image = new Image();
    image.src = src;
    const imgWindow = window.open(src);
    imgWindow?.document.write(image.outerHTML);
  };

  const onFinish = async (values: UsersInterface) => {
    if (!fileList.length || !fileList[0].originFileObj) {
      openNotification("error", "กรุณาอัปโหลดรูปภาพ");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      values.Profile = reader.result as string;
      let res = await CreateUser(values);
      if (res) {
        openNotification("success", res.message || "สร้างข้อมูลสำเร็จ");
        setTimeout(() => navigate("/account"), 2000);
      } else {
        openNotification("error", "เกิดข้อผิดพลาด !");
      }
    };
    reader.readAsDataURL(fileList[0].originFileObj as RcFile);
  };


  const getGender = async () => {
    let res = await GetGenders();
    if (res) {
      setGenders(res);
    }
  };

  useEffect(() => {
    getGender();
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      padding: "32px" // เพิ่มระยะห่างขอบจอ
    }}>
      {/* {contextHolder} */}
      <Card>
        <h2> เพิ่มข้อมูลผู้ใช้งาน</h2>
        <Divider />
        <Form
          name="basic"
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <Form.Item name="Profile" valuePropName="fileList" style={{ marginBottom: "24px", marginTop: "12px" }}>
                  <ImgCrop rotationSlider>
                    <Upload
                      fileList={fileList}
                      onChange={onChange}
                      onPreview={onPreview}
                      beforeUpload={(file) => {
                        setFileList([file]); // จำกัด 1 รูป
                        return false;
                      }}
                      maxCount={1}
                      multiple={false}
                      listType="picture-card"
                      showUploadList={false} // ✅ ซ่อน list อัตโนมัติของ Upload
                    >
                      {fileList.length === 0 ? (
                        <div>
                          <PlusOutlined />
                          <div style={{ marginTop: 8 }}>อัพโหลด</div>
                        </div>
                      ) : (
                        <div style={{ position: "relative" }}>
                          <img
                            src={
                              fileList[0].thumbUrl ||
                              (fileList[0].originFileObj && URL.createObjectURL(fileList[0].originFileObj))
                            }
                            alt="avatar"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              borderRadius: 8,
                            }}
                          />
                          <EditOutlined
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
                        </div>
                      )}
                    </Upload>
                  </ImgCrop>
                </Form.Item>
              </div>
            </Col>


            <Col xs={24} sm={24} md={24} lg={24} xl={12}>
              <Form.Item
                label="ชื่อจริง"
                name="FirstName"
                rules={[
                  {
                    required: true,
                    message: "กรุณากรอกชื่อ !",
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={24} lg={24} xl={12}>
              <Form.Item
                label="นามกสุล"
                name="LastName"
                rules={[
                  {
                    required: true,
                    message: "กรุณากรอกนามสกุล !",
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={24} lg={24} xl={12}>
              <Form.Item
                label="อีเมล"
                name="Email"
                rules={[
                  {
                    type: "email",
                    message: "รูปแบบอีเมลไม่ถูกต้อง !",
                  },
                  {
                    required: true,
                    message: "กรุณากรอกอีเมล !",
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={24} lg={24} xl={12}>
              <Form.Item
                label="รหัสผ่าน"
                name="password"
                rules={[
                  {
                    required: true,
                    message: "กรุณากรอกรหัสผ่าน !",
                  },
                ]}
              >
                <Input.Password />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={24} md={24} lg={24} xl={12}>
              <Form.Item
                label="วัน/เดือน/ปี เกิด"
                name="birthday"
              // rules={[
              //   {
              //     required: true,
              //     message: "กรุณาเลือกวัน/เดือน/ปี เกิด !",
              //   },
              // ]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={24} lg={24} xl={12}>
              <Form.Item
                name="GenderID"
                label="เพศ"
                rules={[{ required: true, message: "กรุณาระบุเพศ !" }]}
              >
                <Select allowClear>
                  {genders.map((item) => (
                    <Option value={item.ID} key={item.Name}>
                      {item.Name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={24} lg={24} xl={12}>
              <Form.Item
                name="Role"
                label="ประเภทผู้ใช้งาน"
                rules={[{ required: true, message: "กรุณาเลือกประเภทผู้ใช้งาน !" }]}
              >
                <Select placeholder="เลือกประเภทผู้ใช้งาน">
                  <Option value="user">นักศึกษา</Option>
                  <Option value="employer">บุคคลภายนอก</Option>
                  <Option value="admin">แอดมิน</Option>
                </Select>
              </Form.Item>
            </Col>
            {/* <Col xs={24} sm={24} md={24} lg={24} xl={12}>
              <Form.Item
                label="เบอร์โทร"
                name="Contact"
                rules={[
                  {
                    required: true,
                    message: "กรุณากรอกเบอร์โทร !",
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col> */}
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

export default CustomerCreate;
