import { Profile } from "../../pages/student/profile/type";

type SkillProps = {
  profile: Profile;
};
export const SkillsSection = ({ profile }: SkillProps) => (
  <div className="flex flex-col gap-6">
    <div className="bg-[#15151E] p-4 rounded-xl shadow-xl">
      <h3 className="font-semibold text-gray-300 mb-2">PROGRAMMING SKILLS</h3>
      <div className="flex flex-wrap gap-2">
        {profile.programming_skills.map((skill, index) => (
          <span
            key={index}
            className="bg-gray-700 text-gray-300 text-xs px-3 py-1 rounded-full hover:bg-gray-600 transition"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
    <div className="bg-[#15151E] p-4 rounded-xl shadow-xl">
      <h3 className="font-semibold text-gray-300 mb-2">LANGUAGE SKILLS</h3>
      <div className="flex flex-wrap gap-2">
        {profile.language_skills.map((skill, index) => (
          <span
            key={index}
            className="bg-gray-700 text-gray-300 text-xs px-3 py-1 rounded-full hover:bg-gray-600 transition"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  </div>
);
