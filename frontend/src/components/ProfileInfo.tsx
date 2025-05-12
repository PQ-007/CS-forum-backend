import { FaEnvelope, FaGlobe, FaRocket } from "react-icons/fa";
import { Profile } from "../pages/student/profile/type";
import { JSX } from "react";

type InfoProps = {
  profile: Profile;
  toggleFollow: () => void;
  isFollowing: boolean;
  socialLinks?: {
    color: string;
    link: string;
    icon: JSX.Element;
    name: string;
  }[];
};

export const ProfileInfo = ({profile, toggleFollow, isFollowing, socialLinks} :InfoProps ) => (
    <div className="flex-1 space-y-2">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{profile.name}</h1>
          <p className="text-sm text-pink-300 italic">"Code. Sleep. Repeat."</p>
        </div>
        <button
          onClick={toggleFollow}
          className={`mt-2 md:mt-0 px-6 py-2 rounded-full font-medium transition-all duration-300 ${
            isFollowing
              ? "bg-green-600 hover:bg-green-700"
              : "bg-yellow-500 hover:bg-yellow-600"
          }`}
        >
          {isFollowing ? "Following" : "Follow"}
        </button>
      </div>

      <div className="flex items-center space-x-2 text-sm text-gray-400">
        <FaEnvelope className="text-gray-500" />
        <span>{profile.email}</span>
      </div>

      <div className="flex items-center space-x-4">
        <span className="text-sm">{profile.following} following</span>
        <span className="text-sm">{profile.followers} followers</span>
      </div>

      {profile.currentFocus && (
        <div className="flex items-center text-sm text-yellow-300">
          <FaRocket className="mr-2" />
          <span>{profile.currentFocus}</span>
        </div>
      )}

      {profile.portfolio && (
        <a
          href={profile.portfolio}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center text-sm text-blue-400 hover:underline"
        >
          <FaGlobe className="mr-2" />
          <span>Portfolio</span>
        </a>
      )}

      <div className="flex space-x-4 pt-2">
        {socialLinks?.map((social, index) => (
          <a
            key={index}
            href={social?.link}
            className={`${social?.color} hover:scale-125 transition-transform`}
            title={social.name}
          >
            {social.icon}
          </a>
        ))}
      </div>
    </div>
  );