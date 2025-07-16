import {
  Button,
  Col,
  Row,
  Form,
  Input,
  Card,
  message,
  DatePicker,
  InputNumber,
  Select,
  Upload,
  Layout,
} from "antd";
import { useEffect, useState } from "react";
import { PlusOutlined, FileImageOutlined } from "@ant-design/icons";
import { useNavigate, Link, useParams } from "react-router-dom";
import ImgCrop from "antd-img-crop";
import { WorkInterface } from "../../../interfaces/IWork";
import { GetWorkById, UpdateWork } from "../../../services/https/index";
import dayjs from "dayjs";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { LeafletMouseEvent } from "leaflet";
import AdminSidebar from "../../../components/Sider/AdminSidebar";

const { Content } = Layout;
const { Option } = Select;

const defaultPosition: [number, number] = [14.883451, 102.010589];

const LocationPicker = ({ onSelect }: { onSelect: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e: LeafletMouseEvent) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const WorkEdit = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const [messageApi, contextHolder] = message.useMessage();
  const [fileList, setFileList] = useState<any[]>([]);
  const [workTypeID, setWorkTypeID] = useState<number>(1);
  const [position, setPosition] = useState<[number, number] | null>(defaultPosition);
  const [workDataState, setWorkDataState] = useState<WorkInterface | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        console.log("❌ No ID provided in URL.");
        return;
      }

      console.log("🔍 Fetching work by ID:", id);
      const workData: WorkInterface | null = await GetWorkById(Number(id));
      console.log("✅ Fetched work data:", workData);

      if (workData) {
        setWorkDataState(workData);

        console.log("🧩 Setting form values...");
        form.setFieldsValue({
          title: workData.title,
          description: workData.description,
          place: workData.place,
          workcount: workData.workcount,
          worktime: dayjs(workData.worktime),
          WorkTypeID: workData.worktype_id,
          WorkStatusID: workData.workstatus_id,
          paid: workData.paid ?? undefined,
          volunteer: workData.volunteer ?? undefined,
        });

        setWorkTypeID(workData.worktype_id || 1);

        if (workData.latitude !== undefined && workData.longitude !== undefined) {
          setPosition([workData.latitude, workData.longitude]);
          console.log("📍 Set position to:", [workData.latitude, workData.longitude]);
        }

        if (workData.photo) {
          const fileListData = [
            {
              uid: "-1",
              name: "image.png",
              status: "done",
              url: workData.photo,
              thumbUrl: workData.photo,
            },
          ];
          setFileList(fileListData);
          console.log("🖼️ Set photo fileList:", fileListData);
        }
      } else {
        console.log("❗ Work not found for ID:", id);
        messageApi.error("ไม่พบข้อมูลงาน");
        navigate("/work");
      }
    };

    fetchData();
  }, [id]);

  const onChange = ({ fileList: newFileList }: { fileList: any[] }) => {
    setFileList(newFileList);
    form.setFieldsValue({ photo: newFileList });
  };

  const onPreview = async (file: any) => {
    let src = file.url;
    if (!src && file.originFileObj) {
      src = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj);
        reader.onload = () => resolve(reader.result);
      });
    }
    const image = new Image();
    image.src = src as string;
    const imgWindow = window.open(src);
    imgWindow?.document.write(image.outerHTML);
  };

  const onFinish = async (values: any) => {
    if (!position) return;

    const data: WorkInterface = {
      ...values,
      ID: Number(id),
      worktime: values.worktime.toISOString(),
      photo: fileList[0]?.thumbUrl || "",
      paid: workTypeID === 1 ? values.paid : null,
      volunteer: workTypeID === 2 ? values.volunteer : null,
      worktype_id: values.WorkTypeID,
      workstatus_id: values.WorkStatusID,
      latitude: position[0],
      longitude: position[1],
    };

    console.log("📤 Submitting data:", data);

    const res = await UpdateWork(data);

    if (res) {
      messageApi.success("แก้ไขงานสำเร็จ");
      setTimeout(() => navigate("/work"), 1500);
    } else {
      messageApi.error("เกิดข้อผิดพลาดในการแก้ไขงาน");
    }
  };

  return (
    <Layout style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      <div style={{ width: 250, height: "100vh", position: "fixed", top: 0, left: 0, backgroundColor: "#1E3A8A", zIndex: 1000 }}>
        <AdminSidebar />
      </div>
      <Layout style={{ marginLeft: 250 }}>
        <Content style={{ padding: "32px", backgroundColor: "#dbe2ef" }}>
          {contextHolder}
          <Card style={{ width: "100%", padding: 24, borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", backgroundColor: "#ffffff" }}>
            <h1 style={{ margin: 0, fontSize: "32px", fontWeight: 800, color: "#112D4E", textAlign: "center" }}>แก้ไขงาน</h1>
            <div style={{ width: 1410, height: 4, backgroundColor: "#434c86", marginTop: 21, borderRadius: 2, marginBottom: 24 }} />
            <Form form={form} layout="vertical" onFinish={onFinish}>
              <Row gutter={24}>
                <Col xs={24} md={14}>
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Form.Item
                        name="title"
                        label={`หัวข้องาน (${workDataState?.title || ""})`}
                        rules={[{ required: true }]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="WorkStatusID"
                        label={`สถานะงาน (${workDataState?.workstatus_id === 1 ? "เปิดรับสมัคร" : "ปิดรับสมัคร"})`}
                        rules={[{ required: true }]}
                      >
                        <Select placeholder="เลือกสถานะ">
                          <Option value={1}>เปิดรับสมัคร</Option>
                          <Option value={2}>ปิดรับสมัคร</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="workcount"
                        label={`จำนวนคนที่ต้องการ (${workDataState?.workcount || 0})`}
                        rules={[{ required: true }]}
                      >
                        <InputNumber min={1} style={{ width: "100%" }} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="place"
                        label={`สถานที่จัดงาน (${workDataState?.place || ""})`}
                        rules={[{ required: true }]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="WorkTypeID"
                        label={`ประเภทงาน (${workDataState?.worktype_id === 1 ? "มีค่าตอบแทน" : "จิตอาสา"})`}
                        rules={[{ required: true }]}
                      >
                        <Select onChange={(value) => setWorkTypeID(value)}>
                          <Option value={1}>มีค่าตอบแทน</Option>
                          <Option value={2}>จิตอาสา</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    {workTypeID === 1 && (
                      <Col span={12}>
                        <Form.Item
                          name="paid"
                          label={`ค่าตอบแทน (บาท) (${workDataState?.paid || 0})`}
                          rules={[{ required: true }]}
                        >
                          <InputNumber style={{ width: "100%" }} />
                        </Form.Item>
                      </Col>
                    )}
                    {workTypeID === 2 && (
                      <Col span={12}>
                        <Form.Item
                          name="volunteer"
                          label={`จำนวนชั่วโมงจิตอาสา (${workDataState?.volunteer || 0})`}
                          rules={[{ required: true }]}
                        >
                          <InputNumber style={{ width: "100%" }} />
                        </Form.Item>
                      </Col>
                    )}
                    <Col span={24}>
                      <Form.Item
                        name="worktime"
                        label={`วันและเวลาทำงาน (${workDataState?.worktime ? dayjs(workDataState.worktime).format("YYYY-MM-DD HH:mm") : ""})`}
                        rules={[{ required: true }]}
                      >
                        <DatePicker showTime style={{ width: "100%" }} disabledDate={(current) => current && current < dayjs().startOf("day")} />
                      </Form.Item>
                    </Col>
                    <Col span={20}>
                      <Form.Item
                        name="description"
                        label={`รายละเอียดงาน (${workDataState?.description?.slice(0, 20) || ""}...)`}
                        rules={[{ required: true }]}
                      >
                        <Input.TextArea rows={4} />
                      </Form.Item>
                    </Col>
                    <Col span={4}>
                      <Form.Item
                        name="photo"
                        label="รูปภาพ"
                        valuePropName="fileList"
                        getValueFromEvent={(e) => Array.isArray(e) ? e : e?.fileList}
                        rules={[{ required: true }]}
                      >
                        <ImgCrop rotationSlider>
                          <Upload
                            listType="picture-card"
                            fileList={fileList}
                            onChange={onChange}
                            onPreview={onPreview}
                            beforeUpload={() => false}
                            maxCount={1}
                          >
                            {fileList.length < 1 && (
                              <div>
                                <FileImageOutlined style={{ fontSize: "34px", color: "#3F72AF" }} />
                                <div style={{ marginTop: 8, color: "#3F72AF" }}>อัปโหลด</div>
                              </div>
                            )}
                          </Upload>
                        </ImgCrop>
                      </Form.Item>
                    </Col>
                  </Row>
                </Col>

                <Col xs={24} md={10}>
                  <div style={{ marginBottom: 8, fontWeight: 600 }}>เลือกพิกัดจากแผนที่</div>
                  {position && (
                    <MapContainer center={position} zoom={15} style={{ height: "430px", width: "100%", borderRadius: 8 }}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <Marker position={position} />
                      <LocationPicker onSelect={(lat, lng) => setPosition([lat, lng])} />
                    </MapContainer>
                  )}
                  <Row gutter={16} style={{ marginTop: 16 }}>
                    <Col span={12}>
                      <Form.Item label={`ละติจูด (${position?.[0]})`}>
                        <Input value={position?.[0]} readOnly />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label={`ลองจิจูด (${position?.[1]})`}>
                        <Input value={position?.[1]} readOnly />
                      </Form.Item>
                    </Col>
                  </Row>
                </Col>

                <Col span={24} style={{ display: "flex", justifyContent: "flex-end", marginTop: 32, gap: 10 }}>
                  <Link to="/work">
                    <Button>ยกเลิก</Button>
                  </Link>
                  <Button type="primary" htmlType="submit" icon={<PlusOutlined />} style={{ backgroundColor: "#3F72AF", borderColor: "#3F72AF" }}>
                    บันทึกงาน
                  </Button>
                </Col>
              </Row>
            </Form>
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default WorkEdit;

