import { useState, useEffect } from "react";
import { message } from "antd";
import {
  CourseData,
  CourseFormValues,
  FileFormValues,
  SectionFormValues,
} from "../types";
import { useAuth } from "../../context/AuthContext";
import CourseService from "../../service/courseService";

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

  // Fetch courses on mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const allCourses = await CourseService.getAllCourses();
        setState((prev) => ({ ...prev, courses: allCourses }));
      } catch (error) {
        message.error("Курсуудыг татахад алдаа гарлаа.");
        console.error("Error fetching courses:", error);
      }
    };
    fetchCourses();
  }, []);

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

  const handleDeleteCourse = async (courseId: string) => {
    try {
      await CourseService.deleteCourse(courseId);
      const updatedCourses = state.courses.filter(
        (course) => course.id !== courseId
      );
      updateState({ courses: updatedCourses });
      message.success("Курс амжилттай устгагдлаа");
    } catch (error) {
      message.error("Курсыг устгахад алдаа гарлаа.");
      console.error("Error deleting course:", error);
    }
  };

  const handleModalSubmit = async (values: ModalFormValues) => {
    try {
      let updatedCourses: CourseData[] = [...state.courses];

      switch (state.modalType) {
        case "course": {
          const courseValues = values as CourseFormValues;
          updatedCourses = await handleCourseSubmit(courseValues);
          break;
        }
        case "file": {
          const fileValues = values as FileFormValues;
          updatedCourses = await handleFileSubmit(fileValues);
          break;
        }
        case "section": {
          const sectionValues = values as SectionFormValues;
          updatedCourses = await handleSectionSubmit(sectionValues);
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
    } catch (error) {
      message.error("Өөрчлөлт хадгалахад алдаа гарлаа.");
      console.error("Error submitting modal:", error);
    }
  };

  const handleCourseSubmit = async (
    values: CourseFormValues
  ): Promise<CourseData[]> => {
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

    if (state.editingCourse?.id) {
      await CourseService.updateCourse(state.editingCourse.id, newCourse);
      message.success("Курс амжилттай засагдлаа");
      return state.courses.map((course) =>
        course.id === state.editingCourse?.id
          ? { ...newCourse, id: course.id }
          : course
      );
    } else {
      const courseId = await CourseService.createCourse(newCourse);
      message.success("Курс амжилттай нэмэгдлээ");
      return [...state.courses, { ...newCourse, id: courseId }];
    }
  };

  const handleFileSubmit = async (
    values: FileFormValues
  ): Promise<CourseData[]> => {
    if (!values.file || !state.expandedCard) return state.courses;

    const course = state.courses.find((c) => c.title === state.expandedCard);
    if (!course?.id) return state.courses;

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

    await CourseService.updateCourse(course.id, {
      ...course,
      content: updatedContent,
    });
    const updatedCourses = state.courses.map((c) =>
      c.id === course.id ? { ...c, content: updatedContent } : c
    );
    return updatedCourses;
  };

  const handleSectionSubmit = async (
    values: SectionFormValues
  ): Promise<CourseData[]> => {
    if (!state.expandedCard) return state.courses;

    const course = state.courses.find((c) => c.title === state.expandedCard);
    if (!course?.id) return state.courses;

    const updatedContent = [
      ...course.content,
      { title: values.title, files: [] },
    ];
    const updatedCourse = {
      ...course,
      content: updatedContent,
      modules: updatedContent.length,
    };

    await CourseService.updateCourse(course.id, updatedCourse);
    return state.courses.map((c) => (c.id === course.id ? updatedCourse : c));
  };

  const handleSectionEdit = async (oldTitle: string, newTitle: string) => {
    const course = state.courses.find((c) => c.title === state.expandedCard);
    if (!course?.id) return;

    const updatedContent = course.content.map((section) =>
      section.title === oldTitle ? { ...section, title: newTitle } : section
    );
    await CourseService.updateCourse(course.id, {
      ...course,
      content: updatedContent,
    });
    updateState({
      courses: state.courses.map((c) =>
        c.id === course.id ? { ...c, content: updatedContent } : c
      ),
    });
    message.success("Сэдвийн нэр өөрчлөгдлөө");
  };

  const handleFileEdit = async (
    sectionTitle: string,
    fileIndex: number,
    newName: string
  ) => {
    const course = state.courses.find((c) => c.title === state.expandedCard);
    if (!course?.id) return;

    const updatedContent = course.content.map((section) => {
      if (section.title === sectionTitle) {
        const updatedFiles = [...section.files];
        updatedFiles[fileIndex] = { ...updatedFiles[fileIndex], name: newName };
        return { ...section, files: updatedFiles };
      }
      return section;
    });
    await CourseService.updateCourse(course.id, {
      ...course,
      content: updatedContent,
    });
    updateState({
      courses: state.courses.map((c) =>
        c.id === course.id ? { ...c, content: updatedContent } : c
      ),
    });
    message.success("Файлын нэр өөрчлөгдлөө");
  };

  const handleDeleteFile = async (sectionTitle: string, fileIndex: number) => {
    const course = state.courses.find((c) => c.title === state.expandedCard);
    if (!course?.id) return;

    const updatedContent = course.content.map((section) => {
      if (section.title === sectionTitle) {
        const updatedFiles = section.files.filter((_, i) => i !== fileIndex);
        return { ...section, files: updatedFiles };
      }
      return section;
    });
    await CourseService.updateCourse(course.id, {
      ...course,
      content: updatedContent,
    });
    updateState({
      courses: state.courses.map((c) =>
        c.id === course.id ? { ...c, content: updatedContent } : c
      ),
    });
    message.success("Файл устгагдлаа");
  };

  const handleDeleteSection = async (sectionTitle: string) => {
    const course = state.courses.find((c) => c.title === state.expandedCard);
    if (!course?.id) return;

    const updatedContent = course.content.filter(
      (section) => section.title !== sectionTitle
    );
    const updatedCourse = {
      ...course,
      content: updatedContent,
      modules: updatedContent.length,
    };
    await CourseService.updateCourse(course.id, updatedCourse);
    updateState({
      courses: state.courses.map((c) =>
        c.id === course.id ? updatedCourse : c
      ),
    });
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
