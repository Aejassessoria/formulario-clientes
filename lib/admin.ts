/**
 * Funções de acesso ao banco para o painel administrativo.
 *
 * Se a tabela ainda não tiver as colunas status e criado_em, rode no Neon:
 *
 *   ALTER TABLE formulario_clientes
 *     ADD COLUMN IF NOT EXISTS status     VARCHAR(20)  DEFAULT 'novo',
 *     ADD COLUMN IF NOT EXISTS criado_em  TIMESTAMPTZ  DEFAULT NOW();
 */

import { pool } from '@/lib/db';

// ─── TIPOS ────────────────────────────────────────────────────────────────────

export type StatusValido = 'novo' | 'em_andamento' | 'concluido';

export type Solicitacao = {
  id: string;
  nome_empresa: string | null;
  cnpj: string | null;
  nome_responsavel: string | null;
  email: string | null;
  telefone: string | null;
  status: StatusValido;
  criado_em: string;
  payload: Record<string, unknown>;
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────

/** Retorna o nome da empresa: coluna dedicada ou payload.razao_social. */
export function nomeEmpresa(row: Solicitacao): string {
  return (
    row.nome_empresa ||
    (row.payload?.razao_social as string) ||
    '—'
  );
}

/** Retorna o e-mail: coluna dedicada ou campos do payload. */
export function emailContato(row: Solicitacao): string {
  return (
    row.email ||
    (row.payload?.resp_email as string) ||
    (row.payload?.cnpj_email as string) ||
    '—'
  );
}

/** Retorna o telefone: coluna dedicada ou campos do payload. */
export function telefoneContato(row: Solicitacao): string {
  return (
    row.telefone ||
    (row.payload?.resp_tel as string) ||
    (row.payload?.cnpj_telefone as string) ||
    '—'
  );
}

/** Retorna o nome do responsável: coluna dedicada ou payload.resp_nome. */
export function nomeResponsavel(row: Solicitacao): string {
  return (
    row.nome_responsavel ||
    (row.payload?.resp_nome as string) ||
    '—'
  );
}

// ─── QUERIES ──────────────────────────────────────────────────────────────────

/** Lista todas as solicitações, da mais recente para a mais antiga. */
export async function listarSolicitacoes(): Promise<Solicitacao[]> {
  const { rows } = await pool.query<Solicitacao>(`
    SELECT
      id, nome_empresa, cnpj, nome_responsavel,
      email, telefone, status, criado_em, payload
    FROM formulario_clientes
    ORDER BY criado_em DESC
  `);
  return rows;
}

/** Busca uma solicitação pelo id (UUID). Retorna null se não encontrada. */
export async function buscarSolicitacao(id: string): Promise<Solicitacao | null> {
  const { rows } = await pool.query<Solicitacao>(`
    SELECT
      id, nome_empresa, cnpj, nome_responsavel,
      email, telefone, status, criado_em, payload
    FROM formulario_clientes
    WHERE id = $1
  `, [id]);
  return rows[0] ?? null;
}

/** Atualiza o status de uma solicitação (UUID). */
export async function atualizarStatus(id: string, status: StatusValido): Promise<void> {
  await pool.query(`
    UPDATE formulario_clientes SET status = $1 WHERE id = $2
  `, [status, id]);
}

/** Contagem por status (para os cards de resumo). */
export async function contarPorStatus(): Promise<Record<string, number>> {
  const { rows } = await pool.query<{ status: string; total: string }>(`
    SELECT status, COUNT(*)::text AS total
    FROM formulario_clientes
    GROUP BY status
  `);
  const contagem: Record<string, number> = { novo: 0, em_andamento: 0, concluido: 0 };
  for (const row of rows) {
    contagem[row.status] = parseInt(row.total, 10);
  }
  return contagem;
}

export type Rascunho = {
  id: string;
  nome: string | null;
  email: string | null;
  telefone: string | null;
  criado_em: string;
};

export async function listarRascunhos(): Promise<Rascunho[]> {
  const { rows } = await pool.query<Rascunho>(
    'SELECT id, nome, email, telefone, criado_em FROM rascunhos ORDER BY criado_em DESC'
  );
  return rows;
}
