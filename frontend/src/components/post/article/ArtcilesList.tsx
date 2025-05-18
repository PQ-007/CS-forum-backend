import React, { useEffect, useState } from "react";
import { Card, Tag } from "antd";
import { UserOutlined, CalendarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { Article } from "../../../pages/student/post/type";
import profileService from "../../../service/profileService";

interface Props {
  articles: Article[];
}

const getExcerptFromEditorJS = (data: any, length = 100) => {
  if (!data || !data.blocks) return "";
  const fullText = data.blocks
    .map((block: any) => {
      if (
        block.type === "paragraph" ||
        block.type === "header" ||
        block.type === "list"
      ) {
        if (block.type === "list" && block.data?.items) {
          return block.data.items.join(" ");
        }
        return block.data?.text || "";
      }
      return "";
    })
    .join(" ");
  return fullText.length > length
    ? fullText.slice(0, length) + "..."
    : fullText;
};

const ArticlesList: React.FC<Props> = ({ articles }) => {
  const [authorNames, setAuthorNames] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  useEffect(() => {
    const uniqueAuthors = Array.from(new Set(articles.map((a) => a.author)));

    Promise.all(
      uniqueAuthors.map(async (authorId) => {
        try {
          const profile = await profileService.getProfile(authorId);
          return { authorId, name: profile?.name || authorId };
        } catch {
          return { authorId, name: authorId };
        }
      })
    ).then((results) => {
      const namesMap: Record<string, string> = {};
      results.forEach(({ authorId, name }) => {
        namesMap[authorId] = name;
      });
      setAuthorNames(namesMap);
    });
  }, [articles]);

  return (
    <>
      {articles.map((post) => {
        let contentData;
        try {
          contentData = JSON.parse(post.content);
        } catch {
          contentData = null;
        }

        return (
          <Card
            key={post.id}
            bordered
            hoverable
            className="transition-all shadow-sm hover:shadow-lg"
            onClick={() =>
              navigate(`/dashboard/student/post/article/read/${post.id}`)
            }
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-start justify-between gap-4">
                <div
                  className="text-lg font-bold hover:underline cursor-pointer"
                  title={post.title}
                  onClick={() => navigate(`/article/${post.id}`)}
                >
                  {post.title}
                </div>
                <p className="text-sm text-gray-600">
                  {getExcerptFromEditorJS(contentData, 80)}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-2">
                <span className="flex items-center gap-1">
                  <UserOutlined />
                  {authorNames[post.author] || post.author}
                </span>
                <span className="flex items-center gap-1">
                  <CalendarOutlined />
                  {dayjs(post.publishedDate).format("MMM D, YYYY")}
                </span>
                {post.tags.map((tag) => (
                  <Tag key={tag} color="blue">
                    {tag}
                  </Tag>
                ))}
              </div>
            </div>
          </Card>
        );
      })}
    </>
  );
};

export default ArticlesList;
