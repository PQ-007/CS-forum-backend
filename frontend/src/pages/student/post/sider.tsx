import React, { useEffect, useState } from "react";
import { useTab } from "../../../context/TabContext";
import { InboxOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Checkbox, Select, Upload, Modal, Form, Input } from "antd";
import { useNavigate } from "react-router-dom";
import { questionService } from "../../../service/postService";
import { useAuth } from "../../../context/AuthContext";

const Sider: React.FC = () => {
  const { activeTab } = useTab();
  const navigate = useNavigate();
  const { user } = useAuth(); // ✅ use it here at the top level

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    console.log("Sider re-rendered. Current activeTab:", activeTab);
  }, [activeTab]);

  const handleAddArticle = () => {
    navigate(`/dashboard/student/post/article/write/`);
  };

  const handleOpenModal = () => setIsModalVisible(true);
  const handleCloseModal = () => setIsModalVisible(false);

  const handleSaveQuestion = async () => {
    try {
      const values = await form.validateFields();
      console.log(values.question);

      if (user) {
        await questionService.createQuestion(values.question, user.uid);
      } else {
        console.warn("User is not logged in.");
      }

      form.resetFields();
      setIsModalVisible(false);
    } catch (error) {
      console.error("Асуулт хадгалахад алдаа гарлаа:", error);
    }
  };

  const normFile = (e: any) => (Array.isArray(e) ? e : e?.fileList);

  const renderContent = () => {
    const tagFilter = (
      <div className="mb-6">
        <h4 className="font-semibold text-sm mb-2">Tag-аар шүүх</h4>
        <Checkbox.Group className="flex flex-col gap-2">
          <Checkbox value="firebase">Firebase</Checkbox>
          <Checkbox value="react">React</Checkbox>
          <Checkbox value="tailwind">Tailwind</Checkbox>
        </Checkbox.Group>
      </div>
    );

    const sortSelect = (
      <div>
        <h4 className="font-semibold text-sm mb-2">Эрэмбэлэх</h4>
        <Select defaultValue="Newest" style={{ width: "100%" }}>
          <Select.Option value="Newest">Хамгийн сүүлд</Select.Option>
          <Select.Option value="Popular">Алдар нэрээр</Select.Option>
        </Select>
      </div>
    );

    switch (activeTab) {
      case "articles":
        return (
          <>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddArticle}
              className="mb-6"
              block
            >
              Шинээр нийтлэл нэмэх
            </Button>
            {tagFilter}
            {sortSelect}
          </>
        );

      case "questions":
        return (
          <>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="mb-6"
              block
              onClick={handleOpenModal}
            >
              Шинээр асуулт нэмэх
            </Button>

            <Modal
              title="Шинэ асуулт нэмэх"
              open={isModalVisible}
              onOk={handleSaveQuestion}
              onCancel={handleCloseModal}
              okText="Хадгалах"
              cancelText="Болих"
            >
              <Form form={form} layout="vertical">
                <Form.Item
                  name="question"
                  label="Асуулт"
                  rules={[{ required: true, message: "Асуултаа оруулна уу" }]}
                >
                  <Input.TextArea placeholder="Асуултаа бичнэ үү..." />
                </Form.Item>

                <Form.Item
                  name="attachments"
                  label="Файл хавсаргах (зураг, видео г.м)"
                  valuePropName="fileList"
                  getValueFromEvent={normFile}
                >
                  <Upload.Dragger
                    name="files"
                    beforeUpload={() => false}
                    multiple
                  >
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">
                      Файлаа энд чирж тавих эсвэл дарж сонгоно уу
                    </p>
                    <p className="ant-upload-hint">
                      Зураг, видео эсвэл бусад төрлийн файл хавсаргаж болно.
                    </p>
                  </Upload.Dragger>
                </Form.Item>
              </Form>
            </Modal>

            {tagFilter}
            {sortSelect}
          </>
        );

      default:
        return null;
    }
  };

  return <div className="w-full p-6 bg-white">{renderContent()}</div>;
};

export default Sider;
