import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import studentService from "@/core/services/api/student-service";
import supervisorService from "@/core/services/api/supervisor-service";

export const useProfileComplete = () => {
  const user = useSelector((state: any) => state.auth.user);
  const [isComplete, setIsComplete] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        if (user.role === "student") {
          const res = await studentService.checkProfileComplete();
          if (res.success && res.data) {
            setIsComplete(res.data.profileCompleted);
          } else {
            setIsComplete(false);
          }
        } else if (user.role === "supervisor") {
          const res = await supervisorService.checkProfileComplete();
          if (res.success && res.data) {
            setIsComplete(res.data.profileCompleted);
          } else {
            setIsComplete(false);
          }
        } else {
          // Admin doesn't need profile completion
          setIsComplete(true);
        }
      } catch (error) {
        console.error("Error checking profile:", error);
        setIsComplete(false);
      } finally {
        setLoading(false);
      }
    };

    checkProfile();
  }, [user]);

  return { isComplete, loading };
};


