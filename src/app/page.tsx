import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-bg">
      <div className="text-center p-10">
        <Image
          src="/logo-capilex.png"
          alt="Capilex Madrid"
          width={220}
          height={117}
          className="mx-auto mb-8"
          priority
        />
        <h1 className="text-3xl font-light text-gold tracking-[4px] uppercase mb-2">
          Trasplante Capilar
        </h1>
        <p className="text-text-muted text-sm tracking-[2px]">
          Aplicacion de acompanamiento al paciente
        </p>
        <div className="mt-10 flex gap-4 justify-center">
          <a
            href="/login"
            className="px-8 py-3 bg-gold text-black font-semibold rounded hover:opacity-90 transition-opacity"
          >
            Acceso Paciente
          </a>
          <a
            href="/admin/login"
            className="px-8 py-3 border border-gold-border text-gold rounded hover:bg-gold-subtle transition-colors"
          >
            Panel Clinica
          </a>
        </div>
      </div>
    </div>
  );
}
