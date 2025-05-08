import React from "react";

interface StudentCoursePageProps {
  section: "main" | "sidebar";
}

const StudentCoursePage: React.FC<StudentCoursePageProps> = ({ section }) => {
  if (section === "main") {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Student Courses</h2>
        <div className="mb-6">
          <h3 className="text-lg font-medium">Enrolled Courses</h3>
          <p>Course list or table goes here.</p>
        </div>
        <div>
          <h3 className="text-lg font-medium">Assignments</h3>
          <p>Assignment list goes here.</p>
        </div>
      </div>
    );
  }

  if (section === "sidebar") {
    return (
      <div>
        <h3 className="text-lg font-medium mb-4">Course Schedule</h3>
        <div className="mb-6">
          <p>Course-specific calendar or schedule goes here.</p>
        </div>
        <h3 className="text-lg font-medium mb-4">Deadlines</h3>
        <div>
          <p>Upcoming deadlines go here.</p>
        </div>
      </div>
    );
  }

  return null;
};

export default StudentCoursePage;
