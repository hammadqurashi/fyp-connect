import React from "react";
import DoubleColumnLayout from "@/shared/components/ui/double-column-layout";
import ForgotPasswordForm from "@/features/auth/components/forgot-password.form";

export const ForgotPasswordPage: React.FC = () => {
  return (
    <DoubleColumnLayout>
      <ForgotPasswordForm />
    </DoubleColumnLayout>
  );
};
