import React, { useState, useEffect } from "react";
import type { Dayjs } from "dayjs";
import { Card, Row, Col, Statistic } from "antd";
import { UserOutlined, BookOutlined, FileOutlined } from "@ant-design/icons";
import AssignmentCalendar from "../../../components/Calendar";
import CourseService from "../../../service/courseService";
import AssignmentService from "../../../service/assignmentService";
import type { CourseData, Assignment } from "../../../components/types";

interface Event {
  type: "success" | "warning" | "error" | "info";
  content: string;
}

interface TeacherAssignmentPageProps {
  section?: "main" | "sidebar";
}

const TeacherAssignmentPage: React.FC<TeacherAssignmentPageProps> = ({
  section = "main",
}) => {
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddAssignment = async (newAssignment: Omit<Assignment, "id">) => {
    try {
      const assignment = await AssignmentService.addAssignment(newAssignment);
      setAssignments((prev) => [...prev, assignment]);
    } catch (error) {
      console.error("Error adding assignment:", error);
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    try {
      // Update local state immediately to reflect the deletion
      setAssignments((prev) => prev.filter((a) => a.id !== assignmentId));
    } catch (error) {
      console.error("Error deleting assignment:", error);
    }
  };

  // Debug: log courses and assignments on every render
  console.log("courses:", courses);
  console.log("assignments:", assignments);

  const events: Record<string, Event[]> = {
    "2024-05-13": [
      { type: "success", content: "Хичээл" },
      { type: "warning", content: "Дасгал" },
    ],
    "2024-05-14": [{ type: "error", content: "Шалгалт" }],
  };

  if (section === "sidebar") {
    return (
      <div className="space-y-4">
        <Card title="Хуваарь">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Хичээл</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>Дасгал</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Шалгалт</span>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Нийт Хичээл"
              value={courses.length}
              prefix={<BookOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Нийт Сурагчид"
              value={150}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Нийт Дасгал"
              value={assignments.length}
              prefix={<FileOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Calendar */}
      <Card>
        <AssignmentCalendar
          mode="teacher"
          assignments={assignments}
          courses={courses}
          onAddAssignment={handleAddAssignment}
          onDeleteAssignment={handleDeleteAssignment}
        />
      </Card>
    </div>
  );
};

export default TeacherAssignmentPage;
