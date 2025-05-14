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
import type { Assignment, AssignmentSubmission } from "../components/types";
import { uploadFile, deleteFile } from "./fileService";

class AssignmentService {
  private static instance: AssignmentService;
  private assignmentsRef = collection(db, "assignments");
  private submissionsRef = collection(db, "submissions");

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

  public async submitAssignment(
    assignmentId: string,
    studentId: string,
    file: File,
    comment: string
  ): Promise<AssignmentSubmission> {
    // Validate input parameters
    if (!assignmentId) {
      throw new Error("Даалгаврын ID олдсонгүй");
    }
    if (!studentId) {
      throw new Error(
        "Хэрэглэгчийн ID олдсонгүй. Системээс гарч дахин нэвтрээрэй"
      );
    }
    if (!file) {
      throw new Error("Файл оруулна уу");
    }
    if (typeof comment !== "string") {
      throw new Error("Тайлбар буруу форматтай байна");
    }

    let uploadedFileUrl: string | null = null;
    let uploadedFilePath: string | null = null;

    try {
      // Validate file before upload
      if (file.size > 10 * 1024 * 1024) {
        throw new Error(
          "Файлын хэмжээ хэт их байна. 10MB-ээс бага файл оруулна уу."
        );
      }

      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "image/png",
        "image/jpeg",
      ];

      if (!allowedTypes.includes(file.type)) {
        throw new Error(
          "Энэ төрлийн файл зөвшөөрөгдөөгүй байна. Зөвхөн PDF, Word, PowerPoint, Excel эсвэл зураг файл оруулна уу."
        );
      }

      // Upload the file first
      const uploadResponse = await uploadFile(
        file,
        assignmentId,
        `submissions-${studentId}`
      );

      if (
        !uploadResponse ||
        !uploadResponse.url ||
        !uploadResponse.storagePath
      ) {
        throw new Error(
          "Файл илгээхэд алдаа гарлаа. Серверийн хариу буруу байна."
        );
      }

      uploadedFileUrl = uploadResponse.url;
      uploadedFilePath = uploadResponse.storagePath;

      // Create submission document
      const submissionData: Omit<AssignmentSubmission, "id"> = {
        assignmentId,
        studentId,
        fileUrl: uploadResponse.url,
        fileName: file.name,
        comment: comment || "",
        submittedAt: new Date().toISOString(),
        status: "pending",
      };

      try {
        // Validate submission data before saving
        if (
          !submissionData.assignmentId ||
          !submissionData.studentId ||
          !submissionData.fileUrl
        ) {
          throw new Error("Даалгаврын мэдээлэл бүрэн бус байна");
        }

        const docRef = await addDoc(this.submissionsRef, submissionData);
        return {
          id: docRef.id,
          ...submissionData,
        };
      } catch (firestoreError) {
        // If Firestore creation fails, try to delete the uploaded file
        if (uploadedFilePath) {
          try {
            await deleteFile(uploadedFilePath);
            console.log(
              "Cleaned up uploaded file after Firestore error:",
              firestoreError
            );
          } catch (cleanupError) {
            console.error(
              "Failed to clean up file after Firestore error:",
              cleanupError
            );
          }
        }

        // Handle specific Firestore errors
        if (firestoreError instanceof Error) {
          if (firestoreError.message.includes("invalid data")) {
            throw new Error(
              "Даалгаврын мэдээлэл буруу форматтай байна. Дараа дахин оролдоно уу."
            );
          } else if (firestoreError.message.includes("permission-denied")) {
            throw new Error(
              "Таны эрх хүрэлцэхгүй байна. Системээс гарч дахин нэвтрээрэй."
            );
          } else if (firestoreError.message.includes("not-found")) {
            throw new Error(
              "Даалгавар олдсонгүй. Хуучин даалгавар байж болзошгүй."
            );
          }
        }
        throw new Error(
          `Даалгаврын бүртгэл хадгалахад алдаа гарлаа: ${
            firestoreError instanceof Error
              ? firestoreError.message
              : "Unknown error"
          }. Дараа дахин оролдоно уу.`
        );
      }
    } catch (error) {
      // Handle network errors
      if (error instanceof Error) {
        if (error.message.includes("Network Error")) {
          throw new Error(
            "Интернэт холболт тасалдсан байна. Дараа дахин оролдоно уу."
          );
        } else if (error.message.includes("timeout")) {
          throw new Error("Холболт удаан байна. Дараа дахин оролдоно уу.");
        }
      }

      // If file upload failed, throw the specific error
      if (!uploadedFileUrl) {
        throw error; // Already has specific error messages from above
      }

      // If we get here, file upload succeeded but something else failed
      throw error;
    }
  }

  public async getSubmission(
    assignmentId: string,
    studentId: string
  ): Promise<AssignmentSubmission> {
    try {
      const q = query(
        this.submissionsRef,
        where("assignmentId", "==", assignmentId),
        where("studentId", "==", studentId)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error("Submission not found");
      }

      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      } as AssignmentSubmission;
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error fetching submission:", error.message);
      } else {
        console.error("Unexpected error fetching submission:", error);
      }
      throw error;
    }
  }

  public async updateSubmissionGrade(
    submissionId: string,
    grade: number,
    feedback?: string
  ): Promise<void> {
    try {
      const submissionRef = doc(this.submissionsRef, submissionId);
      await updateDoc(submissionRef, {
        grade,
        feedback,
        status: "graded",
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error updating submission grade:", error.message);
      } else {
        console.error("Unexpected error updating submission grade:", error);
      }
      throw error;
    }
  }
}

export default AssignmentService.getInstance();
