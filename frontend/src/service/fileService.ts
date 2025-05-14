import axios, { AxiosProgressEvent } from "axios";

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
  response?: {
    data: {
      error: string;
      details?: string;
    };
  };
}

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
): Promise<FileUploadResponse> => {
  try {
    // Validate file before upload
    const validation = validateFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

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

    return response.data;
  } catch (error) {
    console.error("File upload error:", error);
    const fileError = error as FileError;
    throw new Error(
      fileError.response?.data?.error ||
        fileError.response?.data?.details ||
        fileError.message ||
        "Failed to upload file"
    );
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
      throw new Error("Invalid storage path");
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
    const fileError = error as FileError;
    throw new Error(
      fileError.response?.data?.error ||
        fileError.message ||
        "Failed to delete file"
    );
  }
};

/**
 * Gets the URL for a file
 * @param storagePath The storage path of the file
 * @returns The full URL to access the file
 */
export const getFileUrl = (storagePath: string): string => {
  if (!storagePath) {
    throw new Error("Storage path is required");
  }

  // If it's already a full URL, return it
  if (storagePath.startsWith("http")) {
    return storagePath;
  }

  // Otherwise, construct the URL
  return `${API_URL}/uploads/${storagePath}`;
};

/**
 * Checks if the file server is healthy
 * @returns Promise that resolves to true if the server is healthy
 */
export const checkFileServerHealth = async (): Promise<boolean> => {
  try {
    const response = await axios.get(`${API_URL}/health`);
    return response.data.status === "healthy";
  } catch (error) {
    console.error("Health check failed:", error);
    return false;
  }
};

/**
 * Validates a file before upload
 * @param file The file to validate
 * @returns Object containing validation result and any error message
 */
export const validateFile = (
  file: File
): { isValid: boolean; error?: string } => {
  const maxSize = 10 * 1024 * 1024; // 10MB
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

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: "File size exceeds 10MB limit",
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: "File type not allowed",
    };
  }

  return { isValid: true };
};
