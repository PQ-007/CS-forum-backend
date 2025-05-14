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
import type { Assignment } from "../components/types";

class AssignmentService {
  private static instance: AssignmentService;
  private assignmentsRef = collection(db, "assignments");

  private constructor() {}

  public static getInstance(): AssignmentService {
    if (!AssignmentService.instance) {
      AssignmentService.instance = new AssignmentService();
    }
    return AssignmentService.instance;
  }

  public async getAllAssignments(): Promise<Assignment[]> {
    try {
      const querySnapshot = await getDocs(this.assignmentsRef);
      return querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Assignment)
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error fetching assignments:", error.message);
      } else {
        console.error("Unexpected error fetching assignments:", error);
      }
      throw error;
    }
  }

  public async addAssignment(
    assignment: Omit<Assignment, "id">
  ): Promise<Assignment> {
    try {
      const docRef = await addDoc(this.assignmentsRef, assignment);
      return {
        id: docRef.id,
        ...assignment,
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error adding assignment:", error.message);
      } else {
        console.error("Unexpected error adding assignment:", error);
      }
      throw error;
    }
  }

  public async getAssignmentsByDate(date: string): Promise<Assignment[]> {
    try {
      const q = query(this.assignmentsRef, where("deadline", "==", date));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Assignment)
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error fetching assignments by date:", error.message);
      } else {
        console.error("Unexpected error fetching assignments by date:", error);
      }
      throw error;
    }
  }

  public async getAssignmentsByCourse(courseId: string): Promise<Assignment[]> {
    try {
      const q = query(this.assignmentsRef, where("courseId", "==", courseId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Assignment)
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error fetching assignments by course:", error.message);
      } else {
        console.error(
          "Unexpected error fetching assignments by course:",
          error
        );
      }
      throw error;
    }
  }

  public async getAssignmentsByYear(year: number): Promise<Assignment[]> {
    try {
      const q = query(this.assignmentsRef, where("year", "==", year));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Assignment)
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error fetching assignments by year:", error.message);
      } else {
        console.error("Unexpected error fetching assignments by year:", error);
      }
      throw error;
    }
  }

  public async deleteAssignment(id: string): Promise<void> {
    try {
      const assignmentRef = doc(db, "assignments", id);
      await deleteDoc(assignmentRef);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error deleting assignment:", error.message);
      } else {
        console.error("Unexpected error deleting assignment:", error);
      }
      throw error;
    }
  }

  public async updateAssignment(
    id: string,
    assignmentData: Partial<Assignment>
  ): Promise<void> {
    try {
      const assignmentRef = doc(db, "assignments", id);
      await updateDoc(assignmentRef, assignmentData);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error updating assignment:", error.message);
      } else {
        console.error("Unexpected error updating assignment:", error);
      }
      throw error;
    }
  }
}

export default AssignmentService.getInstance();
