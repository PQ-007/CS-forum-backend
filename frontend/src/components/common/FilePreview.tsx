import React from "react";
import { Modal, message } from "antd";
import { FileOutlined } from "@ant-design/icons";

export interface FilePreviewProps {
  fileUrl: string;
  fileName: string;
  open?: boolean;
  onClose?: () => void;
}

const getFileIcon = (fileName?: string) => {
  const ext = fileName?.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "pdf":
      return <FileOutlined style={{ fontSize: 64, color: "#ff4d4f" }} />;
    case "doc":
    case "docx":
      return <FileOutlined style={{ fontSize: 64, color: "#1890ff" }} />;
    case "ppt":
    case "pptx":
      return <FileOutlined style={{ fontSize: 64, color: "#fa8c16" }} />;
    case "xls":
    case "xlsx":
      return <FileOutlined style={{ fontSize: 64, color: "#52c41a" }} />;
    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
    case "bmp":
    case "webp":
      return <FileOutlined style={{ fontSize: 64, color: "#722ed1" }} />;
    default:
      return <FileOutlined style={{ fontSize: 64, color: "#1890ff" }} />;
  }
};

const getFileTypeName = (fileName?: string) => {
  const ext = fileName?.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "pdf":
      return "PDF файл";
    case "doc":
    case "docx":
      return "Word файл";
    case "ppt":
    case "pptx":
      return "PowerPoint файл";
    case "xls":
    case "xlsx":
      return "Excel файл";
    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
    case "bmp":
    case "webp":
      return "Зураг";
    default:
      return "Файл";
  }
};

const FilePreview: React.FC<FilePreviewProps> = ({
  fileUrl,
  fileName,
  open = true,
  onClose,
}) => {
  const ext = fileName.split(".").pop()?.toLowerCase();
  const fileTypeName = getFileTypeName(fileName);
  const isImage = ["png", "jpg", "jpeg", "gif", "bmp", "webp"].includes(
    ext || ""
  );

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      // Use fetch to get the file as a blob
      const response = await fetch(fileUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Get the file as a blob
      const blob = await response.blob();

      // Create a URL for the blob
      const blobUrl = window.URL.createObjectURL(blob);

      // Create an anchor element and set its attributes
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName; // Set the file name

      // Append to the document, click it, and remove it
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl); // Release the object URL

      message.success(`${fileTypeName} амжилттай татагдлаа`);
    } catch (error) {
      message.error("Файл татахад алдаа гарлаа");
      console.error("Error downloading file:", error);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
      title={fileName}
      bodyStyle={{ padding: 0 }}
    >
      <div className="text-center p-8">
        {isImage ? (
          <img
            src={fileUrl}
            alt={fileName}
            style={{
              maxWidth: "100%",
              maxHeight: "40vh",
              objectFit: "contain",
            }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = "";
              Modal.error({
                title: "Зураг ачаалахад алдаа гарлаа",
                content: "Зураг нээхэд алдаа гарлаа. Дараа дахин оролдоно уу.",
                okText: "Ойлголоо",
              });
            }}
          />
        ) : (
          getFileIcon(fileName)
        )}
        <p className="mt-4 text-lg text-gray-700">{fileName}</p>
        <p className="mt-2 text-sm text-gray-500">
          {isImage
            ? "Зургийг харах бол доорх товчлуур дээр дараарай"
            : `${fileTypeName}-ийг шинэ цонхонд нээх бол доорх товчлуур дээр дараарай`}
        </p>
        <div className="mt-6 space-y-3">
          {!isImage && (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              {fileTypeName} нээх
            </a>
          )}
          <br />
          <button
            onClick={handleDownload}
            className="inline-block px-6 py-2 border border-blue-500 text-blue-500 rounded hover:bg-blue-50 transition-colors"
          >
            {fileTypeName} татах
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default FilePreview;
