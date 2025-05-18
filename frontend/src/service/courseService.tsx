import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { CourseData } from "../components/types";
import assignmentService from "./assignmentService";

class CourseService {
  private static instance: CourseService;
  private coursesRef = collection(db, "courses");

  private constructor() {}

  public static getInstance(): CourseService {
    if (!CourseService.instance) {
      CourseService.instance = new CourseService();
    }
    return CourseService.instance;
  }

  public async getStudentCourses(year: number): Promise<CourseData[]> {
    try {
      const q = query(this.coursesRef, where("year", "==", year));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as CourseData)
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error fetching student courses:", error.message);
      } else {
        console.error("Unexpected error fetching student courses:", error);
      }
      throw error;
    }
  }

  public async getAllCourses(): Promise<CourseData[]> {
    try {
      const querySnapshot = await getDocs(this.coursesRef);
      const courses = querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as CourseData)
      );
      console.log(
        "Fetched courses:",
        courses.map((c) => ({
          id: c.id,
          title: c.title,
          content: c.content.map((s) => ({
            title: s.title,
            files: s.files.map((f) => ({
              name: f.name,
              uploadedAt: f.uploadedAt,
              uploadedAtType: typeof f.uploadedAt,
            })),
          })),
        }))
      );
      return courses;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error fetching all courses:", error.message);
      } else {
        console.error("Unexpected error fetching all courses:", error);
      }
      throw error;
    }
  }

  public async createCourse(
    courseData: Omit<CourseData, "id">
  ): Promise<string> {
    try {
      const docRef = await addDoc(this.coursesRef, courseData);
      return docRef.id;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error creating course:", error.message);
      } else {
        console.error("Unexpected error creating course:", error);
      }
      throw error;
    }
  }

  public async updateCourse(
    courseId: string,
    courseData: Partial<CourseData>
  ): Promise<void> {
    try {
      console.log("CourseService.updateCourse called with:", {
        courseId,
        courseData: {
          title: courseData.title,
          year: courseData.year,
          contentLength: courseData.content?.length,
          modules: courseData.modules,
        },
      });

      if (!courseId) {
        throw new Error("Course ID is required for update");
      }

      const courseRef = doc(db, "courses", courseId);

      // Verify the course exists
      const courseDoc = await getDoc(courseRef);
      if (!courseDoc.exists()) {
        throw new Error(`Course with ID ${courseId} not found`);
      }

      // Prepare data for Firestore update
      const preparedData: Record<string, any> = {};

      // Process each field in courseData
      for (const [key, value] of Object.entries(courseData)) {
        if (key === "content" && Array.isArray(value)) {
          preparedData[key] = value.map((section) => ({
            title: section.title,
            files: section.files.map((file) => {
              // Validate and normalize uploadedAt
              let uploadedAt: Date;
              if (
                file.uploadedAt instanceof Date &&
                !isNaN(file.uploadedAt.getTime())
              ) {
                uploadedAt = file.uploadedAt;
              } else if (
                file.uploadedAt &&
                typeof file.uploadedAt === "string"
              ) {
                const parsedDate = new Date(file.uploadedAt);
                uploadedAt = isNaN(parsedDate.getTime())
                  ? new Date()
                  : parsedDate;
              } else {
                uploadedAt = new Date(); // Fallback to current time
              }

              console.log("Processing file in updateCourse:", {
                fileName: file.name,
                uploadedAtRaw: file.uploadedAt,
                uploadedAtType: typeof file.uploadedAt,
                normalizedUploadedAt: uploadedAt,
              });

              return {
                name: file.name,
                url: file.url,
                type: file.type,
                uploadedAt,
                storagePath: file.storagePath,
              };
            }),
          }));
        } else {
          preparedData[key] = value;
        }
      }

      console.log(
        "Prepared data for Firestore update - keys:",
        Object.keys(preparedData)
      );

      // Perform the update
      await updateDoc(courseRef, preparedData);
      console.log("CourseService: Course updated successfully:", courseId);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error updating course:", error.message);
      } else {
        console.error("Unexpected error updating course:", error);
      }
      throw error;
    }
  }

  public async deleteCourse(courseId: string): Promise<void> {
    try {
      if (!courseId) {
        throw new Error("Course ID is required for deletion");
      }

      console.log("CourseService: Deleting course with ID:", courseId);

      const courseRef = doc(db, "courses", courseId);

      // Verify the course exists before deletion
      const courseDoc = await getDoc(courseRef);
      if (!courseDoc.exists()) {
        throw new Error(`Course with ID ${courseId} not found`);
      }

      await deleteDoc(courseRef);
      console.log("CourseService: Course deleted successfully:", courseId);
    } catch (error: unknown) {
      console.error("Error deleting course:", error);
      if (error instanceof Error) {
        throw new Error(`Failed to delete course: ${error.message}`);
      }
      throw new Error("Failed to delete course");
    }
  }

  public async deleteCourseContent(contentId: string): Promise<void> {
    try {
      // Get the course ID before deleting the content
      const contentRef = doc(db, "courseContent", contentId);
      const contentDoc = await getDoc(contentRef);

      if (contentDoc.exists()) {
        const courseId = contentDoc.data().courseId;

        // Delete the content
        await deleteDoc(contentRef);

        // Delete all associated assignments
        if (courseId) {
          // Use the imported service directly
          await assignmentService.deleteAssignmentsByCourseId(courseId);
        }
      }
    } catch (error) {
      console.error("Error deleting course content:", error);
      throw error;
    }
  }
}

export default CourseService.getInstance();
