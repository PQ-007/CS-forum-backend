import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Tag, Button } from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import {articleService} from "../../../service/postService";
import profileService from "../../../service/profileService";
import { Article } from "../../../pages/student/post/type";

const getTextFromEditorJS = (data: any) => {
  if (!data || !data.blocks) return "";
  return data.blocks
    .map((block: any) => {
      if (block.type === "paragraph" || block.type === "header") {
        return block.data?.text || "";
      }
      if (block.type === "list" && block.data?.items) {
        return block.data.items.join(" ");
      }
      return "";
    })
    .join("\n\n");
};

const ReadArticle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [article, setArticle] = useState<Article | null>(null);
  const [authorName, setAuthorName] = useState<string>("");

  useEffect(() => {
    const loadArticle = async () => {
      if (!id) {
        console.log("No id param");
        return;
      }
      console.log("Loading article id:", id);
      const art = await articleService.getArticleById(id);
      console.log("Fetched article:", art);
      setArticle(art);
      if (art) {
        const profile = await profileService.getProfile(art.author);
        setAuthorName(profile?.name || art.author);
      }
    };
    loadArticle();
  }, [id]);

  if (!article) {
    return <div>Ачааллаж байна...</div>;
  }

  let contentData;
  try {
    contentData = JSON.parse(article.content);
  } catch {
    contentData = null;
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-6">
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        className="mb-6"
      >
        Буцах
      </Button>

      <h1 className="text-4xl font-bold mb-4">{article.title}</h1>

      <div className="flex items-center gap-4 text-gray-600 mb-6">
        <span className="flex items-center gap-1">
          <UserOutlined />
          {authorName}
        </span>
        <span className="flex items-center gap-1">
          <CalendarOutlined />
          {dayjs(article.publishedDate).format("YYYY-MM-DD")}
        </span>
        {article.tags.map((tag) => (
          <Tag key={tag} color="blue">
            {tag}
          </Tag>
        ))}
      </div>

      <Card>
        <pre
          style={{
            whiteSpace: "pre-wrap",
            fontFamily: "inherit",
            fontSize: "16px",
            lineHeight: 1.6,
          }}
        >
          {getTextFromEditorJS(contentData)}
        </pre>
      </Card>
    </div>
  );
};

export default ReadArticle;
