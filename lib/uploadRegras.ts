/**
 * Regras de aceitação de anexo, usadas pelo formulário e pela rota de upload.
 *
 * Ficam em um arquivo só de propósito: se o limite mudar em um lado e não no
 * outro, o cliente recebe "pode enviar" e o servidor recusa, ou pior, o
 * contrário.
 */

/**
 * A Vercel corta o corpo da requisição em 4,5 MB antes do código rodar, então
 * um limite maior nunca seria alcançado: o cliente veria um erro de plataforma,
 * sem explicação. 4 MB deixa margem para o overhead do multipart.
 */
export const TAMANHO_MAXIMO = 4 * 1024 * 1024;

export const TIPOS_ACEITOS = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
];

/** Alguns navegadores e celulares mandam o tipo vazio; aí vale a extensão. */
export const EXTENSOES_ACEITAS = ['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif'];

/** Para o atributo accept do input file. */
export const ACCEPT = EXTENSOES_ACEITAS.join(',');

export function emMB(bytes: number): string {
  return (bytes / 1024 / 1024).toFixed(1).replace('.', ',');
}

export function tipoPermitido(nome: string, tipo: string): boolean {
  if (tipo && TIPOS_ACEITOS.includes(tipo)) return true;
  const minusculo = nome.toLowerCase();
  return EXTENSOES_ACEITAS.some(ext => minusculo.endsWith(ext));
}

/**
 * Devolve a mensagem de recusa, ou null quando o arquivo pode ser enviado.
 * Recebe valores soltos em vez de um File para poder ser testada fora do navegador.
 */
export function validarArquivo(nome: string, tamanho: number, tipo: string): string | null {
  if (tamanho === 0) {
    return `O arquivo "${nome}" está vazio.`;
  }
  if (tamanho > TAMANHO_MAXIMO) {
    return `O arquivo "${nome}" tem ${emMB(tamanho)} MB e o limite é ${emMB(TAMANHO_MAXIMO)} MB.`;
  }
  if (!tipoPermitido(nome, tipo)) {
    return `O arquivo "${nome}" não é um tipo aceito. Envie PDF, JPG, PNG ou HEIC.`;
  }
  return null;
}
