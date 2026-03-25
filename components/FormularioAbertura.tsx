'use client';

import { useMemo, useState } from 'react';

// ─── TYPES ───────────────────────────────────────────────────────────────────

type Socio = {
  nome: string; cpf: string; rg: string; nasc: string;
  civil: string; regime_casamento: string; profissao: string;
  tel: string; email: string;
  end_cep: string; end_logradouro: string; end_numero: string;
  end_complemento: string; end_bairro: string; end_cidade: string; end_estado: string;
  participacao: string;
  outra_empresa: string; outra_nome: string; outra_cnpj: string;
  outra_regime: string; outra_participacao: string;
  gestao_funcao: string; gestao_forma: string;
  prolabore: string; prolabore_opt: string; prolabore_valor: string;
};

type FormData = {
  tipo: string;
  resp_nome: string; resp_cpf: string; resp_nasc: string;
  resp_profissao: string; resp_civil: string; resp_regime_casamento: string;
  resp_email: string; resp_tel: string;
  razao_social: string; nome_fantasia: string;
  cep: string; logradouro: string; numero: string; complemento: string;
  bairro: string; cidade: string; estado: string;
  sede_tipo: string; atendimento_publico: string;
  area_total: string; habite_se: string; inscricao_imobiliaria: string; horario_funcionamento: string;
  area_total_fiscal: string; inscricao_imobiliaria_fiscal: string;
  atividades: string[];
  ativ_servico: string; ativ_comercio: string; compras_outros_estados: string;
  ativ_industria: string; ind_compras_outros_estados: string;
  capital_social: string; capital_social_extenso: string;
  capital_integralizacao: string; capital_inicial: string;
  capital_parcelas: string; capital_prazo: string;
  regime_tributario: string; tem_funcionarios: string; func_quantidade: string;
  cnpj_email: string; cnpj_telefone: string;
  decl1: boolean; decl2: boolean; decl3: boolean;
};

// ─── CONSTANTES ──────────────────────────────────────────────────────────────

const ETAPAS = [
  { id: 'responsavel', title: 'Dados do Responsável',          sub: 'Informações pessoais de quem abre a empresa' },
  { id: 'tipo',        title: 'Tipo de Empresa',               sub: 'Selecione o formato jurídico do negócio' },
  { id: 'empresa',     title: 'Nome e Endereço',               sub: 'Razão social e localização da empresa' },
  { id: 'atividade',   title: 'Atividade da Empresa',          sub: 'O que sua empresa irá exercer' },
  { id: 'capital',     title: 'Capital Social',                sub: 'Valor investido para início das operações' },
  { id: 'socios',      title: 'Sócios',                        sub: 'Dados pessoais e documentação dos sócios' },
  { id: 'gestao',      title: 'Gestão e Pró-labore',           sub: 'Função e retirada mensal de cada sócio' },
  { id: 'regime',      title: 'Regime Tributário e Funcionários', sub: 'Tributação, equipe e contatos para o CNPJ' },
  { id: 'documentos',  title: 'Documentos',                    sub: 'Envio de documentação — não obrigatório agora' },
  { id: 'declaracoes', title: 'Declarações Finais',            sub: 'Confirmações obrigatórias para enviar' },
];

const UFS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
             'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

const SOCIO_VAZIO: Socio = {
  nome:'',cpf:'',rg:'',nasc:'',civil:'',regime_casamento:'',profissao:'',
  tel:'',email:'',
  end_cep:'',end_logradouro:'',end_numero:'',end_complemento:'',
  end_bairro:'',end_cidade:'',end_estado:'',
  participacao:'',outra_empresa:'',outra_nome:'',outra_cnpj:'',
  outra_regime:'',outra_participacao:'',
  gestao_funcao:'',gestao_forma:'',prolabore:'',prolabore_opt:'',prolabore_valor:'',
};

const FORM_VAZIO: FormData = {
  tipo:'',
  resp_nome:'',resp_cpf:'',resp_nasc:'',resp_profissao:'',resp_civil:'',resp_regime_casamento:'',
  resp_email:'',resp_tel:'',
  razao_social:'',nome_fantasia:'',
  cep:'',logradouro:'',numero:'',complemento:'',bairro:'',cidade:'',estado:'',
  sede_tipo:'',atendimento_publico:'',
  area_total:'',habite_se:'',inscricao_imobiliaria:'',horario_funcionamento:'',
  area_total_fiscal:'',inscricao_imobiliaria_fiscal:'',
  atividades:[],
  ativ_servico:'',ativ_comercio:'',compras_outros_estados:'',
  ativ_industria:'',ind_compras_outros_estados:'',
  capital_social:'',capital_social_extenso:'',capital_integralizacao:'',
  capital_inicial:'',capital_parcelas:'',capital_prazo:'',
  regime_tributario:'',tem_funcionarios:'',func_quantidade:'',
  cnpj_email:'',cnpj_telefone:'',
  decl1:false,decl2:false,decl3:false,
};

const TIPS: Record<string, string> = {
  razao_social: 'Nome legal da empresa que será registrado na Junta Comercial.',
  nome_fantasia: 'Nome pelo qual a empresa será conhecida pelo público. Pode ser diferente da razão social e não é obrigatório.',
  cep: 'Ao digitar o CEP, o endereço é preenchido automaticamente. Se não encontrar, clique em "Preencher manual".',
  sede_tipo: 'Informe se o imóvel pertence à empresa ou ao sócio (próprio), se é alugado de terceiro, ou se é residencial.',
  atendimento_publico: 'Se haverá clientes no local presencialmente, serão necessários alvará de funcionamento, habite-se e medidas de segurança.',
  capital_social: 'Valor que os sócios investem para iniciar a empresa. Não precisa estar em dinheiro físico imediatamente.',
  capital_social_extenso: 'Este campo é obrigatório para o contrato social. É preenchido automaticamente ao digitar o valor.',
  capital_integralizacao: 'Integralizar significa disponibilizar o capital à empresa. À vista = tudo agora. Parcelado = parte agora, restante depois com prazo definido.',
  inscricao_imobiliaria: 'Número que identifica o imóvel no cadastro da prefeitura. Consta no carnê de IPTU.',
  habite_se: 'Documento da prefeitura que certifica que o imóvel pode ser usado para fins comerciais.',
  horario_funcionamento: 'Necessário para o alvará de funcionamento.',
  area_total: 'Em metros quadrados. Consta na planta ou escritura do imóvel.',
  resp_civil: 'Influencia o contrato social. Se casado, precisaremos saber o regime de bens.',
  resp_regime_casamento: 'Define como os bens do casal se relacionam com os da empresa.',
  socio_participacao: 'Percentual de participação deste sócio. A soma de todos os sócios deve ser exatamente 100%.',
  socio_rg: 'Número do RG. Constará no contrato social.',
  socio_civil: 'Se casado, precisaremos saber o regime de bens para o contrato social.',
  outra_empresa: 'Participação em outra empresa pode restringir o enquadramento no Simples Nacional.',
  gestao_funcao: 'Define quem tem poderes para assinar documentos e representar a empresa.',
  gestao_forma: 'Isolada: cada administrador age sozinho. Conjunta: todos devem assinar juntos — mais segurança, menos agilidade.',
  prolabore: 'Remuneração mensal do sócio administrador. Sobre ele incide INSS e Imposto de Renda.',
  regime_tributario: 'Define como os impostos da empresa serão calculados. Simples Nacional é o mais comum para pequenas empresas.',
  cnpj_email: 'Aparecerá no Cartão CNPJ e será usado pela Receita Federal para comunicações.',
  cnpj_telefone: 'Aparecerá no Cartão CNPJ.',
};

// ─── MÁSCARAS ────────────────────────────────────────────────────────────────

function maskCPF(v: string): string {
  v = v.replace(/\D/g, '');
  if (v.length > 3) v = v.slice(0,3) + '.' + v.slice(3);
  if (v.length > 7) v = v.slice(0,7) + '.' + v.slice(7);
  if (v.length > 11) v = v.slice(0,11) + '-' + v.slice(11,13);
  return v.slice(0,14);
}
function maskCNPJ(v: string): string {
  v = v.replace(/\D/g, '');
  if (v.length > 2) v = v.slice(0,2) + '.' + v.slice(2);
  if (v.length > 6) v = v.slice(0,6) + '.' + v.slice(6);
  if (v.length > 10) v = v.slice(0,10) + '/' + v.slice(10);
  if (v.length > 15) v = v.slice(0,15) + '-' + v.slice(15,17);
  return v.slice(0,18);
}
function maskTel(v: string): string {
  v = v.replace(/\D/g, '');
  if (v.length > 0) v = '(' + v;
  if (v.length > 3) v = v.slice(0,3) + ') ' + v.slice(3);
  if (v.length > 9) v = v.slice(0,9) + '-' + v.slice(9,14);
  return v.slice(0,14);
}
function maskCEP(v: string): string {
  v = v.replace(/\D/g, '');
  if (v.length > 5) v = v.slice(0,5) + '-' + v.slice(5,8);
  return v;
}
function maskDate(v: string): string {
  v = v.replace(/\D/g, '');
  if (v.length > 2) v = v.slice(0,2) + '/' + v.slice(2);
  if (v.length > 5) v = v.slice(0,5) + '/' + v.slice(5,9);
  return v;
}
function maskMoney(v: string): string {
  const digits = v.replace(/\D/g, '');
  if (!digits) return '';
  const num = parseInt(digits) / 100;
  return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function moneyToNumber(v: string): number {
  if (!v) return 0;
  return parseFloat(v.toString().replace(/\./g,'').replace(',','.').replace(/[^\d.]/g,'')) || 0;
}

// ─── EXTENSO ─────────────────────────────────────────────────────────────────

const UNI = ['','um','dois','três','quatro','cinco','seis','sete','oito','nove',
             'dez','onze','doze','treze','catorze','quinze','dezesseis','dezessete','dezoito','dezenove'];
const DEZ = ['','','vinte','trinta','quarenta','cinquenta','sessenta','setenta','oitenta','noventa'];
const CEN = ['','cem','duzentos','trezentos','quatrocentos','quinhentos','seiscentos','setecentos','oitocentos','novecentos'];
function numExt(n: number): string {
  n = Math.round(n);
  if (n === 0) return 'zero';
  if (n === 100) return 'cem';
  let s = '';
  if (n >= 1000000) { const m = Math.floor(n/1000000); s += (m===1?'um milhão':numExt(m)+' milhões'); n %= 1000000; if (n>0) s += ' e '; }
  if (n >= 1000)    { const m = Math.floor(n/1000);    s += (m===1?'mil':numExt(m)+' mil');             n %= 1000;    if (n>0) s += ' e '; }
  if (n >= 100)     { s += CEN[Math.floor(n/100)]; n %= 100; if (n>0) s += ' e '; }
  if (n >= 20)      { s += DEZ[Math.floor(n/10)];  n %= 10;  if (n>0) s += ' e '; }
  if (n > 0)        { s += UNI[n]; }
  return s;
}
function gerarExtenso(valorStr: string): string {
  const val = moneyToNumber(valorStr);
  if (!val) return '';
  const int = Math.floor(val);
  const cents = Math.round((val - int) * 100);
  let t = numExt(int) + ' reais';
  if (cents > 0) t += ' e ' + numExt(cents) + ' centavos';
  return t;
}

// ─── TOOLTIP COMPONENT ───────────────────────────────────────────────────────

function Tip({ tipKey }: { tipKey: string }) {
  const txt = TIPS[tipKey];
  if (!txt) return null;
  return <span className="tip" data-tip={txt}>?</span>;
}

// ─── LABEL HELPERS ───────────────────────────────────────────────────────────

function Lbl({ children, req, tip }: { children: React.ReactNode; req?: boolean; tip?: string }) {
  const inner = (
    <label>
      {children}{req && <span className="req"> *</span>}
    </label>
  );
  if (!tip) return inner;
  return (
    <div className="lbl-row">
      {inner}
      <Tip tipKey={tip} />
    </div>
  );
}

// ─── CEP LOOKUP ──────────────────────────────────────────────────────────────

type CepStatus = { text: string; color: string };
type CepSetAddress = (fields: { logradouro: string; bairro: string; cidade: string; estado: string }) => void;

async function fetchCEP(
  raw: string,
  setStatus: (s: CepStatus) => void,
  setAddress: CepSetAddress,
  setReadonly: (v: boolean) => void,
) {
  if (raw.length !== 8) return;
  setStatus({ text: 'Buscando endereço...', color: 'var(--muted)' });
  try {
    const r = await fetch(`https://viacep.com.br/ws/${raw}/json/`);
    if (!r.ok) throw new Error();
    const d = await r.json();
    if (d.erro) {
      setStatus({ text: 'CEP não encontrado. Preencha manualmente.', color: 'var(--danger)' });
      setReadonly(false);
      return;
    }
    setAddress({ logradouro: d.logradouro||'', bairro: d.bairro||'', cidade: d.localidade||'', estado: d.uf||'' });
    setReadonly(true);
    setStatus({ text: '✓ Endereço encontrado. Complete o número.', color: 'var(--success)' });
  } catch {
    setStatus({ text: 'Erro ao buscar CEP. Preencha manualmente.', color: 'var(--danger)' });
    setReadonly(false);
  }
}

// ─── UPLOAD FILES STATE ───────────────────────────────────────────────────────

type UploadedFiles = Record<string, File[]>;

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function FormularioAbertura() {
  const [step, setStep] = useState(0);
  const [enviado, setEnviado] = useState(false);
  const [protocolo, setProtocolo] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erros, setErros] = useState<Record<string, string>>({});

  const [form, setForm] = useState<FormData>({ ...FORM_VAZIO });
  const [socios, setSocios] = useState<Socio[]>([{ ...SOCIO_VAZIO }]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFiles>({});

  // CEP empresa
  const [cepEmpStatus, setCepEmpStatus] = useState<CepStatus>({ text: '', color: '' });
  const [cepEmpManual, setCepEmpManual] = useState(false);
  const [endEmpReadonly, setEndEmpReadonly] = useState(false);

  // CEP sócios (array por index)
  const [cepSocioStatus, setCepSocioStatus] = useState<CepStatus[]>([{ text: '', color: '' }]);
  const [cepSocioManual, setCepSocioManual] = useState<boolean[]>([false]);
  const [endSocioReadonly, setEndSocioReadonly] = useState<boolean[]>([false]);

  const etapa = ETAPAS[step];

  // ── helpers de form ──

  function setField(name: keyof FormData, value: string | boolean | string[]) {
    setForm(prev => ({ ...prev, [name]: value }));
    if (erros[name]) setErros(prev => { const n = {...prev}; delete n[name]; return n; });
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setField(name as keyof FormData, type === 'checkbox' ? checked : value);
  }

  function handleMasked(name: keyof FormData, raw: string, mask: (v:string)=>string) {
    setField(name, mask(raw));
  }

  function toggleAtividade(cat: string) {
    setForm(prev => {
      const list = prev.atividades.includes(cat)
        ? prev.atividades.filter(a => a !== cat)
        : [...prev.atividades, cat];
      return { ...prev, atividades: list };
    });
    if (erros['atividades']) setErros(prev => { const n = {...prev}; delete n['atividades']; return n; });
  }

  // ── sócios helpers ──

  function setSocioField(idx: number, campo: keyof Socio, valor: string) {
    setSocios(prev => {
      const copia = [...prev];
      copia[idx] = { ...copia[idx], [campo]: valor };
      return copia;
    });
    const key = `s${idx}_${campo}`;
    if (erros[key]) setErros(prev => { const n = {...prev}; delete n[key]; return n; });
  }

  function adicionarSocio() {
    setSocios(prev => [...prev, { ...SOCIO_VAZIO }]);
    setCepSocioStatus(prev => [...prev, { text: '', color: '' }]);
    setCepSocioManual(prev => [...prev, false]);
    setEndSocioReadonly(prev => [...prev, false]);
  }

  function removerSocio(idx: number) {
    if (socios.length === 1) return;
    setSocios(prev => prev.filter((_, i) => i !== idx));
    setCepSocioStatus(prev => prev.filter((_, i) => i !== idx));
    setCepSocioManual(prev => prev.filter((_, i) => i !== idx));
    setEndSocioReadonly(prev => prev.filter((_, i) => i !== idx));
  }

  function copiarResponsavel(idx: number) {
    setSocios(prev => {
      const copia = [...prev];
      copia[idx] = {
        ...copia[idx],
        nome: form.resp_nome,
        cpf: form.resp_cpf,
        nasc: form.resp_nasc,
        civil: form.resp_civil,
        regime_casamento: form.resp_regime_casamento,
        profissao: form.resp_profissao,
        tel: form.resp_tel,
        email: form.resp_email,
      };
      return copia;
    });
  }

  // ── uploads ──

  function handleUpload(id: string, files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploadedFiles(prev => ({
      ...prev,
      [id]: [...(prev[id] || []), ...Array.from(files)],
    }));
  }

  // ── CEP empresa ──

  function handleCepEmpChange(raw: string) {
    const masked = maskCEP(raw);
    setField('cep', masked);
    const digits = masked.replace(/\D/g, '');
    if (digits.length === 8 && !cepEmpManual) {
      fetchCEP(digits, setCepEmpStatus,
        ({ logradouro, bairro, cidade, estado }) => {
          setForm(prev => ({ ...prev, logradouro, bairro, cidade, estado }));
        },
        setEndEmpReadonly,
      );
    }
  }

  function handleCepEmpBlur() {
    const digits = form.cep.replace(/\D/g, '');
    if (digits.length === 8 && !cepEmpManual) {
      fetchCEP(digits, setCepEmpStatus,
        ({ logradouro, bairro, cidade, estado }) => {
          setForm(prev => ({ ...prev, logradouro, bairro, cidade, estado }));
        },
        setEndEmpReadonly,
      );
    }
  }

  function toggleCepEmpManual() {
    const novo = !cepEmpManual;
    setCepEmpManual(novo);
    if (novo) {
      setEndEmpReadonly(false);
      setCepEmpStatus({ text: 'Preencha o endereço manualmente.', color: 'var(--gold)' });
    } else {
      setCepEmpStatus({ text: '', color: '' });
      const digits = form.cep.replace(/\D/g, '');
      if (digits.length === 8) {
        fetchCEP(digits, setCepEmpStatus,
          ({ logradouro, bairro, cidade, estado }) => {
            setForm(prev => ({ ...prev, logradouro, bairro, cidade, estado }));
          },
          setEndEmpReadonly,
        );
      }
    }
  }

  // ── CEP sócio ──

  function handleCepSocioChange(idx: number, raw: string) {
    const masked = maskCEP(raw);
    setSocioField(idx, 'end_cep', masked);
    const digits = masked.replace(/\D/g, '');
    if (digits.length === 8 && !cepSocioManual[idx]) {
      fetchCEP(digits,
        (s) => setCepSocioStatus(prev => { const a=[...prev]; a[idx]=s; return a; }),
        ({ logradouro, bairro, cidade, estado }) => {
          setSocios(prev => {
            const c = [...prev];
            c[idx] = { ...c[idx], end_logradouro: logradouro, end_bairro: bairro, end_cidade: cidade, end_estado: estado };
            return c;
          });
        },
        (v) => setEndSocioReadonly(prev => { const a=[...prev]; a[idx]=v; return a; }),
      );
    }
  }

  function handleCepSocioBlur(idx: number) {
    const digits = socios[idx].end_cep.replace(/\D/g, '');
    if (digits.length === 8 && !cepSocioManual[idx]) {
      fetchCEP(digits,
        (s) => setCepSocioStatus(prev => { const a=[...prev]; a[idx]=s; return a; }),
        ({ logradouro, bairro, cidade, estado }) => {
          setSocios(prev => {
            const c = [...prev];
            c[idx] = { ...c[idx], end_logradouro: logradouro, end_bairro: bairro, end_cidade: cidade, end_estado: estado };
            return c;
          });
        },
        (v) => setEndSocioReadonly(prev => { const a=[...prev]; a[idx]=v; return a; }),
      );
    }
  }

  function toggleCepSocioManual(idx: number) {
    const novo = !cepSocioManual[idx];
    setCepSocioManual(prev => { const a=[...prev]; a[idx]=novo; return a; });
    if (novo) {
      setEndSocioReadonly(prev => { const a=[...prev]; a[idx]=false; return a; });
      setCepSocioStatus(prev => { const a=[...prev]; a[idx]={ text:'Preencha o endereço manualmente.', color:'var(--gold)' }; return a; });
    } else {
      setCepSocioStatus(prev => { const a=[...prev]; a[idx]={ text:'', color:'' }; return a; });
    }
  }

  // ── soma participação ──

  const somaParticipacao = useMemo(() =>
    socios.reduce((acc, s) => acc + (parseFloat(s.participacao) || 0), 0),
  [socios]);

  const somaOk        = Math.abs(somaParticipacao - 100) < 0.01;
  const somaIniciada  = somaParticipacao > 0;

  // ── validação ──

  function validar(): boolean {
    const e: Record<string, string> = {};
    const req = (k: string, v: string | boolean, msg = 'Campo obrigatório') => {
      if (v === '' || v === false || v == null) e[k] = msg;
    };

    if (etapa.id === 'responsavel') {
      req('resp_nome', form.resp_nome);
      req('resp_cpf', form.resp_cpf);
      req('resp_nasc', form.resp_nasc);
      req('resp_profissao', form.resp_profissao);
      req('resp_civil', form.resp_civil);
      req('resp_tel', form.resp_tel);
      req('resp_email', form.resp_email);
      if (form.resp_civil === 'Casado(a)' || form.resp_civil === 'União estável')
        req('resp_regime_casamento', form.resp_regime_casamento);
    }

    if (etapa.id === 'tipo') {
      req('tipo', form.tipo, 'Selecione o tipo de empresa');
    }

    if (etapa.id === 'empresa') {
      req('razao_social', form.razao_social);
      req('cep', form.cep);
      req('logradouro', form.logradouro);
      req('numero', form.numero);
      req('bairro', form.bairro);
      req('cidade', form.cidade);
      req('estado', form.estado);
      req('sede_tipo', form.sede_tipo);
      req('atendimento_publico', form.atendimento_publico);
      if (form.atendimento_publico === 'sim') {
        req('area_total', form.area_total);
        req('habite_se', form.habite_se);
        req('inscricao_imobiliaria', form.inscricao_imobiliaria);
        req('horario_funcionamento', form.horario_funcionamento);
      }
      if (form.atendimento_publico === 'nao') {
        req('area_total_fiscal', form.area_total_fiscal);
        req('inscricao_imobiliaria_fiscal', form.inscricao_imobiliaria_fiscal);
      }
    }

    if (etapa.id === 'atividade') {
      if (!form.atividades.length) e['atividades'] = 'Selecione ao menos uma categoria';
      if (form.atividades.includes('servico')) req('ativ_servico', form.ativ_servico);
      if (form.atividades.includes('comercio')) {
        req('ativ_comercio', form.ativ_comercio);
        req('compras_outros_estados', form.compras_outros_estados);
      }
      if (form.atividades.includes('industria')) {
        req('ativ_industria', form.ativ_industria);
        req('ind_compras_outros_estados', form.ind_compras_outros_estados);
      }
    }

    if (etapa.id === 'capital') {
      req('capital_social', form.capital_social);
      req('capital_social_extenso', form.capital_social_extenso);
      req('capital_integralizacao', form.capital_integralizacao);
      if (form.capital_integralizacao === 'parcial') {
        req('capital_inicial', form.capital_inicial);
        req('capital_parcelas', form.capital_parcelas);
        req('capital_prazo', form.capital_prazo);
      }
    }

    if (etapa.id === 'socios') {
      socios.forEach((s, i) => {
        req(`s${i}_nome`, s.nome);
        req(`s${i}_cpf`, s.cpf);
        req(`s${i}_rg`, s.rg);
        req(`s${i}_nasc`, s.nasc);
        req(`s${i}_civil`, s.civil);
        req(`s${i}_profissao`, s.profissao);
        req(`s${i}_participacao`, s.participacao);
        req(`s${i}_end_cep`, s.end_cep);
        req(`s${i}_end_logradouro`, s.end_logradouro);
        req(`s${i}_end_numero`, s.end_numero);
        req(`s${i}_end_bairro`, s.end_bairro);
        req(`s${i}_end_cidade`, s.end_cidade);
        req(`s${i}_end_estado`, s.end_estado);
        req(`s${i}_outra_emp`, s.outra_empresa);
        if (s.civil === 'Casado(a)' || s.civil === 'União estável')
          req(`s${i}_regime_casamento`, s.regime_casamento);
        if (s.outra_empresa === 'sim') {
          req(`s${i}_outra_nome`, s.outra_nome);
          req(`s${i}_outra_cnpj`, s.outra_cnpj);
          req(`s${i}_outra_regime`, s.outra_regime);
          req(`s${i}_outra_participacao`, s.outra_participacao);
        }
      });
      if (Math.abs(somaParticipacao - 100) >= 0.01) {
        e['participacao_total'] = `A soma das participações deve ser exatamente 100% (atual: ${somaParticipacao.toFixed(1)}%)`;
      }
    }

    if (etapa.id === 'gestao') {
      socios.forEach((s, i) => {
        req(`g${i}_funcao`, s.gestao_funcao);
        const isAdm = s.gestao_funcao === 'adm' || s.gestao_funcao === 'adm_nao_socio';
        if (isAdm) req(`g${i}_forma`, s.gestao_forma, 'Selecione a forma de atuação');
        req(`g${i}_prolabore`, s.prolabore);
        if (s.prolabore === 'sim') {
          req(`g${i}_plopt`, s.prolabore_opt);
          if (s.prolabore_opt === 'outro') req(`g${i}_plval`, s.prolabore_valor);
        }
      });
    }

    if (etapa.id === 'regime') {
      req('regime_tributario', form.regime_tributario);
      req('tem_funcionarios', form.tem_funcionarios);
      if (form.tem_funcionarios === 'sim') req('func_quantidade', form.func_quantidade);
      req('cnpj_telefone', form.cnpj_telefone);
      req('cnpj_email', form.cnpj_email);
    }

    if (etapa.id === 'declaracoes') {
      if (!form.decl1 || !form.decl2 || !form.decl3)
        e['decl'] = 'Confirme todas as declarações para prosseguir';
    }

    setErros(e);
    return Object.keys(e).length === 0;
  }

  function avancar() {
    if (!validar()) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    if (step < ETAPAS.length - 1) {
      setStep(s => s + 1);
      setErros({});
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function voltar() {
    if (step > 0) {
      setStep(s => s - 1);
      setErros({});
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validar()) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }

    setEnviando(true);

    // Faz upload de cada arquivo para obter URL permanente
    const arquivos: Record<string, { name: string; url: string }[]> = {};
    for (const [campo, files] of Object.entries(uploadedFiles)) {
      arquivos[campo] = [];
      for (const file of files) {
        try {
          const fd = new FormData();
          fd.append('file', file);
          fd.append('campo', campo);
          const res = await fetch('/api/upload', { method: 'POST', body: fd });
          const data = await res.json();
          arquivos[campo].push({ name: file.name, url: data.url ?? '' });
        } catch {
          arquivos[campo].push({ name: file.name, url: '' });
        }
      }
    }

    const prot = 'AJ-' + Date.now().toString(36).toUpperCase();

    const payload = {
      protocolo: prot,
      data_envio: new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      ...form,
      socios,
      arquivos,
    };

    try {
      const res = await fetch('/api/solicitacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const resultado = await res.json();
      if (!res.ok || !resultado.ok) { alert('Erro ao enviar a solicitação.'); return; }
      setProtocolo(prot);
      setEnviado(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      alert('Não foi possível enviar a solicitação.');
    } finally {
      setEnviando(false);
    }
  }

  // ── HELPERS DE CAMPO ──

  function ErrMsg({ k }: { k: string }) {
    if (!erros[k]) return null;
    return <p className="em">{erros[k]}</p>;
  }

  function errClass(k: string) {
    return erros[k] ? 'err' : '';
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER ETAPAS
  // ═══════════════════════════════════════════════════════════════════════════

  function renderResponsavel() {
    return (
      <>
        <div className="fg">
          <Lbl req>Nome completo</Lbl>
          <input className={errClass('resp_nome')} type="text" value={form.resp_nome} onChange={e => setField('resp_nome', e.target.value)} />
          <ErrMsg k="resp_nome" />
        </div>
        <div className="fr">
          <div className="fg">
            <Lbl req>CPF</Lbl>
            <input className={errClass('resp_cpf')} type="text" maxLength={14} placeholder="000.000.000-00"
              value={form.resp_cpf}
              onChange={e => handleMasked('resp_cpf', e.target.value, maskCPF)} />
            <ErrMsg k="resp_cpf" />
          </div>
          <div className="fg">
            <Lbl req>Data de nascimento</Lbl>
            <input className={errClass('resp_nasc')} type="date" value={form.resp_nasc}
              onChange={e => setField('resp_nasc', e.target.value)} />
            <ErrMsg k="resp_nasc" />
          </div>
        </div>
        <div className="fr">
          <div className="fg">
            <Lbl req>Profissão</Lbl>
            <input className={errClass('resp_profissao')} type="text" value={form.resp_profissao}
              onChange={e => setField('resp_profissao', e.target.value)} />
            <ErrMsg k="resp_profissao" />
          </div>
          <div className="fg">
            <Lbl req tip="resp_civil">Estado civil</Lbl>
            <select className={errClass('resp_civil')} value={form.resp_civil}
              onChange={e => setField('resp_civil', e.target.value)}>
              <option value="">Selecione...</option>
              {['Solteiro(a)','Casado(a)','Divorciado(a)','Viúvo(a)','União estável'].map(o => <option key={o}>{o}</option>)}
            </select>
            <ErrMsg k="resp_civil" />
          </div>
        </div>
        {(form.resp_civil === 'Casado(a)' || form.resp_civil === 'União estável') && (
          <div className="cond">
            <div className="cond-lbl">Regime de casamento</div>
            <div className="fg">
              <Lbl req tip="resp_regime_casamento">Regime de bens</Lbl>
              <select className={errClass('resp_regime_casamento')} value={form.resp_regime_casamento}
                onChange={e => setField('resp_regime_casamento', e.target.value)}>
                <option value="">Selecione...</option>
                {['Comunhão parcial de bens','Comunhão universal de bens','Separação total de bens','Participação final nos aquestos'].map(o => <option key={o}>{o}</option>)}
              </select>
              <ErrMsg k="resp_regime_casamento" />
            </div>
          </div>
        )}
        <div className="fr">
          <div className="fg">
            <Lbl req>Telefone / WhatsApp</Lbl>
            <input className={errClass('resp_tel')} type="tel" maxLength={14} placeholder="(00) 00000-0000"
              value={form.resp_tel}
              onChange={e => handleMasked('resp_tel', e.target.value, maskTel)} />
            <ErrMsg k="resp_tel" />
          </div>
          <div className="fg">
            <Lbl req>E-mail</Lbl>
            <input className={errClass('resp_email')} type="email" value={form.resp_email}
              onChange={e => setField('resp_email', e.target.value)} />
            <ErrMsg k="resp_email" />
          </div>
        </div>
      </>
    );
  }

  function renderTipo() {
    const tipos = [
      { id: 'MEI',   nome: 'MEI',               desc: 'Microempreendedor Individual. Faturamento até R$ 81 mil/ano.' },
      { id: 'LTDA',  nome: 'LTDA / Simples Nacional', desc: 'Sociedade Limitada. Ideal para a maioria dos negócios.', pop: true },
      { id: 'SA',    nome: 'S/A',               desc: 'Sociedade Anônima. Para negócios de maior porte.' },
      { id: 'Outro', nome: 'Outro / Não sei',   desc: 'Nos conte sobre o negócio e indicamos o melhor formato.' },
    ];
    return (
      <>
        <div className="tipo-grid">
          {tipos.map(t => (
            <label key={t.id}
              className={`tipo-card${form.tipo === t.id ? ' sel' : ''}`}
              onClick={() => { setField('tipo', t.id); }}>
              <input type="radio" name="tipo" value={t.id} readOnly checked={form.tipo === t.id} />
              {t.pop && <span className="pop">Popular</span>}
              <strong>{t.nome}</strong>
              <span>{t.desc}</span>
            </label>
          ))}
        </div>
        <ErrMsg k="tipo" />
      </>
    );
  }

  function renderEmpresa() {
    return (
      <>
        <div className="fg">
          <Lbl req tip="razao_social">Sugestão de razão social</Lbl>
          <input className={errClass('razao_social')} type="text" value={form.razao_social}
            onChange={e => setField('razao_social', e.target.value)} />
          <ErrMsg k="razao_social" />
        </div>
        <div className="fg">
          <Lbl tip="nome_fantasia">Nome fantasia</Lbl>
          <input type="text" value={form.nome_fantasia}
            onChange={e => setField('nome_fantasia', e.target.value)} />
        </div>

        {/* CEP */}
        <div className="fg">
          <div className="lbl-row">
            <label>CEP <span className="req">*</span></label>
            <Tip tipKey="cep" />
          </div>
          <div className="cep-row">
            <div>
              <input className={errClass('cep')} type="text" maxLength={9} placeholder="00000-000"
                value={form.cep}
                onChange={e => handleCepEmpChange(e.target.value)}
                onBlur={handleCepEmpBlur} />
              <ErrMsg k="cep" />
            </div>
            <button type="button" className="btn-manual" onClick={toggleCepEmpManual}>
              {cepEmpManual ? 'Cancelar' : 'Preencher manual'}
            </button>
          </div>
          {cepEmpStatus.text && <p className="hint" style={{ color: cepEmpStatus.color }}>{cepEmpStatus.text}</p>}
        </div>

        {/* Endereço */}
        <div className="fr">
          <div className="fg">
            <Lbl req>Logradouro</Lbl>
            <input className={errClass('logradouro')} type="text" value={form.logradouro}
              readOnly={endEmpReadonly && !cepEmpManual}
              onChange={e => setField('logradouro', e.target.value)} />
            <ErrMsg k="logradouro" />
          </div>
          <div className="fg">
            <Lbl req>Número</Lbl>
            <input className={errClass('numero')} type="text" value={form.numero}
              onChange={e => setField('numero', e.target.value)} />
            <ErrMsg k="numero" />
          </div>
        </div>
        <div className="fr c3">
          <div className="fg">
            <Lbl>Complemento</Lbl>
            <input type="text" placeholder="Apto, Sala..." value={form.complemento}
              onChange={e => setField('complemento', e.target.value)} />
          </div>
          <div className="fg">
            <Lbl req>Bairro</Lbl>
            <input className={errClass('bairro')} type="text" value={form.bairro}
              readOnly={endEmpReadonly && !cepEmpManual}
              onChange={e => setField('bairro', e.target.value)} />
            <ErrMsg k="bairro" />
          </div>
          <div className="fg">
            <Lbl req>Cidade</Lbl>
            <input className={errClass('cidade')} type="text" value={form.cidade}
              readOnly={endEmpReadonly && !cepEmpManual}
              onChange={e => setField('cidade', e.target.value)} />
            <ErrMsg k="cidade" />
          </div>
        </div>
        <div className="fg" style={{ maxWidth: 140 }}>
          <Lbl req>Estado</Lbl>
          <select className={errClass('estado')} value={form.estado}
            disabled={endEmpReadonly && !cepEmpManual}
            onChange={e => setField('estado', e.target.value)}>
            <option value="">UF</option>
            {UFS.map(u => <option key={u}>{u}</option>)}
          </select>
          <ErrMsg k="estado" />
        </div>

        {/* Tipo sede */}
        <div className="fg">
          <Lbl req tip="sede_tipo">O endereço é</Lbl>
          <select className={errClass('sede_tipo')} value={form.sede_tipo}
            onChange={e => setField('sede_tipo', e.target.value)}>
            <option value="">Selecione...</option>
            <option value="proprio">Próprio</option>
            <option value="alugado">Alugado</option>
            <option value="residencial">Residencial (home office)</option>
          </select>
          <ErrMsg k="sede_tipo" />
        </div>

        {/* Atendimento */}
        <div className="fg">
          <Lbl req tip="atendimento_publico">O local terá atendimento ao público?</Lbl>
          <select className={errClass('atendimento_publico')} value={form.atendimento_publico}
            onChange={e => setField('atendimento_publico', e.target.value)}>
            <option value="">Selecione...</option>
            <option value="sim">Sim — haverá atendimento presencial</option>
            <option value="nao">Não — apenas fiscal / correspondência</option>
          </select>
          <ErrMsg k="atendimento_publico" />
        </div>

        {/* Condicional: atendimento SIM */}
        {form.atendimento_publico === 'sim' && (
          <div className="cond">
            <div className="cond-lbl">Informações do imóvel — atendimento presencial</div>
            <div className="fg">
              <Lbl req tip="area_total">Área total (m²)</Lbl>
              <input className={errClass('area_total')} type="number" min={0} value={form.area_total}
                onChange={e => setField('area_total', e.target.value)} />
              <ErrMsg k="area_total" />
            </div>
            <div className="fg">
              <Lbl req tip="habite_se">Habite-se comercial</Lbl>
              <select className={errClass('habite_se')} value={form.habite_se}
                onChange={e => setField('habite_se', e.target.value)}>
                <option value="">Selecione...</option>
                <option value="sim">Sim, possuo o Habite-se comercial</option>
                <option value="nao">Não possuo ainda (vou solicitar ao proprietário)</option>
                <option value="na">Não se aplica ao imóvel</option>
              </select>
              <ErrMsg k="habite_se" />
            </div>
            <div className="fg">
              <Lbl req tip="inscricao_imobiliaria">Inscrição imobiliária (IPTU)</Lbl>
              <input className={errClass('inscricao_imobiliaria')} type="text" value={form.inscricao_imobiliaria}
                onChange={e => setField('inscricao_imobiliaria', e.target.value)} />
              <ErrMsg k="inscricao_imobiliaria" />
            </div>
            <div className="fg">
              <Lbl req tip="horario_funcionamento">Horário de funcionamento</Lbl>
              <input className={errClass('horario_funcionamento')} type="text" placeholder="Ex: Seg a Sex 08h–18h"
                value={form.horario_funcionamento}
                onChange={e => setField('horario_funcionamento', e.target.value)} />
              <ErrMsg k="horario_funcionamento" />
            </div>
          </div>
        )}

        {/* Condicional: atendimento NÃO */}
        {form.atendimento_publico === 'nao' && (
          <div className="cond">
            <div className="cond-lbl">Informações do imóvel — endereço fiscal</div>
            <div className="fg">
              <Lbl req tip="area_total">Área total do imóvel (m²)</Lbl>
              <input className={errClass('area_total_fiscal')} type="number" min={0} value={form.area_total_fiscal}
                onChange={e => setField('area_total_fiscal', e.target.value)} />
              <ErrMsg k="area_total_fiscal" />
            </div>
            <div className="fg">
              <Lbl req tip="inscricao_imobiliaria">Inscrição imobiliária (IPTU)</Lbl>
              <input className={errClass('inscricao_imobiliaria_fiscal')} type="text" value={form.inscricao_imobiliaria_fiscal}
                onChange={e => setField('inscricao_imobiliaria_fiscal', e.target.value)} />
              <ErrMsg k="inscricao_imobiliaria_fiscal" />
            </div>
            <div className="alert alert-info" style={{ marginTop: '.5rem' }}>
              <strong>ℹ Endereço apenas fiscal</strong> — Evita exigências de alvará de bombeiro e vigilância sanitária.
            </div>
          </div>
        )}
      </>
    );
  }

  function renderAtividade() {
    const cats = [
      { id: 'servico',  l: 'Prestação de Serviços' },
      { id: 'comercio', l: 'Comércio (revenda de produtos)' },
      { id: 'industria',l: 'Indústria / Fabricação' },
    ];
    return (
      <>
        <div className="fg">
          <label>Categorias de atuação <span className="req">*</span></label>
          <p className="hint" style={{ marginBottom: '.5rem' }}>Selecione todas que se aplicam ao negócio</p>
          <div className="chk-grp">
            {cats.map(c => (
              <label key={c.id} className="chk-item">
                <input type="checkbox" checked={form.atividades.includes(c.id)}
                  onChange={() => toggleAtividade(c.id)} />
                <span>{c.l}</span>
              </label>
            ))}
          </div>
          <ErrMsg k="atividades" />
        </div>

        {form.atividades.includes('servico') && (
          <div className="cond">
            <div className="cond-lbl">Serviços — detalhamento</div>
            <div className="fg">
              <label>Descreva as atividades de serviço <span className="req">*</span></label>
              <textarea className={errClass('ativ_servico')} rows={5} value={form.ativ_servico}
                onChange={e => setField('ativ_servico', e.target.value)} />
              <ErrMsg k="ativ_servico" />
            </div>
            <div className="alert alert-warn">
              <strong>⚠ Atenção:</strong> Serviços podem estar sujeitos a retenções de impostos na fonte (ISS, PIS, COFINS, CSLL, IRPJ). Nossa equipe orientará sobre as alíquotas.
            </div>
          </div>
        )}

        {form.atividades.includes('comercio') && (
          <div className="cond">
            <div className="cond-lbl">Comércio — detalhamento</div>
            <div className="alert alert-info" style={{ marginBottom: '.75rem' }}>
              <strong>ℹ Comércio</strong> — Esta categoria é para revenda de produtos de terceiros. Para fabricação própria, utilize <strong>Indústria</strong>.
            </div>
            <div className="fg">
              <label>Descreva os produtos a serem comercializados <span className="req">*</span></label>
              <textarea className={errClass('ativ_comercio')} rows={5} value={form.ativ_comercio}
                onChange={e => setField('ativ_comercio', e.target.value)} />
              <ErrMsg k="ativ_comercio" />
            </div>
            <div className="fg">
              <label>Realizará compras de outros estados? <span className="req">*</span></label>
              <select className={errClass('compras_outros_estados')} value={form.compras_outros_estados}
                onChange={e => setField('compras_outros_estados', e.target.value)}>
                <option value="">Selecione...</option>
                <option value="sim">Sim</option>
                <option value="nao">Não</option>
              </select>
              <ErrMsg k="compras_outros_estados" />
            </div>
            {form.compras_outros_estados === 'sim' && (
              <div className="cond">
                <div className="alert alert-warn" style={{ margin: 0 }}>
                  <strong>⚠ DIFAL:</strong> Compras de outros estados podem gerar obrigação de recolhimento do Diferencial de Alíquotas. Nossa equipe irá orientar.
                </div>
              </div>
            )}
          </div>
        )}

        {form.atividades.includes('industria') && (
          <div className="cond">
            <div className="cond-lbl">Indústria — detalhamento</div>
            <div className="fg">
              <label>Descreva o que será fabricado ou produzido <span className="req">*</span></label>
              <textarea className={errClass('ativ_industria')} rows={5} value={form.ativ_industria}
                onChange={e => setField('ativ_industria', e.target.value)} />
              <ErrMsg k="ativ_industria" />
            </div>
            <div className="fg">
              <label>Realizará compras de outros estados? <span className="req">*</span></label>
              <select className={errClass('ind_compras_outros_estados')} value={form.ind_compras_outros_estados}
                onChange={e => setField('ind_compras_outros_estados', e.target.value)}>
                <option value="">Selecione...</option>
                <option value="sim">Sim</option>
                <option value="nao">Não</option>
              </select>
              <ErrMsg k="ind_compras_outros_estados" />
            </div>
          </div>
        )}
      </>
    );
  }

  function renderCapital() {
    return (
      <>
        <div className="fg">
          <Lbl req tip="capital_social">Valor do capital social</Lbl>
          <input className={errClass('capital_social')} type="text" placeholder="0,00"
            value={form.capital_social}
            onChange={e => {
              const masked = maskMoney(e.target.value);
              setField('capital_social', masked);
            }}
            onBlur={() => {
              const ext = gerarExtenso(form.capital_social);
              if (ext) setField('capital_social_extenso', ext);
            }} />
          <ErrMsg k="capital_social" />
        </div>
        <div className="fg">
          <Lbl req tip="capital_social_extenso">Capital por extenso</Lbl>
          <input className={errClass('capital_social_extenso')} type="text"
            placeholder="Preenchido automaticamente — verifique e ajuste se necessário"
            value={form.capital_social_extenso}
            onChange={e => setField('capital_social_extenso', e.target.value)} />
          <ErrMsg k="capital_social_extenso" />
        </div>
        <div className="fg">
          <Lbl req tip="capital_integralizacao">Forma de integralização</Lbl>
          <select className={errClass('capital_integralizacao')} value={form.capital_integralizacao}
            onChange={e => setField('capital_integralizacao', e.target.value)}>
            <option value="">Selecione...</option>
            <option value="total">À vista — totalmente integralizado agora</option>
            <option value="parcial">Parcelado — parte será integralizada depois</option>
          </select>
          <ErrMsg k="capital_integralizacao" />
        </div>

        {form.capital_integralizacao === 'parcial' && (
          <div className="cond">
            <div className="cond-lbl">Integralização parcelada</div>
            <div className="fg">
              <label>Valor integralizado agora <span className="req">*</span></label>
              <input className={errClass('capital_inicial')} type="text" placeholder="0,00"
                value={form.capital_inicial}
                onChange={e => setField('capital_inicial', maskMoney(e.target.value))} />
              <ErrMsg k="capital_inicial" />
            </div>
            <div className="fr">
              <div className="fg">
                <label>Em quantas parcelas? <span className="req">*</span></label>
                <input className={errClass('capital_parcelas')} type="number" min={1}
                  value={form.capital_parcelas}
                  onChange={e => setField('capital_parcelas', e.target.value)} />
                <ErrMsg k="capital_parcelas" />
              </div>
              <div className="fg">
                <label>Prazo final para integralização <span className="req">*</span></label>
                <input className={errClass('capital_prazo')} type="text" placeholder="dd/mm/aaaa" maxLength={10}
                  value={form.capital_prazo}
                  onChange={e => setField('capital_prazo', maskDate(e.target.value))} />
                <ErrMsg k="capital_prazo" />
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  function renderSocios() {
    return (
      <>
        {somaIniciada && (
          <div className={`alert ${somaOk ? 'alert-info' : 'alert-warn'}`} style={{ marginBottom: '1rem' }}>
            {somaOk
              ? <><strong>✓ Participação correta:</strong> Total = 100%</>
              : <><strong>⚠ Participação incorreta:</strong> Soma atual = <strong>{somaParticipacao.toFixed(1)}%</strong> — o total deve ser exatamente <strong>100%</strong>.</>}
          </div>
        )}

        {socios.map((s, i) => (
          <div className="socio-blk" key={i}>
            <div className="socio-hdr">
              <div className="socio-tag">Sócio {i + 1}{i === 0 ? ' — Principal' : ''}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button type="button" className="btn-copy-resp" onClick={() => copiarResponsavel(i)}>
                  ↙ Copiar dados do responsável
                </button>
                {i > 0 && (
                  <button type="button" className="btn-rm" onClick={() => removerSocio(i)}>
                    Remover
                  </button>
                )}
              </div>
            </div>

            <div className="fr">
              <div className="fg">
                <label>Nome completo <span className="req">*</span></label>
                <input className={errClass(`s${i}_nome`)} type="text" placeholder="Conforme documento"
                  value={s.nome} onChange={e => setSocioField(i, 'nome', e.target.value)} />
                <ErrMsg k={`s${i}_nome`} />
              </div>
              <div className="fg">
                <label>CPF <span className="req">*</span></label>
                <input className={errClass(`s${i}_cpf`)} type="text" maxLength={14} placeholder="000.000.000-00"
                  value={s.cpf} onChange={e => setSocioField(i, 'cpf', maskCPF(e.target.value))} />
                <ErrMsg k={`s${i}_cpf`} />
              </div>
            </div>

            <div className="fr">
              <div className="fg">
                <div className="lbl-row">
                  <label>RG <span className="req">*</span></label>
                  <Tip tipKey="socio_rg" />
                </div>
                <input className={errClass(`s${i}_rg`)} type="text"
                  value={s.rg} onChange={e => setSocioField(i, 'rg', e.target.value)} />
                <ErrMsg k={`s${i}_rg`} />
              </div>
              <div className="fg">
                <label>Data de nascimento <span className="req">*</span></label>
                <input className={errClass(`s${i}_nasc`)} type="date"
                  value={s.nasc} onChange={e => setSocioField(i, 'nasc', e.target.value)} />
                <ErrMsg k={`s${i}_nasc`} />
              </div>
            </div>

            <div className="fr">
              <div className="fg">
                <div className="lbl-row">
                  <label>Estado civil <span className="req">*</span></label>
                  <Tip tipKey="socio_civil" />
                </div>
                <select className={errClass(`s${i}_civil`)} value={s.civil}
                  onChange={e => setSocioField(i, 'civil', e.target.value)}>
                  <option value="">Selecione...</option>
                  {['Solteiro(a)','Casado(a)','Divorciado(a)','Viúvo(a)','União estável'].map(o => <option key={o}>{o}</option>)}
                </select>
                <ErrMsg k={`s${i}_civil`} />
              </div>
              <div className="fg">
                <label>Profissão <span className="req">*</span></label>
                <input className={errClass(`s${i}_profissao`)} type="text"
                  value={s.profissao} onChange={e => setSocioField(i, 'profissao', e.target.value)} />
                <ErrMsg k={`s${i}_profissao`} />
              </div>
            </div>

            {(s.civil === 'Casado(a)' || s.civil === 'União estável') && (
              <div className="cond">
                <div className="cond-lbl">Regime de casamento</div>
                <div className="fg">
                  <label>Regime de bens <span className="req">*</span></label>
                  <select className={errClass(`s${i}_regime_casamento`)} value={s.regime_casamento}
                    onChange={e => setSocioField(i, 'regime_casamento', e.target.value)}>
                    <option value="">Selecione...</option>
                    {['Comunhão parcial de bens','Comunhão universal de bens','Separação total de bens','Participação final nos aquestos'].map(o => <option key={o}>{o}</option>)}
                  </select>
                  <ErrMsg k={`s${i}_regime_casamento`} />
                </div>
              </div>
            )}

            <div className="fr">
              <div className="fg">
                <div className="lbl-row">
                  <label>Participação <span className="req">*</span></label>
                  <Tip tipKey="socio_participacao" />
                </div>
                <div className="input-pct">
                  <input className={errClass(`s${i}_participacao`)} type="number" min={0} max={100} placeholder="0"
                    value={s.participacao} onChange={e => setSocioField(i, 'participacao', e.target.value)} />
                </div>
                <ErrMsg k={`s${i}_participacao`} />
              </div>
              <div className="fg">
                <label>Telefone / WhatsApp</label>
                <input type="tel" maxLength={14} placeholder="(00) 00000-0000"
                  value={s.tel} onChange={e => setSocioField(i, 'tel', maskTel(e.target.value))} />
              </div>
            </div>

            <div className="fg">
              <label>E-mail</label>
              <input type="email" value={s.email}
                onChange={e => setSocioField(i, 'email', e.target.value)} />
            </div>

            <hr className="socio-hr" />
            <p className="hint" style={{ marginBottom: '.75rem', fontSize: 12, fontWeight: 500 }}>Endereço residencial</p>

            {/* CEP sócio */}
            <div className="fg">
              <div className="lbl-row">
                <label>CEP <span className="req">*</span></label>
                <Tip tipKey="cep" />
              </div>
              <div className="cep-row">
                <div>
                  <input className={errClass(`s${i}_end_cep`)} type="text" maxLength={9} placeholder="00000-000"
                    value={s.end_cep}
                    onChange={e => handleCepSocioChange(i, e.target.value)}
                    onBlur={() => handleCepSocioBlur(i)} />
                  <ErrMsg k={`s${i}_end_cep`} />
                </div>
                <button type="button" className="btn-manual" onClick={() => toggleCepSocioManual(i)}>
                  {cepSocioManual[i] ? 'Cancelar' : 'Preencher manual'}
                </button>
              </div>
              {cepSocioStatus[i]?.text && (
                <p className="hint" style={{ color: cepSocioStatus[i].color }}>{cepSocioStatus[i].text}</p>
              )}
            </div>

            <div className="fr">
              <div className="fg">
                <label>Logradouro <span className="req">*</span></label>
                <input className={errClass(`s${i}_end_logradouro`)} type="text"
                  readOnly={endSocioReadonly[i] && !cepSocioManual[i]}
                  value={s.end_logradouro} onChange={e => setSocioField(i, 'end_logradouro', e.target.value)} />
                <ErrMsg k={`s${i}_end_logradouro`} />
              </div>
              <div className="fg">
                <label>Número <span className="req">*</span></label>
                <input className={errClass(`s${i}_end_numero`)} type="text"
                  value={s.end_numero} onChange={e => setSocioField(i, 'end_numero', e.target.value)} />
                <ErrMsg k={`s${i}_end_numero`} />
              </div>
            </div>
            <div className="fr c3">
              <div className="fg">
                <label>Complemento</label>
                <input type="text" value={s.end_complemento}
                  onChange={e => setSocioField(i, 'end_complemento', e.target.value)} />
              </div>
              <div className="fg">
                <label>Bairro <span className="req">*</span></label>
                <input className={errClass(`s${i}_end_bairro`)} type="text"
                  readOnly={endSocioReadonly[i] && !cepSocioManual[i]}
                  value={s.end_bairro} onChange={e => setSocioField(i, 'end_bairro', e.target.value)} />
                <ErrMsg k={`s${i}_end_bairro`} />
              </div>
              <div className="fg">
                <label>Cidade <span className="req">*</span></label>
                <input className={errClass(`s${i}_end_cidade`)} type="text"
                  readOnly={endSocioReadonly[i] && !cepSocioManual[i]}
                  value={s.end_cidade} onChange={e => setSocioField(i, 'end_cidade', e.target.value)} />
                <ErrMsg k={`s${i}_end_cidade`} />
              </div>
            </div>
            <div className="fg" style={{ maxWidth: 140 }}>
              <label>Estado <span className="req">*</span></label>
              <select className={errClass(`s${i}_end_estado`)} value={s.end_estado}
                disabled={endSocioReadonly[i] && !cepSocioManual[i]}
                onChange={e => setSocioField(i, 'end_estado', e.target.value)}>
                <option value="">UF</option>
                {UFS.map(u => <option key={u}>{u}</option>)}
              </select>
              <ErrMsg k={`s${i}_end_estado`} />
            </div>

            <hr className="socio-hr" />

            {/* Outra empresa */}
            <div className="fg">
              <div className="lbl-row">
                <label>Participa de outra empresa? <span className="req">*</span></label>
                <Tip tipKey="outra_empresa" />
              </div>
              <select className={errClass(`s${i}_outra_emp`)} value={s.outra_empresa}
                onChange={e => setSocioField(i, 'outra_empresa', e.target.value)}>
                <option value="">Selecione...</option>
                <option value="sim">Sim</option>
                <option value="nao">Não</option>
              </select>
              <ErrMsg k={`s${i}_outra_emp`} />
            </div>

            {s.outra_empresa === 'sim' && (
              <div className="cond">
                <div className="alert alert-warn" style={{ marginBottom: '.75rem' }}>
                  <strong>⚠ Simples Nacional:</strong> Participação em outra empresa pode impactar o enquadramento. Nossa equipe irá avaliar.
                </div>
                <div className="fr">
                  <div className="fg">
                    <label>Nome da outra empresa <span className="req">*</span></label>
                    <input className={errClass(`s${i}_outra_nome`)} type="text"
                      value={s.outra_nome} onChange={e => setSocioField(i, 'outra_nome', e.target.value)} />
                    <ErrMsg k={`s${i}_outra_nome`} />
                  </div>
                  <div className="fg">
                    <label>CNPJ <span className="req">*</span></label>
                    <input className={errClass(`s${i}_outra_cnpj`)} type="text" maxLength={18} placeholder="00.000.000/0000-00"
                      value={s.outra_cnpj} onChange={e => setSocioField(i, 'outra_cnpj', maskCNPJ(e.target.value))} />
                    <ErrMsg k={`s${i}_outra_cnpj`} />
                  </div>
                </div>
                <div className="fr">
                  <div className="fg">
                    <label>Regime tributário <span className="req">*</span></label>
                    <select className={errClass(`s${i}_outra_regime`)} value={s.outra_regime}
                      onChange={e => setSocioField(i, 'outra_regime', e.target.value)}>
                      <option value="">Selecione...</option>
                      {['Simples Nacional','Lucro Presumido','Lucro Real','MEI'].map(o => <option key={o}>{o}</option>)}
                    </select>
                    <ErrMsg k={`s${i}_outra_regime`} />
                  </div>
                  <div className="fg">
                    <label>% de participação nessa empresa <span className="req">*</span></label>
                    <input className={errClass(`s${i}_outra_participacao`)} type="number" min={0} max={100} placeholder="0"
                      value={s.outra_participacao} onChange={e => setSocioField(i, 'outra_participacao', e.target.value)} />
                    <ErrMsg k={`s${i}_outra_participacao`} />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        <button type="button" className="btn-add" onClick={adicionarSocio}>
          + Adicionar sócio
        </button>
        {somaIniciada && !somaOk && (
          <p className="em" style={{ marginTop: '.5rem' }}>
            A soma das participações deve ser exatamente 100% (atual: {somaParticipacao.toFixed(1)}%)
          </p>
        )}
      </>
    );
  }

  function renderGestao() {
    if (!socios.length) return <p className="hint">Nenhum sócio cadastrado. Volte e cadastre os sócios.</p>;
    return (
      <>
        <div className="alert alert-info" style={{ marginBottom: '1.25rem' }}>
          <strong>ℹ Como preencher:</strong> Para cada sócio defina a função na empresa e se haverá retirada de pró-labore. Administradores têm poderes para assinar documentos e representar a empresa legalmente.
        </div>
        {socios.map((s, i) => {
          const isAdm = s.gestao_funcao === 'adm' || s.gestao_funcao === 'adm_nao_socio';
          return (
            <div className="socio-blk" key={i}>
              <div className="socio-hdr">
                <div className="socio-tag">{s.nome || `Sócio ${i + 1}`}</div>
                <div className="hint" style={{ fontSize: 11 }}>{s.participacao || '0'}% de participação</div>
              </div>

              <div className="fg">
                <div className="lbl-row">
                  <label>Função na empresa <span className="req">*</span></label>
                  <Tip tipKey="gestao_funcao" />
                </div>
                <select className={errClass(`g${i}_funcao`)} value={s.gestao_funcao}
                  onChange={e => setSocioField(i, 'gestao_funcao', e.target.value)}>
                  <option value="">Selecione...</option>
                  <option value="socio">Apenas sócio (sem poderes de administração)</option>
                  <option value="adm">Sócio administrador</option>
                  <option value="adm_nao_socio">Administrador não sócio</option>
                </select>
                <ErrMsg k={`g${i}_funcao`} />
              </div>

              {isAdm && (
                <div className="cond">
                  <div className="cond-lbl">Forma de atuação administrativa</div>
                  <div className="gestao-forma-grp">
                    {[
                      { val: 'isolada', titulo: 'Pode assinar isoladamente', desc: 'Este administrador pode assinar documentos e representar a empresa sozinho, sem precisar da assinatura de outro sócio.' },
                      { val: 'conjunto', titulo: 'Deve assinar em conjunto', desc: 'Dois ou mais administradores devem assinar juntos para que os atos tenham validade jurídica. Maior controle e segurança nas decisões.' },
                    ].map(opt => (
                      <label key={opt.val} className={`gestao-forma-card${s.gestao_forma === opt.val ? ' sel' : ''}`}
                        onClick={() => setSocioField(i, 'gestao_forma', opt.val)}>
                        <input type="radio" name={`gforma_${i}`} value={opt.val} readOnly checked={s.gestao_forma === opt.val} />
                        <div>
                          <strong>{opt.titulo}</strong>
                          <span>{opt.desc}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                  <ErrMsg k={`g${i}_forma`} />
                </div>
              )}

              <div className="fg" style={{ marginTop: '1rem' }}>
                <div className="lbl-row">
                  <label>Haverá retirada de pró-labore? <span className="req">*</span></label>
                  <Tip tipKey="prolabore" />
                </div>
                <select className={errClass(`g${i}_prolabore`)} value={s.prolabore}
                  onChange={e => setSocioField(i, 'prolabore', e.target.value)}>
                  <option value="">Selecione...</option>
                  <option value="sim">Sim</option>
                  <option value="nao">Não</option>
                </select>
                <ErrMsg k={`g${i}_prolabore`} />
              </div>

              {s.prolabore === 'sim' && (
                <div className="cond">
                  <div className="cond-lbl">Valor do pró-labore</div>
                  <div className="fg">
                    <label>Valor mensal <span className="req">*</span></label>
                    <select className={errClass(`g${i}_plopt`)} value={s.prolabore_opt}
                      onChange={e => setSocioField(i, 'prolabore_opt', e.target.value)}>
                      <option value="">Selecione...</option>
                      <option value="minimo">Salário mínimo vigente</option>
                      <option value="outro">Outro valor — informar</option>
                    </select>
                    <ErrMsg k={`g${i}_plopt`} />
                  </div>
                  {s.prolabore_opt === 'outro' && (
                    <div className="cond">
                      <div className="fg">
                        <label>Informe o valor mensal (R$) <span className="req">*</span></label>
                        <input className={errClass(`g${i}_plval`)} type="text" placeholder="0,00"
                          value={s.prolabore_valor}
                          onChange={e => setSocioField(i, 'prolabore_valor', maskMoney(e.target.value))} />
                        <ErrMsg k={`g${i}_plval`} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {s.prolabore === 'nao' && (
                <div className="alert alert-warn" style={{ marginTop: '.5rem' }}>
                  <strong>⚠ Sem pró-labore:</strong> Este sócio não terá cobertura do INSS — sem auxílio-doença, aposentadoria ou salário-maternidade enquanto não houver recolhimento.
                </div>
              )}
            </div>
          );
        })}
      </>
    );
  }

  function renderRegime() {
    return (
      <>
        <div className="fg">
          <div className="lbl-row">
            <label>Regime tributário pretendido <span className="req">*</span></label>
            <Tip tipKey="regime_tributario" />
          </div>
          <p className="hint" style={{ marginBottom: '.4rem' }}>Se não souber, nossa equipe orientará na melhor escolha</p>
          <select className={errClass('regime_tributario')} value={form.regime_tributario}
            onChange={e => setField('regime_tributario', e.target.value)}>
            <option value="">Selecione...</option>
            <option value="nao_sei">Não sei — quero orientação da equipe</option>
            <option value="simples">Simples Nacional</option>
            <option value="presumido">Lucro Presumido</option>
            <option value="real">Lucro Real</option>
            <option value="mei">MEI</option>
          </select>
          <ErrMsg k="regime_tributario" />
        </div>
        <div className="fg">
          <label>Haverá funcionários? <span className="req">*</span></label>
          <select className={errClass('tem_funcionarios')} value={form.tem_funcionarios}
            onChange={e => setField('tem_funcionarios', e.target.value)}>
            <option value="">Selecione...</option>
            <option value="sim">Sim</option>
            <option value="nao">Não</option>
          </select>
          <ErrMsg k="tem_funcionarios" />
        </div>
        {form.tem_funcionarios === 'sim' && (
          <div className="cond">
            <div className="cond-lbl">Dados sobre funcionários</div>
            <div className="fg">
              <label>Quantidade estimada <span className="req">*</span></label>
              <input className={errClass('func_quantidade')} type="number" min={1}
                value={form.func_quantidade}
                onChange={e => setField('func_quantidade', e.target.value)} />
              <ErrMsg k="func_quantidade" />
            </div>
          </div>
        )}
        <div className="fg" style={{ marginTop: '1rem' }}>
          <div className="lbl-row">
            <label>Telefone para o Cartão CNPJ <span className="req">*</span></label>
            <Tip tipKey="cnpj_telefone" />
          </div>
          <input className={errClass('cnpj_telefone')} type="tel" maxLength={14} placeholder="(00) 00000-0000"
            value={form.cnpj_telefone}
            onChange={e => handleMasked('cnpj_telefone', e.target.value, maskTel)} />
          <ErrMsg k="cnpj_telefone" />
        </div>
        <div className="fg">
          <div className="lbl-row">
            <label>E-mail para o Cartão CNPJ <span className="req">*</span></label>
            <Tip tipKey="cnpj_email" />
          </div>
          <input className={errClass('cnpj_email')} type="email"
            value={form.cnpj_email}
            onChange={e => setField('cnpj_email', e.target.value)} />
          <ErrMsg k="cnpj_email" />
        </div>
      </>
    );
  }

  function renderDocumentos() {
    const docs = [
      { id: 'doc_rg_cnh',   l: 'RG ou CNH' },
      { id: 'doc_comp_res', l: 'Comprovante de residência' },
      { id: 'doc_irpf',     l: 'Declaração de IRPF (último exercício)' },
      { id: 'doc_titulo',   l: 'Título de Eleitor' },
      { id: 'doc_iptu',     l: 'IPTU do imóvel' },
      { id: 'doc_habite_se',l: 'Habite-se comercial' },
      { id: 'doc_outros',   l: 'Outros documentos' },
    ];
    return (
      <>
        <div className="alert alert-warn" style={{ marginBottom: '1.25rem' }}>
          <strong>📎 Não é obrigatório agora</strong> — mas o envio dos documentos <strong>agiliza muito o processo</strong>. Você também poderá enviar por e-mail ou WhatsApp posteriormente.
        </div>
        {docs.map(d => (
          <div className="fg" key={d.id}>
            <label>{d.l}</label>
            <label className="upload-box" htmlFor={d.id}>
              <input id={d.id} type="file" multiple accept=".pdf,.jpg,.jpeg,.png"
                style={{ display: 'none' }}
                onChange={e => handleUpload(d.id, e.target.files)} />
              <div className="upload-label">
                <strong>Clique para selecionar</strong> ou arraste os arquivos
              </div>
              {(uploadedFiles[d.id] || []).length > 0 && (
                <div className="upload-list">
                  {(uploadedFiles[d.id] || []).map((f, idx) => (
                    <div key={idx} className="upload-item">✓ {f.name}</div>
                  ))}
                </div>
              )}
            </label>
          </div>
        ))}
      </>
    );
  }

  function renderDeclaracoes() {
    return (
      <>
        <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, marginBottom: '1.25rem' }}>
          Para enviar sua solicitação, confirme as três declarações abaixo:
        </p>
        <div className="decl-list">
          <label className="decl-item">
            <input type="checkbox" checked={form.decl1}
              onChange={e => setField('decl1', e.target.checked)} />
            <span>Confirmo que todas as informações fornecidas neste formulário são verdadeiras e de minha responsabilidade.</span>
          </label>
          <label className="decl-item">
            <input type="checkbox" checked={form.decl2}
              onChange={e => setField('decl2', e.target.checked)} />
            <span>Autorizo a A&amp;J Assessoria Contábil a realizar os procedimentos necessários para a abertura da empresa em meu nome.</span>
          </label>
          <label className="decl-item">
            <input type="checkbox" checked={form.decl3}
              onChange={e => setField('decl3', e.target.checked)} />
            <span>Autorizo o uso dos dados fornecidos para fins de registro junto aos órgãos competentes (Junta Comercial, Receita Federal, Prefeitura).</span>
          </label>
        </div>
        <ErrMsg k="decl" />
      </>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TELA DE SUCESSO
  // ═══════════════════════════════════════════════════════════════════════════

  if (enviado) {
    return (
      <div>
        <nav>
          <div className="nav-logo">
            <img src="/logo-aj-transparente.png" alt="A&J Assessoria Contábil" />
          </div>
        </nav>
        <section className="hero">
          <img src="/logo-aj-transparente.png" alt="A&J Assessoria Contábil" />
          <h1>Abertura de Empresa</h1>
          <p>Preencha as informações abaixo. Nossos contadores irão analisar seus dados e entrar em contato para finalizar o processo.</p>
          <div className="hero-line" />
        </section>
        <div className="form-wrap">
          <div className="success" style={{ display: 'block' }}>
            <div className="suc-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="#1a6b4a" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="suc-line" />
            <h2>Solicitação Recebida</h2>
            <p>Suas informações foram enviadas com sucesso. Nossa equipe entrará em contato em breve para dar continuidade ao processo.</p>
            {protocolo && <div className="suc-code">{protocolo}</div>}
            {protocolo && <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: '.25rem' }}>Guarde este número de protocolo.</p>}
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER PRINCIPAL
  // ═══════════════════════════════════════════════════════════════════════════

  function renderEtapaAtual() {
    switch (etapa.id) {
      case 'responsavel': return renderResponsavel();
      case 'tipo':        return renderTipo();
      case 'empresa':     return renderEmpresa();
      case 'atividade':   return renderAtividade();
      case 'capital':     return renderCapital();
      case 'socios':      return renderSocios();
      case 'gestao':      return renderGestao();
      case 'regime':      return renderRegime();
      case 'documentos':  return renderDocumentos();
      case 'declaracoes': return renderDeclaracoes();
      default:            return null;
    }
  }

  return (
    <div>
      <nav>
        <div className="nav-logo">
          <img src="/logo-aj-transparente.png" alt="A&J Assessoria Contábil" />
        </div>
      </nav>

      <section className="hero">
        <img src="/logo-aj-transparente.png" alt="A&J Assessoria Contábil" />
        <h1>Abertura de Empresa</h1>
        <p>Preencha as informações abaixo. Nossos contadores irão analisar seus dados e entrar em contato para finalizar o processo.</p>
        <div className="hero-line" />
      </section>

      <div className="prog-wrap">
        <div className="prog-steps">
          {ETAPAS.map((_, i) => (
            <div key={i} className={`prog-dot${i < step ? ' done' : i === step ? ' active' : ''}`} />
          ))}
        </div>
        <div className="prog-lbl">Etapa {step + 1} de {ETAPAS.length}</div>
      </div>

      <form className="form-wrap" onSubmit={handleSubmit}>
        <div className="fsec">
          <div className="sec-hdr">
            <div className="sec-num">{step + 1}</div>
            <div>
              <div className="sec-title">{etapa.title}</div>
              <div className="sec-sub">{etapa.sub}</div>
            </div>
          </div>
          {renderEtapaAtual()}
        </div>

        <div className="nav-btns">
          {step > 0
            ? <button type="button" className="btn-sec" onClick={voltar}>← Voltar</button>
            : <span />}
          {step < ETAPAS.length - 1
            ? <button type="button" className="btn-pri" onClick={avancar}>Continuar →</button>
            : <button type="submit" className="btn-pri" disabled={enviando}>{enviando ? 'Enviando arquivos...' : 'Enviar Solicitação'}</button>}
        </div>
      </form>
    </div>
  );
}
