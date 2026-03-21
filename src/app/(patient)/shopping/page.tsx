"use client";

import { useState } from "react";
import { SHOPPING_LIST } from "@/lib/constants/shopping";

export default function ShoppingPage() {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toggle = (name: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const essentials = SHOPPING_LIST.filter((i) => i.category === "essential");
  const recommended = SHOPPING_LIST.filter((i) => i.category === "recommended");
  const allChecked = SHOPPING_LIST.every((i) => checked.has(i.name));

  return (
    <div className="max-w-lg mx-auto px-4 py-4">
      <h1 className="text-gold text-xs uppercase tracking-[3px] font-light mb-1">
        Lista de compras
      </h1>
      <p className="text-text-muted text-sm mb-4">
        Tenlo todo preparado antes de la intervencion
      </p>

      {allChecked && (
        <div className="card p-3 mb-4 border-l-2 border-l-success bg-success-bg">
          <p className="text-success text-sm font-medium">
            ✓ Tienes todo listo!
          </p>
        </div>
      )}

      {/* Progress */}
      <div className="card p-3 mb-4">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-text-muted">Progreso</span>
          <span className="text-gold">
            {checked.size}/{SHOPPING_LIST.length}
          </span>
        </div>
        <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
          <div
            className="h-full bg-gold rounded-full transition-all duration-500"
            style={{
              width: `${(checked.size / SHOPPING_LIST.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Essentials */}
      <h2 className="text-text-muted text-[10px] uppercase tracking-wider mb-2">
        Imprescindibles
      </h2>
      <div className="space-y-2 mb-6">
        {essentials.map((item) => (
          <button
            key={item.name}
            onClick={() => toggle(item.name)}
            className={`w-full text-left card p-3.5 flex gap-3 items-center transition-all
              ${checked.has(item.name) ? "opacity-50" : ""}
              border-l-2 border-l-gold-border`}
          >
            <div
              className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition-colors
                ${checked.has(item.name) ? "bg-gold border-gold" : "border-gold-border"}`}
            >
              {checked.has(item.name) && (
                <span className="text-black text-xs font-bold">✓</span>
              )}
            </div>
            <span className="text-lg">{item.icon}</span>
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-medium ${
                  checked.has(item.name) ? "line-through text-text-muted" : "text-text-white"
                }`}
              >
                {item.name}
              </p>
              <p className="text-xs text-text-muted">{item.description}</p>
            </div>
            <span className="text-[10px] text-gold-dim flex-shrink-0">
              {item.whereToBuy}
            </span>
          </button>
        ))}
      </div>

      {/* Recommended */}
      <h2 className="text-text-muted text-[10px] uppercase tracking-wider mb-2">
        Recomendados
      </h2>
      <div className="space-y-2">
        {recommended.map((item) => (
          <button
            key={item.name}
            onClick={() => toggle(item.name)}
            className={`w-full text-left card p-3.5 flex gap-3 items-center transition-all
              ${checked.has(item.name) ? "opacity-50" : ""}
              border-l-2 border-l-[#333]`}
          >
            <div
              className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition-colors
                ${checked.has(item.name) ? "bg-gold border-gold" : "border-[#444]"}`}
            >
              {checked.has(item.name) && (
                <span className="text-black text-xs font-bold">✓</span>
              )}
            </div>
            <span className="text-lg">{item.icon}</span>
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-medium ${
                  checked.has(item.name) ? "line-through text-text-muted" : "text-text-white"
                }`}
              >
                {item.name}
              </p>
              <p className="text-xs text-text-muted">{item.description}</p>
            </div>
            <span className="text-[10px] text-text-muted flex-shrink-0">
              {item.whereToBuy}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
