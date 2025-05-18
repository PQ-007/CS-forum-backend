import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Tag,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Typography,
  Space,
} from "antd";
import {

  FileOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import type { Assignment, AssignmentSubmission } from "../types";
import AssignmentService from "../../service/assignmentService";
import dayjs from "dayjs";

const { Text } = Typography;

interface TeacherAssignmentSubmissionsProps {
  assignment: Assignment;
}

const TeacherAssignmentSubmissions: React.FC<
  TeacherAssignmentSubmissionsProps
> = ({ assignment }) => {
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] =
    useState<AssignmentSubmission | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchSubmissions();
  }, [assignment.id]);

  const fetchSubmissions = async () => {
    try {
      const submissionsData = await AssignmentService.getAssignmentSubmissions(
        assignment.id
      );
      setSubmissions(submissionsData);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      message.error("Илгээлтүүдийг ачаалахад алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  const handleGrade = async (values: { grade: number; feedback: string }) => {
    if (!selectedSubmission) return;

    try {
      await AssignmentService.gradeSubmission(
        selectedSubmission.id,
        values.grade,
        values.feedback
      );
      message.success("Амжилттай дүн орууллаа");
      setIsModalOpen(false);
      fetchSubmissions(); // Refresh the list
    } catch (error) {
      console.error("Error grading submission:", error);
      message.error("Дүн оруулахад алдаа гарлаа");
    }
  };

  const showGradeModal = (submission: AssignmentSubmission) => {
    setSelectedSubmission(submission);
    form.setFieldsValue({
      grade: submission.grade,
      feedback: submission.feedback,
    });
    setIsModalOpen(true);
  };

  const columns = [
    {
      title: "Оюутан",
      dataIndex: "studentName",
      key: "studentName",
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: "Илгээсэн огноо",
      dataIndex: "submittedAt",
      key: "submittedAt",
      render: (date: string) => dayjs(date).format("YYYY-MM-DD HH:mm"),
    },
    {
      title: "Файл",
      key: "file",
      render: (_: unknown, record: AssignmentSubmission) => (
        <Button type="link" onClick={() => handleFileClick(record)}>
          {record.fileName}
        </Button>
      ),
    },
    {
      title: "Тайлбар",
      dataIndex: "comment",
      key: "comment",
      render: (text: string) => text || "-",
    },
    {
      title: "Төлөв",
      key: "status",
      render: (_: unknown, record: AssignmentSubmission) => (
        <Tag
          color={record.status === "graded" ? "success" : "processing"}
          icon={
            record.status === "graded" ? (
              <CheckCircleOutlined />
            ) : (
              <ClockCircleOutlined />
            )
          }
        >
          {record.status === "graded" ? "Шалгасан" : "Хүлээгдэж буй"}
        </Tag>
      ),
    },
    {
      title: "Дүн",
      key: "grade",
      render: (_: unknown, record: AssignmentSubmission) => (
        <Space>
          {record.grade ? (
            <>
              <Text strong>{record.grade}</Text>
              <Button
                type="link"
                size="small"
                onClick={() => showGradeModal(record)}
              >
                Засах
              </Button>
            </>
          ) : (
            <Button
              type="primary"
              size="small"
              onClick={() => showGradeModal(record)}
            >
              Дүн оруулах
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Card
        title={
          <div className="flex items-center gap-2">
            <FileOutlined />
            <span>Илгээлтүүд</span>
          </div>
        }
      >
        <Table
          columns={columns}
          dataSource={submissions}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="Дүн оруулах"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleGrade}
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
              <Button onClick={() => setIsModalOpen(false)}>Болих</Button>
              <Button type="primary" htmlType="submit">
                Хадгалах
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TeacherAssignmentSubmissions;
function handleFileClick(_record: AssignmentSubmission): void {
  throw new Error("Function not implemented.");
}

