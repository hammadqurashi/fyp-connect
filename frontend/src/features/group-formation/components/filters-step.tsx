import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Badge } from "@/shared/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/shared/components/ui/form";

interface FiltersStepProps {
  form: UseFormReturn<any>;
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

const skillOptions = [
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

const interestOptions = [
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

export const FiltersStep: React.FC<FiltersStepProps> = ({ form }) => {
  const selectedSkills = form.watch("skills") || [];
  const selectedInterests = form.watch("interests") || [];

  const toggleSkill = (skill: string) => {
    const currentSkills = form.getValues("skills") || [];
    const newSkills = currentSkills.includes(skill)
      ? currentSkills.filter((s: string) => s !== skill)
      : [...currentSkills, skill];
    form.setValue("skills", newSkills);
  };

  const toggleInterest = (interest: string) => {
    const currentInterests = form.getValues("interests") || [];
    const newInterests = currentInterests.includes(interest)
      ? currentInterests.filter((i: string) => i !== interest)
      : [...currentInterests, interest];
    form.setValue("interests", newInterests);
  };

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="department"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Department</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select department to filter by" />
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

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="minCreditHours"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Min Credit Hours</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="e.g., 60"
                  {...field}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="maxCreditHours"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Max Credit Hours</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="e.g., 120"
                  {...field}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div>
        <Label>Skills (Select to filter by)</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {skillOptions.map((skill) => (
            <Badge
              key={skill}
              variant={selectedSkills.includes(skill) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleSkill(skill)}
            >
              {skill}
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <Label>Interests (Select to filter by)</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {interestOptions.map((interest) => (
            <Badge
              key={interest}
              variant={
                selectedInterests.includes(interest) ? "default" : "outline"
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
  );
};

