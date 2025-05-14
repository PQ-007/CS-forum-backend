import { message } from "antd";
import { getFileTypeInfo, FILE_TYPES } from "../service/fileService";
import type { FileTypeInfo } from "../service/fileService";

interface FileValidationProps {
  maxSize?: number;
  allowedTypes?: string[];
  accept?: string;
}

export const validateFile = (
  file: File,
  options: FileValidationProps = {}
): boolean => {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
  } = options;

  // Get file type info using our new system
  const fileTypeInfo = getFileTypeInfo(file);

  // Check file size
  if (file.size > maxSize) {
    message.error(
      `Файлын хэмжээ ${maxSize / (1024 * 1024)}MB-ээс хэтэрч байна`
    );
    return false;
  }

  // Check if file type is allowed
  if (fileTypeInfo.category === "other") {
    message.error(
      "Энэ төрлийн файл зөвшөөрөгдөөгүй байна. Зөвшөөрөгдсөн файлын төрлүүд: PDF, Word, PowerPoint, Excel, зураг, код файл (JS, Python, Java, C++, C#, HTML, CSS, SQL)."
    );
    return false;
  }

  return true;
};

// Helper function to get all allowed extensions for the upload component
export const getAllowedExtensions = (): string => {
  const extensions = new Set<string>();

  // Get all extensions from our file type definitions
  Object.values(FILE_TYPES).forEach((typeInfo: FileTypeInfo) => {
    if (typeInfo.category !== "other") {
      typeInfo.allowedExtensions.forEach((ext: string) => extensions.add(ext));
    }
  });

  return Array.from(extensions).join(",");
};

// Helper function to get a human-readable list of allowed file types
export const getAllowedFileTypesDescription = (): string => {
  const typeGroups = new Map<string, string[]>();

  // Group file types by category
  Object.values(FILE_TYPES).forEach((typeInfo: FileTypeInfo) => {
    if (typeInfo.category !== "other") {
      const category = typeInfo.category;
      if (!typeGroups.has(category)) {
        typeGroups.set(category, []);
      }
      typeGroups.get(category)?.push(typeInfo.displayName);
    }
  });

  // Convert to a readable string
  const descriptions: string[] = [];
  typeGroups.forEach((types) => {
    descriptions.push(types.join(", "));
  });

  return descriptions.join(", ");
};
