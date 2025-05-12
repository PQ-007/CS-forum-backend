import { JSX } from "react";

export interface Profile {
  type: string;
  name: string;
  email: string;
  departure: string;
  year: string;
  bio: string;
  following: number;
  followers: number;
  programming_skills: string[];
  language_skills: string[];
  achievements: string[];
  posts?: string[];
  pinned?: string[];
  projects?: string[];
  courses?: string[];
  badges?: string[];
  portfolio?: string;
  currentFocus?: string;
  interests_hobby?: string[];
  certifications?: string[];
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    github?: string;
  };
  joinedDate?: string;
  photoUrl?: string;
}

export interface SocialLink {
  color: string;
  link: string;
  icon: JSX.Element;
  name: string;
}
