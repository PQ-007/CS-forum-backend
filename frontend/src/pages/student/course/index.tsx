import React, { useState, useEffect } from "react";
import { Spin, Empty, message } from "antd";
import courseService from "../../../service/courseService";
import { useAuth } from "../../../context/AuthContext";
import { CourseData } from "../../../components/types";
import CourseCard from "../../../components/course/CourseCard";

interface StudentCoursePageProps {
  section: "main" | "sidebar";
}

const StudentCoursePage: React.FC<StudentCoursePageProps> = ({ section }) => {
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const { userData } = useAuth();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        if (userData?.year) {
          const studentCourses = await courseService.getStudentCourses(
            userData.year
          );
          setCourses(studentCourses);
        } else {
          message.warning("Оюутны курсын мэдээлэл олдсонгүй");
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
        message.error("Хичээлүүдийг ачааллахад алдаа гарлаа");
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [userData]);

  const handleCardClick = (title: string) => {
    setExpandedCard(expandedCard === title ? null : title);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" tip="Хичээлүүдийг ачааллаж байна..." />
      </div>
    );
  }

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

  if (section === "main") {
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
    return (
      <div>
        <h3 className="text-lg font-medium mb-4">Хичээлийн хуваарь</h3>
        <div className="mb-6">
          {courses.length > 0 ? (
            <ul className="space-y-2">
              {courses.map((course) => (
                <li
                  key={course.id}
                  className="border-b pb-2 last:border-b-0 hover:bg-gray-50 p-2 rounded cursor-pointer transition-all duration-200"
                  onClick={() => handleCardClick(course.title)}
                >
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">
                      {course.title}
                    </span>
                    <span className="text-gray-500">{course.year}-р курс</span>
                  </div>
                  <div className="flex items-center mt-1 text-sm text-gray-500">
                    <span className="flex items-center mr-3">
                      <span className="mr-1">{course.modules}</span> сэдэв
                    </span>
                    <span className="flex items-center">
                      <span className="mr-1">{course.author}</span> багш
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Хичээлийн хуваарь байхгүй байна</p>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default StudentCoursePage;
