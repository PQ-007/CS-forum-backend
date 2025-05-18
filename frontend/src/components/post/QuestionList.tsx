import React, { useEffect, useState } from "react";
import { Card, Tag, Collapse, Badge, Input, Button, message } from "antd";
import { UserOutlined, CalendarOutlined, MessageOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useAuth } from "../../context/AuthContext";
import { Question } from "../../pages/student/post/type";
import profileService from "../../service/profileService";
import { v4 as uuidv4 } from "uuid";
import { questionService } from "../../service/postService";

interface Props {
  questions: Question[];
}

const { Panel } = Collapse;

const QuestionsList: React.FC<Props> = ({ questions }) => {
  const { user } = useAuth();
  const [authorNames, setAuthorNames] = useState<Record<string, string>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [loadingComments, setLoadingComments] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const uniqueAuthors = Array.from(new Set(questions.map((q) => q.author)));

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
  }, [questions]);

  const handleCommentChange = (questionId: string, value: string) => {
    setCommentInputs((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleAddComment = async (questionId: string) => {
    const content = commentInputs[questionId]?.trim();
    if (!content) return;

    setLoadingComments((prev) => ({ ...prev, [questionId]: true }));

    try {
      const newComment = {
        content,
        author: user?.displayName || "Unknown",
        postedAt: new Date().toISOString(),
      };

      await questionService.addComment(questionId, newComment);

      message.success("Сэтгэгдэл нэмэгдлээ");

      // Update local state directly (optimistic UI)
      questions.forEach((q) => {
        if (q.id === questionId) {
          q.comments.push({
            id: uuidv4(),
            content: newComment.content,
            author: newComment.author,
            postedAt: new Date(newComment.postedAt),
          });
        }
      });

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
              <div
                className="text-lg font-bold hover:underline cursor-pointer"
                title={post.content}
              >
                {post.content}
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
                {authorNames[post.author] || post.author}
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
              <Panel header={`Сэтгэгдэл харах (${post.comments.length})`} key="comments">
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

                <div className="mt-4">
                  <Input.TextArea
                    rows={2}
                    value={commentInputs[post.id] || ""}
                    onChange={(e) => handleCommentChange(post.id, e.target.value)}
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
