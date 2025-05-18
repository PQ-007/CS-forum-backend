import { Button, Form, Input, InputNumber, Modal } from "antd";
import React from "react";
import type { AssignmentSubmission } from "../types";

interface TeacherGradingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: { grade: number; feedback: string }) => Promise<void>;
  submission: AssignmentSubmission | null;
}

const TeacherGradingModal: React.FC<TeacherGradingModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  submission,
}) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (submission) {
      form.setFieldsValue({
        grade: submission.grade,
        feedback: submission.feedback,
      });
    }
  }, [submission, form]);

  const handleSubmit = async (values: { grade: number; feedback: string }) => {
    await onSubmit(values);
    form.resetFields();
  };

  return (
    <Modal
      title="Дүн оруулах"
      open={isOpen}
      onCancel={() => {
        onClose();
        form.resetFields();
      }}
      footer={null}
    >
      <Form
        form={form}
        onFinish={handleSubmit}
        layout="vertical"
        initialValues={{ grade: 0, feedback: "" }}
      >
        <Form.Item
          name="grade"
          label="Дүн"
          rules={[
            { required: true, message: "Дүн оруулна уу!" },
            {
              type: "number",
              min: 0,
              max: 100,
              message: "0-100 хооронд оруулна уу!",
            },
          ]}
        >
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          name="feedback"
          label="Санал хүсэлт"
          rules={[{ required: true, message: "Санал хүсэлт оруулна уу!" }]}
        >
          <Input.TextArea rows={4} />
        </Form.Item>

        <Form.Item>
          <div className="flex justify-end gap-2">
            <Button
              onClick={() => {
                onClose();
                form.resetFields();
              }}
            >
              Болих
            </Button>
            <Button type="primary" htmlType="submit">
              Хадгалах
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TeacherGradingModal;
