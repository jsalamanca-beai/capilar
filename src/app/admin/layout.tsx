"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useTheme } from "@/lib/theme/ThemeProvider";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/admin/patients", label: "Pacientes", icon: "👥" },
  { href: "/admin/codes", label: "Codigos", icon: "🔑" },
  { href: "/admin/settings", label: "Ajustes", icon: "⚙️" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-bg">
      {/* Sidebar */}
      <aside className="w-56 bg-black border-r border-[#1a1a1a] flex flex-col flex-shrink-0 hidden md:flex">
        <div className="p-4 border-b border-[#1a1a1a]">
          <Image src="/logo-capilex.png" alt="Capilex" width={120} height={64} className="opacity-80 logo-dark" />
          <p className="text-[9px] text-gold-dim uppercase tracking-widest mt-2">Panel Clinica</p>
        </div>
        <nav className="flex-1 py-3">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors
                  ${isActive
                    ? "text-gold bg-gold-subtle border-r-2 border-r-gold"
                    : "text-text-muted hover:text-text hover:bg-[#111]"
                  }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-[#1a1a1a] space-y-2">
          <button
            onClick={toggle}
            className="text-text-muted text-xs hover:text-gold transition-colors flex items-center gap-2"
          >
            {theme === "dark" ? "☀️ Modo claro" : "🌙 Modo oscuro"}
          </button>
          <Link href="/" className="text-text-muted text-xs hover:text-gold transition-colors block">
            ← Volver a la app
          </Link>
          <button
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              localStorage.removeItem("staff_user");
              window.location.href = "/";
            }}
            className="text-text-muted text-xs hover:text-danger transition-colors"
          >
            Cerrar sesion
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-black border-b border-[#1a1a1a] px-4 py-2 flex items-center justify-between">
        <Image src="/logo-capilex.png" alt="Capilex" width={80} height={43} className="logo-dark" />
        <div className="flex gap-1 items-center">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`p-2 rounded text-lg ${pathname.startsWith(item.href) ? "bg-gold-subtle" : ""}`}
            >
              {item.icon}
            </Link>
          ))}
          <button
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              localStorage.removeItem("staff_user");
              window.location.href = "/";
            }}
            className="p-2 rounded text-text-muted hover:text-danger transition-colors ml-1"
            aria-label="Cerrar sesion"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto md:p-0 pt-14 md:pt-0">
        {children}
      </main>
    </div>
  );
}
