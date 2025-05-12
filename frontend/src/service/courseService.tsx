import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
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
      const courseRef = doc(db, "courses", courseId);
      await deleteDoc(courseRef);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error deleting course:", error.message);
      } else {
        console.error("Unexpected error deleting course:", error);
      }
      throw error;
    }
  }
}

export default CourseService.getInstance();
