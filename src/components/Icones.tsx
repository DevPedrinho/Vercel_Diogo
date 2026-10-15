const CAMINHOS = {
  calendario: (
    <>
      <rect x="3.5" y="5" width="17" height="15" rx="1.5" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" />
    </>
  ),
  relogio: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  local: (
    <>
      <path d="M12 21s-6.5-6.1-6.5-11.2A6.5 6.5 0 0 1 12 3.3a6.5 6.5 0 0 1 6.5 6.5C18.5 14.9 12 21 12 21Z" />
      <circle cx="12" cy="9.8" r="2.4" />
    </>
  ),
  taca: (
    <>
      <path d="M8 3h8l-.6 5.2A3.4 3.4 0 0 1 12 11.3a3.4 3.4 0 0 1-3.4-3.1L8 3ZM12 11.3V20M8.5 20.5h7" />
    </>
  ),
  presente: (
    <>
      <rect x="3.5" y="8.5" width="17" height="4" rx="0.8" />
      <path d="M5 12.5v8h14v-8M12 8.5v12M12 8.5S10.8 4 8.3 4.4C6.5 4.7 6.7 7.6 8.7 8.1 10 8.5 12 8.5 12 8.5Zm0 0s1.2-4.5 3.7-4.1c1.8.3 1.6 3.2-.4 3.7-1.3.4-3.3.4-3.3.4Z" />
    </>
  ),
  musica: (
    <>
      <path d="M9 17.5V5.5l10-2v12" />
      <circle cx="6.5" cy="17.5" r="2.5" />
      <circle cx="16.5" cy="15.5" r="2.5" />
    </>
  ),
  texto: (
    <>
      <path d="M5 5h14M12 5v14M8.5 19h7" />
    </>
  ),
  casa: (
    <>
      <path d="M4 11 12 4l8 7M6 9.5V20h12V9.5" />
    </>
  ),
  sair: (
    <>
      <path d="M14 4h5v16h-5M10 8l-4 4 4 4M6 12h10" />
    </>
  ),
  olho: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.8" />
    </>
  ),
  recado: (
    <>
      <path d="M4 5h16v11H9l-5 4V5Z" />
    </>
  ),
  coracao: <path d="M12 19.5 4.6 12.2C2.5 10.1 2.6 6.7 4.8 4.8a4.8 4.8 0 0 1 6.8.4l.4.5.4-.5a4.8 4.8 0 0 1 6.8-.4c2.2 1.9 2.3 5.3.2 7.4L12 19.5Z" />,
  pessoas: (
    <>
      <circle cx="9" cy="8" r="3" />
      <circle cx="16.5" cy="9" r="2.5" />
      <path d="M3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5M14.5 14.3c.6-.2 1.3-.3 2-.3 2.3 0 4 1.6 4.5 4.5" />
    </>
  ),
  seta_cima: <path d="M12 19V5M6 11l6-6 6 6" />,
  seta_baixo: <path d="M12 5v14M6 13l6 6 6-6" />,
  fechar: <path d="M6 6l12 12M18 6 6 18" />,
  imagem: (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" rx="1.5" />
      <circle cx="9" cy="10" r="1.8" />
      <path d="m4 18 5-5 4 4 3-3 4 4" />
    </>
  ),
} as const;

export type NomeIcone = keyof typeof CAMINHOS;

export function Icone({ nome, className = "h-5 w-5" }: { nome: NomeIcone; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {CAMINHOS[nome]}
    </svg>
  );
}
