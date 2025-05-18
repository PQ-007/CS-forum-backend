import React, { useState, useEffect } from "react";
import { Card, Tag, Collapse, Badge, Input, Button, message } from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { Question } from "../../pages/student/post/type";
import { useAuth } from "../../context/AuthContext";
import { questionService } from "../../service/postService";
import { v4 as uuidv4 } from "uuid";

interface Props {
  questions: Question[];
}

const { Panel } = Collapse;

const QuestionsList: React.FC<Props> = ({ questions: initialQuestions }) => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});
  const [loadingComments, setLoadingComments] = useState<{ [key: string]: boolean }>({});

  // Sync local state if parent updates questions prop
  useEffect(() => {
    setQuestions(initialQuestions);
  }, [initialQuestions]);

  const handleCommentChange = (questionId: string, value: string) => {
    setCommentInputs((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleAddComment = async (questionId: string) => {
    const content = commentInputs[questionId]?.trim();
    if (!content) return;

    try {
      setLoadingComments((prev) => ({ ...prev, [questionId]: true }));

      const newComment = {
        content,
        author: user?.displayName || "Unknown",
        postedAt: new Date().toISOString(),
      };

      // Add comment to backend
      await questionService.addComment(questionId, newComment);

      message.success("Сэтгэгдэл нэмэгдлээ");

      // Update local questions state to immediately reflect comment addition
      setQuestions((prevQuestions) =>
        prevQuestions.map((q) =>
          q.id === questionId
            ? {
                ...q,
                comments: [
                  ...q.comments,
                  {
                    id: uuidv4(),
                    content: newComment.content,
                    author: newComment.author,
                    postedAt: new Date(newComment.postedAt),
                  },
                ],
              }
            : q
        )
      );

      // Clear input for this question
      setCommentInputs((prev) => ({ ...prev, [questionId]: "" }));
    } catch (err) {
      console.error(err);
      message.error("Сэтгэгдэл нэмэхэд алдаа гарлаа");
    } finally {
      setLoadingComments((prev) => ({ ...prev, [questionId]: false }));
    }
  };

  return (
    <>
      {questions.map((post) => (
        <Card
          key={post.id}
          bordered
          hoverable
          className="transition-all shadow-sm hover:shadow-lg"
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div
                  className="text-lg font-bold hover:underline cursor-pointer"
                  title={post.content}
                >
                  {post.content}
                </div>
              </div>
              {post.comments.length > 0 && (
                <Badge
                  count={post.comments.length}
                  overflowCount={99}
                  title="Number of comments"
                  offset={[0, 0]}
                  style={{ backgroundColor: "#52c41a" }}
                >
                  <MessageOutlined className="text-xl text-gray-500" />
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-2">
              <span className="flex items-center gap-1">
                <UserOutlined />
                {post.author}
              </span>
              <span className="flex items-center gap-1">
                <CalendarOutlined />
                {dayjs(post.createdAt).format("MMM D, YYYY")}
              </span>
              {post.tags.map((tag) => (
                <Tag key={tag} color="blue">
                  {tag}
                </Tag>
              ))}
            </div>

            <Collapse ghost className="mt-2">
              <Panel
                header={`View Comments (${post.comments.length})`}
                key="comments"
              >
                {post.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="border-t pt-2 mt-2 first:border-none first:pt-0 first:mt-0"
                  >
                    <p className="text-sm text-gray-800">{comment.content}</p>
                    <p className="text-xs text-gray-500">
                      — {comment.author},{" "}
                      {dayjs(comment.postedAt).format("MMM D, YYYY")}
                    </p>
                  </div>
                ))}

                {/* New comment input */}
                <div className="mt-4">
                  <Input.TextArea
                    rows={2}
                    value={commentInputs[post.id] || ""}
                    onChange={(e) =>
                      handleCommentChange(post.id, e.target.value)
                    }
                    placeholder="Сэтгэгдлээ бичнэ үү..."
                  />
                  <div className="text-right mt-2">
                    <Button
                      type="primary"
                      loading={loadingComments[post.id]}
                      onClick={() => handleAddComment(post.id)}
                    >
                      Сэтгэгдэл нэмэх
                    </Button>
                  </div>
                </div>
              </Panel>
            </Collapse>
          </div>
        </Card>
      ))}
    </>
  );
};

export default QuestionsList;
