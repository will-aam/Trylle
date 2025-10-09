"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { cn } from "@/src/lib/utils";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
}

interface AchievementCardProps {
  achievement: Achievement;
  className?: string;
}

export function AchievementCard({ achievement, className }: AchievementCardProps) {
  const { name, description, icon, unlocked } = achievement;

  return (
    <Card className={cn(!unlocked && "grayscale opacity-50", className)}>
      <CardHeader className="items-center text-center">
        <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
          {icon}
        </div>
        <CardTitle className="text-base">{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent />
      <CardFooter className="justify-center">
        <Badge variant={unlocked ? "default" : "secondary"}>
          {unlocked ? "Unlocked" : "Locked"}
        </Badge>
      </CardFooter>
    </Card>
  );
}

export default AchievementCard;
