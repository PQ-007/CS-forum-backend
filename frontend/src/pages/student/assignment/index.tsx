import {
  BookOutlined,
  CalendarOutlined,
  FileOutlined,
} from "@ant-design/icons";
import { Card, Col, Row, Statistic, Typography } from "antd";
import React, { useEffect, useState } from "react";
import StudentAssignmentDropdowns from "../../../components/assignment/StudentAssignmentDropdowns";
import { Loading } from "../../../components/Loading";
import type { Assignment, CourseData } from "../../../components/types";
import { useAuth } from "../../../context/AuthContext";
import AssignmentService from "../../../service/assignmentService";
import CourseService from "../../../service/courseService";

const { Title } = Typography;

interface StudentAssignmentPageProps {
  section?: "main" | "sidebar";
}

const StudentAssignmentPage: React.FC<StudentAssignmentPageProps> = ({
  section = "main",
}) => {
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const { userData, user } = useAuth();

  const fetchData = async () => {
    try {
      if (userData?.year && user?.uid) {
        const [coursesData, assignmentsData] = await Promise.all([
          CourseService.getStudentCourses(userData.year),
          AssignmentService.getAllAssignments(),
        ]);

        setCourses(coursesData);

        // Filter assignments for student's year and fetch submissions
        const filteredAssignments = assignmentsData.filter(
          (assignment) => assignment.year === userData.year
        );

        // Fetch submissions for each assignment
        const assignmentsWithSubmissions = await Promise.all(
          filteredAssignments.map(async (assignment) => {
            try {
              const submission = await AssignmentService.getSubmission(
                assignment.id,
                user.uid
              );
              return { ...assignment, submission };
            } catch {
              return assignment;
            }
          })
        );

        setAssignments(assignmentsWithSubmissions);
      } else {
        console.error("User year or uid not found");
        setAssignments([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Optional: Set up a refresh interval
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [userData, user]);

  // Calculate upcoming assignments (due in next 7 days)
  const upcomingAssignments = assignments.filter((assignment) => {
    const dueDate = new Date(assignment.deadline);
    const today = new Date();
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(today.getDate() + 7);

    return dueDate >= today && dueDate <= sevenDaysLater;
  });

  if (loading) {
    return <Loading />;
  }

  if (section === "main") {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Title level={2} className="!mb-2">
            Даалгаврууд
          </Title>
          <p className="text-gray-600">Таны хичээлийн даалгавруудын жагсаалт</p>
        </div>

        {/* Stats Cards */}
        <Row gutter={[24, 24]} className="mb-8">
          <Col xs={24} sm={8}>
            <Card className="shadow-md" bodyStyle={{ padding: "24px" }}>
              <Statistic
                title={<span className="text-lg font-medium">Нийт Хичээл</span>}
                value={courses.length}
                prefix={<BookOutlined className="text-blue-500" />}
                valueStyle={{ color: "#3B82F6", fontSize: "24px" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="shadow-md" bodyStyle={{ padding: "24px" }}>
              <Statistic
                title={
                  <span className="text-lg font-medium">Нийт Даалгавар</span>
                }
                value={assignments.length}
                prefix={<FileOutlined className="text-green-500" />}
                valueStyle={{ color: "#10B981", fontSize: "24px" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="shadow-md" bodyStyle={{ padding: "24px" }}>
              <Statistic
                title={
                  <span className="text-lg font-medium">
                    Ойрын хугацаанд дуусах
                  </span>
                }
                value={upcomingAssignments.length}
                prefix={<CalendarOutlined className="text-orange-500" />}
                valueStyle={{ color: "#F97316", fontSize: "24px" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Assignment Dropdowns */}
        <Card className="shadow-md" bodyStyle={{ padding: "24px" }}>
          <StudentAssignmentDropdowns
            assignments={assignments}
            loading={loading}
            onAssignmentSubmitted={fetchData}
          />
        </Card>
      </div>
    );
  }

  return null;
};

export default StudentAssignmentPage;
