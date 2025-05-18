import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  arrayUnion,

} from "firebase/firestore";
import { db } from "../firebase";
import { Article } from "../pages/student/post/type";
import { Question } from "../pages/student/post/type";

import { v4 as uuidv4  } from "uuid";
class ArticleService {
  private static instance: ArticleService;

  private constructor() {}

  public static getInstance(): ArticleService {
    if (!ArticleService.instance) {
      ArticleService.instance = new ArticleService();
    }
    return ArticleService.instance;
  }

  public async createArticle({
    id,
    title,
    author,
    content,
    tags,
    imageUrl,
  }: {
    id: string;
    title: string;
    author: string;
    content: string;
    tags: string[];
    imageUrl?: string;
  }) {
    const publishedDate = new Date();

    const article: Article = {
      id,
      title,
      author,
      content,
      tags,
      imageUrl,
      publishedDate,
      views: 0,
      likes: 0,
      comments: [],
    };

    await setDoc(doc(db, "articles", id), {
      ...article,
      publishedDate: Timestamp.fromDate(publishedDate),
    });

    return id;
  }

  public async getArticleById(id: string): Promise<Article> {
    const docSnap = await getDoc(doc(db, "articles", id));
    if (!docSnap.exists()) throw new Error("Article not found");

    const data = docSnap.data();
    return {
      ...data,
      publishedDate: data.publishedDate.toDate(),
    } as Article;
  }

  public async getAllArticles(): Promise<Article[]> {
    const q = query(
      collection(db, "articles"),
      orderBy("publishedDate", "desc")
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        publishedDate: data.publishedDate.toDate(),
      } as Article;
    });
  }

  public async updateArticle(
    id: string,
    updates: Partial<Omit<Article, "id" | "publishedDate" | "views" | "likes">>
  ) {
    await updateDoc(doc(db, "articles", id), updates);
  }

  public async deleteArticle(id: string) {
    await deleteDoc(doc(db, "articles", id));
  }

  public async getArticlesByTag(tag: string): Promise<Article[]> {
    const q = query(
      collection(db, "articles"),
      where("tags", "array-contains", tag),
      orderBy("publishedDate", "desc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        publishedDate: data.publishedDate.toDate(),
      } as Article;
    });
  }

  public async incrementViews(id: string) {
    const ref = doc(db, "articles", id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;

    const views = snap.data().views || 0;
    await updateDoc(ref, { views: views + 1 });
  }

  public async incrementLikes(id: string) {
    const ref = doc(db, "articles", id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;

    const likes = snap.data().likes || 0;
    await updateDoc(ref, { likes: likes + 1 });
  }
}

class QuestionService {
  private static instance: QuestionService;

  private constructor() {}

  public static getInstance(): QuestionService {
    if (!QuestionService.instance) {
      QuestionService.instance = new QuestionService();
    }
    return QuestionService.instance;
  }

  public async createQuestion(content: string, userId: string) {
    const collectionRef = collection(db, "questions");
    const docRef = doc(collectionRef);

    const now = new Date();
    const newQuestion: Question = {
      id: docRef.id,
      author: userId,
      content: content,
      createdAt: now,
      tags: [],
      comments: [],
    };

    await setDoc(docRef, {
      ...newQuestion,
      createdAt: Timestamp.fromDate(now),
    });
  }

  public async getAllQuestions(): Promise<Question[]> {
    const q = query(collection(db, "questions"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        createdAt: data.createdAt.toDate(),
      } as Question;
    });
  }
  public async addComment(questionId: string, comment: any): Promise<void> {
    const questionRef = doc(db, "questions", questionId);
    await updateDoc(questionRef, {
      comments: arrayUnion({ id: uuidv4(), ...comment }),
    });
  }


}



const articleService = ArticleService.getInstance();
const questionService = QuestionService.getInstance();

export { articleService, questionService };

