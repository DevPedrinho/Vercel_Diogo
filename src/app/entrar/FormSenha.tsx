"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Aviso, Rotulo } from "@/components/Formulario";
import { Botao } from "@/components/Botao";
import { Aquarela, Divisor, Selo } from "@/components/Ornamentos";

/** Login do painel só com senha, para quando o site roda com a planilha. */
export function FormSenha({ semSenha }: { semSenha: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const pedido = params.get("proximo") ?? "/admin";
  const proximo = pedido.startsWith("/") && !pedido.startsWith("//") ? pedido : "/admin";

  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    const ok = await fetch("/api/entrar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senha }),
    })
      .then((r) => r.ok)
      .catch(() => false);
    if (!ok) {
      setErro("Senha incorreta.");
      setEnviando(false);
      return;
    }
    router.push(proximo);
    router.refresh();
  }

  return (
    <main className="papel relative flex min-h-svh items-center justify-center overflow-hidden px-5 py-16">
      <Aquarela id="aq-senha-1" className="pointer-events-none absolute -top-4 -right-4 w-[60vw] max-w-[460px]" />
      <Aquarela id="aq-senha-2" canto="base-esquerda" className="pointer-events-none absolute -bottom-4 -left-4 w-[55vw] max-w-[420px]" />

      <div className="relative w-full max-w-md border border-ouro/40 bg-papel-claro px-7 py-12 shadow-xl sm:px-10">
        <Selo className="mx-auto w-16" />
        <h1 className="titulo-serif versalete mt-6 text-center text-2xl text-marinho">Painel dos noivos</h1>
        <Divisor className="mt-5" />

        {semSenha ? (
          <Aviso tipo="info">
            O painel está fechado até a senha ser definida. Na Vercel, crie a variável <strong>ADMIN_SENHA</strong> e
            publique de novo.
          </Aviso>
        ) : (
          <form onSubmit={enviar} className="mt-8 space-y-5">
            {erro && <Aviso tipo="erro">{erro}</Aviso>}
            <div>
              <Rotulo htmlFor="senha">Senha</Rotulo>
              <input
                id="senha"
                type="password"
                required
                autoFocus
                autoComplete="current-password"
                className="campo"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
            </div>
            <Botao type="submit" disabled={enviando} className="w-full">
              {enviando ? "Entrando…" : "Entrar"}
            </Botao>
          </form>
        )}

        <p className="mt-8 text-center">
          <Link href="/" className="inline-flex min-h-11 items-center text-sm text-azul underline underline-offset-4">
            Voltar para o site
          </Link>
        </p>
      </div>
    </main>
  );
}
