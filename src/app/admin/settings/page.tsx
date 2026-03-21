"use client";

export default function SettingsPage() {
  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-gold text-xs uppercase tracking-[4px] font-light mb-6">Ajustes</h1>

      <div className="card p-5 mb-4">
        <h2 className="text-text-white text-sm font-medium mb-3">Clinica</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-text-muted">Nombre</span><span className="text-text-white">Capilex Madrid</span></div>
          <div className="flex justify-between"><span className="text-text-muted">CIF</span><span className="text-text-white">B16867491</span></div>
          <div className="flex justify-between"><span className="text-text-muted">Email recetas</span><span className="text-gold">recetas@capilexmadrid.es</span></div>
        </div>
      </div>

      <div className="card p-5 mb-4">
        <h2 className="text-text-white text-sm font-medium mb-3">Integraciones</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-text-muted">Telegram Bot</span>
            <span className={`text-xs ${process.env.NEXT_PUBLIC_SUPABASE_URL ? "text-success" : "text-text-muted"}`}>
              Configurado en .env
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-text-muted">OpenAI GPT-4o</span>
            <span className="text-success text-xs">Configurado en .env</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-text-muted">WhatsApp</span>
            <span className="text-text-muted text-xs">No configurado</span>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="text-text-white text-sm font-medium mb-3">Documentacion</h2>
        <div className="space-y-2">
          <a href="/docs/setup-telegram.html" target="_blank" className="block text-gold text-sm hover:underline">Setup Telegram →</a>
          <a href="/docs/deploy-vercel.html" target="_blank" className="block text-gold text-sm hover:underline">Deploy Vercel →</a>
          <a href="/docs/costes-telegram-whatsapp.html" target="_blank" className="block text-gold text-sm hover:underline">Costes comunicacion →</a>
          <a href="/docs/historias-de-usuario.html" target="_blank" className="block text-gold text-sm hover:underline">Historias de usuario →</a>
          <a href="/docs/casos-de-test.html" target="_blank" className="block text-gold text-sm hover:underline">Casos de test →</a>
        </div>
      </div>
    </div>
  );
}
