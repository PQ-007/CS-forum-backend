import { useState } from "react";
import { Profile } from "../profile/type";

interface ProfileSettingsProps {
  initialProfile: Profile;
}

const StudentSettingsPage: React.FC<ProfileSettingsProps> = ({ initialProfile }) => {
  const [profile, setProfile] = useState<Profile>(initialProfile);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    path: string
  ) => {
    const keys = path.split(".");
    const value = e.target.value;

    setProfile((prev) => {
      const newProfile: any = { ...prev };
      let current = newProfile;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newProfile;
    });
  };

  const handleArrayChange = (path: string, index: number, value: string) => {
    const keys = path.split(".");
    setProfile((prev) => {
      const newProfile: any = { ...prev };
      let current = newProfile;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      const arr = [...(current[keys[keys.length - 1]] || [])];
      arr[index] = value;
      current[keys[keys.length - 1]] = arr;
      return newProfile;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Saving profile:", profile);
  };

  const renderArrayInput = (label: string, path: string, arr: string[] = []) => (
    <div className="mb-6">
      <label className="block text-sm font-medium text-cyan-300 mb-2">{label}</label>
      {arr.map((item, index) => (
        <input
          key={index}
          className="w-full px-4 py-2 mb-2 rounded-lg bg-[#0f172a] text-white border border-[#334155] focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
          value={item}
          onChange={(e) => handleArrayChange(path, index, e.target.value)}
        />
      ))}
      <button
        type="button"
        className="text-sm text-cyan-400 hover:underline mt-2 transition"
        onClick={() => handleArrayChange(path, arr.length, "")}
      >
        + Add {label.toLowerCase()}
      </button>
    </div>
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-4xl mx-auto p-8 space-y-8 bg-[#0f172a] text-white min-h-screen"
    >
      <h2 className="text-4xl font-bold text-center mb-6 text-cyan-400">Profile Settings</h2>

      {/* Basic Info */}
      <fieldset className="rounded-xl p-6 bg-[#1e293b] shadow-xl border border-[#334155]">
        <legend className="text-2xl font-semibold text-cyan-300 mb-4">Basic Info</legend>
        <div className="space-y-4">
          <input
            className="w-full px-4 py-2 rounded-lg bg-[#0f172a] text-white border border-[#334155] focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
            placeholder="Name"
            value={profile.name}
            onChange={(e) => handleChange(e, "name")}
          />
          <input
            className="w-full px-4 py-2 rounded-lg bg-[#0f172a] text-white border border-[#334155]"
            placeholder="Email"
            value={profile.email}
            onChange={(e) => handleChange(e, "email")}
          />
          <input
            className="w-full px-4 py-2 rounded-lg bg-[#0f172a] text-white border border-[#334155]"
            placeholder="Class"
            value={profile.class}
            onChange={(e) => handleChange(e, "class")}
          />
          <textarea
            className="w-full px-4 py-2 rounded-lg bg-[#0f172a] text-white border border-[#334155]"
            placeholder="Bio"
            value={profile.bio}
            onChange={(e) => handleChange(e, "bio")}
          />
        </div>
      </fieldset>

      {/* Skills */}
      <fieldset className="bg-[#1e293b] rounded-xl p-6 shadow-xl border border-[#334155]">
        <legend className="text-2xl font-semibold text-cyan-300 mb-4">Skills</legend>
        {renderArrayInput("Programming Skills", "skills.programming", profile.skills.programming)}
        {renderArrayInput("Language Skills", "skills.language", profile.skills.language)}
      </fieldset>

      {/* Social Links */}
      <fieldset className="bg-[#1e293b] rounded-xl p-6 shadow-xl border border-[#334155]">
        <legend className="text-2xl font-semibold text-cyan-300 mb-4">Social Links</legend>
        {["facebook", "instagram", "youtube", "github"].map((platform) => (
          <input
            key={platform}
            className="w-full px-4 py-2 mb-4 rounded-lg bg-[#0f172a] text-white border border-[#334155] focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder={platform[0].toUpperCase() + platform.slice(1)}
            value={profile.socialLinks?.[platform as keyof typeof profile.socialLinks] || ""}
            onChange={(e) => handleChange(e, `socialLinks.${platform}`)}
          />
        ))}
      </fieldset>

      {/* Additional Info */}
      <fieldset className="bg-[#1e293b] rounded-xl p-6 shadow-xl border border-[#334155]">
        <legend className="text-2xl font-semibold text-cyan-300 mb-4">Additional Info</legend>
        <input
          className="w-full px-4 py-2 mb-4 rounded-lg bg-[#0f172a] text-white border border-[#334155]"
          placeholder="Current Focus"
          value={profile.currentFocus || ""}
          onChange={(e) => handleChange(e, "currentFocus")}
        />
        <input
          className="w-full px-4 py-2 mb-4 rounded-lg bg-[#0f172a] text-white border border-[#334155]"
          placeholder="Portfolio URL"
          value={profile.portfolio || ""}
          onChange={(e) => handleChange(e, "portfolio")}
        />
        {renderArrayInput("Interests & Hobbies", "interests_hobby", profile.interests_hobby)}
        {renderArrayInput("Certifications", "certifications", profile.certifications)}
        {renderArrayInput("Achievements", "achievements", profile.achievements)}
      </fieldset>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 transition-colors text-white font-semibold py-3 rounded-xl mt-4 shadow-lg"
      >
        Save Changes
      </button>
    </form>
  );
};

export default StudentSettingsPage;
