import { JSX } from "react";

export interface Profile {
  name: string;
  email: string;
  class: string;
  bio: string;
  following: number;
  followers: number;
  skills: {
    programming: string[];
    language: string[];
  };
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
}

export interface SocialLink {
  color: string;
  link: string;
  icon: JSX.Element;
  name: string;
}
