import React, { useEffect, useState } from "react";
import { Tabs, Spin } from "antd";
import { BulbOutlined, FireOutlined } from "@ant-design/icons";

import ArticlesList from "../../../components/post/article/ArtcilesList";
import QuestionsList from "../../../components/post/QuestionList";
import { articleService, questionService } from "../../../service/postService";

import { Article, Question } from "./type";
import { useTab } from "../../../context/TabContext";
import Sider from "./sider";

const { TabPane } = Tabs;

const PostTabs = () => {
  const { activeTab, setActiveTab } = useTab();

  return (
    <Tabs
      activeKey={activeTab}
      onChange={(key) => setActiveTab(key as any)}
      type="line"
      size="large"
    >
      <TabPane
        tab={
          <span>
            <BulbOutlined /> Нийтлэл
          </span>
        }
        key="articles"
      />
      <TabPane
        tab={
          <span>
            <FireOutlined /> Асуултууд
          </span>
        }
        key="questions"
      />
    </Tabs>
  );
};


const PostContent = () => {
  const { activeTab } = useTab();
  const [articles, setArticles] = useState<Article[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        if (activeTab === "articles") {
          const data = await articleService.getAllArticles();
          setArticles(data);
        } else if (activeTab === "questions") {
          const data = await questionService.getAllQuestions();
          console.log(data);
          setQuestions(data);
        }
      } catch (err) {
        console.error("Алдаа гарлаа:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [activeTab]); 

  if (loading) return <Spin className="mt-10" size="large" />;

  return (
    <div className="grid gap-6 mt-6">
      {activeTab === "articles" && <ArticlesList articles={articles} />}
      {activeTab === "questions" && <QuestionsList questions={questions} />}
    </div>
  );
};

const StudentPostPage: React.FC = () => {
  const { activeTab } = useTab();

  return (
    <div className="flex w-full min-h-screen bg-gray-50 text-gray-800">
      <main className="flex-1 p-6 max-w-5xl mx-auto">
        <PostTabs />
        <PostContent />
      </main>
      <div className="w-[350px] overflow-y-auto no-scrollbar bg-gray-100 border-l border-gray-200 p-4">
        <Sider key={activeTab} />
      </div>
    </div>
  );
};

export default StudentPostPage;
