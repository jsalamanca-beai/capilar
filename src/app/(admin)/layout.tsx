"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/admin/patients", label: "Pacientes", icon: "👥" },
  { href: "/admin/codes", label: "Codigos", icon: "🔑" },
  { href: "/admin/settings", label: "Ajustes", icon: "⚙️" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-bg">
      {/* Sidebar */}
      <aside className="w-56 bg-black border-r border-[#1a1a1a] flex flex-col flex-shrink-0 hidden md:flex">
        <div className="p-4 border-b border-[#1a1a1a]">
          <Image src="/logo-capilex.png" alt="Capilex" width={120} height={64} className="opacity-80" />
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
        <div className="p-4 border-t border-[#1a1a1a]">
          <Link href="/" className="text-text-muted text-xs hover:text-gold transition-colors">
            ← Volver a la app
          </Link>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-black border-b border-[#1a1a1a] px-4 py-2 flex items-center justify-between">
        <Image src="/logo-capilex.png" alt="Capilex" width={80} height={43} />
        <div className="flex gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`p-2 rounded text-lg ${pathname.startsWith(item.href) ? "bg-gold-subtle" : ""}`}
            >
              {item.icon}
            </Link>
          ))}
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto md:p-0 pt-14 md:pt-0">
        {children}
      </main>
    </div>
  );
}
