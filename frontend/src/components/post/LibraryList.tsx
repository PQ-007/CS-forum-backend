import React from "react";
import { Card, Tag } from "antd";
import { UserOutlined, CalendarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { LibraryItem } from "../../pages/student/post/type";

interface Props {
  library: LibraryItem[];
}

const getExcerpt = (text: string, length = 100) =>
  text.length > length ? text.slice(0, length) + "..." : text;

const LibraryList: React.FC<Props> = ({ library }) => {
  return (
    <>
      {library.map((item) => (
        <Card
          key={item.id}
          bordered
          hoverable
          className="transition-all shadow-sm hover:shadow-lg"
        >
          <div className="flex flex-col gap-2">
            <div className="text-lg font-bold hover:underline cursor-pointer">
              {item.title}
            </div>
            <p className="text-sm text-gray-600">
              {getExcerpt(item.description, 100)}
            </p>
            <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-2">
              <span className="flex items-center gap-1">
                <UserOutlined />
                {item.author}
              </span>
              <span className="flex items-center gap-1">
                <CalendarOutlined />
                {dayjs(item.publishedDate).format("MMM D, YYYY")}
              </span>
              {item.tags.map((tag) => (
                <Tag key={tag} color="green">
                  {tag}
                </Tag>
              ))}
            </div>
          </div>
        </Card>
      ))}
    </>
  );
};

export default LibraryList;
