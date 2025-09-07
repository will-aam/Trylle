"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/src/lib/supabase-client";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Play, Users, Star, TrendingUp } from "lucide-react";
import { Skeleton } from "../../ui/skeleton";
import { getUserCount } from "@/src/app/admin/actions"; // 1. Importa a Server Action

export function AdminStats() {
  // O cliente Supabase aqui é o cliente seguro para o navegador (anon key)
  const supabase = createClient();
  const [episodeCount, setEpisodeCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);

      // Array para aguardar todas as buscas de dados
      const promises = [];

      // Promessa para buscar o total de episódios
      promises.push(
        supabase
          .from("episodes")
          .select("*", { count: "exact", head: true })
          .then(({ count, error }) => {
            if (error) console.error("Erro ao buscar episódios:", error);
            else setEpisodeCount(count || 0);
          })
      );

      // Promessa para buscar o total de usuários usando a Server Action
      promises.push(
        getUserCount().then((count) => {
          setUserCount(count);
        })
      );

      // Aguarda todas as buscas terminarem
      await Promise.all(promises);

      setLoading(false);
    };

    fetchStats();
  }, [supabase]);

  const stats = [
    {
      title: "Total de Episódios",
      value: episodeCount.toString(),
      change: "+12%",
      icon: Play,
      color: "text-blue-600",
      isLoading: loading,
    },
    {
      title: "Total de Usuários", // 2. Texto corrigido
      value: userCount.toString(),
      change: "+8%",
      icon: Users,
      color: "text-green-600",
      isLoading: loading,
    },
    {
      title: "Avaliação Média",
      value: "4.8",
      change: "+0.2",
      icon: Star,
      color: "text-yellow-600",
      isLoading: false, // Estático
    },
    {
      title: "Horas Ouvidas",
      value: "123,456",
      change: "+15%",
      icon: TrendingUp,
      color: "text-purple-600",
      isLoading: false, // Estático
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
            ) : (
              <>
                <div className="text-2xl font-bold">{stat.value}</div>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
