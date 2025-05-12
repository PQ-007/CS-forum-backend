import React from "react";
import { useAuth } from "../../../context/AuthContext";
import AddButton from "../../../components/AddButton";
import FormModal from "../../../components/Modal";
import { courseFields, fileFields, sectionFields } from "../type";
import { CourseData, ModalFormValues } from "../../../components/types";
import { useCourseManager } from "../../../components/course/CourseManageState";
import CourseCard from "../../../components/course/CourseCard";

interface TeacherCoursePageProps {
  section: "main" | "sidebar";
  courses?: CourseData[];
}

export const TeacherCoursePage: React.FC<TeacherCoursePageProps> = ({
  section,
  courses: propCourses,
}) => {
  const { userData } = useAuth();
  const {
    courses,
    expandedCard,
    isModalOpen,
    modalType,
    editingCourse,
    handleCardClick,
    handleAddCourse,
    handleEditCourse,
    handleAddFile,
    handleAddSection,
    handleDeleteCourse,
    handleModalSubmit,
    handleModalClose,
    handleSectionEdit,
    handleFileEdit,
    handleDeleteFile,
    handleDeleteSection,
  } = useCourseManager(propCourses);

  const getModalFields = () => {
    switch (modalType) {
      case "file":
        return fileFields;
      case "section":
        return sectionFields;
      case "course":
        return courseFields;
      default:
        return [];
    }
  };

  const handleSubmit = (values: ModalFormValues) => {
    handleModalSubmit(values);
  };

  if (section === "main") {
    return (
      <div className="space-y-4 overflow-y-auto">
        {courses.map((course, index) => (
          <CourseCard
            key={`course-${index}-${course.title}`}
            {...course}
            onClick={() => handleCardClick(course.title)}
            isExpanded={expandedCard === course.title}
            actions={{
              canEdit: userData?.type === "teacher",
              canDelete: userData?.type === "teacher",
              onEdit: handleEditCourse,
              onDelete: handleDeleteCourse,
            }}
            contentActions={{
              onAddFile: handleAddFile,
              onAddSection: handleAddSection,
              onEditSection: handleSectionEdit,
              onEditFile: handleFileEdit,
              onDeleteFile: handleDeleteFile,
              onDeleteSection: handleDeleteSection,
            }}
          />
        ))}

        <AddButton
          transparent
          text="Шинэ хичээл нэмэх"
          fullWidth
          size="lg"
          bgColor="bg-white"
          textColor="text-blue-500"
          hoverColor="hover:bg-blue-50"
          activeColor="active:bg-blue-100"
          borderColor="border-gray-200"
          style={{
            height: "100%",
            minHeight: "180px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={handleAddCourse}
        />

        <FormModal
          title={getModalTitle(modalType, editingCourse)}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSubmit={handleSubmit}
          fields={getModalFields()}
          initialValues={
            editingCourse
              ? {
                  title: editingCourse.title,
                  year: editingCourse.year,
                  modules: editingCourse.modules,
                  description: editingCourse.description,
                }
              : undefined
          }
        />
      </div>
    );
  }

  return null;
};

const getModalTitle = (
  modalType: "course" | "section" | "file" | null,
  editingCourse: CourseData | null
) => {
  switch (modalType) {
    case "file":
      return "Файл нэмэх";
    case "section":
      return "Сэдэв нэмэх";
    case "course":
      return editingCourse ? "Курс засах" : "Шинэ хичээл нэмэх";
    default:
      return "";
  }
};

export default TeacherCoursePage;
