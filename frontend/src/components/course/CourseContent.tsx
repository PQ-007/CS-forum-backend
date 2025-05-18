import {
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  FileOutlined,
  PlusOutlined,
  RightOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { Button, Modal, message } from "antd";
import React, { useState } from "react";
import FormModal from "../Modal";
import { ContentSection, CourseData, FileItem } from "../types";
import { getFileUrl, FileServiceError } from "../../service/fileService";
import FilePreview from "../common/FilePreview";

interface CourseContentProps {
  sections: ContentSection[];
  className?: string;
  onAddFile?: (sectionTitle: string) => void;
  onAddSection?: () => void;
  onEditCourse?: (course: CourseData) => void;
  onEditSection?: (sectionTitle: string, newTitle: string) => void;
  onEditFile?: (
    sectionTitle: string,
    fileIndex: number,
    newName: string
  ) => void;
  onDeleteFile?: (sectionTitle: string, fileIndex: number) => void;
  onDeleteSection?: (sectionTitle: string) => void;
  isEditable?: boolean;
}

interface EditingState {
  type: "section" | "file";
  sectionTitle?: string;
  fileIndex?: number;
  initialValue?: string;
}

const CourseContent: React.FC<CourseContentProps> = ({
  sections,
  className = "",
  onAddFile,
  onAddSection,
  onEditSection,
  onEditFile,
  onDeleteFile,
  onDeleteSection,
  isEditable = false,
}) => {
  console.log("CourseContent sections:", sections);
  console.log("CourseContent isEditable:", isEditable);

  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [editing, setEditing] = useState<EditingState | null>(null);

  const handleFileClick = (file: FileItem) => {
    try {
      // Try to get the file URL first to catch any errors
      getFileUrl(file.storagePath || file.url);
      setPreviewFile(file);
    } catch (error) {
      const fileError = error as FileServiceError;
      let errorMessage = "Файл нээхэд алдаа гарлаа";

      switch (fileError.type) {
        case "BLOCKED":
          errorMessage =
            "Сервертэй холбогдоход алдаа гарлаа. Сүлжээний тохиргоо, эсвэл халдлагаас хамгаалах системийг шалгана уу.";
          break;
        case "CORS":
          errorMessage =
            "Серверийн зөвшөөрөл хүрэлцэхгүй байна. Системийн администратортой холбоо барина уу.";
          break;
        case "NETWORK":
          errorMessage = "Холболт удаан байна. Дараа дахин оролдоно уу.";
          break;
        case "SERVER":
          errorMessage = "Серверийн алдаа гарлаа. Дараа дахин оролдоно уу.";
          break;
        case "VALIDATION":
          errorMessage = "Файлын мэдээлэл буруу байна.";
          break;
      }

      Modal.error({
        title: "Алдаа гарлаа",
        icon: <ExclamationCircleOutlined />,
        content: errorMessage,
        okText: "Ойлголоо",
      });
    }
  };

  const handleModalSubmit = async (values: {
    title?: string;
    name?: string;
  }) => {
    try {
      if (editing?.type === "section" && editing.sectionTitle) {
        await onEditSection?.(editing.sectionTitle, values.title || "");
      } else if (
        editing?.type === "file" &&
        editing.sectionTitle !== undefined &&
        editing.fileIndex !== undefined
      ) {
        await onEditFile?.(
          editing.sectionTitle,
          editing.fileIndex,
          values.name || ""
        );
      }
      setEditing(null);
    } catch (error) {
      console.error("Error in handleModalSubmit:", error);
      message.error("Өөрчлөлт хадгалахад алдаа гарлаа");
    }
  };

  const getModalFields = () => {
    if (editing?.type === "section") {
      return [
        {
          name: "title",
          label: "Сэдвийн нэр",
          type: "text" as const,
          rules: [{ required: true, message: "Сэдвийн нэр оруулна уу!" }],
        },
      ];
    }
    return [
      {
        name: "name",
        label: "Файлын нэр",
        type: "text" as const,
        rules: [{ required: true, message: "Файлын нэр оруулна уу!" }],
      },
    ];
  };

  const renderFileItem = (
    file: FileItem,
    fileIndex: number,
    sectionTitle: string
  ) => (
    <div className="flex items-center p-2 hover:bg-gray-100 rounded-md group relative">
      <div
        className="flex items-center cursor-pointer flex-grow pr-20"
        onClick={() => handleFileClick(file)}
      >
        <FileOutlined className="text-gray-500 mr-2" />
        <span className="text-gray-600">{file.name}</span>
      </div>

      {isEditable && (
        <div className="absolute right-2 hidden group-hover:flex items-center gap-1">
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              setEditing({
                type: "file",
                sectionTitle,
                fileIndex,
                initialValue: file.name,
              });
            }}
          />
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              onDeleteFile?.(sectionTitle, fileIndex);
            }}
          />
        </div>
      )}
    </div>
  );

  const renderSectionTitle = (section: ContentSection, index: number) => (
    <div className="flex items-center flex-grow relative pr-20">
      <span className="font-medium text-gray-700">
        {index + 1}. {section.title}
      </span>

      {isEditable && (
        <div className="absolute right-2 hidden group-hover:flex items-center gap-1">
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              setEditing({
                type: "section",
                sectionTitle: section.title,
                initialValue: section.title,
              });
            }}
          />
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              onDeleteSection?.(section.title);
            }}
          />
        </div>
      )}
    </div>
  );

  return (
    <>
      <div
        className={`bg-gray-50 rounded-lg p-4 mt-2 border border-gray-200 ${className}`}
      >
        <div className="space-y-2">
          {sections.map((section, index) => (
            <div
              key={`section-${index}`}
              className="border-b border-gray-100 pb-2 last:border-b-0"
            >
              <div
                className="flex items-center cursor-pointer py-2 hover:bg-gray-100 px-2 rounded-md group"
                onClick={() =>
                  setExpandedSection(
                    expandedSection === section.title ? null : section.title
                  )
                }
              >
                {expandedSection === section.title ? (
                  <DownOutlined className="text-blue-500 mr-2" />
                ) : (
                  <RightOutlined className="text-gray-500 mr-2" />
                )}
                {renderSectionTitle(section, index)}
              </div>

              <div
                className={`
                  ml-8 mt-2 space-y-2 
                  transition-all duration-300 ease-in-out
                  ${
                    expandedSection === section.title
                      ? "opacity-100 max-h-[500px]"
                      : "opacity-0 max-h-0 overflow-hidden"
                  }
                `}
              >
                {section.files.map((file, fileIndex) => (
                  <div
                    key={fileIndex}
                    className="transform transition-all duration-200 hover:scale-[1.01]"
                  >
                    {renderFileItem(file, fileIndex, section.title)}
                  </div>
                ))}

                {onAddFile && (
                  <button
                    onClick={() => onAddFile(section.title)}
                    className="flex items-center p-2 w-full 
                      hover:bg-gray-100 rounded-md cursor-pointer text-blue-500
                      transition-all duration-200 hover:shadow-sm
                      transform hover:-translate-y-[1px]"
                  >
                    <PlusOutlined className="mr-2" />
                    <span>Файл нэмэх</span>
                  </button>
                )}
              </div>
            </div>
          ))}

          {onAddSection && (
            <button
              onClick={onAddSection}
              className="flex items-center py-2 px-2 w-full mt-4 hover:bg-gray-100 rounded-md cursor-pointer text-blue-500 border border-dashed border-gray-300"
            >
              <PlusOutlined className="mr-2" />
              <span>Шинэ сэдэв нэмэх</span>
            </button>
          )}
        </div>
      </div>

      {/* Replace the old modal with FilePreview component */}
      {previewFile && (
        <FilePreview
          fileUrl={getFileUrl(previewFile.storagePath || previewFile.url)}
          fileName={previewFile.name}
          open={!!previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}

      <FormModal
        title={editing?.type === "section" ? "Сэдэв засах" : "Файл засах"}
        isOpen={!!editing}
        onClose={() => setEditing(null)}
        onSubmit={handleModalSubmit}
        fields={getModalFields()}
        initialValues={
          editing
            ? {
                [editing.type === "section" ? "title" : "name"]:
                  editing.initialValue,
              }
            : undefined
        }
      />
    </>
  );
};

export default CourseContent;
