import React from "react";

interface StudentHomePageProps {
  section: "main" | "sidebar";
}

const StudentHomePage: React.FC<StudentHomePageProps> = ({ section }) => {
  if (section === "main") {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Student Home</h2>
        <div className="mb-6">
          <h3 className="text-lg font-medium">Course Progress</h3>
          <p>Progress bars and course summaries go here.</p>
        </div>
        <div>
          <h3 className="text-lg font-medium">Recommended Courses</h3>
          <p>Course cards or list go here.</p>
        </div>
      </div>
    );
  }

  if (section === "sidebar") {
    return (
      <div>
        <h3 className="text-lg font-medium mb-4">Schedule</h3>
        <div className="mb-6">
          <p>Today’s schedule or calendar goes here.</p>
        </div>
        <h3 className="text-lg font-medium mb-4">Upcoming Events</h3>
        <div>
          <p>Event list or calendar widget goes here.</p>
        </div>
      </div>
    );
  }

  return null;
};

export default StudentHomePage;
