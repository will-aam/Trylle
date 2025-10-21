"use client";

import { useState } from "react";

const categories = ["Todos", "Relaxar", "Triste", "Festa", "Romance", "Treino"];

export function CategoryFilters() {
  const [activeCategory, setActiveCategory] = useState("Todos");

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => setActiveCategory(category)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeCategory === category
              ? "bg-emerald-500 text-white"
              : "bg-white/5 text-gray-300 hover:bg-white/10"
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
