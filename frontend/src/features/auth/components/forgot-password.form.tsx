import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

import { Car, Mail, ArrowLeft, Send } from "lucide-react";
import useForgotPasswordForm from "../hooks/use-forgot-password-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { LoadingSpinner } from "@/shared/components/ui/loading-spinner";

const ForgotPasswordForm = () => {
  const {
    form,
    isEmailSent,
    onSubmit,
    resendEmail,
    isEmailResended,
    isEmailResending,
  } = useForgotPasswordForm();

  return (
    <div className="flex-1 flex items-center justify-center bg-slate-50 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 lg:hidden">
          <div className="flex items-center justify-center mb-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              FYP CONNECT
            </h1>
          </div>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-slate-800">
              {isEmailSent ? "Check Your Email" : "Reset Password"}
            </CardTitle>
            <CardDescription className="text-slate-600">
              {isEmailSent
                ? "We've sent password reset instructions to your email"
                : "Enter your email address to receive reset instructions"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isEmailSent ? (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">
                          Email Address
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                            <Input
                              {...field}
                              type="email"
                              placeholder="Enter your email"
                              className="pl-10 h-12"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? (
                      <>
                        <Send className="mr-2 h-4 w-4 animate-pulse" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Reset Link
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            ) : (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Mail className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-slate-600">
                  We've sent a password reset link to your email.
                </p>
                <p className="text-sm text-slate-500">
                  Didn't receive the email? Check your spam folder
                  {!isEmailResended ? " or try again." : "."}
                </p>
                {!isEmailResended && (
                  <Button
                    variant="outline"
                    onClick={resendEmail}
                    className="w-full"
                    disabled={isEmailResending}
                  >
                    {isEmailResending ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      "Try Again"
                    )}
                  </Button>
                )}
              </div>
            )}

            <div className="mt-8 text-center">
              <Link
                to="/login"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 hover:underline font-medium"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
