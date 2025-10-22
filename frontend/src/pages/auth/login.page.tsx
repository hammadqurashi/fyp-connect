import React from "react";
import DoubleColumnLayout from "@/shared/components/ui/double-column-layout";
import LoginForm from "@/features/auth/components/login.form";

export const LoginPage: React.FC = () => {
  return (
    <DoubleColumnLayout>
      <LoginForm />
    </DoubleColumnLayout>
  );
};
