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
import { uploadFile, deleteFile } from "../../service/fileService";

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
    const course = state.courses.find((c) => c.title === title);
    if (!course) {
      console.error("Course not found for title:", title);
      return;
    }
    console.log("Expanding/collapsing course:", { title, courseId: course.id });
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
    // Get current course
    const course = state.courses.find((c) => c.title === state.expandedCard);
    if (!course) {
      message.error("Курс олдсонгүй");
      return;
    }

    if (!course.id) {
      message.error("Курсын ID олдсонгүй");
      return;
    }

    // Validate the section exists in the course
    const sectionExists = course.content.some((s) => s.title === sectionTitle);
    if (!sectionExists) {
      message.error("Сэдэв олдсонгүй");
      return;
    }

    // Log the state before update
    console.log("Adding file to course:", {
      courseId: course.id,
      sectionTitle: sectionTitle,
      courseTitle: course.title,
    });

    // Update state with the active section and course ID
    updateState({
      activeSectionTitle: sectionTitle,
      modalType: "file",
      isModalOpen: true,
      editingCourse: course,
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
      activeSectionTitle: "", // Clear the active section when modal closes
    });
  };

  const handleDeleteCourse = async (courseId: string) => {
    try {
      console.log("Attempting to delete course:", courseId);
      const courseToDelete = state.courses.find((c) => c.id === courseId);

      if (!courseToDelete) {
        console.error("Course not found:", courseId);
        message.error("Курс олдсонгүй");
        return;
      }

      console.log("Found course to delete:", courseToDelete);

      // Delete all files in all sections first
      for (const section of courseToDelete.content) {
        console.log("Processing section:", section.title);
        for (const file of section.files) {
          if (file.storagePath) {
            try {
              console.log("Deleting file:", file.storagePath);
              await deleteFile(file.storagePath);
            } catch (error) {
              console.error("Error deleting file:", file.storagePath, error);
              // Continue with other files even if one fails
            }
          }
        }
      }

      // Delete the course from the database
      console.log("Deleting course from database:", courseId);
      await CourseService.deleteCourse(courseId);

      // Update local state
      updateState({
        courses: state.courses.filter((course) => course.id !== courseId),
        expandedCard:
          state.expandedCard === courseToDelete.title
            ? null
            : state.expandedCard,
      });

      message.success("Курс амжилттай устгагдлаа");
    } catch (error) {
      console.error("Error deleting course:", error);
      message.error("Курсыг устгахад алдаа гарлаа");
    }
  };

  const handleModalSubmit = async (values: ModalFormValues) => {
    try {
      let updatedCourses: CourseData[] = [...state.courses];

      // Log the current state and values for debugging
      console.log("Modal submit state:", {
        modalType: state.modalType,
        expandedCard: state.expandedCard,
        activeSectionTitle: state.activeSectionTitle,
        editingCourse: state.editingCourse,
        values,
      });

      switch (state.modalType) {
        case "course": {
          const courseValues = values as CourseFormValues;
          updatedCourses = await handleCourseSubmit(courseValues);
          break;
        }
        case "file": {
          const fileValues = values as FileFormValues;
          // Validate required data is present
          if (!state.editingCourse?.id) {
            throw new Error("No course selected");
          }
          if (!state.activeSectionTitle) {
            throw new Error("No section selected");
          }
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
        activeSectionTitle: "", // Clear active section after successful submit
      });
    } catch (error) {
      console.error("Error submitting modal:", error);
      message.error(
        error instanceof Error
          ? error.message
          : "Өөрчлөлт хадгалахад алдаа гарлаа."
      );
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
    // Log the incoming values
    console.log("handleFileSubmit received values:", values);

    if (!values.file) {
      console.error("No file in values:", values);
      message.error("Файл сонгогдоогүй байна");
      return state.courses;
    }

    const editingCourse = state.editingCourse;
    if (!editingCourse?.id) {
      console.error("No editing course found:", state.editingCourse);
      message.error("Курсын ID олдсонгүй");
      return state.courses;
    }

    if (!state.activeSectionTitle) {
      console.error("No active section title:", state.activeSectionTitle);
      message.error("Сэдэв сонгогдоогүй байна");
      return state.courses;
    }

    try {
      // Log upload parameters
      console.log("Uploading file with params:", {
        courseId: editingCourse.id,
        sectionTitle: state.activeSectionTitle,
        fileName: values.file.name,
        fileSize: values.file.size,
        fileType: values.file.type,
      });

      // Create FormData and append all required fields
      const formData = new FormData();
      formData.append("file", values.file);
      formData.append("courseId", editingCourse.id);
      formData.append("sectionTitle", state.activeSectionTitle);

      // Log FormData contents
      for (const pair of formData.entries()) {
        console.log("FormData entry:", pair[0], pair[1]);
      }

      // Upload file to the server
      const fileData = await uploadFile(
        values.file,
        editingCourse.id,
        state.activeSectionTitle
      );

      if (!fileData || !fileData.url || !fileData.storagePath) {
        console.error("Invalid file upload response:", fileData);
        throw new Error("Invalid response from file upload");
      }

      // Find the section and update its files
      const updatedContent = editingCourse.content.map((section) => {
        if (section.title === state.activeSectionTitle) {
          return {
            ...section,
            files: [
              ...section.files,
              {
                name: values.name || values.file.name,
                url: fileData.url,
                type: fileData.type,
                uploadedAt: new Date(fileData.uploadedAt),
                storagePath: fileData.storagePath,
              },
            ],
          };
        }
        return section;
      });

      // Update the course in the database
      await CourseService.updateCourse(editingCourse.id, {
        ...editingCourse,
        content: updatedContent,
      });

      message.success("Файл амжилттай нэмэгдлээ");

      // Update local state
      return state.courses.map((c) =>
        c.id === editingCourse.id ? { ...c, content: updatedContent } : c
      );
    } catch (error) {
      console.error("Error uploading file:", error);
      message.error(
        error instanceof Error ? error.message : "Файл нэмэхэд алдаа гарлаа"
      );
      return state.courses;
    }
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
    if (!course?.id) {
      message.error("Курсын мэдээлэл олдсонгүй");
      return;
    }

    try {
      const section = course.content.find((s) => s.title === sectionTitle);
      if (!section) {
        message.error("Сэдвийн мэдээлэл олдсонгүй");
        return;
      }

      const file = section.files[fileIndex];
      if (!file?.storagePath) {
        message.error("Файлын зам олдсонгүй");
        return;
      }

      // Delete file from server
      await deleteFile(file.storagePath);

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
    } catch (error) {
      message.error("Файл устгахад алдаа гарлаа");
      console.error("Error deleting file:", error);
    }
  };

  const handleDeleteSection = async (sectionTitle: string) => {
    const course = state.courses.find((c) => c.title === state.expandedCard);
    if (!course?.id) {
      message.error("Курсын мэдээлэл олдсонгүй");
      return;
    }

    try {
      // Find the section to delete
      const sectionToDelete = course.content.find(
        (s) => s.title === sectionTitle
      );
      if (!sectionToDelete) {
        message.error("Сэдэв олдсонгүй");
        return;
      }

      // Delete all files in the section first
      for (const file of sectionToDelete.files) {
        if (file.storagePath) {
          try {
            await deleteFile(file.storagePath);
          } catch (error) {
            console.error("Error deleting file:", error);
            // Continue with other files even if one fails
          }
        }
      }

      // Remove the section from the course content
      const updatedContent = course.content.filter(
        (section) => section.title !== sectionTitle
      );

      const updatedCourse = {
        ...course,
        content: updatedContent,
        modules: updatedContent.length,
      };

      // Update the course in the database
      await CourseService.updateCourse(course.id, updatedCourse);

      // Update local state
      updateState({
        courses: state.courses.map((c) =>
          c.id === course.id ? updatedCourse : c
        ),
      });

      message.success("Сэдэв устгагдлаа");
    } catch (error) {
      console.error("Error deleting section:", error);
      message.error("Сэдэв устгахад алдаа гарлаа");
    }
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
