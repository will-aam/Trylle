"use client";

import * as React from "react";
import { Progress } from "@/src/components/ui/progress";
import AchievementsList from "./AchievementsList";
import { type Achievement } from "./AchievementCard";

interface AchievementsPageProps {
  achievements: Achievement[];
}

export default function AchievementsPage({ achievements }: AchievementsPageProps) {
  const total = achievements.length;
  const unlocked = achievements.filter((a) => a.unlocked).length;
  const progress = total > 0 ? Math.round((unlocked / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">My Achievements</h1>

      <section>
        <p className="mb-2 text-sm text-muted-foreground">
          You have unlocked {unlocked} out of {total} achievements.
        </p>
        <Progress value={progress} />
      </section>

      <section>
        <AchievementsList achievements={achievements} />
      </section>
    </div>
  );
}
