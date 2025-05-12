/* eslint-disable @typescript-eslint/no-unused-vars */
import { message } from "antd";

interface FileData {
  url: string;
  type: string;
  name: string;
}

export const handleFileUpload = async (
  file: File
): Promise<FileData | null> => {
  try {
    // Create a URL for the file
    const url = URL.createObjectURL(file);

    // Return file metadata along with URL
    return {
      url,
      type: file.type,
      name: file.name,
    };
  } catch (error) {
    message.error("Файл боловсруулах явцад алдаа гарлаа");
    return null;
  }
};

// Add cleanup function to revoke URLs when no longer needed
export const revokeFileUrl = (url: string) => {
  URL.revokeObjectURL(url);
};

// Validate file type and size
export const validateFile = (
  file: File,
  options: {
    maxSize?: number;
    allowedTypes?: string[];
  }
) => {
  const { maxSize = 10 * 1024 * 1024, allowedTypes = [] } = options;

  if (maxSize && file.size > maxSize) {
    message.error(
      `Файлын хэмжээ ${maxSize / 1024 / 1024}MB-аас бага байх ёстой`
    );
    return false;
  }

  if (allowedTypes.length && !allowedTypes.includes(file.type)) {
    message.error("Файлын төрөл дэмжигдэхгүй байна");
    return false;
  }

  return true;
};
