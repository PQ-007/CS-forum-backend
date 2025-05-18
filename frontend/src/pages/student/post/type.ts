interface Comment {
  id: string;
  author: string;
  content: string;
  postedAt: Date;
}



export interface Article {
  id: string;
  title: string;
  author: string;
  content: any;
  publishedDate: Date;
  tags: string[];
  imageUrl?: string;
  views: number;
  likes: number;
  comments: Comment[];
}
// New sample library items (you can customize this type and data)
export interface LibraryItem {
  category: any[];
  id: string;
  title: string;
  author: string;
  publishedDate: Date;
  tags: string[];
  description: string;
}

export interface Question {
  id: string;
  content: string;
  attachment?: string;
  author: string;
  createdAt: Date;
  tags: string[];
  comments: Comment[];
}
