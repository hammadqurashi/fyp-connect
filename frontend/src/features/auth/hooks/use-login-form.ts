import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import authService from "@/core/services/api/auth-service";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { authActions } from "@/store/auth";
import { useNavigate } from "react-router-dom";
import { studentRoutes } from "@/core/routes";

const loginFormSchema = z.object({
  email: z
    .string({ required_error: "Email is required." })
    .email("Please enter a valid email address"),
  password: z
    .string({ required_error: "Password is required." })
    .min(1, "Password is required."),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

const useLoginForm = () => {
  const form = useForm({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const res = await authService.login(data);

      if (res.success && res.data) {
        const { token, user } = res.data;

        toast.success(res.msg);
        dispatch(authActions.setAuth({ token, user }));

        navigate("/");

        return;
      }

      toast.error(res.msg);
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An error occurred during login");
    }
  };

  return { form, onSubmit };
};

export default useLoginForm;
