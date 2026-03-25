import type { Solicitacao } from './admin';

// ─── TRADUÇÃO DE VALORES ──────────────────────────────────────────────────────

const VALORES: Record<string, string> = {
  sim: 'Sim', nao: 'Não',
  MEI: 'MEI — Microempreendedor Individual',
  LTDA: 'LTDA / Simples Nacional',
  SA: 'S/A — Sociedade Anônima',
  Outro: 'Outro / Não sei',
  proprio: 'Próprio', alugado: 'Alugado', residencial: 'Residencial (home office)',
  total: 'À vista — totalmente integralizado', parcial: 'Parcelado',
  nao_sei: 'Não sei — orientação da equipe',
  simples: 'Simples Nacional', presumido: 'Lucro Presumido',
  real: 'Lucro Real', mei: 'MEI',
  socio: 'Apenas sócio (sem administração)',
  adm: 'Sócio administrador',
  adm_nao_socio: 'Administrador não sócio',
  isolada: 'Pode assinar isoladamente', conjunto: 'Deve assinar em conjunto',
  minimo: 'Salário mínimo vigente', outro: 'Outro valor',
  servico: 'Prestação de Serviços', comercio: 'Comércio (revenda)', industria: 'Indústria / Fabricação',
};

function tr(v: unknown): string {
  if (v === null || v === undefined || v === '') return '—';
  if (typeof v === 'boolean') return v ? '✓ Confirmado' : '—';
  if (Array.isArray(v)) {
    if (v.length === 0) return '—';
    return v.map(i => VALORES[String(i)] ?? String(i)).join(', ');
  }
  const s = String(v);
  return VALORES[s] ?? VALORES[s.toLowerCase()] ?? s;
}

function ok(v: unknown): boolean {
  if (v === null || v === undefined || v === '') return false;
  if (typeof v === 'boolean') return v === true;
  if (Array.isArray(v)) return v.length > 0;
  return true;
}

// ─── ESTRUTURA DE SEÇÕES ─────────────────────────────────────────────────────

type Campo = { chave: string; rotulo: string };

const SECOES: { titulo: string; campos: Campo[] }[] = [
  {
    titulo: 'Tipo de Empresa',
    campos: [{ chave: 'tipo', rotulo: 'Tipo' }],
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
      { chave: 'resp_tel',              rotulo: 'Telefone' },
    ],
  },
  {
    titulo: 'Empresa',
    campos: [
      { chave: 'razao_social',              rotulo: 'Razão social' },
      { chave: 'nome_fantasia',             rotulo: 'Nome fantasia' },
      { chave: 'cep',                       rotulo: 'CEP' },
      { chave: 'logradouro',                rotulo: 'Logradouro' },
      { chave: 'numero',                    rotulo: 'Número' },
      { chave: 'complemento',               rotulo: 'Complemento' },
      { chave: 'bairro',                    rotulo: 'Bairro' },
      { chave: 'cidade',                    rotulo: 'Cidade' },
      { chave: 'estado',                    rotulo: 'Estado' },
      { chave: 'sede_tipo',                 rotulo: 'Tipo de imóvel' },
      { chave: 'atendimento_publico',       rotulo: 'Atendimento ao público' },
      { chave: 'area_total',                rotulo: 'Área total (m²)' },
      { chave: 'area_total_fiscal',         rotulo: 'Área total — fiscal (m²)' },
      { chave: 'habite_se',                 rotulo: 'Habite-se' },
      { chave: 'inscricao_imobiliaria',     rotulo: 'Inscrição imobiliária' },
      { chave: 'inscricao_imobiliaria_fiscal', rotulo: 'Inscrição imobiliária — fiscal' },
      { chave: 'horario_funcionamento',     rotulo: 'Horário de funcionamento' },
    ],
  },
  {
    titulo: 'Atividades',
    campos: [
      { chave: 'atividades',               rotulo: 'Categorias' },
      { chave: 'ativ_servico',             rotulo: 'Descrição — Serviços' },
      { chave: 'ativ_comercio',            rotulo: 'Descrição — Comércio' },
      { chave: 'compras_outros_estados',   rotulo: 'Compras de outros estados (comércio)' },
      { chave: 'ativ_industria',           rotulo: 'Descrição — Indústria' },
      { chave: 'ind_compras_outros_estados', rotulo: 'Compras de outros estados (indústria)' },
    ],
  },
  {
    titulo: 'Capital Social',
    campos: [
      { chave: 'capital_social',         rotulo: 'Valor' },
      { chave: 'capital_social_extenso', rotulo: 'Por extenso' },
      { chave: 'capital_integralizacao', rotulo: 'Integralização' },
      { chave: 'capital_inicial',        rotulo: 'Valor integralizado agora' },
      { chave: 'capital_parcelas',       rotulo: 'Número de parcelas' },
      { chave: 'capital_prazo',          rotulo: 'Prazo final' },
    ],
  },
  {
    titulo: 'Regime Tributário e Funcionários',
    campos: [
      { chave: 'regime_tributario', rotulo: 'Regime tributário' },
      { chave: 'tem_funcionarios',  rotulo: 'Terá funcionários' },
      { chave: 'func_quantidade',   rotulo: 'Quantidade de funcionários' },
      { chave: 'cnpj_email',        rotulo: 'E-mail do Cartão CNPJ' },
      { chave: 'cnpj_telefone',     rotulo: 'Telefone do Cartão CNPJ' },
    ],
  },
  {
    titulo: 'Declarações',
    campos: [
      { chave: 'decl1', rotulo: 'Veracidade das informações' },
      { chave: 'decl2', rotulo: 'Autorização para abertura pela A&J' },
      { chave: 'decl3', rotulo: 'Uso dos dados junto aos órgãos competentes' },
    ],
  },
];

const SOCIO_CAMPOS: Campo[] = [
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
  { chave: 'end_cep',           rotulo: 'CEP residencial' },
  { chave: 'end_logradouro',    rotulo: 'Logradouro' },
  { chave: 'end_numero',        rotulo: 'Número' },
  { chave: 'end_bairro',        rotulo: 'Bairro' },
  { chave: 'end_cidade',        rotulo: 'Cidade' },
  { chave: 'end_estado',        rotulo: 'Estado' },
  { chave: 'outra_empresa',     rotulo: 'Participa de outra empresa' },
  { chave: 'outra_nome',        rotulo: 'Nome da outra empresa' },
  { chave: 'outra_cnpj',        rotulo: 'CNPJ da outra empresa' },
  { chave: 'gestao_funcao',     rotulo: 'Função na empresa' },
  { chave: 'gestao_forma',      rotulo: 'Forma de atuação' },
  { chave: 'prolabore',         rotulo: 'Receberá pró-labore' },
  { chave: 'prolabore_opt',     rotulo: 'Opção de valor' },
  { chave: 'prolabore_valor',   rotulo: 'Valor mensal' },
];

// ─── GERAÇÃO HTML ─────────────────────────────────────────────────────────────

const TD_LABEL = `padding:6px 12px;font-size:11px;color:#666;text-transform:uppercase;letter-spacing:.04em;background:#f9f9f7;border:1px solid #e0ddd7;width:34%;vertical-align:top;`;
const TD_VALUE = `padding:6px 12px;font-size:13px;border:1px solid #e0ddd7;vertical-align:top;`;

function secaoHTML(titulo: string, campos: Campo[], payload: Record<string, unknown>): string {
  const visiveis = campos.filter(c => ok(payload[c.chave]));
  if (visiveis.length === 0) return '';

  const rows = visiveis.map(c =>
    `<tr>
      <td style="${TD_LABEL}">${c.rotulo}</td>
      <td style="${TD_VALUE}">${tr(payload[c.chave])}</td>
    </tr>`
  ).join('');

  return `
    <h3 style="font-size:11px;text-transform:uppercase;letter-spacing:.1em;color:#1a6b4a;
               margin:20px 0 6px;padding-bottom:5px;border-bottom:2px solid #1a6b4a;">${titulo}</h3>
    <table style="width:100%;border-collapse:collapse;margin-bottom:4px;">${rows}</table>`;
}

function sociosHTML(socios: Record<string, unknown>[]): string {
  if (!socios || socios.length === 0) return '';
  return socios.map((s, i) => {
    const visiveis = SOCIO_CAMPOS.filter(c => ok(s[c.chave]));
    const rows = visiveis.map(c =>
      `<tr>
        <td style="${TD_LABEL}">${c.rotulo}</td>
        <td style="${TD_VALUE}">${tr(s[c.chave])}</td>
      </tr>`
    ).join('');
    return `
      <h3 style="font-size:11px;text-transform:uppercase;letter-spacing:.1em;color:#1a6b4a;
                 margin:20px 0 6px;padding-bottom:5px;border-bottom:2px solid #1a6b4a;">
        Sócio ${i + 1}${i === 0 ? ' — Principal' : ''}
      </h3>
      <table style="width:100%;border-collapse:collapse;margin-bottom:4px;">${rows}</table>`;
  }).join('');
}

type ArquivoItem = string | { name: string; url: string };

function arquivosHTML(arquivos: Record<string, ArquivoItem[]> | undefined): string {
  if (!arquivos) return '';

  const NOMES: Record<string, string> = {
    doc_rg_cnh:    'RG ou CNH',
    doc_comp_res:  'Comprovante de residência',
    doc_irpf:      'Declaração de IRPF',
    doc_titulo:    'Título de Eleitor',
    doc_iptu:      'IPTU do imóvel',
    doc_habite_se: 'Habite-se comercial',
    doc_outros:    'Outros documentos',
  };

  const entradas = Object.entries(arquivos).filter(([, files]) => files.length > 0);
  if (entradas.length === 0) return '';

  const rows = entradas.map(([campo, files]) => {
    const conteudo = files.map(f => {
      const nome = typeof f === 'string' ? f : f.name;
      const url  = typeof f === 'string' ? '' : f.url;
      return url
        ? `<a href="${url}" style="color:#1a6b4a;text-decoration:none;">${nome}</a>`
        : `<span style="color:#555;">${nome}</span>`;
    }).join('&nbsp; &bull; &nbsp;');

    return `<tr>
      <td style="${TD_LABEL}">${NOMES[campo] ?? campo.replace(/_/g, ' ')}</td>
      <td style="${TD_VALUE}">${conteudo}</td>
    </tr>`;
  }).join('');

  return `
    <h3 style="font-size:11px;text-transform:uppercase;letter-spacing:.1em;color:#1a6b4a;
               margin:20px 0 6px;padding-bottom:5px;border-bottom:2px solid #1a6b4a;">Documentos enviados</h3>
    <table style="width:100%;border-collapse:collapse;margin-bottom:4px;">${rows}</table>`;
}

// ─── FUNÇÃO PRINCIPAL ─────────────────────────────────────────────────────────

export function gerarEmailHTML(row: Solicitacao, empresa: string): string {
  const payload = row.payload;
  const socios  = (payload.socios as Record<string, unknown>[]) ?? [];
  const arquivos = payload.arquivos as Record<string, ArquivoItem[]> | undefined;

  const dataFormatada = (() => {
    try { return new Date(row.criado_em).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch { return row.criado_em; }
  })();

  const corpo = [
    ...SECOES.map(s => secaoHTML(s.titulo, s.campos, payload)),
    sociosHTML(socios),
    arquivosHTML(arquivos),
  ].join('');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Solicitação de Abertura — ${empresa}</title>
</head>
<body style="margin:0;padding:0;background:#f0ede7;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:680px;margin:30px auto;background:#fff;border-radius:6px;overflow:hidden;
              box-shadow:0 2px 16px rgba(0,0,0,.1);">

    <!-- Cabeçalho -->
    <div style="background:#1a6b4a;padding:28px 32px;">
      <div style="color:#fff;font-size:22px;font-weight:700;letter-spacing:.02em;">A&amp;J Assessoria Contábil</div>
      <div style="color:rgba(255,255,255,.75);font-size:13px;margin-top:4px;">
        Nova solicitação de abertura de empresa
      </div>
    </div>

    <!-- Resumo -->
    <div style="padding:20px 32px;border-bottom:1px solid #e8e5e0;background:#fafaf8;">
      <div style="font-size:19px;font-weight:600;color:#1a1a1a;margin-bottom:4px;">${empresa}</div>
      <div style="font-size:12px;color:#888;">Recebido em ${dataFormatada}</div>
      ${(payload.protocolo as string) ? `<div style="font-size:12px;color:#888;margin-top:2px;">Protocolo: <strong>${payload.protocolo}</strong></div>` : ''}
    </div>

    <!-- Dados -->
    <div style="padding:20px 32px 32px;">
      ${corpo}
    </div>

    <!-- Rodapé -->
    <div style="padding:16px 32px;background:#f4f3ef;border-top:1px solid #e8e5e0;
                font-size:11px;color:#aaa;text-align:center;">
      Gerado automaticamente pelo painel A&amp;J — ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
    </div>
  </div>
</body>
</html>`;
}
