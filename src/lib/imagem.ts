/**
 * Compressão da foto antes do upload.
 *
 * Fotos de celular e de loja chegam com vários MB. Redimensionamos e
 * recodificamos para JPEG no próprio navegador — a foto do presente sobe
 * leve e a lista abre rápido no 4G.
 */

const LADO_MAXIMO = 1600;
const QUALIDADE = 0.82;
/** Acima disso o arquivo é recusado antes mesmo de tentar comprimir. */
export const TAMANHO_MAXIMO_ORIGINAL = 25 * 1024 * 1024;

export type FotoPronta = {
  arquivo: Blob;
  largura: number;
  altura: number;
  previa: string;
};

/** Lê o arquivo como imagem, respeitando a orientação gravada pela câmera. */
async function carregarImagem(arquivo: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    try {
      // imageOrientation resolve a foto "deitada" tirada na vertical.
      return await createImageBitmap(arquivo, { imageOrientation: "from-image" });
    } catch {
      // Navegador sem suporte à opção: cai no caminho abaixo.
    }
  }

  const url = URL.createObjectURL(arquivo);
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Não foi possível ler a imagem."));
      img.src = url;
    });
  } finally {
    // Só liberamos depois que o onload já leu os pixels.
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  }
}

export async function comprimirFoto(arquivo: File): Promise<FotoPronta> {
  if (!arquivo.type.startsWith("image/")) {
    throw new Error("Escolha uma imagem.");
  }
  if (arquivo.size > TAMANHO_MAXIMO_ORIGINAL) {
    throw new Error("Essa foto é muito pesada. Tente uma com menos de 25 MB.");
  }

  const fonte = await carregarImagem(arquivo);
  const larguraOriginal = "width" in fonte ? fonte.width : 0;
  const alturaOriginal = "height" in fonte ? fonte.height : 0;

  if (!larguraOriginal || !alturaOriginal) {
    throw new Error("Não foi possível ler a imagem.");
  }

  // Só encolhe; foto pequena não é ampliada.
  const escala = Math.min(1, LADO_MAXIMO / Math.max(larguraOriginal, alturaOriginal));
  const largura = Math.round(larguraOriginal * escala);
  const altura = Math.round(alturaOriginal * escala);

  const canvas = document.createElement("canvas");
  canvas.width = largura;
  canvas.height = altura;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Não foi possível processar a imagem.");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(fonte as CanvasImageSource, 0, 0, largura, altura);

  if ("close" in fonte && typeof fonte.close === "function") fonte.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", QUALIDADE),
  );
  if (!blob) throw new Error("Não foi possível processar a imagem.");

  return {
    arquivo: blob,
    largura,
    altura,
    previa: canvas.toDataURL("image/jpeg", 0.5),
  };
}
