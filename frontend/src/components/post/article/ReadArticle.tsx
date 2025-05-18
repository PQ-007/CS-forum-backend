import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Tag,
  Button,
  Form,
  Input,
  List,
  Avatar,
  Typography,
  Space,
  message,
  Modal,
} from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  ArrowLeftOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { articleService } from "../../../service/postService";
import profileService from "../../../service/profileService";
import { useAuth } from "../../../context/AuthContext";
import { Article, Comment } from "../../../pages/student/post/type";
import { Loading } from "../../Loading";
import { v4 as uuidv4 } from "uuid";

const { Text, Paragraph } = Typography;

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
  const { user } = useAuth();
  const [form] = Form.useForm();

  const [article, setArticle] = useState<Article | null>(null);
  const [authorName, setAuthorName] = useState<string>("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const loadArticle = async () => {
      if (!id) {
        message.error("Article ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const art = await articleService.getArticleById(id);
        if (!art) {
          message.error("Article not found.");
          setLoading(false);
          return;
        }

        setArticle(art);
        const fetchedComments = (art.comments || []).map((comment: any) => ({
          id: comment.id || uuidv4(),
          author: comment.author,
          content: comment.content,
          postedAt: comment.postedAt ? new Date(comment.postedAt) : new Date(),
        }));

        // Fetch author names for comments
        const commentsWithNames = await Promise.all(
          fetchedComments.map(async (comment: Comment) => {
            const profile = await profileService.getProfile(comment.author);
            return { ...comment, authorName: profile?.name || comment.author };
          })
        );

        setComments(commentsWithNames);

        const profile = await profileService.getProfile(art.author);
        setAuthorName(profile?.name || art.author);
      } catch (err) {
        console.error("Failed to load article:", err);
        message.error("Failed to load article.");
      } finally {
        setLoading(false);
      }
    };
    loadArticle();
  }, [id]);

  const handleSubmitComment = async (values: { comment: string }) => {
    if (!user) {
      message.error("Та нэвтрэх ёстой.");
      navigate("/login");
      return;
    }

    if (!article) {
      message.error("Article not loaded.");
      return;
    }

    setSubmitting(true);
    try {
      const newComment: Comment = {
        id: uuidv4(),
        author: user.displayName ?? user.uid,
        content: values.comment,
        postedAt: new Date(),
      };

      const profile = await profileService.getProfile(user.uid);
      const updatedComments = [
        ...comments,
        { ...newComment, authorName: profile?.name || user.uid },
      ];
      await articleService.updateArticle(article.id, {
        comments: updatedComments,
      });
      setComments(updatedComments);
      form.resetFields();
      message.success("Сэтгэгдэл амжилттай нэмэгдлээ!");
    } catch (err) {
      console.error("Failed to submit comment:", err);
      message.error("Сэтгэгдэл нэмэхэд алдаа гарлаа.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!article) return;

    Modal.confirm({
      title: "Сэтгэгдэл устгах",
      content: "Та энэ сэтгэгдлийг устгахдаа итгэлтэй байна уу?",
      okText: "Устгах",
      cancelText: "Болих",
      onOk: async () => {
        try {
          const updatedComments = comments.filter(
            (comment) => comment.id !== commentId
          );
          await articleService.updateArticle(article.id, {
            comments: updatedComments,
          });
          setComments(updatedComments);
          message.success("Сэтгэгдэл амжилттай устлаа!");
        } catch (err) {
          console.error("Failed to delete comment:", err);
          message.error("Сэтгэгдэл устгахад алдаа гарлаа.");
        }
      },
    });
  };

  if (loading) {
    return <Loading />;
  }

  if (!article) {
    return (
      <div className="max-w-3xl mx-auto py-10 px-6">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          Буцах
        </Button>
        <p>Article not found.</p>
      </div>
    );
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

      <Card className="mb-6">
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

      <Card title="Сэтгэгдэл" className="mb-6">
        {user ? (
          <Form form={form} onFinish={handleSubmitComment} layout="vertical">
            <Form.Item
              name="comment"
              rules={[{ required: true, message: "Сэтгэгдэл оруулна уу!" }]}
            >
              <Input.TextArea
                rows={4}
                placeholder="Сэтгэгдлээ энд бичнэ үү..."
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Сэтгэгдэл нэмэх
              </Button>
            </Form.Item>
          </Form>
        ) : (
          <p>
            Сэтгэгдэл бичихийн тулд{" "}
            <a onClick={() => navigate("/login")}>нэвтэрнэ үү</a>.
          </p>
        )}

        {comments.length > 0 ? (
          <List
            dataSource={comments}
            renderItem={(comment) => (
              <List.Item
                actions={
                  user && user.uid === comment.author
                    ? [
                        <Button
                          key="delete"
                          type="text"
                          icon={<DeleteOutlined />}
                          onClick={() => handleDeleteComment(comment.id)}
                          danger
                        >
                          Устгах
                        </Button>,
                      ]
                    : []
                }
              >
                <List.Item.Meta
                  avatar={<Avatar icon={<UserOutlined />} />}
                  title={
                    <Space>
                      <Text strong>{comment.author}</Text>
                      <Text type="secondary">
                        {dayjs(comment.postedAt).format("YYYY-MM-DD HH:mm")}
                      </Text>
                    </Space>
                  }
                  description={<Paragraph>{comment.content}</Paragraph>}
                />
              </List.Item>
            )}
          />
        ) : (
          <p>Одоогоор сэтгэгдэл байхгүй байна.</p>
        )}
      </Card>
    </div>
  );
};

export default ReadArticle;
