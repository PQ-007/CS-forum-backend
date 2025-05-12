import { Profile } from "../pages/student/profile/type";

type StatsProps = {
  statCards: {
    label: string;
    count : number;
  }[];
};

export const StatsSection = ({statCards} : StatsProps) => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {statCards.map((item, i) => (
        <div
          key={i}
          className="bg-[#15151E] p-4 rounded-xl text-center shadow-xl"
        >
          <h2 className="font-semibold text-gray-300">{item.label}</h2>
          <div className="text-xl font-semibold text-pink-500">
            {item.count}
          </div>
        </div>
      ))}
    </div>
  );