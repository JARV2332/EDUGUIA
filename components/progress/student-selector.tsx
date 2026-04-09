"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Student } from "@/app/progress/page";

interface StudentSelectorProps {
  students: Student[];
  selectedStudent: Student | null;
  onSelectStudent: (student: Student) => void;
}

export function StudentSelector({
  students,
  selectedStudent,
  onSelectStudent,
}: StudentSelectorProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {students.map((student) => {
        const isSelected = selectedStudent ? student.id === selectedStudent.id : false;
        const avgProgress = Math.round(
          (student.currentProgress.social +
            student.currentProgress.academic +
            student.currentProgress.emotional) /
            3
        );

        return (
          <Card
            key={student.id}
            className={cn(
              "cursor-pointer transition-all hover:border-primary/50",
              isSelected && "border-primary bg-primary/5 ring-1 ring-primary"
            )}
            role="button"
            tabIndex={0}
            onClick={() => onSelectStudent(student)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelectStudent(student);
              }
            }}
            aria-pressed={isSelected}
            aria-label={`Select ${student.name}`}
          >
            <CardContent className="flex items-center gap-4 p-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {student.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{student.name}</h3>
                  <Badge
                    variant={avgProgress >= 70 ? "default" : avgProgress >= 50 ? "secondary" : "outline"}
                  >
                    {avgProgress}%
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {student.age} years old • {student.grade}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
