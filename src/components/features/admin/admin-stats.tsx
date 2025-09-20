// src/components/features/admin/admin-stats.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Play, Users, Database, Cloud } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Skeleton } from "../../ui/skeleton";
import { Progress } from "../../ui/progress";

interface StorageStats {
  usage: string;
  limit: string;
  usagePercentage: number;
}

interface AdminStatsProps {
  episodeCount: number;
  userCount: number;
}

interface StatItem {
  title: string;
  value?: string;
  storage?: StorageStats | null;
  icon: LucideIcon; // ou React.ElementType
  color: string;
  isLoading: boolean;
}

export function AdminStats({ episodeCount, userCount }: AdminStatsProps) {
  const [supabaseStorage, setSupabaseStorage] = useState<StorageStats | null>(
    null
  );
  const [cloudflareStorage, setCloudflareStorage] =
    useState<StorageStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStorageStats = async () => {
      setLoading(true);
      const promises = [
        fetch("/api/monitoring/supabase")
          .then((res) => res.json())
          .then((data) => setSupabaseStorage(data)),
        fetch("/api/monitoring/cloudflare")
          .then((res) => res.json())
          .then((data) => setCloudflareStorage(data)),
      ];
      await Promise.all(promises);
      setLoading(false);
    };

    fetchStorageStats();
  }, []);

  const stats = [
    {
      title: "Total de Episódios",
      value: episodeCount.toString(),
      icon: Play,
      color: "stroke-blue-600",
      isLoading: false,
    },
    {
      title: "Total de Usuários",
      value: userCount.toString(),
      icon: Users,
      color: "text-green-600",
      isLoading: false,
    },
    {
      title: "Uso do Banco (Supabase)",
      storage: supabaseStorage,
      icon: Database,
      color: "text-indigo-600",
      isLoading: loading,
    },
    {
      title: "Uso do Armazenamento (R2)",
      storage: cloudflareStorage,
      icon: Cloud,
      color: "text-orange-600",
      isLoading: loading,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 stroke-[2px] ${stat.color}`} />
          </CardHeader>
          <CardContent>
            {stat.isLoading ? (
              <>
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-4 w-32" />
              </>
            ) : stat.storage ? (
              <div className="space-y-2">
                <div className="text-2xl font-bold">{stat.storage.usage}</div>
                <p className="text-xs text-muted-foreground">
                  de {stat.storage.limit} (Plano Gratuito)
                </p>
                <Progress
                  value={stat.storage.usagePercentage}
                  className="h-2"
                />
              </div>
            ) : (
              <div className="text-2xl font-bold">{stat.value}</div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
