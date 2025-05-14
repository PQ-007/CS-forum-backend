import { useState, useEffect } from "react";
import { Profile, SocialLink } from "./type.ts";
import { useParams } from "react-router-dom";
import { FaFacebook, FaInstagram, FaYoutube, FaGithub } from "react-icons/fa";
import { Avatar } from "../../../components/profile/Avatar.tsx";
import { ProfileInfo } from "../../../components/profile/ProfileInfo.tsx";
import { BioSection } from "../../../components/profile/BioSection.tsx";
import { SkillsSection } from "../../../components/profile/SkillSection.tsx";
import { StatsSection } from "../../../components/profile/StatsSection.tsx";
import { InterestsSection } from "../../../components/profile/InterestSection.tsx";
import { ContentTabs } from "../../../components/profile/ContentTabs.tsx";
import { Loading } from "../../../components/Loading.tsx";
import profileService from "../../../service/profileService.tsx";
import { useAuth } from "../../../context/AuthContext.tsx";
const StudentProfilePage = () => {
  const { uid } = useParams();
  const { user } = useAuth();
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
        if (!uid) {
          throw new Error("UID is undefined");
        }
        const result = await profileService.getProfile(uid);

        setProfile(result);
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
    return <Loading />;
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
    {
      key: "certifications",
      label: "Certifications",
      items: profile.certifications || [],
    },
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
            <ProfileInfo
              profile={profile}
              toggleFollow={toggleFollow}
              socialLinks={socialLinks}
              isFollowing={isFollowing}
              myProfile={user?.uid == uid ? true : false}
            />
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
            <ContentTabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              tabs={tabs}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfilePage;
