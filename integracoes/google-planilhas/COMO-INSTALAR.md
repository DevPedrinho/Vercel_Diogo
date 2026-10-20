# Google Planilhas como banco de dados

Presentes, confirmações de presença e recados ficam numa planilha do Google.
O site lê e grava nela por um pequeno script (Apps Script) publicado dentro
da própria planilha.

Planilha: **Casamento Vércia e Diogo - dados do site** (no Google Drive do Pedro).

## Instalar (uma vez só, ~5 minutos)

1. Abra a planilha → menu **Extensões → Apps Script**.
2. Apague o que estiver no editor e cole o conteúdo de [`Codigo.gs`](./Codigo.gs).
3. Na linha `var TOKEN = '…'`, cole o token combinado (o mesmo que está na
   Vercel em `GOOGLE_PLANILHA_TOKEN`). Salve (ícone de disquete).
4. No topo do editor, escolha a função **configurar** e clique em **Executar**.
   O Google pede autorização: escolha sua conta → *Avançado* → *Acessar
   (não seguro)* → *Permitir*. (O aviso aparece porque o script é seu e não
   foi publicado na loja do Google; ele só mexe nesta planilha.)
   Ao terminar, a planilha tem as abas **Presentes**, **Confirmações** e
   **Recados**.
5. **Implantar → Nova implantação** → engrenagem → **App da Web**.
   - Executar como: **Eu**
   - Quem pode acessar: **Qualquer pessoa**
   Clique em **Implantar** e copie a **URL do app da Web** (termina em `/exec`).
6. Na Vercel (projeto *casamento-vercia-diogo* → Settings → Environment
   Variables), crie `GOOGLE_PLANILHA_URL` com essa URL e faça um novo deploy.

"Qualquer pessoa" só significa que o site consegue chamar o script. Sem o
token, ele não lê nem grava nada.

> Se mudar o código do script depois, use **Implantar → Gerenciar
> implantações → editar → Nova versão**, para a URL continuar a mesma.

## Usar no dia a dia

**Aba Presentes** — é a lista que aparece no site (atualiza em até 1 minuto).

| coluna | o que pôr |
| --- | --- |
| imagem | Link da foto. Link de loja ou de foto do Google Drive compartilhada como *qualquer pessoa com o link*. |
| valor | Só o número: `450` ou `1250,50`. Vazio = valor livre. |
| ativo | `não` esconde o presente sem apagar a linha. |
| link | Opcional. Vazio = o convidado paga pelo PIX do casal. |

Não renomeie os cabeçalhos da primeira linha nem as abas.

**Aba Confirmações** — o formulário do site grava aqui sozinho. Pode filtrar e
ordenar à vontade; o painel do site (`/admin/confirmacoes`) mostra os totais.

**Aba Recados** — nome e recado de quem presenteou.
