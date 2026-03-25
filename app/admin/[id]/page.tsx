import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  buscarSolicitacao,
  nomeEmpresa,
  emailContato,
  telefoneContato,
  nomeResponsavel,
  type Solicitacao,
  type StatusValido,
} from '@/lib/admin';
import StatusSelect from './StatusSelect';
import EmailButton from './EmailButton';
import PrintButton from './PrintButton';
import DeleteButton from './DeleteButton';
import LogoutButton from '../LogoutButton';

// ─── TIPOS ────────────────────────────────────────────────────────────────────

type Campo = { chave: string; rotulo: string };
type Secao = { titulo: string; campos: Campo[] };
type SocioPayload = Record<string, unknown>;

// ─── MAPA DE VALORES LEGÍVEIS ─────────────────────────────────────────────────
// Traduz os valores internos (como 'sim', 'nao', 'proprio') para texto amigável.

const VALORES_LEGIVEIS: Record<string, string> = {
  // genérico
  sim: 'Sim',
  nao: 'Não',
  // tipo empresa
  MEI:   'MEI — Microempreendedor Individual',
  LTDA:  'LTDA / Simples Nacional',
  SA:    'S/A — Sociedade Anônima',
  Outro: 'Outro / Não sei',
  // sede
  proprio:     'Próprio',
  alugado:     'Alugado',
  residencial: 'Residencial (home office)',
  // atendimento
  'sim — haverá atendimento presencial': 'Sim — haverá atendimento presencial',
  'não — apenas fiscal / correspondência': 'Não — apenas fiscal / correspondência',
  // habite-se
  na: 'Não se aplica ao imóvel',
  // integralização
  total:   'À vista — totalmente integralizado',
  parcial: 'Parcelado',
  // regime tributário
  nao_sei:  'Não sei — quero orientação da equipe',
  simples:  'Simples Nacional',
  presumido:'Lucro Presumido',
  real:     'Lucro Real',
  mei:      'MEI',
  // gestão funcao
  socio:         'Apenas sócio (sem administração)',
  adm:           'Sócio administrador',
  adm_nao_socio: 'Administrador não sócio',
  // gestão forma
  isolada:  'Pode assinar isoladamente',
  conjunto: 'Deve assinar em conjunto',
  // prolabore opt
  minimo: 'Salário mínimo vigente',
  outro:  'Outro valor',
  // atividades (categorias internas)
  servico:  'Prestação de Serviços',
  comercio: 'Comércio (revenda)',
  industria:'Indústria / Fabricação',
};

function traduzir(v: unknown): string {
  const str = String(v).trim();
  return VALORES_LEGIVEIS[str] ?? VALORES_LEGIVEIS[str.toLowerCase()] ?? str;
}

// ─── MAPEAMENTO PAYLOAD → SEÇÕES ─────────────────────────────────────────────

const SECOES: Secao[] = [
  {
    titulo: 'Tipo de Empresa',
    campos: [
      { chave: 'tipo', rotulo: 'Tipo de empresa' },
    ],
  },
  {
    titulo: 'Responsável',
    campos: [
      { chave: 'resp_nome',             rotulo: 'Nome completo' },
      { chave: 'resp_cpf',              rotulo: 'CPF' },
      { chave: 'resp_nasc',             rotulo: 'Data de nascimento' },
      { chave: 'resp_profissao',        rotulo: 'Profissão' },
      { chave: 'resp_civil',            rotulo: 'Estado civil' },
      { chave: 'resp_regime_casamento', rotulo: 'Regime de casamento' },
      { chave: 'resp_email',            rotulo: 'E-mail' },
      { chave: 'resp_tel',              rotulo: 'Telefone / WhatsApp' },
    ],
  },
  {
    titulo: 'Empresa — Identificação',
    campos: [
      { chave: 'razao_social',  rotulo: 'Razão social' },
      { chave: 'nome_fantasia', rotulo: 'Nome fantasia' },
    ],
  },
  {
    titulo: 'Empresa — Endereço',
    campos: [
      { chave: 'cep',          rotulo: 'CEP' },
      { chave: 'logradouro',   rotulo: 'Logradouro' },
      { chave: 'numero',       rotulo: 'Número' },
      { chave: 'complemento',  rotulo: 'Complemento' },
      { chave: 'bairro',       rotulo: 'Bairro' },
      { chave: 'cidade',       rotulo: 'Cidade' },
      { chave: 'estado',       rotulo: 'Estado' },
    ],
  },
  {
    titulo: 'Empresa — Imóvel',
    campos: [
      { chave: 'sede_tipo',               rotulo: 'Tipo de imóvel' },
      { chave: 'atendimento_publico',     rotulo: 'Atendimento ao público' },
      { chave: 'area_total',              rotulo: 'Área total (m²)' },
      { chave: 'area_total_fiscal',       rotulo: 'Área total — fiscal (m²)' },
      { chave: 'habite_se',               rotulo: 'Habite-se' },
      { chave: 'inscricao_imobiliaria',   rotulo: 'Inscrição imobiliária' },
      { chave: 'inscricao_imobiliaria_fiscal', rotulo: 'Inscrição imobiliária — fiscal' },
      { chave: 'horario_funcionamento',   rotulo: 'Horário de funcionamento' },
    ],
  },
  {
    titulo: 'Atividades',
    campos: [
      { chave: 'atividades',                  rotulo: 'Categorias selecionadas' },
      { chave: 'ativ_servico',                rotulo: 'Descrição — Serviços' },
      { chave: 'ativ_comercio',               rotulo: 'Descrição — Comércio' },
      { chave: 'compras_outros_estados',      rotulo: 'Compras de outros estados (comércio)' },
      { chave: 'ativ_industria',              rotulo: 'Descrição — Indústria' },
      { chave: 'ind_compras_outros_estados',  rotulo: 'Compras de outros estados (indústria)' },
    ],
  },
  {
    titulo: 'Capital Social',
    campos: [
      { chave: 'capital_social',          rotulo: 'Valor' },
      { chave: 'capital_social_extenso',  rotulo: 'Por extenso' },
      { chave: 'capital_integralizacao',  rotulo: 'Forma de integralização' },
      { chave: 'capital_inicial',         rotulo: 'Valor integralizado agora' },
      { chave: 'capital_parcelas',        rotulo: 'Número de parcelas' },
      { chave: 'capital_prazo',           rotulo: 'Prazo final' },
    ],
  },
  {
    titulo: 'Regime Tributário e Funcionários',
    campos: [
      { chave: 'regime_tributario', rotulo: 'Regime tributário pretendido' },
      { chave: 'tem_funcionarios',  rotulo: 'Terá funcionários' },
      { chave: 'func_quantidade',   rotulo: 'Quantidade estimada de funcionários' },
      { chave: 'cnpj_email',        rotulo: 'E-mail do Cartão CNPJ' },
      { chave: 'cnpj_telefone',     rotulo: 'Telefone do Cartão CNPJ' },
    ],
  },
  {
    titulo: 'Declarações confirmadas',
    campos: [
      { chave: 'decl1', rotulo: 'Veracidade das informações' },
      { chave: 'decl2', rotulo: 'Autorização para abertura pela A&J' },
      { chave: 'decl3', rotulo: 'Uso dos dados junto aos órgãos competentes' },
    ],
  },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

/** Decide se um valor deve ser exibido (filtra vazios, false e arrays vazios). */
function preenchido(v: unknown): boolean {
  if (v === null || v === undefined || v === '') return false;
  if (typeof v === 'boolean') return v === true;
  if (Array.isArray(v)) return v.length > 0;
  return true;
}

/** Converte um valor do payload para texto legível para o admin. */
function legivel(v: unknown): string {
  if (v === null || v === undefined || v === '') return '—';
  if (typeof v === 'boolean') return v ? '✓ Confirmado' : '—';
  if (Array.isArray(v)) {
    if (v.length === 0) return '—';
    return v.map(item => traduzir(item)).join(', ');
  }
  return traduzir(v);
}

const STATUS_LABELS: Record<string, string> = {
  novo:          'Novo',
  em_andamento:  'Em andamento',
  concluido:     'Concluído',
};

const STATUS_COLORS: Record<string, string> = {
  novo:         '#e1f5ee',
  em_andamento: '#faeeda',
  concluido:    '#eaf3de',
};

const STATUS_TEXT: Record<string, string> = {
  novo:         '#085041',
  em_andamento: '#633806',
  concluido:    '#27500a',
};

function formatarData(dataStr: string): string {
  try {
    return new Date(dataStr).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
      timeZone: 'America/Sao_Paulo',
    });
  } catch {
    return dataStr;
  }
}

// ─── COMPONENTES DE SEÇÃO ─────────────────────────────────────────────────────

function SecaoDados({ titulo, campos, payload }: {
  titulo: string;
  campos: Campo[];
  payload: Record<string, unknown>;
}) {
  const visiveis = campos.filter(c => preenchido(payload[c.chave]));
  if (visiveis.length === 0) return null;

  return (
    <div className="adm-sec">
      <div className="adm-sec-t">{titulo}</div>
      <div className="dgrid">
        {visiveis.map(c => (
          <div className="di" key={c.chave}
            style={c.chave === 'ativ_servico' || c.chave === 'ativ_comercio' || c.chave === 'ativ_industria'
              ? { gridColumn: '1 / -1' } : undefined}>
            <dt>{c.rotulo}</dt>
            <dd style={{ whiteSpace: 'pre-wrap' }}>{legivel(payload[c.chave])}</dd>
          </div>
        ))}
      </div>
    </div>
  );
}

function SecaoSocios({ socios }: { socios: SocioPayload[] }) {
  if (!socios || socios.length === 0) return null;

  const camposDados: Campo[] = [
    { chave: 'nome',              rotulo: 'Nome completo' },
    { chave: 'cpf',               rotulo: 'CPF' },
    { chave: 'rg',                rotulo: 'RG' },
    { chave: 'nasc',              rotulo: 'Nascimento' },
    { chave: 'civil',             rotulo: 'Estado civil' },
    { chave: 'regime_casamento',  rotulo: 'Regime de casamento' },
    { chave: 'profissao',         rotulo: 'Profissão' },
    { chave: 'tel',               rotulo: 'Telefone' },
    { chave: 'email',             rotulo: 'E-mail' },
    { chave: 'participacao',      rotulo: 'Participação (%)' },
  ];

  const camposEnd: Campo[] = [
    { chave: 'end_cep',          rotulo: 'CEP' },
    { chave: 'end_logradouro',   rotulo: 'Logradouro' },
    { chave: 'end_numero',       rotulo: 'Número' },
    { chave: 'end_complemento',  rotulo: 'Complemento' },
    { chave: 'end_bairro',       rotulo: 'Bairro' },
    { chave: 'end_cidade',       rotulo: 'Cidade' },
    { chave: 'end_estado',       rotulo: 'Estado' },
  ];

  const camposOutra: Campo[] = [
    { chave: 'outra_empresa',      rotulo: 'Participa de outra empresa' },
    { chave: 'outra_nome',         rotulo: 'Nome da outra empresa' },
    { chave: 'outra_cnpj',         rotulo: 'CNPJ da outra empresa' },
    { chave: 'outra_regime',       rotulo: 'Regime tributário' },
    { chave: 'outra_participacao', rotulo: 'Participação (%)' },
  ];

  const camposGestao: Campo[] = [
    { chave: 'gestao_funcao',   rotulo: 'Função na empresa' },
    { chave: 'gestao_forma',    rotulo: 'Forma de atuação' },
    { chave: 'prolabore',       rotulo: 'Receberá pró-labore' },
    { chave: 'prolabore_opt',   rotulo: 'Opção de valor' },
    { chave: 'prolabore_valor', rotulo: 'Valor mensal' },
  ];

  return (
    <>
      {socios.map((s, i) => {
        const dados     = camposDados.filter(c => preenchido(s[c.chave]));
        const enderecos = camposEnd.filter(c => preenchido(s[c.chave]));
        const outra     = camposOutra.filter(c => preenchido(s[c.chave]));
        const gestao    = camposGestao.filter(c => preenchido(s[c.chave]));

        return (
          <div className="adm-sec" key={i}>
            <div className="adm-sec-t">Sócio {i + 1}{i === 0 ? ' — Principal' : ''}</div>

            {dados.length > 0 && (
              <div className="dgrid" style={{ marginBottom: '0.75rem' }}>
                {dados.map(c => (
                  <div className="di" key={c.chave}>
                    <dt>{c.rotulo}</dt>
                    <dd>{legivel(s[c.chave])}</dd>
                  </div>
                ))}
              </div>
            )}

            {enderecos.length > 0 && (
              <>
                <div className="adm-sec-sub">Endereço residencial</div>
                <div className="dgrid" style={{ marginBottom: '0.75rem' }}>
                  {enderecos.map(c => (
                    <div className="di" key={c.chave}>
                      <dt>{c.rotulo}</dt>
                      <dd>{legivel(s[c.chave])}</dd>
                    </div>
                  ))}
                </div>
              </>
            )}

            {outra.length > 0 && (
              <>
                <div className="adm-sec-sub">Participação em outra empresa</div>
                <div className="dgrid" style={{ marginBottom: '0.75rem' }}>
                  {outra.map(c => (
                    <div className="di" key={c.chave}>
                      <dt>{c.rotulo}</dt>
                      <dd>{legivel(s[c.chave])}</dd>
                    </div>
                  ))}
                </div>
              </>
            )}

            {gestao.length > 0 && (
              <>
                <div className="adm-sec-sub">Gestão e pró-labore</div>
                <div className="dgrid">
                  {gestao.map(c => (
                    <div className="di" key={c.chave}>
                      <dt>{c.rotulo}</dt>
                      <dd>{legivel(s[c.chave])}</dd>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        );
      })}
    </>
  );
}

type ArquivoItem = string | { name: string; url: string };

function SecaoDocumentos({ arquivos }: { arquivos: Record<string, ArquivoItem[]> | undefined }) {
  if (!arquivos) return null;

  const NOMES_DOC: Record<string, string> = {
    doc_rg_cnh:    'RG ou CNH',
    doc_comp_res:  'Comprovante de residência',
    doc_irpf:      'Declaração de IRPF',
    doc_titulo:    'Título de Eleitor',
    doc_iptu:      'IPTU do imóvel',
    doc_habite_se: 'Habite-se comercial',
    doc_outros:    'Outros documentos',
  };

  const entradas = Object.entries(arquivos).filter(([, files]) => files.length > 0);
  if (entradas.length === 0) return null;

  return (
    <div className="adm-sec">
      <div className="adm-sec-t">Documentos enviados</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        {entradas.map(([campo, files]) => (
          <div className="di" key={campo} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <dt>{NOMES_DOC[campo] ?? campo.replace(/_/g, ' ')}</dt>
            <dd style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {files.map((f, i) => {
                const nome = typeof f === 'string' ? f : f.name;
                const url  = typeof f === 'string' ? '' : f.url;
                return url
                  ? (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                      className="btn-sec"
                      style={{ fontSize: 11, padding: '4px 10px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      ⬇ {nome}
                    </a>
                  ) : (
                    <span key={i} style={{ fontSize: 12, color: 'var(--muted)' }}>{nome} (sem link)</span>
                  );
              })}
            </dd>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default async function AdminDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!id) notFound();

  let row: Solicitacao | null = null;
  let erro: string | null = null;

  try {
    row = await buscarSolicitacao(id);
  } catch (e) {
    erro = e instanceof Error ? e.message : 'Erro ao carregar registro.';
  }

  if (!row && !erro) notFound();

  const empresa  = row ? nomeEmpresa(row) : '—';
  const payload  = row?.payload ?? {};
  const socios   = (payload.socios as SocioPayload[]) ?? [];
  const arquivos = payload.arquivos as Record<string, string[]> | undefined;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--off)' }}>

      {/* NAV */}
      <nav className="print-hide">
        <div className="nav-logo">
          <img src="/logo-aj-transparente.png" alt="A&J Assessoria Contábil" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link href="/admin" className="nav-tab active">Painel Admin</Link>
          <LogoutButton />
        </div>
      </nav>

      <div className="adm-detail-wrap">

        {/* BARRA DE AÇÕES */}
        <div className="print-hide" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: 8 }}>
          <Link href="/admin" className="btn-sec" style={{ display: 'inline-block', textDecoration: 'none' }}>
            ← Voltar à lista
          </Link>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <PrintButton />
            <DeleteButton id={row?.id ?? ''} />
          </div>
        </div>

        {erro && (
          <div className="alert alert-danger" style={{ marginBottom: '1.25rem' }}>
            <strong>Erro:</strong> {erro}
          </div>
        )}

        {row && (
          <>
            {/* CABEÇALHO */}
            <div className="fsec" style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--muted)', marginBottom: 4 }}>
                    Solicitação
                  </div>
                  <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.6rem', fontWeight: 500, marginBottom: 4 }}>
                    {empresa}
                  </h1>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                    Recebido em {formatarData(row.criado_em)}
                    {(payload.protocolo as string) && (
                      <> · Protocolo: <strong>{payload.protocolo as string}</strong></>
                    )}
                  </div>
                </div>
                <span style={{
                  background: STATUS_COLORS[row.status] ?? '#eee',
                  color: STATUS_TEXT[row.status] ?? '#333',
                  fontSize: 11, padding: '4px 12px', borderRadius: 4,
                  fontWeight: 700, letterSpacing: '.04em', alignSelf: 'flex-start',
                }}>
                  {STATUS_LABELS[row.status] ?? row.status}
                </span>
              </div>
            </div>

            {/* DADOS RÁPIDOS */}
            <div className="fsec" style={{ marginBottom: '1rem' }}>
              <div className="adm-sec-t" style={{ marginBottom: '1rem' }}>Resumo</div>
              <div className="dgrid">
                <div className="di"><dt>Responsável</dt><dd>{nomeResponsavel(row)}</dd></div>
                <div className="di"><dt>E-mail</dt><dd>{emailContato(row)}</dd></div>
                <div className="di"><dt>Telefone</dt><dd>{telefoneContato(row)}</dd></div>
                {row.cnpj && <div className="di"><dt>CNPJ</dt><dd>{row.cnpj}</dd></div>}
                {(payload.tipo as string) && (
                  <div className="di"><dt>Tipo de empresa</dt><dd>{legivel(payload.tipo)}</dd></div>
                )}
              </div>
            </div>

            {/* ATUALIZAR STATUS */}
            <div className="fsec print-hide" style={{ marginBottom: '1rem' }}>
              <div className="adm-sec-t" style={{ marginBottom: '1rem' }}>Atualizar status</div>
              <StatusSelect id={row.id} statusAtual={row.status as StatusValido} />
            </div>

            {/* ENVIAR POR E-MAIL */}
            <div className="fsec print-hide" style={{ marginBottom: '1rem' }}>
              <div className="adm-sec-t" style={{ marginBottom: '1rem' }}>Enviar por e-mail</div>
              <EmailButton id={row.id} emailPadrao={emailContato(row)} />
            </div>

            {/* DADOS COMPLETOS DO FORMULÁRIO */}
            <div className="fsec">
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.15rem', fontWeight: 500, marginBottom: '1.5rem', paddingBottom: '.75rem', borderBottom: '1px solid var(--border)' }}>
                Dados completos do formulário
              </div>

              {/* Seções fixas */}
              {SECOES.map(sec => (
                <SecaoDados
                  key={sec.titulo}
                  titulo={sec.titulo}
                  campos={sec.campos}
                  payload={payload}
                />
              ))}

              {/* Sócios */}
              {socios.length > 0 && (
                <SecaoSocios socios={socios} />
              )}

              {/* Documentos */}
              <SecaoDocumentos arquivos={arquivos} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
