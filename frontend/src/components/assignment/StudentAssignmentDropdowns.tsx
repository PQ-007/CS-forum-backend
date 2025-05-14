import React, { useState, useEffect } from "react";
import {
  Collapse,
  Card,
  Typography,
  Tag,
  Empty,
  Spin,
  Tooltip,
  Button,
  message,
} from "antd";
import {
  CaretRightOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  FileOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import type { Assignment } from "../types";
import { useAuth } from "../../context/AuthContext";
import AssignmentService from "../../service/assignmentService";
import FormModal from "../Modal";
import {
  getAllowedExtensions,
  getAllowedFileTypesDescription,
} from "../../utils/FileHandler";

const { Panel } = Collapse;
const { Text, Title } = Typography;

interface StudentAssignmentDropdownsProps {
  assignments: Assignment[];
  loading?: boolean;
  onAssignmentSubmitted?: () => void;
}

const StudentAssignmentDropdowns: React.FC<StudentAssignmentDropdownsProps> = ({
  assignments,
  loading = false,
  onAssignmentSubmitted,
}) => {
  const { userData, user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] =
    useState<Assignment | null>(null);
  const [categorizedAssignments, setCategorizedAssignments] = useState<{
    pending: Assignment[];
    overdue: Assignment[];
    submitted: Assignment[];
  }>({
    pending: [],
    overdue: [],
    submitted: [],
  });

  useEffect(() => {
    if (!assignments || !userData) return;

    const now = dayjs();
    const categorized = assignments.reduce(
      (acc, assignment) => {
        const deadline = dayjs(assignment.deadline);
        const isSubmitted = assignment.submission !== undefined;

        if (isSubmitted) {
          acc.submitted.push(assignment);
        } else if (deadline.isBefore(now)) {
          acc.overdue.push(assignment);
        } else {
          acc.pending.push(assignment);
        }
        return acc;
      },
      { pending: [], overdue: [], submitted: [] } as {
        pending: Assignment[];
        overdue: Assignment[];
        submitted: Assignment[];
      }
    );

    // Sort assignments by deadline
    const sortByDeadline = (a: Assignment, b: Assignment) =>
      dayjs(a.deadline).unix() - dayjs(b.deadline).unix();

    categorized.pending.sort(sortByDeadline);
    categorized.overdue.sort(sortByDeadline);
    categorized.submitted.sort(sortByDeadline);

    setCategorizedAssignments(categorized);
  }, [assignments, userData]);

  const getStatusColor = (assignment: Assignment) => {
    const deadline = dayjs(assignment.deadline);
    const isSubmitted = assignment.submission !== undefined;
    const status = assignment.submission?.status;

    if (isSubmitted) {
      return status === "graded" ? "success" : "processing";
    }
    return deadline.isBefore(dayjs()) ? "error" : "warning";
  };

  const getStatusIcon = (assignment: Assignment) => {
    const deadline = dayjs(assignment.deadline);
    const isSubmitted = assignment.submission !== undefined;
    const status = assignment.submission?.status;

    if (isSubmitted) {
      return status === "graded" ? (
        <CheckCircleOutlined />
      ) : (
        <ClockCircleOutlined />
      );
    }
    return deadline.isBefore(dayjs()) ? (
      <ExclamationCircleOutlined />
    ) : (
      <ClockCircleOutlined />
    );
  };

  const getStatusText = (assignment: Assignment) => {
    const deadline = dayjs(assignment.deadline);
    const isSubmitted = assignment.submission !== undefined;
    const status = assignment.submission?.status;

    if (isSubmitted) {
      return status === "graded"
        ? `Шалгалт өгсөн${
            assignment.submission?.grade
              ? ` (${assignment.submission.grade})`
              : ""
          }`
        : "Шалгалт хүлээгдэж буй";
    }
    return deadline.isBefore(dayjs()) ? "Хугацаа хэтэрсэн" : "Хүлээгдэж буй";
  };

  const handleModalSubmit = async (values: { file: File; comment: string }) => {
    if (!user?.uid || !selectedAssignment) {
      return;
    }

    try {
      await AssignmentService.submitAssignment(
        selectedAssignment.id,
        user.uid,
        values.file,
        values.comment
      );

      message.success("Даалгавар амжилттай илгээгдлээ");
      setIsModalOpen(false);
      setSelectedAssignment(null);
      if (onAssignmentSubmitted) {
        onAssignmentSubmitted();
      }
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      } else {
        message.error("Даалгавар илгээхэд алдаа гарлаа");
      }
    }
  };

  const showUploadModal = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setIsModalOpen(true);
  };

  const getModalFields = () => [
    {
      name: "file",
      label: "Файл сонгох",
      type: "upload" as const,
      rules: [{ required: true, message: "Файл сонгоно уу!" }],
      validation: {
        accept: getAllowedExtensions(),
        maxSize: 10 * 1024 * 1024, // 10MB
      },
      description: `Зөвшөөрөгдсөн файлын төрлүүд: ${getAllowedFileTypesDescription()}`,
    },
    {
      name: "comment",
      label: "Тайлбар",
      type: "textarea" as const,
      placeholder: "Даалгаврын тайлбар (optional)",
      rows: 4,
    },
  ];

  const renderAssignmentItem = (assignment: Assignment) => {
    const deadline = dayjs(assignment.deadline);
    const daysUntilDeadline = deadline.diff(dayjs(), "day");
    const hoursUntilDeadline = deadline.diff(dayjs(), "hour") % 24;
    const isSubmitted = assignment.submission !== undefined;
    const canSubmit = !isSubmitted && !deadline.isBefore(dayjs());

    return (
      <Card key={assignment.id} size="small" className="mb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <FileTextOutlined className="text-gray-400" />
              <Title level={5} className="!mb-0">
                {assignment.title}
              </Title>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ClockCircleOutlined className="text-gray-400" />
                <Text type="secondary" className="text-sm">
                  Дуусах хугацаа: {deadline.format("YYYY-MM-DD HH:mm")}
                  {!isSubmitted && !deadline.isBefore(dayjs()) && (
                    <Tooltip title="Үлдсэн хугацаа">
                      <span className="ml-2 text-orange-500">
                        ({daysUntilDeadline} хоног {hoursUntilDeadline} цаг
                        үлдсэн)
                      </span>
                    </Tooltip>
                  )}
                </Text>
              </div>

              {assignment.description && (
                <div className="flex items-start gap-2 mt-2">
                  <Text type="secondary" className="text-sm flex-1">
                    {assignment.description}
                  </Text>
                </div>
              )}

              {isSubmitted && assignment.submission?.fileName && (
                <div className="flex items-center gap-2 mt-2">
                  <FileOutlined className="text-gray-400" />
                  <Text type="secondary" className="text-sm">
                    Илгээсэн файл: {assignment.submission.fileName}
                  </Text>
                </div>
              )}
            </div>
          </div>

          <div className="ml-4 flex flex-col items-end gap-2">
            <Tag
              color={getStatusColor(assignment)}
              className="px-3 py-1 text-sm"
              icon={getStatusIcon(assignment)}
            >
              {getStatusText(assignment)}
            </Tag>

            {canSubmit && (
              <Button
                type="primary"
                icon={<UploadOutlined />}
                onClick={() => showUploadModal(assignment)}
                className="mt-2"
              >
                Илгээх
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <Collapse
          defaultActiveKey={["pending"]}
          expandIcon={({ isActive }) => (
            <CaretRightOutlined rotate={isActive ? 90 : 0} />
          )}
          className="bg-white rounded-lg shadow-sm"
        >
          <Panel
            header={
              <div className="flex items-center gap-2 py-1">
                <ClockCircleOutlined className="text-orange-500" />
                <span className="font-medium">Хүлээгдэж буй даалгаврууд</span>
                <Tag color="warning" className="ml-auto">
                  {categorizedAssignments.pending.length}
                </Tag>
              </div>
            }
            key="pending"
            className="border-b border-gray-100"
          >
            <div className="pt-2">
              {categorizedAssignments.pending.length > 0 ? (
                categorizedAssignments.pending.map(renderAssignmentItem)
              ) : (
                <Empty
                  description="Хүлээгдэж буй даалгавар байхгүй байна"
                  className="py-8"
                />
              )}
            </div>
          </Panel>

          <Panel
            header={
              <div className="flex items-center gap-2 py-1">
                <ExclamationCircleOutlined className="text-red-500" />
                <span className="font-medium">
                  Хугацаанаасаа хэтэрсэн даалгаврууд
                </span>
                <Tag color="error" className="ml-auto">
                  {categorizedAssignments.overdue.length}
                </Tag>
              </div>
            }
            key="overdue"
            className="border-b border-gray-100"
          >
            <div className="pt-2">
              {categorizedAssignments.overdue.length > 0 ? (
                categorizedAssignments.overdue.map(renderAssignmentItem)
              ) : (
                <Empty
                  description="Хугацаанаасаа хэтэрсэн даалгавар байхгүй байна"
                  className="py-8"
                />
              )}
            </div>
          </Panel>

          <Panel
            header={
              <div className="flex items-center gap-2 py-1">
                <CheckCircleOutlined className="text-green-500" />
                <span className="font-medium">Илгээсэн даалгаврууд</span>
                <Tag color="success" className="ml-auto">
                  {categorizedAssignments.submitted.length}
                </Tag>
              </div>
            }
            key="submitted"
          >
            <div className="pt-2">
              {categorizedAssignments.submitted.length > 0 ? (
                categorizedAssignments.submitted.map(renderAssignmentItem)
              ) : (
                <Empty
                  description="Илгээсэн даалгавар байхгүй байна"
                  className="py-8"
                />
              )}
            </div>
          </Panel>
        </Collapse>
      </div>

      <FormModal
        title={`Даалгавар илгээх: ${selectedAssignment?.title}`}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAssignment(null);
        }}
        onSubmit={handleModalSubmit}
        fields={getModalFields()}
      />
    </>
  );
};

export default StudentAssignmentDropdowns;
