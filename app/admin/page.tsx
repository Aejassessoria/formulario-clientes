import Link from 'next/link';
import LogoutButton from './LogoutButton';
import DeleteRowButton from './DeleteRowButton';
import {
  listarSolicitacoes,
  listarRascunhos,
  contarPorStatus,
  nomeEmpresa,
  emailContato,
  telefoneContato,
  type Solicitacao,
  type Rascunho,
} from '@/lib/admin';

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  novo:         'Novo',
  em_andamento: 'Em andamento',
  concluido:    'Concluído',
};

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  novo:          { bg: '#e1f5ee', color: '#085041' },
  em_andamento:  { bg: '#faeeda', color: '#633806' },
  concluido:     { bg: '#eaf3de', color: '#27500a' },
};

const TIPO_COLORS: Record<string, { bg: string; color: string }> = {
  MEI:    { bg: '#eaf3de', color: '#27500a' },
  LTDA:   { bg: '#e1f5ee', color: '#085041' },
  SA:     { bg: '#faeeda', color: '#633806' },
  Outro:  { bg: 'var(--off2)', color: 'var(--dark)' },
};

function formatarData(dataStr: string): string {
  try {
    const d = new Date(new Date(dataStr).getTime() - 3 * 60 * 60 * 1000);
    const p = (n: number) => String(n).padStart(2, '0');
    return `${p(d.getUTCDate())}/${p(d.getUTCMonth() + 1)}/${d.getUTCFullYear()}, ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}`;
  } catch {
    return dataStr;
  }
}

function TabelaRascunhos({ rows }: { rows: Rascunho[] }) {
  if (rows.length === 0) {
    return <div className="empty">Nenhum rascunho encontrado.</div>;
  }
  return (
    <table className="rtbl">
      <thead>
        <tr>
          <th>#</th>
          <th>Nome</th>
          <th>E-mail</th>
          <th>Telefone</th>
          <th>Iniciado em</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            <td style={{ color: 'var(--muted)', fontSize: 11, width: 40 }}>
              {row.id.slice(0, 8)}…
            </td>
            <td>{row.nome || '—'}</td>
            <td style={{ fontSize: 12, color: 'var(--muted)' }}>{row.email || '—'}</td>
            <td style={{ fontSize: 12, color: 'var(--muted)' }}>{row.telefone || '—'}</td>
            <td style={{ fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
              {formatarData(row.criado_em)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function TabelaSolicitacoes({ rows }: { rows: Solicitacao[] }) {
  if (rows.length === 0) {
    return <div className="empty">Nenhuma solicitação nesta lista.</div>;
  }

  return (
    <table className="rtbl">
      <thead>
        <tr>
          <th>#</th>
          <th>Empresa</th>
          <th>Responsável / E-mail</th>
          <th>Telefone</th>
          <th>Tipo</th>
          <th>Status</th>
          <th>Recebido em</th>
          <th></th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => {
          const tipo        = (row.payload?.tipo as string) ?? '';
          const tipoColor   = TIPO_COLORS[tipo] ?? TIPO_COLORS.Outro;
          const statusColor = STATUS_COLORS[row.status] ?? STATUS_COLORS.novo;
          const nome        = nomeEmpresa(row);
          const responsavel = row.nome_responsavel || (row.payload?.resp_nome as string) || '';
          const email       = emailContato(row);
          const tel         = telefoneContato(row);

          return (
            <tr key={row.id}>
              <td style={{ color: 'var(--muted)', fontSize: 11, width: 40 }}>
                {row.id.slice(0, 8)}…
              </td>
              <td>
                <div style={{ fontWeight: 500, marginBottom: 2 }}>{nome}</div>
              </td>
              <td>
                {responsavel && (
                  <div style={{ fontSize: 12, marginBottom: 2 }}>{responsavel}</div>
                )}
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{email}</div>
              </td>
              <td style={{ fontSize: 12, color: 'var(--muted)' }}>{tel}</td>
              <td>
                {tipo && (
                  <span className="tbdg" style={{ background: tipoColor.bg, color: tipoColor.color }}>
                    {tipo}
                  </span>
                )}
              </td>
              <td>
                <span className="sbdg" style={{ background: statusColor.bg, color: statusColor.color }}>
                  {STATUS_LABELS[row.status] ?? row.status}
                </span>
              </td>
              <td style={{ fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                {formatarData(row.criado_em)}
              </td>
              <td>
                <Link href={`/admin/${row.id}`} className="btn-ver" style={{ textDecoration: 'none' }}>
                  Ver detalhes
                </Link>
              </td>
              <td>
                <DeleteRowButton id={row.id} />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const abaAtiva = tab === 'concluidos' ? 'concluidos' : tab === 'rascunhos' ? 'rascunhos' : 'pendentes';

  let rows: Solicitacao[] = [];
  let contagem: Record<string, number> = {};
  let rascunhos: Rascunho[] = [];
  let erro: string | null = null;

  try {
    [rows, contagem, rascunhos] = await Promise.all([
      listarSolicitacoes(),
      contarPorStatus(),
      listarRascunhos(),
    ]);
  } catch (e) {
    erro = e instanceof Error ? e.message : 'Erro ao carregar dados.';
  }

  const pendentes  = rows.filter(r => r.status === 'novo' || r.status === 'em_andamento');
  const concluidos = rows.filter(r => r.status === 'concluido');
  const rowsAtuais = abaAtiva === 'concluidos' ? concluidos : pendentes;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--off)' }}>

      {/* NAV */}
      <nav>
        <div className="nav-logo">
          <img src="/logo-aj-transparente.png" alt="A&J Assessoria Contábil" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link href="/abertura-empresa" className="nav-tab">Formulário</Link>
          <span className="nav-tab active">Painel Admin</span>
          <LogoutButton />
        </div>
      </nav>

      {/* BARRA SUPERIOR */}
      <div className="adm-bar">
        <h2>Solicitações de Abertura</h2>
        <div className="adm-ctrl">
          <Link
            href="/abertura-empresa"
            className="btn-sec"
            style={{ textDecoration: 'none', fontSize: 12 }}
          >
            Ver formulário
          </Link>
        </div>
      </div>

      {/* CARDS DE RESUMO */}
      <div className="stats">
        <div className="stat">
          <div className="stat-l">Total</div>
          <div className="stat-v">{rows.length}</div>
          <div className="stat-s">solicitações recebidas</div>
        </div>
        <div className="stat">
          <div className="stat-l">Novos</div>
          <div className="stat-v">{contagem.novo ?? 0}</div>
          <div className="stat-s">aguardando atendimento</div>
        </div>
        <div className="stat">
          <div className="stat-l">Em andamento</div>
          <div className="stat-v">{contagem.em_andamento ?? 0}</div>
          <div className="stat-s">em processamento</div>
        </div>
        <div className="stat">
          <div className="stat-l">Concluídos</div>
          <div className="stat-v">{contagem.concluido ?? 0}</div>
          <div className="stat-s">processos finalizados</div>
        </div>
      </div>

      {/* ERRO */}
      {erro && (
        <div style={{ padding: '1rem 2.5rem' }}>
          <div className="alert alert-danger">
            <strong>Erro ao carregar dados:</strong> {erro}
            <br />
            <small style={{ marginTop: 4, display: 'block' }}>
              Verifique se as colunas <code>status</code> e <code>criado_em</code> existem na tabela.
              Rode no Neon: <code>ALTER TABLE formulario_clientes ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT &apos;novo&apos;, ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ DEFAULT NOW();</code>
            </small>
          </div>
        </div>
      )}

      {/* ABAS */}
      <div className="adm-tabs">
        <Link
          href="/admin?tab=pendentes"
          className={`adm-tab-item${abaAtiva === 'pendentes' ? ' active' : ''}`}
        >
          Em aberto
          <span className="adm-tab-count">{pendentes.length}</span>
        </Link>
        <Link
          href="/admin?tab=rascunhos"
          className={`adm-tab-item${abaAtiva === 'rascunhos' ? ' active' : ''}`}
        >
          Em preenchimento
          <span className="adm-tab-count">{rascunhos.length}</span>
        </Link>
        <Link
          href="/admin?tab=concluidos"
          className={`adm-tab-item${abaAtiva === 'concluidos' ? ' active' : ''}`}
        >
          Concluídos
          <span className="adm-tab-count">{concluidos.length}</span>
        </Link>
      </div>

      {/* TABELA */}
      <div className="tbl-wrap">
        {abaAtiva === 'rascunhos'
          ? <TabelaRascunhos rows={rascunhos} />
          : <TabelaSolicitacoes rows={rowsAtuais} />}
      </div>

    </div>
  );
}
