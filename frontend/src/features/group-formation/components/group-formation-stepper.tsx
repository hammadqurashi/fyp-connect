import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Progress } from "@/shared/components/ui/progress";
import {
  ChevronLeft,
  ChevronRight,
  Users,
  Search,
  CheckCircle,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import studentGroupService from "@/core/services/api/student-group-service";
import { BasicInfoStep } from "./basic-info-step";
import { FiltersStep } from "./filters-step";
import { FindMembersStep } from "./find-members-step";
import { ConfirmationStep } from "./confirmation-step";
import { GroupStatusView } from "./group-status-view";
import { Form } from "@/shared/components/ui/form";

// Form schema
const groupFormSchema = z.object({
  name: z.string().min(3, "Group name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  department: z.string().optional(),
  minCreditHours: z.number().optional(),
  maxCreditHours: z.number().optional(),
  skills: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
});

type GroupFormData = z.infer<typeof groupFormSchema>;

const steps = [
  { title: "Basic Info", description: "Group details", icon: Users },
  { title: "Filters", description: "Search preferences", icon: Filter },
  { title: "Find Members", description: "Invite students", icon: Search },
  {
    title: "Confirmation",
    description: "Review and create",
    icon: CheckCircle,
  },
];

export function GroupFormationStepper() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasGroup, setHasGroup] = useState(false);

  const form = useForm<GroupFormData>({
    resolver: zodResolver(groupFormSchema),
    defaultValues: {
      name: "",
      description: "",
      department: "",
      minCreditHours: undefined,
      maxCreditHours: undefined,
      skills: [],
      interests: [],
    },
  });

  // Check if user already has a group
  useEffect(() => {
    const checkGroup = async () => {
      try {
        const res = await studentGroupService.getMyGroup();
        if (res.success && res.data?.group) {
          setHasGroup(true);
        }
      } catch (error) {
        console.error("Error checking group:", error);
      }
    };
    checkGroup();
  }, []);

  const nextStep = async (e) => {
    e.preventDefault();
    // Validate current step before proceeding
    const fieldsToValidate: (keyof GroupFormData)[][] = [
      ["name", "description"], // Step 0
      [], // Step 1 (filters are optional)
      [], // Step 2 (selection is validated on submit)
      [], // Step 3 (confirmation)
    ];

    const fields = fieldsToValidate[currentStep];
    if (fields.length > 0) {
      const isValid = await form.trigger(fields as any);
      if (!isValid) {
        return;
      }
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: GroupFormData) => {
    if (selectedStudents.length === 0) {
      toast.error("Please select at least one student to invite");
      return;
    }

    if (selectedStudents.length > 3) {
      toast.error("Maximum 3 students can be invited (4 total including you)");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await studentGroupService.createGroup({
        name: data.name,
        description: data.description,
        invitedStudentIds: selectedStudents,
      });

      if (res.success) {
        toast.success("Group created and invitations sent successfully!");
        setHasGroup(true);
        setCurrentStep(3);
      } else {
        toast.error(res.msg || "Failed to create group");
      }
    } catch (error: any) {
      console.error("Error creating group:", error);
      toast.error(
        error?.response?.data?.msg ||
          "An error occurred while creating the group"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  // If user already has a group, show status view
  if (hasGroup && currentStep !== 3) {
    return <GroupStatusView />;
  }

  const CurrentStepIcon = steps[currentStep].icon;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Create Your Group</h1>
          <div className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </div>
        </div>

        <Progress value={progress} className="h-2" />

        <div className="flex justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className={`flex-1 text-center ${
                  index <= currentStep
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Icon className="h-4 w-4" />
                  <div className="text-xs font-medium">{step.title}</div>
                </div>
                <div className="text-xs">{step.description}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {CurrentStepIcon && <CurrentStepIcon className="h-5 w-5" />}
            {steps[currentStep].title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Step 0: Basic Info */}
              {currentStep === 0 && <BasicInfoStep form={form} />}

              {/* Step 1: Filters */}
              {currentStep === 1 && <FiltersStep form={form} />}

              {/* Step 2: Find Members */}
              {currentStep === 2 && (
                <FindMembersStep
                  form={form}
                  selectedStudents={selectedStudents}
                  onSelectionChange={setSelectedStudents}
                />
              )}

              {/* Step 3: Confirmation */}
              {currentStep === 3 && (
                <ConfirmationStep
                  form={form}
                  selectedStudentsCount={selectedStudents.length}
                />
              )}

              {/* Navigation Buttons */}
              {currentStep < 3 && (
                <div className="flex justify-between pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>

                  {currentStep === 2 ? (
                    <Button
                      type="submit"
                      className="flex items-center gap-2"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Creating..." : "Create Group"}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="flex items-center gap-2"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}

              {currentStep === 3 && (
                <div className="flex gap-3 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => window.location.reload()}
                  >
                    View My Group
                  </Button>
                  <Button
                    type="button"
                    className="flex-1"
                    onClick={() => (window.location.href = "/")}
                  >
                    Go to Dashboard
                  </Button>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
