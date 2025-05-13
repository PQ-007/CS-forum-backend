import { useState, useEffect } from "react";
import { Profile } from "../profile/type";
import { Loading } from "../../../components/Loading";
import ProfileService from "../../../service/profileService";
import { useParams } from "react-router-dom";
import profileService from "../../../service/profileService";
const StudentSettingsPage = () => {
  const { uid } = useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!uid) {
          throw new Error("UID is undefined");
        }
        const result = await ProfileService.getProfile(uid);
        if (!result) {
          throw new Error("Profile not found");
        }
        setProfile(result);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    path: string
  ) => {
    const keys = path.split(".");
    const value = e.target.value;

    setProfile((prev) => {
      if (!prev) return prev;

      const newProfile = { ...prev };
      let current: any = newProfile;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newProfile;
    });
  };

  const handleArrayChange = (path: string, index: number, value: string) => {
    const keys = path.split(".");

    setProfile((prev) => {
      if (!prev) return prev;

      const newProfile = { ...prev };
      let current: any = newProfile;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }

      const lastKey = keys[keys.length - 1];
      const arr = [...(current[lastKey] || [])];
      arr[index] = value;
      current[lastKey] = arr;

      return newProfile;
    });
  };

  const handleAddArrayItem = (path: string) => {
    const keys = path.split(".");

    setProfile((prev) => {
      if (!prev) return prev;

      const newProfile = { ...prev };
      let current: any = newProfile;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }

      const lastKey = keys[keys.length - 1];
      const arr = [...(current[lastKey] || [])];
      arr.push("");
      current[lastKey] = arr;

      return newProfile;
    });
  };

  const handleRemoveArrayItem = (path: string, index: number) => {
    const keys = path.split(".");

    setProfile((prev) => {
      if (!prev) return prev;

      const newProfile = { ...prev };
      let current: any = newProfile;

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }

      const lastKey = keys[keys.length - 1];
      const arr = [...(current[lastKey] || [])];
      arr.splice(index, 1);
      current[lastKey] = arr;

      return newProfile;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profile) return;

    try {
      if (uid && profile) {
        profileService.updateProfile(uid, profile);
      } else {
        console.error("UID or profile is missing");
        alert("Failed to update profile. UID or profile is missing.");
      }

      console.log("Saving profile:", profile);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Error saving profile:", err);
      alert("Failed to save profile. Please try again.");
    }
  };

  const renderArrayInput = (
    label: string,
    path: string,
    arr: string[] = []
  ) => (
    <div className="mb-6">
      <label className="block text-sm font-medium text-cyan-300 mb-2">
        {label}
      </label>
      {arr.map((item, index) => (
        <div key={index} className="flex mb-2">
          <input
            className="flex-grow px-4 py-2 rounded-lg bg-[#0f172a] text-white border border-[#334155] focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
            value={item}
            onChange={(e) => handleArrayChange(path, index, e.target.value)}
          />
          <button
            type="button"
            className="ml-2 px-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition"
            onClick={() => handleRemoveArrayItem(path, index)}
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        className="text-sm text-cyan-400 hover:underline mt-2 transition"
        onClick={() => handleAddArrayItem(path)}
      >
        + Add {label.toLowerCase()}
      </button>
    </div>
  );

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-900/30 text-red-200 p-6 rounded-lg max-w-md">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
          <button
            className="mt-4 px-4 py-2 bg-red-500/30 hover:bg-red-500/50 rounded-lg transition"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-gray-800 p-6 rounded-lg max-w-md text-center">
          <h2 className="text-xl font-bold mb-2">Profile Not Found</h2>
          <p className="text-gray-400">Could not load profile data</p>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-4xl mx-auto p-8 space-y-8 bg-[#0f172a] text-white min-h-screen rounded-2xl shadow-lg"
    >
      <h2 className="text-4xl font-bold text-center mb-6">Profile Settings</h2>

      {/* Basic Info */}
      <fieldset className="rounded-xl p-6 bg-[#1e293b] shadow-xl border border-[#334155]">
        <legend className="text-2xl font-semibold mb-4">Basic Info</legend>
        <div className="space-y-4">
          <input
            className="w-full px-4 py-2 rounded-lg bg-[#0f172a] text-white border border-[#334155] focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
            placeholder="Name"
            value={profile.name || ""}
            onChange={(e) => handleChange(e, "name")}
          />
          <input
            className="w-full px-4 py-2 rounded-lg bg-[#0f172a] text-white border border-[#334155] focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
            placeholder="Email"
            value={profile.email || ""}
            onChange={(e) => handleChange(e, "email")}
          />
          <input
            className="w-full px-4 py-2 rounded-lg bg-[#0f172a] text-white border border-[#334155] focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
            placeholder="Grade (example: 1st year, 2st year)"
            value={profile.year || ""}
            onChange={(e) => handleChange(e, "year")}
          />
          <textarea
            className="w-full px-4 py-2 rounded-lg bg-[#0f172a] text-white border border-[#334155] focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
            placeholder="Bio"
            value={profile.bio || ""}
            onChange={(e) => handleChange(e, "bio")}
            rows={4}
          />
        </div>
      </fieldset>

      {/* Skills */}
      <fieldset className="bg-[#1e293b] rounded-xl p-6 shadow-xl border border-[#334155]">
        <legend className="text-2xl font-semibold text-white-300 mb-4">
          Skills
        </legend>
        {renderArrayInput(
          "Programming Skills",
          "programming_skills",
          profile.programming_skills || []
        )}
        {renderArrayInput(
          "Language Skills",
          "language_skills",
          profile.language_skills || []
        )}
      </fieldset>

      {/* Social Links */}
      <fieldset className="bg-[#1e293b] rounded-xl p-6 shadow-xl border border-[#334155]">
        <legend className="text-2xl font-semibold mb-4">Social Links</legend>
        {["facebook", "instagram", "youtube", "github"].map((platform) => (
          <div key={platform} className="mb-4">
            <label className="block text-sm text-cyan-300 mb-1 capitalize">
              {platform}
            </label>
            <input
              className="w-full px-4 py-2 rounded-lg bg-[#0f172a] text-white border border-[#334155] focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
              placeholder={`Your ${platform} profile URL`}
              value={
                profile.socialLinks?.[
                  platform as keyof typeof profile.socialLinks
                ] || ""
              }
              onChange={(e) => handleChange(e, `socialLinks.${platform}`)}
            />
          </div>
        ))}
      </fieldset>

      {/* Additional Info */}
      <fieldset className="bg-[#1e293b] rounded-xl p-6 shadow-xl border border-[#334155]">
        <legend className="text-2xl font-semibold mb-4">Additional Info</legend>
        <div className="mb-4">
          <label className="block text-sm text-cyan-300 mb-1">
            Current Focus
          </label>
          <input
            className="w-full px-4 py-2 rounded-lg bg-[#0f172a] text-white border border-[#334155] focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
            placeholder="What are you currently learning or working on?"
            value={profile.currentFocus || ""}
            onChange={(e) => handleChange(e, "currentFocus")}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm text-cyan-300 mb-1">
            Portfolio URL
          </label>
          <input
            className="w-full px-4 py-2 rounded-lg bg-[#0f172a] text-white border border-[#334155] focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
            placeholder="Your portfolio website URL"
            value={profile.portfolio || ""}
            onChange={(e) => handleChange(e, "portfolio")}
          />
        </div>
        {renderArrayInput(
          "Interests & Hobbies",
          "interests_hobby",
          profile.interests_hobby || []
        )}
        {renderArrayInput(
          "Certifications",
          "certifications",
          profile.certifications || []
        )}
        {renderArrayInput(
          "Achievements",
          "achievements",
          profile.achievements || []
        )}
        {renderArrayInput("Pinned Items", "pinned", profile.pinned || [])}
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
