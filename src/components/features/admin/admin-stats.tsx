// src/components/features/admin/admin-stats.tsx
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/src/lib/supabase-client";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Play, Users, Database, Cloud } from "lucide-react";
import { Skeleton } from "../../ui/skeleton";
import { Progress } from "../../ui/progress"; // Importe o componente de progresso
import { getUserCount } from "@/src/app/admin/actions";

interface StorageStats {
  usage: string;
  limit: string;
  usagePercentage: number;
}

export function AdminStats() {
  const supabase = createClient();
  const [episodeCount, setEpisodeCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [supabaseStorage, setSupabaseStorage] = useState<StorageStats | null>(
    null
  );
  const [cloudflareStorage, setCloudflareStorage] =
    useState<StorageStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);

      const promises = [
        supabase
          .from("episodes")
          .select("*", { count: "exact", head: true })
          .then(({ count, error }) => {
            if (error) console.error("Erro ao buscar episódios:", error);
            else setEpisodeCount(count || 0);
          }),
        getUserCount().then((count) => {
          setUserCount(count);
        }),
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

    fetchStats();
  }, [supabase]);

  const stats = [
    {
      title: "Total de Episódios",
      value: episodeCount.toString(),
      icon: Play,
      color: "text-blue-600",
      isLoading: loading,
    },
    {
      title: "Total de Usuários",
      value: userCount.toString(),
      icon: Users,
      color: "text-green-600",
      isLoading: loading,
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
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
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
