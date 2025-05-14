import React, { useState, useEffect } from "react";
import { Card, Row, Col, Statistic, Empty, Spin } from "antd";
import {
  BookOutlined,
  FileOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import AssignmentCalendar from "../../../components/Calendar";
import CourseService from "../../../service/courseService";
import AssignmentService from "../../../service/assignmentService";
import type { CourseData, Assignment } from "../../../components/types";
import { useAuth } from "../../../context/AuthContext";

interface StudentAssignmentPageProps {
  section?: "main" | "sidebar";
}

const StudentAssignmentPage: React.FC<StudentAssignmentPageProps> = ({
  section = "main",
}) => {
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const { userData } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (userData?.year) {
          const [coursesData, assignmentsData] = await Promise.all([
            CourseService.getStudentCourses(userData.year),
            AssignmentService.getAllAssignments(),
          ]);

          setCourses(coursesData);

          // Filter assignments for student's year
          const filteredAssignments = assignmentsData.filter(
            (assignment) => assignment.year === userData.year
          );
          setAssignments(filteredAssignments);
        } else {
          console.error("User year not found");
          setAssignments([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userData]);

  // Calculate upcoming assignments (due in next 7 days)
  const upcomingAssignments = assignments.filter((assignment) => {
    const dueDate = new Date(assignment.deadline);
    const today = new Date();
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(today.getDate() + 7);

    return dueDate >= today && dueDate <= sevenDaysLater;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (section === "main") {
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
                title="Нийт Даалгавар"
                value={assignments.length}
                prefix={<FileOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Ойрын хугацаанд дуусах"
                value={upcomingAssignments.length}
                prefix={<CalendarOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* Calendar */}
        <Card title="Даалгаврын хуваарь">
          {assignments.length > 0 ? (
            <AssignmentCalendar
              mode="student"
              assignments={assignments}
              courses={courses}
            />
          ) : (
            <Empty description="Одоогоор даалгавар байхгүй байна" />
          )}
        </Card>
      </div>
    );
  }

  return null;
};

export default StudentAssignmentPage;
