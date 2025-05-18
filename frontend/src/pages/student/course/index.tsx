import { CaretRightOutlined } from "@ant-design/icons";
import {
  Badge,
  Card,
  Collapse,
  Empty,
  message,
  Tooltip,
  Typography,
} from "antd";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import CourseCard from "../../../components/course/CourseCard";
import { Loading } from "../../../components/Loading";
import { Assignment, CourseData } from "../../../components/types";
import { useAuth } from "../../../context/AuthContext";
import assignmentService from "../../../service/assignmentService";
import courseService from "../../../service/courseService";

const { Text } = Typography;
const { Panel } = Collapse;

interface StudentCoursePageProps {
  section: "main" | "sidebar";
}

const StudentCoursePage: React.FC<StudentCoursePageProps> = ({ section }) => {
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const { userData, user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (userData?.year && user?.uid) {
          const [studentCourses, allAssignments] = await Promise.all([
            courseService.getStudentCourses(userData.year),
            assignmentService.getAllAssignments(),
          ]);

          setCourses(studentCourses);

          // Filter assignments for student's year and fetch submissions
          const filteredAssignments = allAssignments.filter(
            (assignment) => assignment.year === userData.year
          );

          // Fetch submissions for each assignment
          const assignmentsWithSubmissions = await Promise.all(
            filteredAssignments.map(async (assignment) => {
              try {
                const submission = await assignmentService.getSubmission(
                  assignment.id,
                  user.uid
                );
                return { ...assignment, submission };
              } catch {
                return assignment;
              }
            })
          );

          // Filter out submitted assignments
          const pendingAssignments = assignmentsWithSubmissions.filter(
            (assignment) => !assignment.submission
          );

          setAssignments(pendingAssignments);
        } else {
          message.warning("Оюутны курсын мэдээлэл олдсонгүй");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        message.error("Мэдээлэл ачааллахад алдаа гарлаа");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userData, user]);

  const handleCardClick = (title: string) => {
    setExpandedCard(expandedCard === title ? null : title);
  };

  // Sort assignments by deadline (most recent first)
  const sortedAssignments = [...assignments].sort((a, b) => {
    return dayjs(a.deadline).isBefore(dayjs(b.deadline)) ? -1 : 1;
  });

  if (loading) {
    return <Loading />;
  }

  if (section === "main") {
    // Filter courses that have pending assignments
    const coursesWithPendingAssignments = courses.filter((course) =>
      assignments.some((assignment) => assignment.courseId === course.id)
    );

    if (coursesWithPendingAssignments.length === 0) {
      return (
        <Empty
          description={
            userData?.year
              ? `${userData.year}-р курсын хүлээгдэж буй даалгавар байхгүй байна`
              : "Хүлээгдэж буй даалгавар байхгүй байна"
          }
          className="mt-8"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      );
    }

    return (
      <div className="space-y-4 overflow-y-auto">
        {coursesWithPendingAssignments.map((course, index) => (
          <CourseCard
            key={course.id || `course-${index}`}
            {...course}
            onClick={() => handleCardClick(course.title)}
            isExpanded={expandedCard === course.title}
            // No editing or deleting actions for students
            actions={{
              canEdit: false,
              canDelete: false,
              onEdit: undefined,
              onDelete: undefined,
            }}
            // No content actions for students
            contentActions={{
              onAddFile: undefined,
              onAddSection: undefined,
              onEditSection: undefined,
              onEditFile: undefined,
              onDeleteFile: undefined,
              onDeleteSection: undefined,
            }}
            className=""
          />
        ))}
      </div>
    );
  }

  if (section === "sidebar") {
    // Group assignments by course
    const assignmentsByCourse = courses.reduce<
      Record<string, { course: CourseData; assignments: Assignment[] }>
    >((acc, course) => {
      if (!course.id) return acc;
      const courseAssignments = sortedAssignments.filter(
        (assignment) => assignment.courseId === course.id
      );
      if (courseAssignments.length > 0) {
        acc[course.id] = {
          course,
          assignments: courseAssignments,
        };
      }
      return acc;
    }, {});

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Хүлээгдэж буй даалгаврууд</h3>
        {Object.keys(assignmentsByCourse).length > 0 ? (
          <Collapse
            expandIcon={({ isActive }) => (
              <CaretRightOutlined rotate={isActive ? 90 : 0} />
            )}
            className="bg-transparent"
          >
            {Object.entries(assignmentsByCourse).map(
              ([courseId, { course, assignments }]) => (
                <Panel
                  key={courseId}
                  header={
                    <div className="flex items-center justify-between">
                      <Text strong>{course.title}</Text>
                      <Badge
                        count={assignments.length}
                        style={{ backgroundColor: "#1890ff" }}
                      />
                    </div>
                  }
                >
                  <div className="space-y-2">
                    {assignments.map((assignment) => {
                      const today = dayjs();
                      const isUpcoming = dayjs(assignment.deadline).isAfter(
                        today
                      );
                      const isPastDue = dayjs(assignment.deadline).isBefore(
                        today
                      );

                      let status: "processing" | "error" | "default";
                      let statusText: string;

                      if (isPastDue) {
                        status = "error";
                        statusText = "Хугацаа хэтэрсэн";
                      } else if (isUpcoming) {
                        status = "processing";
                        statusText = "Удахгүй дуусна";
                      } else {
                        status = "default";
                        statusText = "Дууссан";
                      }

                      return (
                        <Card
                          key={assignment.id}
                          size="small"
                          className=""
                          bodyStyle={{ padding: "12px" }}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <Text strong className="text-sm">
                              {assignment.title}
                            </Text>
                            <Badge status={status} text={statusText} />
                          </div>
                          <div className="text-xs text-gray-500 mb-2">
                            Дуусах:{" "}
                            {dayjs(assignment.deadline).format("YYYY-MM-DD")}
                          </div>
                          <Tooltip title={assignment.description}>
                            <div className="text-xs text-gray-700 line-clamp-2">
                              {assignment.description}
                            </div>
                          </Tooltip>
                        </Card>
                      );
                    })}
                  </div>
                </Panel>
              )
            )}
          </Collapse>
        ) : (
          <p className="text-gray-500">Хүлээгдэж буй даалгавар байхгүй байна</p>
        )}
      </div>
    );
  }

  return null;
};

export default StudentCoursePage;
