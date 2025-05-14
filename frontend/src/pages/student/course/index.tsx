import React, { useState, useEffect } from "react";
import { Spin, Empty, message, List, Typography, Badge, Tooltip } from "antd";
import courseService from "../../../service/courseService";
import assignmentService from "../../../service/assignmentService";
import { useAuth } from "../../../context/AuthContext";
import { CourseData, Assignment } from "../../../components/types";
import CourseCard from "../../../components/course/CourseCard";
import dayjs from "dayjs";

const { Text } = Typography;

interface StudentCoursePageProps {
  section: "main" | "sidebar";
}

const StudentCoursePage: React.FC<StudentCoursePageProps> = ({ section }) => {
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const { userData } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (userData?.year) {
          const [studentCourses, allAssignments] = await Promise.all([
            courseService.getStudentCourses(userData.year),
            assignmentService.getAllAssignments(),
          ]);

          setCourses(studentCourses);

          // Filter assignments for student's year
          const filteredAssignments = allAssignments.filter(
            (assignment) => assignment.year === userData.year
          );
          setAssignments(filteredAssignments);
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
  }, [userData]);

  const handleCardClick = (title: string) => {
    setExpandedCard(expandedCard === title ? null : title);
  };

  // Sort assignments by deadline (most recent first)
  const sortedAssignments = [...assignments].sort((a, b) => {
    return dayjs(a.deadline).isBefore(dayjs(b.deadline)) ? -1 : 1;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" tip="Мэдээллийг ачааллаж байна..." />
      </div>
    );
  }

  if (section === "main") {
    if (courses.length === 0) {
      return (
        <Empty
          description={
            userData?.year
              ? `${userData.year}-р курсын хичээлүүд олдсонгүй`
              : "Хичээлүүд олдсонгүй"
          }
          className="mt-8"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      );
    }

    return (
      <div className="space-y-4 overflow-y-auto">
        {courses.map((course, index) => (
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
          />
        ))}
      </div>
    );
  }

  if (section === "sidebar") {
    // Get the current date to identify upcoming assignments
    const today = dayjs();

    return (
      <div>
        {/* Assignments Section */}
        <h3 className="text-lg font-medium mb-4">Даалгаврууд</h3>
        {sortedAssignments.length > 0 ? (
          <List
            size="small"
            dataSource={sortedAssignments}
            renderItem={(assignment) => {
              const courseInfo = courses.find(
                (c) => c.id === assignment.courseId
              );
              const isUpcoming = dayjs(assignment.deadline).isAfter(today);
              const isPastDue = dayjs(assignment.deadline).isBefore(today);

              return (
                <List.Item className="px-2 py-3 border-b last:border-b-0 hover:bg-gray-50 rounded">
                  <div className="w-full">
                    <div className="flex justify-between items-start">
                      <Text strong className="text-blue-600">
                        {courseInfo?.title || assignment.title}
                      </Text>
                      {isPastDue ? (
                        <Badge status="error" text="Хугацаа хэтэрсэн" />
                      ) : isUpcoming ? (
                        <Badge status="processing" text="Удахгүй дуусна" />
                      ) : (
                        <Badge status="default" text="Дууссан" />
                      )}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Дуусах: {dayjs(assignment.deadline).format("YYYY-MM-DD")}
                    </div>
                    <Tooltip title={assignment.description}>
                      <div className="mt-1 text-gray-700 truncate">
                        {assignment.description}
                      </div>
                    </Tooltip>
                  </div>
                </List.Item>
              );
            }}
          />
        ) : (
          <p className="text-gray-500">Даалгаврууд байхгүй байна</p>
        )}
      </div>
    );
  }

  return null;
};

export default StudentCoursePage;
