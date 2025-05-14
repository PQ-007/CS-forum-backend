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
      return querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as CourseData)
      );
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
      const courseRef = doc(db, "courses", courseId);
      await updateDoc(courseRef, courseData);
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
}

export default CourseService.getInstance();
