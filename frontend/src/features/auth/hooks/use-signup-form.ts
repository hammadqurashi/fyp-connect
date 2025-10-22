import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import authService from "@/core/services/api/auth-service";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { authActions } from "@/store/auth";
import { useNavigate } from "react-router-dom";

const signupFormSchema = z
  .object({
    firstName: z
      .string({ required_error: "First name is required." })
      .min(2, "First name must be at least 2 characters"),
    lastName: z
      .string({ required_error: "Last name is required." })
      .min(2, "Last name must be at least 2 characters"),
    email: z
      .string({ required_error: "Email is required." })
      .email("Please enter a valid email address"),
    password: z
      .string({ required_error: "Password is required." })
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string({
      required_error: "Please confirm your password.",
    }),
    role: z.enum(["student", "supervisor", "admin"], {
      required_error: "Please select a role.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignupFormValues = z.infer<typeof signupFormSchema>;

const useSignupForm = () => {
  const form = useForm({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "student" as const,
    },
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onSubmit = async (data: SignupFormValues) => {
    try {
      const { confirmPassword, ...signupData } = data;
      const res = await authService.signup(signupData);

      if (res.success && res.data) {
        const { token, user } = res.data;

        toast.success(res.msg || "Account created successfully!");

        dispatch(authActions.setAuth({ token, user }));

        navigate("/");

        return;
      }

      toast.error(res.msg || "Signup failed");
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("An error occurred during signup");
    }
  };

  return { form, onSubmit };
};

export default useSignupForm;

