"use client";

import * as React from "react";
import { Progress } from "@/src/components/ui/progress";
import AchievementsList from "./AchievementsList";
import { type Achievement } from "./AchievementCard";
import { Trophy, Flame, Star, Crown, Shield, Target, Medal, Heart, Sword, Book } from "lucide-react";

export default function AchievementsPage() {
  const achievements: Achievement[] = [
    { id: "1", name: "First Lesson", description: "Complete your first lesson", icon: <Trophy className="h-6 w-6" />, unlocked: true },
    { id: "2", name: "5-Day Streak", description: "Study for 5 days straight", icon: <Flame className="h-6 w-6" />, unlocked: true },
    { id: "3", name: "Rising Star", description: "Earn 500 XP", icon: <Star className="h-6 w-6" />, unlocked: true },
    { id: "4", name: "Champion", description: "Reach level 10", icon: <Crown className="h-6 w-6" />, unlocked: false },
    { id: "5", name: "Guardian", description: "Help a friend learn", icon: <Shield className="h-6 w-6" />, unlocked: false },
    { id: "6", name: "On Target", description: "Finish a unit perfectly", icon: <Target className="h-6 w-6" />, unlocked: true },
    { id: "7", name: "Medalist", description: "Win a weekly challenge", icon: <Medal className="h-6 w-6" />, unlocked: false },
    { id: "8", name: "Big Heart", description: "Give 10 kudos", icon: <Heart className="h-6 w-6" />, unlocked: true },
    { id: "9", name: "Sword Master", description: "Master 50 words", icon: <Sword className="h-6 w-6" />, unlocked: false },
    { id: "10", name: "Bookworm", description: "Read 10 articles", icon: <Book className="h-6 w-6" />, unlocked: true },
  ];

  const total = achievements.length;
  const unlocked = achievements.filter((a) => a.unlocked).length;
  const progress = Math.round((unlocked / total) * 100);

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
