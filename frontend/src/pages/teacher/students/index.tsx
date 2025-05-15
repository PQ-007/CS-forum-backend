import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Form,
  message,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import dayjs from "dayjs";
import React, { useEffect, useRef, useState } from "react";
import FilePreview from "../../../components/common/FilePreview";
import FormModal, { FormModalRef } from "../../../components/Modal";
import type {
  Assignment,
  AssignmentSubmission,
  CourseData,
} from "../../../components/types";
import AssignmentService from "../../../service/assignmentService";
import CourseService from "../../../service/courseService";
import { getFileUrl } from "../../../service/fileService";

const { Text, Title } = Typography;
const { Option } = Select;

interface TeacherStudentsPageProps {
  section?: "main" | "sidebar";
}

const TeacherStudentsPage: React.FC<TeacherStudentsPageProps> = ({
  section = "main",
}) => {
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(
    null
  );
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] =
    useState<AssignmentSubmission | null>(null);
  const [form] = Form.useForm();
  const [previewFile, setPreviewFile] = useState<AssignmentSubmission | null>(
    null
  );
  const modalRef = useRef<FormModalRef>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedAssignment) {
      fetchSubmissions(selectedAssignment);
    } else {
      setSubmissions([]);
    }
  }, [selectedAssignment]);

  const fetchData = async () => {
    try {
      const [coursesData, assignmentsData] = await Promise.all([
        CourseService.getAllCourses(),
        AssignmentService.getAllAssignments(),
      ]);
      setCourses(coursesData);
      setAssignments(assignmentsData);
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("Мэдээлэл ачаалахад алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async (assignmentId: string) => {
    try {
      setLoading(true);
      const submissionsData = await AssignmentService.getAssignmentSubmissions(
        assignmentId
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
      if (selectedAssignment) {
        fetchSubmissions(selectedAssignment);
      }
    } catch (error) {
      console.error("Error grading submission:", error);
      message.error("Дүн оруулахад алдаа гарлаа");
    }
  };

  const showGradeModal = (submission: AssignmentSubmission) => {
    setSelectedSubmission(submission);
    setIsModalOpen(true);
  };

  const handleCourseChange = (courseId: string | null) => {
    setSelectedCourse(courseId);
    setSelectedAssignment(null);
  };

  const handleFileClick = (submission: AssignmentSubmission) => {
    try {
      const fileUrl = getFileUrl(submission.fileUrl);
      setPreviewFile({
        ...submission,
        fileUrl,
      });
    } catch (error) {
      message.error("Файл нээхэд алдаа гарлаа");
      console.error("Error getting file URL:", error);
    }
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
        <Space>
          <Button type="link" onClick={() => handleFileClick(record)}>
            {record.fileName}
          </Button>
        </Space>
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
          {record.status === "graded" ? "Шалгалт өгсөн" : "Хүлээгдэж буй"}
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

  // Define the form fields for the FormModal
  const gradeFormFields = [
    {
      type: "number",
      name: "grade",
      label: "Дүн",
      placeholder: "Дүн оруулах",
      min: 0,
      max: 100,
      rules: [
        { required: true, message: "Дүн оруулна уу!" },
        {
          type: "number",
          min: 0,
          max: 100,
          message: "0-100 хооронд оруулна уу!",
        },
      ],
    },
    {
      type: "textarea",
      name: "feedback",
      label: "Санал хүсэлт",
      placeholder: "Санал хүсэлт оруулах",
      rows: 4,
      rules: [{ required: true, message: "Санал хүсэлт оруулна уу!" }],
    },
  ];

  const filteredAssignments = selectedCourse
    ? assignments.filter((a) => a.courseId === selectedCourse)
    : assignments;

  if (section === "sidebar") {
    return null;
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <UserOutlined className="text-2xl" />
          <Title level={4} className="!mb-0">
            Оюутны илгээлтүүд
          </Title>
        </div>

        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} md={12}>
            <Text strong>Хичээл</Text>
            <Select
              style={{ width: "100%" }}
              placeholder="Хичээл сонгох"
              value={selectedCourse}
              onChange={handleCourseChange}
              allowClear
            >
              {courses.map((course) => (
                <Option key={course.id} value={course.id}>
                  {course.title}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} md={12}>
            <Text strong>Даалгавар</Text>
            <Select
              style={{ width: "100%" }}
              placeholder="Даалгавар сонгох"
              value={selectedAssignment}
              onChange={setSelectedAssignment}
              allowClear
            >
              {filteredAssignments.map((assignment) => (
                <Option key={assignment.id} value={assignment.id}>
                  {assignment.description}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>

        {selectedAssignment ? (
          <Table
            columns={columns}
            dataSource={submissions}
            loading={loading}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        ) : (
          <div className="text-center py-8">
            <Text type="secondary">Хичээл болон даалгавар сонгоно уу</Text>
          </div>
        )}
      </Card>

      {/* FormModal component replacing the regular Modal */}
      <FormModal
        ref={modalRef}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleGrade}
        title="Дүн оруулах"
        fields={gradeFormFields}
        initialValues={
          selectedSubmission
            ? {
                grade: selectedSubmission.grade || 0,
                feedback: selectedSubmission.feedback || "",
              }
            : { grade: 0, feedback: "" }
        }
      />

      {previewFile && (
        <FilePreview
          fileUrl={previewFile.fileUrl}
          fileName={previewFile.fileName}
          open={true}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </div>
  );
};

export default TeacherStudentsPage;
