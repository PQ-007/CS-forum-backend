import { useState, useEffect } from "react";
import { Profile, SocialLink } from "./type.ts";
import { useParams } from "react-router-dom";
import {
  FaYoutube,
  FaFacebook,
  FaGithub,
  FaInstagram,
  FaSpinner,
} from "react-icons/fa";
import { Avatar } from "../../../components/Avatar.tsx";
import { ProfileInfo } from "../../../components/ProfileInfo.tsx";
import { BioSection } from "../../../components/BioSection.tsx";
import { SkillsSection } from "../../../components/SkillSection.tsx";
import { StatsSection } from "../../../components/StatsSection.tsx";
import { InterestsSection } from "../../../components/InterestSection.tsx";
import { ContentTabs } from "../../../components/ContentTabs.tsx";

const StudentProfilePage = () => {
  const { uid } = useParams();
  const [activeTab, setActiveTab] = useState("posts");
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch profile data based on uid
  useEffect(() => {
    const fetchProfileData = async () => {
      // Reset state when uid changes
      setLoading(true);
      setError(null);

      try {
        // In a real app, you would fetch data from your API
        // const response = await fetch(`/api/students/${uid}`);
        // const data = await response.json();

        // For demo purposes, we'll simulate an API call with a timeout
        await new Promise((resolve) => setTimeout(resolve, 800));

        const mockData: Profile = {
          name: "Bilguuntushig",
          email: "bilguuntushig@example.com",
          bio: "Би зүгээр л код бичиж чаддаг. Заримдаа онгоцны нисгэгч болохыг хүсдэг. Гэхдээ ихэнхдээ би зүгээр л код бичдэг.",
          following: 8,
          followers: 6,
          skills: {
            programming: [
              "HTML",
              "CSS",
              "JavaScript",
              "Python",
              "C++",
              "SQL",
              "React",
              "Git & GitHub",
            ],
            language: ["English", "Mongolian", "Japanese"],
          },
          achievements: [],
          posts: ["Post 1", "Post 2", "Post 3"],
          projects: ["Project A", "Project B", "Project C"],
          courses: ["Course 1", "Course 2", "Course 3"],
          badges: ["Badge 1", "Badge 2", "Badge 3"],
          pinned: ["Course 1", "Project 1A"],
          portfolio: "https://bilguuntushig.dev",
          currentFocus: "Learning TypeScript and contributing to open source",
          class: "КУ-4",
          certifications: [
            "Google Python Certificate",
            "Responsive Web Design (freeCodeCamp)",
          ],
          interests_hobby: [
            "Web Development",
            "Machine Learning",
            "Game Development",
            "Open Source Contribution",
          ],
          socialLinks: {
            facebook: "#",
            instagram: "#",
            youtube: "#",
            github: "#",
          },
          joinedDate: "Jun 20, 2024",
        };

        setProfile(mockData);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [uid]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl mx-auto text-pink-500 mb-4" />
          <p className="text-white">Loading profile...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-900/30 text-red-200 p-6 rounded-lg max-w-md">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
          <p className="mt-4 text-sm">User ID: {uid}</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-gray-800 p-6 rounded-lg max-w-md text-center">
          <h2 className="text-xl font-bold mb-2">Profile Not Found</h2>
          <p className="text-gray-400">
            Could not find a profile for user ID: {uid}
          </p>
        </div>
      </div>
    );
  }

  const socialLinks: SocialLink[] = [
    profile.socialLinks?.facebook
      ? {
          icon: <FaFacebook />,
          color: "text-blue-600",
          name: "Facebook",
          link: profile.socialLinks.facebook,
        }
      : undefined,

    profile.socialLinks?.instagram
      ? {
          icon: <FaInstagram />,
          color: "text-pink-500",
          name: "Instagram",
          link: profile.socialLinks.instagram,
        }
      : undefined,
    profile.socialLinks?.youtube
      ? {
          icon: <FaYoutube />,
          color: "text-red-500",
          name: "YouTube",
          link: profile.socialLinks.youtube,
        }
      : undefined,
    profile.socialLinks?.github
      ? {
          icon: <FaGithub />,
          color: "text-gray-300",
          name: "GitHub",
          link: profile.socialLinks.github,
        }
      : undefined,
  ].filter((link): link is SocialLink => link !== undefined);

  const statCards = [
    { label: "Posts", count: profile.posts?.length || 0 },
    { label: "Projects", count: profile.projects?.length || 0 },
    { label: "Courses", count: profile.courses?.length || 0 },
    { label: "Badges", count: profile.badges?.length || 0 },
  ];

  const tabs = [
    { key: "pinned", label: "Pinned", items: profile.pinned || [] },
    { key: "posts", label: "Posts", items: profile.posts || [] },
    { key: "projects", label: "Projects", items: profile.projects || [] },
    { key: "certifications", label: "Certifications", items: profile.certifications || [] },
  ];

  const toggleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  return (
    <div className="min-h-screen md:p-6 text-white rounded-xl">
      <div className="w-full mx-auto">
        {/* Header */}
        <div className="relative p-6 rounded-3xl shadow-3xl bg-gradient-to-r from-[#1a1a2e] to-[#16213e] text-white mb-6">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            <Avatar profile={profile} />
            <ProfileInfo profile={profile} toggleFollow={toggleFollow} socialLinks={socialLinks} isFollowing={isFollowing} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <BioSection profile={profile} />
            <SkillsSection profile={profile} />
          </div>

          {/* Right Column */}
          <div className="md:col-span-2 space-y-6">
            <StatsSection statCards={statCards} />
            <InterestsSection profile={profile} />
            <ContentTabs activeTab={activeTab} setActiveTab={setActiveTab} tabs={tabs} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfilePage;
