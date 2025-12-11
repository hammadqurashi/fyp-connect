import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { StudentProfileForm } from "@/features/profile/components/student-profile-form";
import { SupervisorProfileForm } from "@/features/profile/components/supervisor-profile-form";
import studentService from "@/core/services/api/student-service";
import supervisorService from "@/core/services/api/supervisor-service";
import { LoadingSpinner } from "@/shared/components/ui/loading-spinner";

const ProfileSetup: React.FC = () => {
  const user = useSelector((state: any) => state.auth.user);
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<any>(null);

  useEffect(() => {
    const loadProfile = async () => {
      console.log("ProfileSetup: Loading profile for user:", user);
      try {
        if (user?.role === "student") {
          console.log("ProfileSetup: Fetching student profile...");
          const res = await studentService.getProfile();
          console.log("ProfileSetup: Student profile response:", res);
          if (res.success && res.data) {
            console.log("res", res);
            setInitialData({
              department: res.data.department,
              completedCreditHours: res.data.completedCreditHours,
              skills: res.data.skills || [],
              interests: res.data.interests || [],
            });
          } else {
            // If profile doesn't exist yet, set empty initial data
            console.log("ProfileSetup: No existing profile, using empty data");
            setInitialData({
              department: "",
              completedCreditHours: 0,
              skills: [],
              interests: [],
            });
          }
        } else if (user?.role === "supervisor") {
          console.log("ProfileSetup: Fetching supervisor profile...");
          const res = await supervisorService.getProfile();
          console.log("ProfileSetup: Supervisor profile response:", res);
          if (res.success && res.data) {
            setInitialData({
              description: res.data.description,
              department: res.data.department,
              level: res.data.level,
              skills: res.data.skills || [],
              interests: res.data.interests || [],
            });
          } else {
            // If profile doesn't exist yet, set empty initial data
            console.log("ProfileSetup: No existing profile, using empty data");
            setInitialData({
              description: "",
              department: "",
              level: "professor",
              skills: [],
              interests: [],
            });
          }
        }
      } catch (error) {
        console.error("ProfileSetup: Error loading profile:", error);
        // Set empty initial data on error
        if (user?.role === "student") {
          setInitialData({
            department: "",
            completedCreditHours: 0,
            skills: [],
            interests: [],
          });
        } else if (user?.role === "supervisor") {
          setInitialData({
            description: "",
            department: "",
            level: "professor",
            skills: [],
            interests: [],
          });
        }
      } finally {
        console.log("ProfileSetup: Setting loading to false");
        setLoading(false);
      }
    };

    if (user) {
      loadProfile();
    } else {
      console.log("ProfileSetup: No user found, stopping loading");
      // If no user, stop loading after a short delay
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <p>Please log in to access this page.</p>
        </div>
      </div>
    );
  }

  console.log(
    "ProfileSetup: Rendering with user:",
    user,
    "initialData:",
    initialData,
    "loading:",
    loading
  );

  // Ensure initialData is set even if null
  const formData = !!initialData
    ? initialData
    : user?.role === "student"
    ? {
        department: "",
        completedCreditHours: 0,
        skills: [],
        interests: [],
      }
    : {
        description: "",
        department: "",
        level: "professor",
        skills: [],
        interests: [],
      };

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-4">Profile Setup</h1>
      {user?.role === "student" && (
        <StudentProfileForm initialData={formData} />
      )}
      {user?.role === "supervisor" && (
        <SupervisorProfileForm initialData={formData} />
      )}
      {user?.role !== "student" && user?.role !== "supervisor" && user && (
        <div className="text-center py-8">
          <p>Profile setup is only available for students and supervisors.</p>
        </div>
      )}
      {!user && (
        <div className="text-center py-8">
          <p>Please log in to access this page.</p>
        </div>
      )}
    </div>
  );
};

export default ProfileSetup;
