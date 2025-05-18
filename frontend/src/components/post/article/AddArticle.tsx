import React, { useRef, useEffect, useState } from "react";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import { Select, message, Button } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { articleService } from "../../../service/postService";
import { useAuth } from "../../../context/AuthContext";


const availableTags = ["Firebase", "React", "Tailwind", "JavaScript", "CSS"];

const AddArticleEditorJS: React.FC = () => {
  const ejInstance = useRef<EditorJS | null>(null);
  const { user } = useAuth();
  const { id } = useParams(); 
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [initialContent, setInitialContent] = useState<any>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isEditorReady, setIsEditorReady] = useState<boolean>(false);


  useEffect(() => {
    if (!id) {
      setIsEditing(false);
      return;
    }

    (async () => {
      try {
        const article = await articleService.getArticleById(id);
        if (article) {
          setIsEditing(true);
          setTitle(article.title);
          setTags(article.tags || []);
          setInitialContent(article.content ? JSON.parse(article.content) : null);
        } else {
          message.error("Article not found. Treating as new article.");
          setIsEditing(false);
        }
      } catch (err) {
        console.error("Failed to load article:", err);
        message.error("Failed to load article. Treating as new article.");
        setIsEditing(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    const checkEditorElement = () => {
      if (document.getElementById("editorjs")) {
        setIsEditorReady(true);
      } else {
        setTimeout(checkEditorElement, 100);
      }
    };
    checkEditorElement();
  }, []);

  // Initialize EditorJS only when DOM is ready
  useEffect(() => {
    const editorElement = document.getElementById("editorjs");
    if (!editorElement || ejInstance.current || !isEditorReady) {
      return;
    }

    try {
      ejInstance.current = new EditorJS({
        holder: "editorjs",
        autofocus: true,
        placeholder: "Нийтлэлийн текстээ энд бичнэ үү",
        tools: {
          header: Header,
          list: List,
        },
        data: initialContent || undefined,
        onReady: () => {
          console.log("EditorJS is ready");
        },
      });
    } catch (err) {
      console.error("EditorJS initialization failed:", err);
      message.error("Failed to initialize editor.");
    }

    return () => {
      if (ejInstance.current && typeof ejInstance.current.destroy === "function") {
        ejInstance.current.destroy();
        ejInstance.current = null;
      }
    };
  }, [initialContent, isEditorReady]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      message.error("Гарчигийг оруулна уу.");
      return;
    }
    if (!user) {
      message.error("Хэрэглэгч олдсонгүй. Нэвтэрнэ үү.");
      navigate("/login");
      return;
    }

    try {
      const savedData = await ejInstance.current?.save();

      if (!savedData || savedData.blocks.length === 0) {
        message.error("Агуулга хоосон байна.");
        return;
      }

      const article = {
        id: isEditing && id ? id : uuidv4(),
        title,
        author: user.uid,
        content: JSON.stringify(savedData),
        tags,
        imageUrl: "",
        publishedDate: new Date(),
        views: isEditing ? undefined : 0,
        likes: isEditing ? undefined : 0,
        comments: isEditing ? undefined : [],
      };

      if (isEditing && id) {
        await articleService.updateArticle(article.id, article);
        message.success("Нийтлэл амжилттай шинэчлэгдлээ!");
      } else {
        await articleService.createArticle(article);
        message.success("Нийтлэл амжилттай нэмэгдлээ!");
        navigate(`/dashboard/student/post/article/write/${article.id}`);
      }

      if (!isEditing) {
        setTitle("");
        setTags([]);
        ejInstance.current?.render({ blocks: [] });
      }
    } catch (err) {
      console.error("Хадгалах алдаа:", err);
      message.error("Нийтлэх үед алдаа гарлаа.");
    }
  };

  const handleBack = () => {
    navigate(-1); // Go back to previous page
    // Alternatively, use a specific route: navigate("/dashboard/student/post");
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-6">
      <div className="flex justify-between mb-6">
        
      </div>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Нийтлэлийн гарчиг"
        className="w-full text-4xl font-extrabold mb-6 border-b-2 border-gray-300 focus:outline-none focus:border-indigo-500"
      />

      <div
        id="editorjs"
        className="min-h-[350px] border border-gray-300 rounded-md px-4 py-6 shadow-sm"
        style={{ fontFamily: "Georgia, serif", fontSize: "18px", lineHeight: 1.6 }}
      />

      <div className="mt-6">
        <Select
          mode="multiple"
          allowClear
          placeholder="Тагуудыг сонгох"
          value={tags}
          onChange={setTags}
          className="w-full"
          size="large"
          options={availableTags.map((tag) => ({ label: tag, value: tag }))}
        />
      </div>

      <div className="mt-8 flex justify-end gap-4">
        <Button
          type="default"
          onClick={handleBack}
        >
          Буцах
        </Button>
        <Button
          type="primary"
          onClick={handleSubmit}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          {isEditing ? "Шинэчлэх" : "Нийтлэл нэмэх"}
        </Button>
      </div>
    </div>
  );
};

export default AddArticleEditorJS;