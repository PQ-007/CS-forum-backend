import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  List,
  Typography,
  Tag,
  Spin,
} from "antd";
import {
  BookOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../../context/AuthContext";
import CourseService from "../../../service/courseService";
import AssignmentService from "../../../service/assignmentService";
import type { CourseData, Assignment } from "../../../components/types";
import dayjs from "dayjs";

const { Title, Text } = Typography;

interface StudentHomePageProps {
  section: "main" | "sidebar";
}

const StudentHomePage: React.FC<StudentHomePageProps> = ({ section }) => {
  const { userData, user } = useAuth();
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userData, user]);

  // Calculate upcoming assignments (due in next 7 days)
  const upcomingAssignments = assignments
    .filter((assignment) => {
      const dueDate = dayjs(assignment.deadline);
      const today = dayjs();
      const sevenDaysLater = dayjs().add(7, "day");
      return dueDate.isAfter(today) && dueDate.isBefore(sevenDaysLater);
    })
    .sort((a, b) => dayjs(a.deadline).unix() - dayjs(b.deadline).unix());

  // Calculate overdue assignments
  const overdueAssignments = assignments
    .filter((assignment) => {
      const dueDate = dayjs(assignment.deadline);
      const today = dayjs();
      return dueDate.isBefore(today) && !assignment.submission;
    })
    .sort((a, b) => dayjs(a.deadline).unix() - dayjs(b.deadline).unix());

  // Calculate submitted assignments
  const submittedAssignments = assignments
    .filter((assignment) => assignment.submission)
    .sort(
      (a, b) =>
        dayjs(b.submission?.submittedAt).unix() -
        dayjs(a.submission?.submittedAt).unix()
    );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (section === "main") {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Title level={2} className="!mb-2">
            Сайн байна уу, {userData?.displayName}!
          </Title>
          <Text type="secondary" className="text-lg">
            Таны хичээлийн мэдээлэл
          </Text>
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
                  <span className="text-lg font-medium">Хүлээгдэж буй</span>
                }
                value={upcomingAssignments.length}
                prefix={<ClockCircleOutlined className="text-orange-500" />}
                valueStyle={{ color: "#F97316", fontSize: "24px" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="shadow-md" bodyStyle={{ padding: "24px" }}>
              <Statistic
                title={<span className="text-lg font-medium">Илгээсэн</span>}
                value={submittedAssignments.length}
                prefix={<CheckCircleOutlined className="text-green-500" />}
                valueStyle={{ color: "#10B981", fontSize: "24px" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Course Progress */}
        <Card
          title="Хичээлийн явц"
          className="mb-8"
          bodyStyle={{ padding: "24px" }}
        >
          <div className="space-y-6">
            {courses.map((course) => {
              const courseAssignments = assignments.filter(
                (a) => a.courseId === course.id
              );
              const submittedCount = courseAssignments.filter(
                (a) => a.submission
              ).length;
              const progress = courseAssignments.length
                ? Math.round((submittedCount / courseAssignments.length) * 100)
                : 0;

              return (
                <div key={course.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Text strong>{course.title}</Text>
                    <Text type="secondary">{progress}%</Text>
                  </div>
                  <Progress
                    percent={progress}
                    status={progress === 100 ? "success" : "active"}
                    strokeColor={{
                      "0%": "#108ee9",
                      "100%": "#87d068",
                    }}
                  />
                </div>
              );
            })}
          </div>
        </Card>

        {/* Upcoming Assignments */}
        <Card
          title="Ойрын даалгаврууд"
          className="mb-8"
          bodyStyle={{ padding: "24px" }}
        >
          <List
            dataSource={upcomingAssignments}
            renderItem={(assignment) => (
              <List.Item>
                <div className="w-full">
                  <div className="flex justify-between items-start">
                    <div>
                      <Text strong>{assignment.title}</Text>
                      <div className="mt-1">
                        <Text type="secondary">
                          Дуусах хугацаа:{" "}
                          {dayjs(assignment.deadline).format(
                            "YYYY-MM-DD HH:mm"
                          )}
                        </Text>
                      </div>
                    </div>
                    <Tag color="warning">Хүлээгдэж буй</Tag>
                  </div>
                </div>
              </List.Item>
            )}
            locale={{
              emptyText: "Ойрын даалгавар байхгүй байна",
            }}
          />
        </Card>

        {/* Overdue Assignments */}
        {overdueAssignments.length > 0 && (
          <Card
            title="Хугацаа хэтэрсэн даалгаврууд"
            className="mb-8"
            bodyStyle={{ padding: "24px" }}
          >
            <List
              dataSource={overdueAssignments}
              renderItem={(assignment) => (
                <List.Item>
                  <div className="w-full">
                    <div className="flex justify-between items-start">
                      <div>
                        <Text strong>{assignment.title}</Text>
                        <div className="mt-1">
                          <Text type="secondary">
                            Дуусах хугацаа:{" "}
                            {dayjs(assignment.deadline).format(
                              "YYYY-MM-DD HH:mm"
                            )}
                          </Text>
                        </div>
                      </div>
                      <Tag color="error" icon={<ExclamationCircleOutlined />}>
                        Хугацаа хэтэрсэн
                      </Tag>
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        )}
      </div>
    );
  }

  if (section === "sidebar") {
    return (
      <div className="space-y-4">
        {/* Quick Stats */}
        <Card title="Товч мэдээлэл" className="mb-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Text>Нийт хичээл</Text>
              <Text strong>{courses.length}</Text>
            </div>
            <div className="flex items-center justify-between">
              <Text>Хүлээгдэж буй</Text>
              <Text strong>{upcomingAssignments.length}</Text>
            </div>
            <div className="flex items-center justify-between">
              <Text>Илгээсэн</Text>
              <Text strong>{submittedAssignments.length}</Text>
            </div>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card title="Сүүлийн үйл ажиллагаа">
          <List
            size="small"
            dataSource={[...submittedAssignments].slice(0, 5)}
            renderItem={(assignment) => (
              <List.Item>
                <div className="w-full">
                  <Text type="secondary" className="text-xs">
                    {dayjs(assignment.submission?.submittedAt).format(
                      "MM-DD HH:mm"
                    )}
                  </Text>
                  <div className="mt-1">
                    <Text>{assignment.title}</Text>
                  </div>
                  <Tag color="success" className="mt-1">
                    Илгээсэн
                  </Tag>
                </div>
              </List.Item>
            )}
            locale={{
              emptyText: "Сүүлийн үйл ажиллагаа байхгүй байна",
            }}
          />
        </Card>
      </div>
    );
  }

  return null;
};

export default StudentHomePage;
