"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Inicio", icon: "🏠" },
  { href: "/checklist", label: "Tareas", icon: "✅" },
  { href: "/photos", label: "Fotos", icon: "📸" },
  { href: "/chat", label: "Chat", icon: "💬" },
  { href: "/emergency", label: "Ayuda", icon: "🆘" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black border-t border-[#1a1a1a]">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-colors
                ${isActive
                  ? "text-gold"
                  : "text-text-muted hover:text-text"
                }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px] font-medium tracking-wide">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
