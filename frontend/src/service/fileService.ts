import axios, { AxiosProgressEvent, AxiosError } from "axios";

const API_URL = "http://163.43.128.5:3000";

export interface FileUploadResponse {
  url: string;
  type: string;
  name: string;
  uploadedAt: string;
  storagePath: string;
}

export interface FileError extends Error {
  code?: string;
  type?: "BLOCKED" | "CORS" | "NETWORK" | "SERVER" | "VALIDATION" | "UNKNOWN";
  response?: {
    data: {
      error: string;
      details?: string;
    };
  };
}

// Custom error class for file service errors
export class FileServiceError extends Error implements FileError {
  type: FileError["type"];
  code?: string;
  response?: FileError["response"];

  constructor(
    message: string,
    type: FileError["type"] = "UNKNOWN",
    code?: string,
    response?: FileError["response"]
  ) {
    super(message);
    this.name = "FileServiceError";
    this.type = type;
    this.code = code;
    this.response = response;
  }
}

// Helper function to create appropriate error
const createFileError = (error: unknown): FileServiceError => {
  if (error instanceof FileServiceError) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ error: string; details?: string }>;

    // Handle CORS and blocked connection errors
    if (
      axiosError.code === "ERR_NETWORK" ||
      axiosError.message.includes("blocked")
    ) {
      return new FileServiceError(
        "Сервертэй холбогдоход алдаа гарлаа. Сүлжээний тохиргоо, эсвэл халдлагаас хамгаалах системийг шалгана уу.",
        "BLOCKED",
        axiosError.code
      );
    }

    // Handle CORS errors
    if (axiosError.message.includes("CORS") || axiosError.code === "ERR_CORS") {
      return new FileServiceError(
        "Серверийн зөвшөөрөл хүрэлцэхгүй байна. Системийн администратортой холбоо барина уу.",
        "CORS",
        axiosError.code
      );
    }

    // Handle server errors
    if (axiosError.response?.data) {
      return new FileServiceError(
        axiosError.response.data.error || "Серверийн алдаа гарлаа",
        "SERVER",
        axiosError.code,
        { data: axiosError.response.data }
      );
    }

    // Handle network errors
    if (
      axiosError.code === "ECONNABORTED" ||
      axiosError.message.includes("timeout")
    ) {
      return new FileServiceError(
        "Холболт удаан байна. Дараа дахин оролдоно уу.",
        "NETWORK",
        axiosError.code
      );
    }
  }

  // Handle validation errors
  if (error instanceof Error && error.message.includes("validation")) {
    return new FileServiceError(error.message, "VALIDATION");
  }

  // Handle unknown errors
  return new FileServiceError(
    error instanceof Error ? error.message : "Тодорхойгүй алдаа гарлаа",
    "UNKNOWN"
  );
};

// File type categories
export type FileCategory =
  | "document" // PDF, Word, etc.
  | "spreadsheet" // Excel
  | "presentation" // PowerPoint
  | "image" // Images
  | "code" // Programming files
  | "other"; // Other files

// File type information interface
export interface FileTypeInfo {
  category: FileCategory;
  displayName: string;
  iconColor: string;
  allowedExtensions: string[];
  mimeTypes: string[];
}

// Export the file types constant
export const FILE_TYPES: Record<string, FileTypeInfo> = {
  // Documents
  pdf: {
    category: "document",
    displayName: "PDF файл",
    iconColor: "#ff4d4f",
    allowedExtensions: [".pdf"],
    mimeTypes: ["application/pdf"],
  },
  word: {
    category: "document",
    displayName: "Word файл",
    iconColor: "#1890ff",
    allowedExtensions: [".doc", ".docx"],
    mimeTypes: [
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
  },
  // Spreadsheets
  excel: {
    category: "spreadsheet",
    displayName: "Excel файл",
    iconColor: "#52c41a",
    allowedExtensions: [".xls", ".xlsx"],
    mimeTypes: [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ],
  },
  // Presentations
  powerpoint: {
    category: "presentation",
    displayName: "PowerPoint файл",
    iconColor: "#fa8c16",
    allowedExtensions: [".ppt", ".pptx"],
    mimeTypes: [
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ],
  },
  // Images
  image: {
    category: "image",
    displayName: "Зураг",
    iconColor: "#722ed1",
    allowedExtensions: [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"],
    mimeTypes: [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/bmp",
      "image/webp",
    ],
  },
  // Code files
  javascript: {
    category: "code",
    displayName: "JavaScript файл",
    iconColor: "#fadb14",
    allowedExtensions: [".js", ".jsx", ".ts", ".tsx"],
    mimeTypes: ["text/javascript", "application/javascript", "text/typescript"],
  },
  python: {
    category: "code",
    displayName: "Python файл",
    iconColor: "#13c2c2",
    allowedExtensions: [".py", ".pyw"],
    mimeTypes: ["text/x-python", "text/python"],
  },
  java: {
    category: "code",
    displayName: "Java файл",
    iconColor: "#eb2f96",
    allowedExtensions: [".java"],
    mimeTypes: ["text/x-java-source", "text/java"],
  },
  cpp: {
    category: "code",
    displayName: "C++ файл",
    iconColor: "#fa541c",
    allowedExtensions: [".cpp", ".cc", ".cxx", ".hpp", ".h"],
    mimeTypes: ["text/x-c++src", "text/x-c++hdr"],
  },
  csharp: {
    category: "code",
    displayName: "C# файл",
    iconColor: "#a0d911",
    allowedExtensions: [".cs"],
    mimeTypes: ["text/x-csharp"],
  },
  html: {
    category: "code",
    displayName: "HTML файл",
    iconColor: "#faad14",
    allowedExtensions: [".html", ".htm"],
    mimeTypes: ["text/html"],
  },
  css: {
    category: "code",
    displayName: "CSS файл",
    iconColor: "#2f54eb",
    allowedExtensions: [".css"],
    mimeTypes: ["text/css"],
  },
  sql: {
    category: "code",
    displayName: "SQL файл",
    iconColor: "#1890ff",
    allowedExtensions: [".sql"],
    mimeTypes: ["text/x-sql"],
  },
  // Other files
  other: {
    category: "other",
    displayName: "Файл",
    iconColor: "#1890ff",
    allowedExtensions: [],
    mimeTypes: [],
  },
} as const;

// Helper function to get file type info
export const getFileTypeInfo = (
  file: File | { name: string; type?: string }
): FileTypeInfo => {
  const extension = file.name.toLowerCase().split(".").pop() || "";
  const mimeType = file.type?.toLowerCase() || "";

  // Find matching file type
  for (const typeInfo of Object.values(FILE_TYPES)) {
    if (
      typeInfo.allowedExtensions.includes(`.${extension}`) ||
      typeInfo.mimeTypes.includes(mimeType)
    ) {
      return typeInfo;
    }
  }

  return FILE_TYPES.other;
};

/**
 * Uploads a file to the server
 * @param file The file to upload
 * @param courseId The ID of the course
 * @param sectionTitle The title of the section
 * @returns Promise with the upload response
 */
export const uploadFile = async (
  file: File,
  courseId: string,
  sectionTitle: string
): Promise<{ url: string; storagePath: string; fileType: FileTypeInfo }> => {
  try {
    validateFile(file);

    // Create FormData and append all required fields
    const formData = new FormData();

    // Create a new File object with the same name to ensure proper encoding
    const fileWithEncodedName = new File([file], file.name, {
      type: file.type,
      lastModified: file.lastModified,
    });

    formData.append("file", fileWithEncodedName);
    formData.append("courseId", courseId);
    formData.append("sectionTitle", sectionTitle);

    // Log the FormData contents
    console.log("FormData contents:", {
      file: file.name,
      courseId,
      sectionTitle,
      fileSize: file.size,
      fileType: file.type,
    });

    // Log the actual FormData entries
    for (const pair of formData.entries()) {
      console.log("FormData entry:", pair[0], pair[1]);
    }

    // Log the request configuration
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
      transformRequest: [(data: FormData) => data], // Prevent axios from transforming FormData
      onUploadProgress: (progressEvent: AxiosProgressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log(`Upload progress: ${percentCompleted}%`);
        }
      },
    };
    console.log("Request config:", config);

    // Log the request URL and data
    console.log("Sending request to:", `${API_URL}/upload`);
    console.log("Request data:", {
      file: file.name,
      courseId,
      sectionTitle,
    });

    const response = await axios.post<FileUploadResponse>(
      `${API_URL}/upload`,
      formData,
      config
    );

    // Log the response
    console.log("Upload response:", response.data);

    return {
      url: response.data.url,
      storagePath: response.data.storagePath,
      fileType: getFileTypeInfo(file),
    };
  } catch (error) {
    console.error("File upload error:", error);
    throw createFileError(error);
  }
};

/**
 * Deletes a file from the server
 * @param storagePath The storage path of the file to delete
 * @returns Promise that resolves when the file is deleted
 */
export const deleteFile = async (storagePath: string): Promise<void> => {
  try {
    if (!storagePath.startsWith("courses/")) {
      throw new FileServiceError("Invalid storage path", "VALIDATION");
    }

    console.log("Deleting file:", { storagePath });

    await axios.delete(`${API_URL}/file`, {
      data: { storagePath },
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("File deleted successfully:", storagePath);
  } catch (error) {
    console.error("File deletion error:", error);
    throw createFileError(error);
  }
};

/**
 * Gets the URL for a file
 * @param storagePath The storage path of the file
 * @returns The full URL to access the file
 */
export const getFileUrl = (storagePath: string): string => {
  try {
    if (!storagePath) {
      throw new FileServiceError("Storage path is required", "VALIDATION");
    }

    // If it's already a full URL, return it
    if (storagePath.startsWith("http")) {
      return storagePath;
    }

    // If it starts with /uploads, it's a relative path from the server
    if (storagePath.startsWith("/uploads")) {
      return `${API_URL}${storagePath}`;
    }

    // Otherwise, construct the URL using the storage path
    return `${API_URL}/uploads/${storagePath}`;
  } catch (error) {
    console.error("Error getting file URL:", error);
    throw createFileError(error);
  }
};

/**
 * Checks if the file server is healthy
 * @returns Promise that resolves to true if the server is healthy
 */
export const checkFileServerHealth = async (): Promise<boolean> => {
  try {
    const response = await axios.get(`${API_URL}/health`, {
      timeout: 5000, // 5 second timeout
      headers: {
        Accept: "application/json",
      },
    });
    return response.data.status === "healthy";
  } catch (error) {
    console.error("Health check failed:", error);
    const fileError = createFileError(error);

    // Log specific error details for debugging
    console.error("Health check error details:", {
      type: fileError.type,
      code: fileError.code,
      message: fileError.message,
      response: fileError.response,
    });

    return false;
  }
};

/**
 * Validates a file before upload
 * @param file The file to validate
 * @returns Object containing validation result and any error message
 */
export const validateFile = (file: File): void => {
  const fileTypeInfo = getFileTypeInfo(file);

  // Check file size (10MB limit)
  if (file.size > 10 * 1024 * 1024) {
    throw new FileServiceError(
      "Файлын хэмжээ хэт их байна. 10MB-ээс бага файл оруулна уу.",
      "VALIDATION"
    );
  }

  // Check if file type is allowed
  if (fileTypeInfo.category === "other") {
    throw new FileServiceError(
      "Энэ төрлийн файл зөвшөөрөгдөөгүй байна. Зөвшөөрөгдсөн файлын төрлүүд: PDF, Word, PowerPoint, Excel, зураг, код файл (JS, Python, Java, C++, C#, HTML, CSS, SQL).",
      "VALIDATION"
    );
  }
};
