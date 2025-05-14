import { message } from "antd";

interface FileValidationProps {
  maxSize?: number;
  allowedTypes?: string[];
}

export const validateFile = (
  file: File,
  options: FileValidationProps = {}
): boolean => {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "image/png",
      "image/jpeg",
    ],
  } = options;

  // Check file size
  if (file.size > maxSize) {
    message.error(
      `Файлын хэмжээ ${maxSize / (1024 * 1024)}MB-ээс хэтэрч байна`
    );
    return false;
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    message.error("Зөвшөөрөгдөөгүй файлын төрөл байна");
    return false;
  }

  return true;
};
