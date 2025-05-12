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
  onEditFile?: (sectionTitle: string, fileIndex: number, newName: string) => void;
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

export type ModalFormValues = CourseFormValues | FileFormValues | SectionFormValues;
