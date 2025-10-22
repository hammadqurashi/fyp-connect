import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import { Badge } from "@/shared/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Checkbox } from "@/shared/components/ui/checkbox";
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
} from "lucide-react";
import groupService from "@/core/services/api/group-service";
import { useToast } from "@/shared/components/ui/use-toast";

// Form schema
const groupFormSchema = z.object({
  name: z.string().min(3, "Group name must be at least 3 characters"),
  tagline: z.string().min(10, "Tagline must be at least 10 characters"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  department: z.string().min(1, "Please select a department"),
  skills: z.array(z.string()).min(1, "Please select at least one skill"),
  creditHours: z.number().min(60, "Must have at least 60 credit hours"),
  interests: z.array(z.string()).min(1, "Please select at least one interest"),
});

type GroupFormData = z.infer<typeof groupFormSchema>;

const departments = [
  "Computer Science",
  "Software Engineering",
  "Data Science",
  "Information Technology",
  "Electrical Engineering",
  "Mechanical Engineering",
];

const skillOptions = [
  "React",
  "Node.js",
  "Python",
  "Java",
  "Machine Learning",
  "Data Analysis",
  "UI/UX Design",
  "Mobile Development",
  "Cloud Computing",
  "DevOps",
  "Database Design",
  "API Development",
  "Cybersecurity",
  "Blockchain",
];

const interestOptions = [
  "Artificial Intelligence",
  "Web Development",
  "Mobile Apps",
  "Data Science",
  "Cybersecurity",
  "Cloud Computing",
  "IoT",
  "Blockchain",
  "Game Development",
  "E-commerce",
  "Healthcare Tech",
  "Fintech",
  "EdTech",
  "Green Technology",
];

// Mock student suggestions
const mockStudents = [
  {
    id: "1",
    name: "Alice Johnson",
    department: "Computer Science",
    creditHours: 85,
    skills: ["React", "Node.js", "Python"],
    interests: ["AI", "Web Development"],
    avatar: "/placeholder-avatar-1.jpg",
  },
  {
    id: "2",
    name: "Bob Smith",
    department: "Data Science",
    creditHours: 90,
    skills: ["Python", "Machine Learning", "Data Analysis"],
    interests: ["AI", "Data Science"],
    avatar: "/placeholder-avatar-2.jpg",
  },
  {
    id: "3",
    name: "Carol Williams",
    department: "Computer Science",
    creditHours: 78,
    skills: ["Java", "Mobile Development", "UI/UX Design"],
    interests: ["Mobile Apps", "EdTech"],
    avatar: "/placeholder-avatar-3.jpg",
  },
];

const steps = [
  { title: "Basic Info", description: "Group details and description" },
  { title: "Filters", description: "Skills and preferences" },
  { title: "Find Members", description: "Invite matching students" },
  { title: "Confirmation", description: "Review and create group" },
];

export function GroupFormationStepper() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdGroupId, setCreatedGroupId] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<GroupFormData>({
    resolver: zodResolver(groupFormSchema),
    defaultValues: {
      name: "",
      tagline: "",
      description: "",
      department: "",
      skills: [],
      creditHours: 0,
      interests: [],
    },
  });

  const nextStep = () => {
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
    try {
      setIsSubmitting(true);
      // 1) Create group
      const createRes = await groupService.createGroup({
        name: data.name,
        description: data.description,
      });

      if (!createRes.success) {
        toast({
          title: "Failed to create group",
          description: createRes.msg,
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const groupId = createRes.data?.group?._id || createRes.data?.group?.id;
      setCreatedGroupId(groupId);

      // 2) Send invitations (if any selected)
      if (groupId && selectedStudents.length > 0) {
        const inviteRes = await groupService.sendInvitations(
          groupId,
          selectedStudents
        );
        if (!inviteRes.success) {
          toast({
            title: "Group created, but invitations failed",
            description: inviteRes.msg,
            variant: "destructive",
          });
        }
      }

      toast({
        title: "Group created",
        description: "Your group has been created and invitations sent.",
      });
      setCurrentStep(3);
    } catch (err: any) {
      toast({
        title: "Something went wrong",
        description: err?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSkill = (skill: string) => {
    const currentSkills = form.getValues("skills");
    const newSkills = currentSkills.includes(skill)
      ? currentSkills.filter((s) => s !== skill)
      : [...currentSkills, skill];
    form.setValue("skills", newSkills);
  };

  const toggleInterest = (interest: string) => {
    const currentInterests = form.getValues("interests");
    const newInterests = currentInterests.includes(interest)
      ? currentInterests.filter((i) => i !== interest)
      : [...currentInterests, interest];
    form.setValue("interests", newInterests);
  };

  const toggleStudent = (studentId: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

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
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex-1 text-center ${
                index <= currentStep ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <div className="text-xs font-medium">{step.title}</div>
              <div className="text-xs">{step.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Form Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {currentStep === 0 && <Users className="h-5 w-5" />}
            {currentStep === 1 && <Search className="h-5 w-5" />}
            {currentStep === 2 && <Users className="h-5 w-5" />}
            {currentStep === 3 && <CheckCircle className="h-5 w-5" />}
            {steps[currentStep].title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1: Basic Info */}
            {currentStep === 0 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Group Name</Label>
                  <Input
                    id="name"
                    {...form.register("name")}
                    placeholder="Enter your group name"
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input
                    id="tagline"
                    {...form.register("tagline")}
                    placeholder="A brief catchy description"
                  />
                  {form.formState.errors.tagline && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.tagline.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...form.register("description")}
                    placeholder="Describe your group's goals, project ideas, and what you're looking for in team members..."
                    rows={4}
                  />
                  {form.formState.errors.description && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.description.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Filters */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <Label>Department</Label>
                  <Select
                    onValueChange={(value) =>
                      form.setValue("department", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="creditHours">Completed Credit Hours</Label>
                  <Input
                    id="creditHours"
                    type="number"
                    {...form.register("creditHours", { valueAsNumber: true })}
                    placeholder="e.g., 85"
                  />
                </div>

                <div>
                  <Label>Skills (Select relevant skills)</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {skillOptions.map((skill) => (
                      <Badge
                        key={skill}
                        variant={
                          form.watch("skills")?.includes(skill)
                            ? "default"
                            : "outline"
                        }
                        className="cursor-pointer"
                        onClick={() => toggleSkill(skill)}
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Interests (Select project interests)</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {interestOptions.map((interest) => (
                      <Badge
                        key={interest}
                        variant={
                          form.watch("interests")?.includes(interest)
                            ? "default"
                            : "outline"
                        }
                        className="cursor-pointer"
                        onClick={() => toggleInterest(interest)}
                      >
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Find Members */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Based on your filters, here are suggested students who might
                  be a good fit:
                </div>

                <div className="grid gap-4">
                  {mockStudents.map((student) => (
                    <Card
                      key={student.id}
                      className={`cursor-pointer transition-all ${
                        selectedStudents.includes(student.id)
                          ? "ring-2 ring-primary bg-primary/5"
                          : "hover:shadow-md"
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium">
                              {student.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </div>
                            <div>
                              <h4 className="font-medium">{student.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {student.department} • {student.creditHours}{" "}
                                credits
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 space-y-2">
                          <div>
                            <div className="text-xs font-medium text-muted-foreground mb-1">
                              Skills:
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {student.skills.slice(0, 3).map((skill) => (
                                <Badge
                                  key={skill}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <div className="text-xs font-medium text-muted-foreground mb-1">
                              Interests:
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {student.interests.map((interest) => (
                                <Badge
                                  key={interest}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {interest}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t">
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full"
                          >
                            Send Group Request
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Confirmation */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center py-6">
                  <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
                  <h2 className="text-xl font-semibold mb-2">
                    Group Created Successfully!
                  </h2>
                  <p className="text-muted-foreground">
                    Your group has been created and invitations have been sent
                    to selected students.
                  </p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Group Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Group Name</Label>
                      <p>{form.watch("name")}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Tagline</Label>
                      <p>{form.watch("tagline")}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">
                        Invitations Sent
                      </Label>
                      <p>{selectedStudents.length} students</p>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-3">
                  <Button asChild className="flex-1">
                    <a
                      href={`/group-formation${
                        createdGroupId ? `?id=${createdGroupId}` : ""
                      }`}
                    >
                      View My Group
                    </a>
                  </Button>
                  <Button variant="outline" asChild className="flex-1">
                    <a href="/">Go to Dashboard</a>
                  </Button>
                </div>
              </div>
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

                <Button
                  type={currentStep === 2 ? "submit" : "button"}
                  onClick={currentStep === 3 ? undefined : nextStep}
                  className="flex items-center gap-2"
                  disabled={isSubmitting}
                >
                  {currentStep === 2
                    ? isSubmitting
                      ? "Creating..."
                      : "Create Group"
                    : "Next"}
                  {currentStep < 2 && <ChevronRight className="h-4 w-4" />}
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
