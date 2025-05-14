import React, { useState, useRef } from "react";
import {
  ConfigProvider,
  Calendar,
  Badge,
  Modal,
  Button,
  List,
  Typography,
  Popconfirm,
  message,
} from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import mn_MN from "antd/locale/mn_MN";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import "dayjs/locale/mn";
import type { AssignmentCalendarProps, Assignment } from "../components/types";
import FormModal, { FormModalRef } from "../components/Modal";
import { assignmentFields } from "../components/types";
import AssignmentService from "../service/assignmentService";

dayjs.locale("mn");

const { Text } = Typography;

const AssignmentCalendar: React.FC<AssignmentCalendarProps> = ({
  mode,
  assignments,
  courses,
  onAddAssignment,
  onDeleteAssignment,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [modalInitialValues, setModalInitialValues] = useState<
    Record<string, unknown>
  >({});
  const [selectedYear, setSelectedYear] = useState<number | undefined>(
    undefined
  );
  const modalRef = useRef<FormModalRef>(null);

  const getAssignmentsForDate = (date: Dayjs) =>
    assignments.filter((a) => dayjs(a.deadline).isSame(date, "day"));

  const handleCellClick = (date: Dayjs) => {
    // Only open the add modal when in teacher mode and there's no stopPropagation flag
    if (mode === "teacher") {
      setModalInitialValues({
        year: undefined,
        courseId: undefined,
        deadline: date,
        description: "",
      });
      setSelectedYear(undefined);
      setModalOpen(true);
    }
  };

  const handleModalSubmit = async (values: Record<string, unknown>) => {
    if (onAddAssignment) {
      const course = courses.find((c) => c.id === (values.courseId as string));
      await onAddAssignment({
        ...values,
        title: course?.title || "",
        year: values.year as number,
        courseId: values.courseId as string,
        description: values.description as string,
        deadline: (values.deadline as Dayjs).format("YYYY-MM-DD"),
      });
    }
    setModalOpen(false);
  };

  const handleEditAssignment = async (assignment: Assignment) => {
    setModalInitialValues({
      year: assignment.year,
      courseId: assignment.courseId,
      deadline: dayjs(assignment.deadline),
      description: assignment.description,
    });
    setSelectedYear(assignment.year);
    setModalOpen(true);
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    try {
      await AssignmentService.deleteAssignment(assignmentId);
      message.success("Даалгавар устгагдлаа");
      setViewModalOpen(false);
      if (onDeleteAssignment) {
        onDeleteAssignment(assignmentId);
      } else {
        // If onDeleteAssignment callback is not provided, update the local state
        setViewModalOpen(false);
      }
    } catch {
      message.error("Даалгавар устгахад алдаа гарлаа");
    }
  };

  // Dynamically update course options based on selected year
  const dynamicFields = assignmentFields.map((field) => {
    if (field.name === "courseId") {
      return {
        ...field,
        options: courses
          .filter((c) => c.year === Number(selectedYear))
          .map((c) => ({ value: c.id, label: c.title })),
        disabled: !selectedYear,
      };
    }
    if (field.name === "year") {
      return {
        ...field,
        onChange: (val: number) => {
          setSelectedYear(val);
          modalRef.current?.form.setFieldValue("courseId", undefined);
        },
      };
    }
    return field;
  });

  const dateCellRender = (date: Dayjs) => {
    const dayAssignments = getAssignmentsForDate(date);
    if (dayAssignments.length === 0) return null;

    return (
      <div className="relative h-full w-full">
        <Badge
          dot
          status="processing"
          offset={[-2, 2]}
          className="absolute top-0 right-0"
        />
        <div className="text-xs mt-1">
          <Button
            type="link"
            size="small"
            className="p-0 h-auto text-blue-600 hover:text-blue-800"
            onClick={(e) => {
              e.stopPropagation(); // Stop event propagation to prevent cell click
              setSelectedDate(date);
              setViewModalOpen(true);
            }}
          >
            {dayAssignments.length} даалгавар
          </Button>
        </div>
      </div>
    );
  };

  return (
    <ConfigProvider locale={mn_MN}>
      <Calendar
        fullscreen={true}
        dateCellRender={dateCellRender}
        onSelect={handleCellClick}
      />
      {mode === "teacher" && (
        <FormModal
          ref={modalRef}
          title="Шинэ даалгавар нэмэх"
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleModalSubmit}
          fields={dynamicFields}
          initialValues={modalInitialValues}
        />
      )}
      <Modal
        title={`${selectedDate?.format("YYYY-MM-DD")} даалгаврууд`}
        open={viewModalOpen}
        onCancel={() => setViewModalOpen(false)}
        footer={null}
        width={600}
      >
        <List
          dataSource={selectedDate ? getAssignmentsForDate(selectedDate) : []}
          renderItem={(assignment) => {
            const course = courses.find((c) => c.id === assignment.courseId);
            return (
              <List.Item
                actions={
                  mode === "teacher"
                    ? [
                        <Button
                          key="edit"
                          type="text"
                          icon={<EditOutlined />}
                          onClick={() => {
                            setViewModalOpen(false);
                            handleEditAssignment(assignment);
                          }}
                        />,
                        <Popconfirm
                          key="delete"
                          title="Даалгавар устгах уу?"
                          onConfirm={() =>
                            handleDeleteAssignment(assignment.id)
                          }
                          okText="Тийм"
                          cancelText="Үгүй"
                        >
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                          />
                        </Popconfirm>,
                      ]
                    : undefined
                }
              >
                <div className="w-full">
                  <div className="flex justify-between items-start">
                    <div>
                      <Text strong className="text-blue-600">
                        {course?.title || "Хичээл байхгүй"}
                      </Text>
                      <div className="text-gray-600">
                        {assignment.year}-р курс
                      </div>
                    </div>
                    <Badge status="processing" />
                  </div>
                  <div className="mt-2 text-gray-700">
                    {assignment.description}
                  </div>
                </div>
              </List.Item>
            );
          }}
        />
      </Modal>
    </ConfigProvider>
  );
};

export default AssignmentCalendar;
