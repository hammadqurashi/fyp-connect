import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { authActions } from "@/store/auth";
import authService from "@/core/services/api/auth-service";
import { jwtService } from "@/core/services";

export const useAuthInit = () => {
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state: any) => state.auth.isLoggedIn);

  const [isFetching, setIsFetching] = useState<boolean>(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedSession = jwtService.getAuthSession();

        if (storedSession?.token && !isLoggedIn) {
          const user = await authService.getUserDetailsByToken();

          if (user) {
            dispatch(
              authActions.setAuth({
                token: storedSession.token,
                user,
              })
            );
          } else {
            jwtService.clearSession();
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        // Clear invalid session
        jwtService.clearSession();
      }
    };

    initializeAuth().finally(() => setIsFetching(false));
  }, [dispatch, isLoggedIn]);

  return { isFetching };
};


