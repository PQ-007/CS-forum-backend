/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentClass, FC } from "react";

export type RC = FC | ComponentClass;

export type Factory = Promise<{ default: RC }>;

export interface IRoute {
  key?: string;
  path?: string;
  component: any;
  children?: IRoute[];
}
export interface FileItem {
  name: string;
  url: string;
  type?: string;
  uploadedAt?: Date;
  storagePath?: string;
}

export interface ContentSection {
  title: string;
  files: FileItem[];
}

export interface CourseData {
  id?: string;
  title: string;
  year: number;
  modules: number;
  author: string;
  description: string;
  content: ContentSection[];
}

export interface CourseActions {
  canEdit?: boolean;
  canDelete?: boolean;
  onEdit?: (course: CourseData) => void;
  onDelete?: (courseTitle: string) => void;
}

export interface ContentActions {
  onAddFile?: (sectionTitle: string) => void;
  onAddSection?: () => void;
  onEditSection?: (oldTitle: string, newTitle: string) => void;
  onEditFile?: (
    sectionTitle: string,
    fileIndex: number,
    newName: string
  ) => void;
  onDeleteFile?: (sectionTitle: string, fileIndex: number) => void;
  onDeleteSection?: (sectionTitle: string) => void;
}

export interface CourseCardProps extends CourseData {
  onClick?: () => void;
  isExpanded?: boolean;
  className?: string;
  actions?: CourseActions;
  contentActions?: ContentActions;
}

export interface CourseFormValues {
  title: string;
  year: number;
  modules: number;
  description: string;
}

export interface FileFormValues {
  name: string;
  file: File;
}

export interface SectionFormValues {
  title: string;
}

export type ModalFormValues =
  | CourseFormValues
  | FileFormValues
  | SectionFormValues;

export type AssignmentSubmission = {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName?: string;
  fileUrl: string;
  fileName: string;
  comment: string;
  submittedAt: string;
  status: "pending" | "graded";
  grade?: number;
  feedback?: string;
  gradedAt?: string;
};

export type Assignment = {
  id: string;
  courseId: string;
  year: number;
  title: string;
  deadline: string; // ISO string
  description: string;
  submission?: AssignmentSubmission; // Optional submission details
};

export interface AssignmentCalendarProps {
  mode: "teacher" | "student";
  assignments: Assignment[];
  courses: CourseData[];
  onAddAssignment?: (assignment: Omit<Assignment, "id">) => void;
  onDeleteAssignment?: (assignmentId: string) => void;
}

export const assignmentFields = [
  {
    name: "year",
    label: "Курс",
    type: "select" as const,
    options: [
      { value: 1, label: "1-р курс" },
      { value: 2, label: "2-р курс" },
      { value: 3, label: "3-р курс" },
      { value: 4, label: "4-р курс" },
      { value: 5, label: "5-р курс" },
    ],
    rules: [{ required: true, message: "Курс сонгоно уу!" }],
  },
  {
    name: "courseId",
    label: "Хичээл",
    type: "select" as const,
    // options will be set dynamically based on year
    rules: [{ required: true, message: "Хичээл сонгоно уу!" }],
    dependencies: ["year"],
  },
  {
    name: "deadline",
    label: "Дуусах огноо",
    type: "date" as const,
    rules: [{ required: true, message: "Дуусах огноо сонгоно уу!" }],
  },
  {
    name: "description",
    label: "Тайлбар",
    type: "textarea" as const,
    rules: [{ required: true, message: "Тайлбар оруулна уу!" }],
  },
];
