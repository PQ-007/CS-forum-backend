import React from "react";
import { Card, Space, Typography, Tooltip, Button } from "antd";
import {
  BookOutlined,
  StarOutlined,
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { ContentActions, CourseActions, CourseData } from "../types";
import CourseContent from "./CourseContent";

const { Title } = Typography;

const getGradientByTitle = (title: string): string => {
  const gradients = [
    "from-[#2c3e50] to-[#4ca1af]",
    "from-[#434343] to-[#000000]",
    "from-[#141e30] to-[#243b55]",
    "from-[#0f2027] via-[#203a43] to-[#2c5364]",
    "from-[#232526] to-[#414345]",
    "from-[#3e5151] to-[#decba4]",
    "from-[#1c1c1c] to-[#434343]",
    "from-[#485563] to-[#29323c]",
    "from-[#2b5876] to-[#4e4376]",
    "from-[#1d4350] to-[#a43931]",
    "from-[#3a6073] to-[#16222a]",
    "from-[#232526] to-[#414345]",
    "from-[#355c7d] to-[#6c5b7b]",
    "from-[#2C3E50] to-[#FD746C]",
    "from-[#1e3c72] to-[#2a5298]",
  ];

  const hash = Array.from(title).reduce(
    (acc, char) => acc + char.charCodeAt(0),
    0
  );

  return gradients[hash % gradients.length];
};

interface CourseCardProps extends CourseData {
  onClick?: () => void;
  isExpanded?: boolean;
  className?: string;
  actions?: CourseActions;
  contentActions?: ContentActions;
}

const CourseCard = React.memo<CourseCardProps>(
  ({
    title,
    year,
    modules,
    author,
    description,
    content = [],
    onClick,
    isExpanded = false,
    className = "",
    actions,
    contentActions,
    id,
  }) => {
    const gradientClass = getGradientByTitle(title);

    const handleEditClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      console.log("CourseCard: Triggering onEdit for course:", { id, title });
      actions?.onEdit?.({
        id,
        title,
        year,
        modules,
        author,
        description,
        content,
      });
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!actions?.onDelete) return;

      console.log("Attempting to delete course:", { id, title });

      if (!id) {
        console.error("No course ID available for deletion");
        return;
      }

      actions.onDelete(id);
    };

    return (
      <div className="w-full">
        <Card
          className={`rounded-xl shadow-lg overflow-hidden relative ${className}`}
          onClick={onClick}
          hoverable
        >
          {/* Gradient Background */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${gradientClass}`}
            style={{ zIndex: 0 }}
          />

          {/* Content with z-index to appear above gradient */}
          <div className="relative z-10">
            <div className="mb-4 flex justify-between items-start">
              <Title
                level={3}
                className="mb-2"
                style={{ color: "white", marginBottom: "8px" }}
              >
                {title}
              </Title>

              {actions?.canEdit && (
                <div className="action-buttons flex gap-2">
                  <Tooltip title="Хичээлийн мэдээлэл засах">
                    <Button
                      type="text"
                      icon={
                        <EditOutlined
                          className="text-lg"
                          style={{ color: "rgb(229, 231, 235)" }}
                        />
                      }
                      onClick={handleEditClick}
                      className="hover:!text-white transition-all duration-200 
                        hover:bg-white/10 active:bg-white/20"
                    />
                  </Tooltip>
                  <Tooltip title="Хичээл устгах">
                    <Button
                      type="text"
                      icon={
                        <DeleteOutlined
                          className="text-lg"
                          style={{ color: "rgb(229, 231, 235)" }}
                        />
                      }
                      onClick={handleDeleteClick}
                      className="hover:!text-red-400 transition-all duration-200 
                        hover:bg-red-500/10 active:bg-red-500/20"
                    />
                  </Tooltip>
                </div>
              )}
            </div>

            {/* Tags Section */}
            <div className="flex flex-col">
              <Space size="middle" className="mb-4">
                <span
                  className="border-r border-gray-400 pr-2"
                  style={{ color: "#e5e7eb" }}
                >
                  <StarOutlined /> {year}-р курс
                </span>
                <span
                  className="border-r border-gray-400 pr-2"
                  style={{ color: "#e5e7eb" }}
                >
                  <BookOutlined /> {modules} хичээл
                </span>
                <span className="pr-2" style={{ color: "#e5e7eb" }}>
                  <UserOutlined /> {author} багш
                </span>
              </Space>
            </div>

            <div style={{ color: "#d1d5db" }} className="leading-relaxed">
              {description}
            </div>
          </div>
        </Card>

        {/* Expandable content */}
        <div
          className={`
    transition-all duration-500 ease-in-out 
    overflow-hidden transform-gpu
    ${isExpanded ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0 h-0"}
  `}
          style={{
            transformOrigin: "top",
          }}
        >
          {isExpanded && (
            <CourseContent
              sections={content}
              className="mt-4"
              isEditable={actions?.canEdit}
              onAddFile={contentActions?.onAddFile}
              onAddSection={contentActions?.onAddSection}
              onEditSection={contentActions?.onEditSection}
              onEditFile={contentActions?.onEditFile}
              onDeleteFile={contentActions?.onDeleteFile}
              onDeleteSection={contentActions?.onDeleteSection}
            />
          )}
        </div>
      </div>
    );
  }
);

export default CourseCard;
