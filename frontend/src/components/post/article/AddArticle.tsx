import React, { useRef, useEffect, useState } from "react";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import { Select, message } from "antd";
import { useParams} from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import {articleService} from "../../../service/postService";
import { useAuth } from "../../../context/AuthContext";

// const location = useLocation();
// const isNew = new URLSearchParams(location.search).get("new") === "true";
const availableTags = ["Firebase", "React", "Tailwind", "JavaScript", "CSS"];

const AddArticle: React.FC = () => {
  const ejInstance = useRef<EditorJS | null>(null);
  const { user } = useAuth();
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [initialContent, setInitialContent] = useState<any>(null);

  // Fetch article if editing
  useEffect(() => {
    const fetchArticle = async () => {
      if (!id) return;

      try {
        const article = await articleService.getArticleById(id);
        if (article) {
          setTitle(article.title);
          setTags(article.tags || []);
          setInitialContent(JSON.parse(article.content));
        }
      } catch (err) {
        console.error("Article fetch failed", err);
      }
    };

    fetchArticle();
  }, [id]);

  // Initialize EditorJS after initialContent or on mount
  useEffect(() => {
    const initializeEditor = async () => {
      if (ejInstance.current || !document.getElementById("editorjs")) return;

      ejInstance.current = new EditorJS({
        holder: "editorjs",
        autofocus: true,
        placeholder: "Текстээ энд бичнэ үү",
        tools: {
          header: Header,
          list: List,
        },
        data: initialContent || undefined,
        onReady: () => {
          console.log("Editor.js is ready");
        },
      });
    };

    initializeEditor();

    return () => {
      if (
        ejInstance.current &&
        typeof ejInstance.current.destroy === "function"
      ) {
        ejInstance.current.destroy();
      }
      ejInstance.current = null;
    };
  }, [initialContent]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      message.error("Гарчигийг заавал бөглөнө үү.");
      return;
    }

    if (!user) {
      message.error("Хэрэглэгчийн мэдээлэл олдсонгүй.");
      return;
    }

    try {
      const outputData = await ejInstance.current?.save();

      if (!outputData || outputData.blocks.length === 0) {
        message.error("Агуулга хоосон байна.");
        return;
      }

      const article = {
        id: id ?? uuidv4(),
        title,
        author: user.uid,
        content: JSON.stringify(outputData),
        tags,
        imageUrl: "",
        publishedDate: new Date(),
        views: 0,
        likes: 0,
        comments: [],
      };

      if (id) {
        await articleService.updateArticle(article.id, article);
        message.success("Нийтлэл амжилттай шинэчлэгдлээ!");
      } else {
        await articleService.createArticle(article);
        message.success("Нийтлэл амжилттай нэмэгдлээ!");
      }

      setTitle("");
      setTags([]);
      // Re-initialize editor with empty data
      ejInstance.current?.render({ blocks: [] });
    } catch (error) {
      console.error("Saving failed: ", error);
      message.error("Нийтлэх үед алдаа гарлаа.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-6">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Нийтлэлийн гарчиг"
        className="w-full text-4xl font-extrabold leading-tight border-0 border-b-2 border-gray-200 focus:outline-none focus:border-indigo-500 placeholder-gray-400 mb-10 transition-colors"
        onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
      />

      <div
        id="editorjs"
        className="prose max-w-none min-h-[350px] border border-gray-200 rounded-lg px-6 py-8 shadow-sm focus-within:ring-2 focus-within:ring-indigo-400 transition"
        style={{
          fontFamily:
            "Georgia, serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
          fontSize: "18px",
          lineHeight: 1.7,
          color: "#222",
        }}
      />

      <div className="mt-10">
        <Select
          mode="multiple"
          allowClear
          placeholder="Тагуудыг сонгох (Firebase, React ...)"
          value={tags}
          onChange={setTags}
          className="w-full"
          size="large"
          dropdownClassName="rounded-md shadow-lg"
          style={{ borderRadius: 6 }}
          options={availableTags.map((tag) => ({ label: tag, value: tag }))}
        />
      </div>

      <div className="mt-12 flex justify-end">
        <button
          onClick={handleSubmit}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-md shadow-md transition transform active:scale-95"
        >
          {id ? "Шинэчлэх" : "Нийтлэл нэмэх"}
        </button>
      </div>
    </div>
  );
};

export default AddArticle;
