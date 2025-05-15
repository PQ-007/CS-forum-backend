import React, { useState, useEffect } from "react";
import { Card, Row, Col, Statistic } from "antd";
import { UserOutlined, BookOutlined, FileOutlined } from "@ant-design/icons";
import AssignmentCalendar from "../../../components/Calendar";
import CourseService from "../../../service/courseService";
import AssignmentService from "../../../service/assignmentService";
import type { CourseData, Assignment } from "../../../components/types";

interface TeacherAssignmentPageProps {
  section?: "main" | "sidebar";
}

const TeacherAssignmentPage: React.FC<TeacherAssignmentPageProps> = ({
  section = "main",
}) => {
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

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
    }
  };

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
      await AssignmentService.deleteAssignment(assignmentId);
      setAssignments((prev) => prev.filter((a) => a.id !== assignmentId));
    } catch (error) {
      console.error("Error deleting assignment:", error);
    }
  };

  if (section === "sidebar") {
    return null;
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
