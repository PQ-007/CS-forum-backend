/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { message } from "antd";
import {
  CourseData,
  CourseFormValues,
  FileFormValues,
  SectionFormValues,
} from "../types";
import { useAuth } from "../../context/AuthContext";

interface CourseManagerState {
  courses: CourseData[];
  expandedCard: string | null;
  isModalOpen: boolean;
  modalType: "course" | "section" | "file" | null;
  activeSectionTitle: string;
  editingCourse: CourseData | null;
}

type ModalFormValues = CourseFormValues | FileFormValues | SectionFormValues;

export const useCourseManager = (initialCourses: CourseData[] = []) => {
  const { userData } = useAuth();
  const [state, setState] = useState<CourseManagerState>({
    courses: initialCourses,
    expandedCard: null,
    isModalOpen: false,
    modalType: null,
    activeSectionTitle: "",
    editingCourse: null,
  });

  const updateState = (updates: Partial<CourseManagerState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const handleCardClick = (title: string) => {
    updateState({ expandedCard: state.expandedCard === title ? null : title });
  };

  const handleAddCourse = () => {
    updateState({ modalType: "course", isModalOpen: true });
  };

  const handleEditCourse = (course: CourseData) => {
    updateState({
      editingCourse: course,
      modalType: "course",
      isModalOpen: true,
    });
  };

  const handleAddFile = (sectionTitle: string) => {
    updateState({
      activeSectionTitle: sectionTitle,
      modalType: "file",
      isModalOpen: true,
    });
  };

  const handleAddSection = () => {
    updateState({ modalType: "section", isModalOpen: true });
  };

  const handleModalClose = () => {
    updateState({
      isModalOpen: false,
      modalType: null,
      editingCourse: null,
    });
  };

  const handleDeleteCourse = (courseTitle: string) => {
    const updatedCourses = state.courses.filter(
      (course) => course.title !== courseTitle
    );
    updateState({ courses: updatedCourses });
    message.success("Курс амжилттай устгагдлаа");
  };

  const handleModalSubmit = async (values: ModalFormValues) => {
    let updatedCourses: CourseData[];

    switch (state.modalType) {
      case "course": {
        const courseValues = values as CourseFormValues;
        updatedCourses = handleCourseSubmit(courseValues);
        break;
      }
      case "file": {
        const fileValues = values as FileFormValues;
        updatedCourses = handleFileSubmit(fileValues);
        break;
      }
      case "section": {
        const sectionValues = values as SectionFormValues;
        updatedCourses = handleSectionSubmit(sectionValues);
        break;
      }
      default:
        return;
    }

    updateState({
      courses: updatedCourses,
      isModalOpen: false,
      modalType: null,
      editingCourse: null,
    });
  };

  const handleCourseSubmit = (values: any): CourseData[] => {
    const initialContent = Array.from(
      { length: values.modules || 0 },
      (_, index) => ({
        title: `Section ${index + 1}`,
        files: [],
      })
    );

    const newCourse: CourseData = {
      title: values.title,
      year: values.year,
      modules: initialContent.length,
      author: userData?.displayName || "Unknown Teacher",
      description: values.description,
      content: initialContent,
    };

    if (state.editingCourse) {
      message.success("Курс амжилттай засагдлаа");
      return state.courses.map((course) =>
        course.title === state.editingCourse!.title ? newCourse : course
      );
    }

    message.success("Курс амжилттай нэмэгдлээ");
    return [...state.courses, newCourse];
  };

  const handleFileSubmit = (values: any): CourseData[] => {
    if (!values.file) return state.courses;

    return state.courses.map((course) => {
      if (course.title === state.expandedCard) {
        const updatedContent = course.content.map((section) => {
          if (section.title === state.activeSectionTitle) {
            return {
              ...section,
              files: [
                ...section.files,
                {
                  name: values.name,
                  url: URL.createObjectURL(values.file),
                  type: values.file.type,
                  uploadedAt: new Date(),
                },
              ],
            };
          }
          return section;
        });
        return { ...course, content: updatedContent };
      }
      return course;
    });
  };

  const handleSectionSubmit = (values: any): CourseData[] => {
    return state.courses.map((course) => {
      if (course.title === state.expandedCard) {
        return {
          ...course,
          content: [...course.content, { title: values.title, files: [] }],
          modules: course.content.length + 1,
        };
      }
      return course;
    });
  };

  const handleSectionEdit = (oldTitle: string, newTitle: string) => {
    const updatedCourses = state.courses.map((course) => {
      if (course.title === state.expandedCard) {
        const updatedContent = course.content.map((section) => {
          if (section.title === oldTitle) {
            return { ...section, title: newTitle };
          }
          return section;
        });
        return { ...course, content: updatedContent };
      }
      return course;
    });
    updateState({ courses: updatedCourses });
    message.success("Сэдвийн нэр өөрчлөгдлөө");
  };

  const handleFileEdit = (
    sectionTitle: string,
    fileIndex: number,
    newName: string
  ) => {
    const updatedCourses = state.courses.map((course) => {
      if (course.title === state.expandedCard) {
        const updatedContent = course.content.map((section) => {
          if (section.title === sectionTitle) {
            const updatedFiles = [...section.files];
            updatedFiles[fileIndex] = {
              ...updatedFiles[fileIndex],
              name: newName,
            };
            return { ...section, files: updatedFiles };
          }
          return section;
        });
        return { ...course, content: updatedContent };
      }
      return course;
    });
    updateState({ courses: updatedCourses });
    message.success("Файлын нэр өөрчлөгдлөө");
  };

  const handleDeleteFile = (sectionTitle: string, fileIndex: number) => {
    const updatedCourses = state.courses.map((course) => {
      if (course.title === state.expandedCard) {
        const updatedContent = course.content.map((section) => {
          if (section.title === sectionTitle) {
            const updatedFiles = section.files.filter(
              (_, i) => i !== fileIndex
            );
            return { ...section, files: updatedFiles };
          }
          return section;
        });
        return { ...course, content: updatedContent };
      }
      return course;
    });
    updateState({ courses: updatedCourses });
    message.success("Файл устгагдлаа");
  };

  const handleDeleteSection = (sectionTitle: string) => {
    const updatedCourses = state.courses.map((course) => {
      if (course.title === state.expandedCard) {
        const updatedContent = course.content.filter(
          (section) => section.title !== sectionTitle
        );
        return {
          ...course,
          content: updatedContent,
          modules: updatedContent.length,
        };
      }
      return course;
    });
    updateState({ courses: updatedCourses });
    message.success("Сэдэв устгагдлаа");
  };

  return {
    ...state,
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
  };
};
