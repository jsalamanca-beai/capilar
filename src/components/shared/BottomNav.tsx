"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Hoy", icon: "🏠" },
  { href: "/checklist", label: "Tareas", icon: "✅" },
  { href: "/photos", label: "Fotos", icon: "📸" },
  { href: "/chat", label: "Chat", icon: "💬" },
  { href: "/medications", label: "Medicacion", icon: "💊" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-t border-[#1a1a1a]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg
                transition-colors min-w-0 flex-1
                ${isActive ? "text-gold" : "text-[#555] hover:text-[#888]"}`}
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-gold rounded-b" />
              )}
              <span className="text-xl leading-none">{item.icon}</span>
              <span className="text-[9px] font-medium tracking-wide leading-none truncate w-full text-center">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
