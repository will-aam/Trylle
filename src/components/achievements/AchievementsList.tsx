"use client";

import * as React from "react";
import AchievementCard, { type Achievement } from "./AchievementCard";

interface AchievementsListProps {
  achievements: Achievement[];
  className?: string;
}

export function AchievementsList({ achievements, className }: AchievementsListProps) {
  return (
    <div className={"grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 " + (className ?? "") }>
      {achievements.map((a) => (
        <AchievementCard key={a.id} achievement={a} />
      ))}
    </div>
  );
}

export default AchievementsList;
