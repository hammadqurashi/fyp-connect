import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { authRoutes } from "@/core/routes";
import { useState } from "react";

const formSchema = z.object({
  email: z
    .string({ required_error: "Email is required." })
    .email("Please enter a valid email address"),
});

type FormValues = z.infer<typeof formSchema>;

const useForgotPasswordForm = () => {
  const [isEmailSent, setIsEmailSent] = useState(false);

  //   only allowing user to send email once to prevent spam
  const [isEmailResended, setIsEmailResended] = useState(false);
  const [isEmailResending, setIsEmailResending] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const navigate = useNavigate();

  const onSubmit = async (data: FormValues) => {
    console.log(data);
    setIsEmailSent(true);
  };

  const resendEmail = async () => {
    setIsEmailResending(true);

    new Promise((res, rej) =>
      setTimeout(() => {
        res("hi");
      }, 3000)
    ).then(() => {
      setIsEmailResending(false);
      setIsEmailResended(true);
    });
  };

  return {
    form,
    onSubmit,
    isEmailSent,
    resendEmail,
    isEmailResended,
    isEmailResending,
  };
};

export default useForgotPasswordForm;
