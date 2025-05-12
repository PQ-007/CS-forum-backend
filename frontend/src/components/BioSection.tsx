import { FaCalendarAlt } from "react-icons/fa";
import { Profile } from "../pages/student/profile/type";

type BioProps = {
  profile: Profile;
};

export const BioSection = ({profile} : BioProps) => (
    <div className="bg-[#15151E] p-4 rounded-xl shadow-xl">
      <h2 className="font-semibold text-gray-300 mb-2">BIO</h2>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-semibold text-yellow-400 bg-yellow-900/30 px-2 py-1 rounded-md">
          анги: {profile.class}
        </span>
      </div>
      <p className="text-sm text-gray-300">{profile.bio}</p>
      <p className="text-sm text-gray-400 mt-3">
        <FaCalendarAlt className="inline mr-2" />
        Joined {profile.joinedDate}
      </p>
    </div>
  );