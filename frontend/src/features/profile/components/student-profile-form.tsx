import React, { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { LoadingSpinner } from "@/shared/components/ui/loading-spinner";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/shared/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import studentService from "@/core/services/api/student-service";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { authActions } from "@/store/auth";

const studentProfileSchema = z.object({
  department: z.string().min(1, "Department is required"),
  completedCreditHours: z
    .number()
    .min(0, "Credit hours must be 0 or greater")
    .int("Credit hours must be a whole number"),
  skills: z.array(z.string()).min(1, "At least one skill is required"),
  interests: z.array(z.string()).min(1, "At least one interest is required"),
});

type StudentProfileFormValues = z.infer<typeof studentProfileSchema>;

interface StudentProfileFormProps {
  onComplete?: () => void;
  initialData?: {
    department?: string;
    completedCreditHours?: number;
    skills?: string[];
    interests?: string[];
  };
}

const departments = [
  "Computer Science",
  "Software Engineering",
  "Information Technology",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Business Administration",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Other",
];

const commonSkills = [
  "JavaScript",
  "Python",
  "Java",
  "React",
  "Node.js",
  "MongoDB",
  "SQL",
  "Machine Learning",
  "Data Science",
  "Web Development",
  "Mobile Development",
  "Cloud Computing",
  "DevOps",
  "UI/UX Design",
  "Other",
];

const commonInterests = [
  "Web Development",
  "Mobile Apps",
  "AI/ML",
  "Data Science",
  "Cybersecurity",
  "Cloud Computing",
  "IoT",
  "Blockchain",
  "Game Development",
  "Robotics",
  "Research",
  "Other",
];

export const StudentProfileForm: React.FC<StudentProfileFormProps> = ({
  initialData,
}) => {
  const [skillInput, setSkillInput] = useState("");
  const [interestInput, setInterestInput] = useState("");

  const form = useForm<StudentProfileFormValues>({
    resolver: zodResolver(studentProfileSchema),
    defaultValues: {
      department: initialData?.department || "",
      completedCreditHours: initialData?.completedCreditHours || 0,
      skills: initialData?.skills || [],
      interests: initialData?.interests || [],
    },
  });

  // Update form when initialData changes
  useEffect(() => {
    if (initialData !== undefined) {
      form.reset({
        department: initialData?.department || "",
        completedCreditHours: initialData?.completedCreditHours || 0,
        skills: initialData?.skills || [],
        interests: initialData?.interests || [],
      });
    }
  }, [initialData, form]);

  const skills = form.watch("skills");
  const interests = form.watch("interests");

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      form.setValue("skills", [...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    form.setValue(
      "skills",
      skills.filter((s) => s !== skill)
    );
  };

  const addInterest = () => {
    if (interestInput.trim() && !interests.includes(interestInput.trim())) {
      form.setValue("interests", [...interests, interestInput.trim()]);
      setInterestInput("");
    }
  };

  const removeInterest = (interest: string) => {
    form.setValue(
      "interests",
      interests.filter((i) => i !== interest)
    );
  };

  const onSubmit = async (data: StudentProfileFormValues) => {
    const res = await studentService.updateProfile(data);

    if (res.success) {
      toast.success("Profile updated successfully!");

      // dispatch(
      //   authActions.setUser({
      //     user: {
      //       ...data,
      //       profileCompleted: true,
      //     },
      //   })
      // );

      return;
    }
    toast.error(res.msg || "Failed to update profile");
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Complete Your Profile</CardTitle>
        <CardDescription>
          Please provide the following information to continue
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your department" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="completedCreditHours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Completed Credit Hours</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter completed credit hours"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Skills</FormLabel>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Add a skill"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                />
                <Button type="button" onClick={addSkill}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="hover:text-blue-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="mt-2">
                <p className="text-xs text-muted-foreground mb-1">
                  Common skills:
                </p>
                <div className="flex flex-wrap gap-1">
                  {commonSkills
                    .filter((s) => !skills.includes(s))
                    .map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => {
                          form.setValue("skills", [...skills, skill]);
                        }}
                        className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                      >
                        + {skill}
                      </button>
                    ))}
                </div>
              </div>
              {form.formState.errors.skills && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.skills.message}
                </p>
              )}
            </div>

            <div>
              <FormLabel>Interests</FormLabel>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Add an interest"
                  value={interestInput}
                  onChange={(e) => setInterestInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addInterest();
                    }
                  }}
                />
                <Button type="button" onClick={addInterest}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {interests.map((interest) => (
                  <span
                    key={interest}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                  >
                    {interest}
                    <button
                      type="button"
                      onClick={() => removeInterest(interest)}
                      className="hover:text-green-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="mt-2">
                <p className="text-xs text-muted-foreground mb-1">
                  Common interests:
                </p>
                <div className="flex flex-wrap gap-1">
                  {commonInterests
                    .filter((i) => !interests.includes(i))
                    .map((interest) => (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => {
                          form.setValue("interests", [...interests, interest]);
                        }}
                        className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                      >
                        + {interest}
                      </button>
                    ))}
                </div>
              </div>
              {form.formState.errors.interests && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.interests.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Saving...
                </>
              ) : (
                "Save Profile"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
