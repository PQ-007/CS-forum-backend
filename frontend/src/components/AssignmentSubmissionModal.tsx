import React, { useState } from "react";
import { Modal, Upload, Button, message, Form, Input } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";
import type { Assignment } from "./types";
import dayjs from "dayjs";

interface AssignmentSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: Assignment;
  onSubmit: (file: File, comment: string) => Promise<void>;
}

const AssignmentSubmissionModal: React.FC<AssignmentSubmissionModalProps> = ({
  isOpen,
  onClose,
  assignment,
  onSubmit,
}) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    try {
      const values = await form.validateFields();
      const file = fileList[0]?.originFileObj;

      if (!file) {
        setError("Файл оруулна уу");
        return;
      }

      setUploading(true);
      await onSubmit(file, values.comment || "");
      message.success("Даалгавар амжилттай илгээгдлээ");
      handleClose();
    } catch (error) {
      console.error("Error submitting assignment:", error);

      // Handle specific error cases
      if (error instanceof Error) {
        const errorMessage = error.message;

        // Handle authentication errors
        if (
          errorMessage.includes("Хэрэглэгчийн ID") ||
          errorMessage.includes("эрх хүрэлцэхгүй")
        ) {
          setError(
            "Таны нэвтрэлт дууссан байна. Системээс гарч дахин нэвтрээрэй."
          );
          message.error(
            "Таны нэвтрэлт дууссан байна. Системээс гарч дахин нэвтрээрэй."
          );
          return;
        }

        // Handle file-related errors
        if (errorMessage.includes("файл") || errorMessage.includes("Файл")) {
          setError(errorMessage);
          message.error(errorMessage);
          return;
        }

        // Handle network errors
        if (
          errorMessage.includes("Интернэт") ||
          errorMessage.includes("Холболт")
        ) {
          setError("Интернэт холболттой байгаа эсэхээ шалгана уу");
          message.error("Интернэт холболттой байгаа эсэхээ шалгана уу");
          return;
        }

        // Handle other specific errors
        if (
          errorMessage.includes("Даалгаврын мэдээлэл") ||
          errorMessage.includes("Даалгаврын бүртгэл") ||
          errorMessage.includes("Даалгавар олдсонгүй")
        ) {
          setError(errorMessage);
          message.error(errorMessage);
          return;
        }

        // For any other errors, show a generic message
        setError("Даалгавар илгээхэд алдаа гарлаа. Дараа дахин оролдоно уу.");
        message.error(
          "Даалгавар илгээхэд алдаа гарлаа. Дараа дахин оролдоно уу."
        );
      } else {
        setError("Тодорхойгүй алдаа гарлаа. Дараа дахин оролдоно уу.");
        message.error("Тодорхойгүй алдаа гарлаа. Дараа дахин оролдоно уу.");
      }
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    form.resetFields();
    setFileList([]);
    setError(null);
    onClose();
  };

  const isOverdue = dayjs(assignment.deadline).isBefore(dayjs());

  return (
    <Modal
      title={`Даалгавар илгээх: ${assignment.title}`}
      open={isOpen}
      onCancel={handleClose}
      footer={[
        <Button key="cancel" onClick={handleClose}>
          Болих
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={uploading}
          onClick={handleSubmit}
          disabled={isOverdue}
        >
          Илгээх
        </Button>,
      ]}
    >
      {isOverdue && (
        <div className="mb-4 p-2 bg-red-50 text-red-600 rounded">
          Энэ даалгаврын хугацаа дууссан байна
        </div>
      )}

      {error && (
        <div className="mb-4 p-2 bg-red-50 text-red-600 rounded">{error}</div>
      )}

      <Form form={form} layout="vertical">
        <Form.Item
          label="Файл"
          required
          tooltip="Зөвхөн PDF, Word, PowerPoint, Excel эсвэл зураг файл оруулна уу"
        >
          <Upload
            fileList={fileList}
            onChange={({ fileList }) => setFileList(fileList)}
            beforeUpload={() => false}
            maxCount={1}
            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg"
          >
            <Button icon={<UploadOutlined />}>Файл сонгох</Button>
          </Upload>
        </Form.Item>

        <Form.Item label="Тайлбар" name="comment">
          <Input.TextArea
            placeholder="Даалгаврын талаар нэмэлт тайлбар бичнэ үү"
            rows={4}
          />
        </Form.Item>

        <div className="text-sm text-gray-500">
          <p>
            Дуусах хугацаа:{" "}
            {dayjs(assignment.deadline).format("YYYY-MM-DD HH:mm")}
          </p>
          <p>Хамгийн их файлын хэмжээ: 10MB</p>
        </div>
      </Form>
    </Modal>
  );
};

export default AssignmentSubmissionModal;
