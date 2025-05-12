import { FaCalendarAlt } from "react-icons/fa";
import { Profile } from "../..//pages/student/profile/type";

type BioProps = {
  profile: Profile;
};

export const BioSection = ({ profile }: BioProps) => (
  <div className="bg-[#15151E] p-4 rounded-xl shadow-xl">
    <h2 className="font-semibold text-gray-300 mb-2">BIO</h2>
    <div className="flex items-center gap-2 mb-2"></div>
    <p className="text-sm text-gray-300">{profile.bio}</p>
    <p className="text-sm text-gray-400 mt-3">
      <FaCalendarAlt className="inline mr-2" />
      Joined {profile.joinedDate?.slice(0, 10)}
    </p>
  </div>
);
