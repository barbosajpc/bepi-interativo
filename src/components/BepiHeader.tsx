import seplanLogo from "@/assets/logo_pi.png";

interface BepiHeaderProps {
  onToggleSidebar: () => void;
}

export function BepiHeader({ onToggleSidebar }: BepiHeaderProps) {
  return (
    <header className="h-14 bg-header text-header-foreground flex items-center px-4 gap-3 shrink-0">
      {/* Menu */}
      <button
        onClick={onToggleSidebar}
        className="p-1.5 hover:bg-primary/20 rounded transition-colors"
        aria-label="Menu"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Título */}
      <h1 className="text-lg font-heading font-bold tracking-wide">
        BEPI Interativo
      </h1>

      {/* Logo empurrada para a direita */}
      <img
        src={seplanLogo}
        alt="SEPLAN"
        className="h-14 max-w-[200px] object-contain ml-auto"
      />
    </header>
  );
}