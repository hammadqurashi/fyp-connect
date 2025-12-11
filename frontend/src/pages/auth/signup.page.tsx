import React from "react";
import DoubleColumnLayout from "@/shared/components/ui/double-column-layout";
import SignupForm from "@/features/auth/components/signup.form";

export const SignupPage: React.FC = () => {
  return (
    <DoubleColumnLayout>
      <SignupForm />
    </DoubleColumnLayout>
  );
};


