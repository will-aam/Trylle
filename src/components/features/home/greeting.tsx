// src/components/features/home/greeting.tsx
"use client";

export function Greeting() {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia!";
    if (hour < 18) return "Boa tarde!";
    return "Boa noite!";
  };

  return (
    <div className="space-y-2">
      <h1 className="text-2xl md:text-3xl font-bold text-foreground">
        {getGreeting()}
      </h1>
    </div>
  );
}
