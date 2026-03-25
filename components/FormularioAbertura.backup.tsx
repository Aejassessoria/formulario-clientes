'use client';

import { useState } from 'react';

type Socio = {
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  participacao: string;
};

const etapas = [
  { id: 'responsavel', titulo: 'Dados do Responsável', subtitulo: 'Informações pessoais de quem abre a empresa' },
  { id: 'tipo', titulo: 'Tipo de Empresa', subtitulo: 'Selecione o formato jurídico do negócio' },
  { id: 'empresa', titulo: 'Nome e Endereço', subtitulo: 'Razão social e localização da empresa' },
  { id: 'atividade', titulo: 'Atividade da Empresa', subtitulo: 'O que sua empresa irá exercer' },
  { id: 'capital', titulo: 'Capital Social', subtitulo: 'Valor investido para início das operações' },
  { id: 'socios', titulo: 'Sócios', subtitulo: 'Dados pessoais dos sócios' },
  { id: 'regime', titulo: 'Regime Tributário', subtitulo: 'Tributação, equipe e contatos para o CNPJ' },
  { id: 'documentos', titulo: 'Documentos', subtitulo: 'Envio de documentação' },
  { id: 'declaracoes', titulo: 'Declarações Finais', subtitulo: 'Confirmações obrigatórias para enviar' },
];

export default function FormularioAbertura() {
  const [etapaAtual, setEtapaAtual] = useState(0);
  const [enviado, setEnviado] = useState(false);

  const [form, setForm] = useState({
    resp_nome: '',
    resp_cpf: '',
    resp_email: '',
    resp_tel: '',
    tipo: '',
    razao_social: '',
    nome_fantasia: '',
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    atividade_resumo: '',
    capital_social: '',
    regime_tributario: '',
    cnpj_email: '',
    cnpj_telefone: '',
    declaracao_veracidade: false,
    declaracao_lgpd: false,
  });

  const [socios, setSocios] = useState<Socio[]>([
    { nome: '', cpf: '', email: '', telefone: '', participacao: '' },
  ]);

  const etapa = etapas[etapaAtual];
  const progresso = ((etapaAtual + 1) / etapas.length) * 100;

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  function handleSocioChange(index: number, field: keyof Socio, value: string) {
    setSocios((prev) => {
      const copia = [...prev];
      copia[index] = { ...copia[index], [field]: value };
      return copia;
    });
  }

  function adicionarSocio() {
    setSocios((prev) => [
      ...prev,
      { nome: '', cpf: '', email: '', telefone: '', participacao: '' },
    ]);
  }

  function removerSocio(index: number) {
    if (socios.length === 1) return;
    setSocios((prev) => prev.filter((_, i) => i !== index));
  }

  function proximaEtapa() {
    if (etapaAtual < etapas.length - 1) {
      setEtapaAtual((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function etapaAnterior() {
    if (etapaAtual > 0) {
      setEtapaAtual((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();

  const payload = {
    ...form,
    socios,
  };

  try {
    const response = await fetch('/api/solicitacoes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const resultado = await response.json();

    if (!response.ok || !resultado.ok) {
      alert('Erro ao enviar a solicitação.');
      return;
    }

    console.log('Resposta da API:', resultado);

    setEnviado(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (error) {
    console.error('Erro no envio:', error);
    alert('Não foi possível enviar a solicitação.');
  }
}

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
          <h1>Solicitação Recebida</h1>
          <p>Recebemos suas informações com sucesso.</p>
        </section>

        <div className="success">
          <h2>Solicitação enviada com sucesso</h2>
          <p style={{ marginTop: '12px' }}>
            Nossa equipe entrará em contato em breve para dar continuidade ao processo.
          </p>
        </div>
      </div>
    );
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
        <p>Preencha os dados abaixo para iniciarmos o processo de abertura da sua empresa.</p>
      </section>

      <div className="prog-wrap">
        <div
          style={{
            width: '100%',
            height: '10px',
            background: '#EEECEA',
            borderRadius: '999px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${progresso}%`,
              height: '100%',
              background: '#B8A882',
              transition: '0.3s',
            }}
          />
        </div>

        <div style={{ marginTop: '10px', fontSize: '12px', color: '#7a7c8a' }}>
          Etapa {etapaAtual + 1} de {etapas.length}
        </div>
      </div>

      <form className="form-wrap" onSubmit={handleSubmit}>
        <div className="fsec">
          <p style={{ fontSize: '12px', textTransform: 'uppercase', color: '#7a7c8a', marginBottom: '8px' }}>
            Etapa atual
          </p>
          <h2 style={{ marginBottom: '8px' }}>{etapa.titulo}</h2>
          <p style={{ color: '#7a7c8a' }}>{etapa.subtitulo}</p>
        </div>

        {etapa.id === 'responsavel' && (
          <div className="fsec">
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label htmlFor="resp_nome">Nome do responsável</label>
                <input
                  id="resp_nome"
                  name="resp_nome"
                  value={form.resp_nome}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="resp_cpf">CPF</label>
                <input
                  id="resp_cpf"
                  name="resp_cpf"
                  value={form.resp_cpf}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="resp_email">E-mail</label>
                <input
                  id="resp_email"
                  name="resp_email"
                  type="email"
                  value={form.resp_email}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="resp_tel">Telefone</label>
                <input
                  id="resp_tel"
                  name="resp_tel"
                  value={form.resp_tel}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        )}

        {etapa.id === 'tipo' && (
          <div className="fsec">
            <label htmlFor="tipo">Tipo de empresa</label>
            <select id="tipo" name="tipo" value={form.tipo} onChange={handleChange}>
              <option value="">Selecione</option>
              <option value="LTDA">LTDA</option>
              <option value="SLU">SLU</option>
              <option value="EI">EI</option>
            </select>
          </div>
        )}

        {etapa.id === 'empresa' && (
          <div className="fsec">
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label htmlFor="razao_social">Razão social</label>
                <input
                  id="razao_social"
                  name="razao_social"
                  value={form.razao_social}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="nome_fantasia">Nome fantasia</label>
                <input
                  id="nome_fantasia"
                  name="nome_fantasia"
                  value={form.nome_fantasia}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="cep">CEP</label>
                <input id="cep" name="cep" value={form.cep} onChange={handleChange} />
              </div>

              <div>
                <label htmlFor="logradouro">Logradouro</label>
                <input
                  id="logradouro"
                  name="logradouro"
                  value={form.logradouro}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="numero">Número</label>
                <input
                  id="numero"
                  name="numero"
                  value={form.numero}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="complemento">Complemento</label>
                <input
                  id="complemento"
                  name="complemento"
                  value={form.complemento}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="bairro">Bairro</label>
                <input
                  id="bairro"
                  name="bairro"
                  value={form.bairro}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="cidade">Cidade</label>
                <input
                  id="cidade"
                  name="cidade"
                  value={form.cidade}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="estado">Estado</label>
                <input
                  id="estado"
                  name="estado"
                  value={form.estado}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        )}

        {etapa.id === 'atividade' && (
          <div className="fsec">
            <label htmlFor="atividade_resumo">Descreva a atividade da empresa</label>
            <textarea
              id="atividade_resumo"
              name="atividade_resumo"
              rows={6}
              value={form.atividade_resumo}
              onChange={handleChange}
            />
          </div>
        )}

        {etapa.id === 'capital' && (
          <div className="fsec">
            <label htmlFor="capital_social">Capital social</label>
            <input
              id="capital_social"
              name="capital_social"
              value={form.capital_social}
              onChange={handleChange}
            />
          </div>
        )}

        {etapa.id === 'socios' && (
          <div className="fsec">
            <h3 style={{ marginBottom: '16px' }}>Sócios</h3>

            {socios.map((socio, index) => (
              <div
                key={index}
                style={{
                  border: '1px solid rgba(48,50,62,.13)',
                  borderRadius: '10px',
                  padding: '16px',
                  marginBottom: '16px',
                  background: '#F7F6F3',
                }}
              >
                <div style={{ display: 'grid', gap: '12px' }}>
                  <div>
                    <label htmlFor={`socio_nome_${index}`}>Nome do sócio</label>
                    <input
                      id={`socio_nome_${index}`}
                      value={socio.nome}
                      onChange={(e) => handleSocioChange(index, 'nome', e.target.value)}
                    />
                  </div>

                  <div>
                    <label htmlFor={`socio_cpf_${index}`}>CPF</label>
                    <input
                      id={`socio_cpf_${index}`}
                      value={socio.cpf}
                      onChange={(e) => handleSocioChange(index, 'cpf', e.target.value)}
                    />
                  </div>

                  <div>
                    <label htmlFor={`socio_email_${index}`}>E-mail</label>
                    <input
                      id={`socio_email_${index}`}
                      type="email"
                      value={socio.email}
                      onChange={(e) => handleSocioChange(index, 'email', e.target.value)}
                    />
                  </div>

                  <div>
                    <label htmlFor={`socio_telefone_${index}`}>Telefone</label>
                    <input
                      id={`socio_telefone_${index}`}
                      value={socio.telefone}
                      onChange={(e) => handleSocioChange(index, 'telefone', e.target.value)}
                    />
                  </div>

                  <div>
                    <label htmlFor={`socio_participacao_${index}`}>Participação (%)</label>
                    <input
                      id={`socio_participacao_${index}`}
                      value={socio.participacao}
                      onChange={(e) => handleSocioChange(index, 'participacao', e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ marginTop: '12px' }}>
                  <button
                    type="button"
                    className="btn-pri"
                    onClick={() => removerSocio(index)}
                  >
                    Remover sócio
                  </button>
                </div>
              </div>
            ))}

            <button type="button" className="btn-pri" onClick={adicionarSocio}>
              Adicionar sócio
            </button>
          </div>
        )}

        {etapa.id === 'regime' && (
          <div className="fsec">
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label htmlFor="regime_tributario">Regime tributário</label>
                <select
                  id="regime_tributario"
                  name="regime_tributario"
                  value={form.regime_tributario}
                  onChange={handleChange}
                >
                  <option value="">Selecione</option>
                  <option value="Simples Nacional">Simples Nacional</option>
                  <option value="Lucro Presumido">Lucro Presumido</option>
                  <option value="Lucro Real">Lucro Real</option>
                </select>
              </div>

              <div>
                <label htmlFor="cnpj_email">E-mail do CNPJ</label>
                <input
                  id="cnpj_email"
                  name="cnpj_email"
                  type="email"
                  value={form.cnpj_email}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="cnpj_telefone">Telefone do CNPJ</label>
                <input
                  id="cnpj_telefone"
                  name="cnpj_telefone"
                  value={form.cnpj_telefone}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        )}

        {etapa.id === 'documentos' && (
          <div className="fsec">
            <label htmlFor="documentos">Envio de documentos</label>
            <div className="upload-box" style={{ marginTop: '10px' }}>
              <p style={{ marginBottom: '10px' }}>
                Você poderá anexar os documentos nesta etapa.
              </p>
              <input id="documentos" type="file" multiple />
            </div>
          </div>
        )}

        {etapa.id === 'declaracoes' && (
          <div className="fsec">
            <div style={{ display: 'grid', gap: '14px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', textTransform: 'none' }}>
                <input
                  type="checkbox"
                  name="declaracao_veracidade"
                  checked={form.declaracao_veracidade}
                  onChange={handleChange}
                  style={{ width: 'auto' }}
                />
                Declaro que as informações prestadas são verdadeiras.
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', textTransform: 'none' }}>
                <input
                  type="checkbox"
                  name="declaracao_lgpd"
                  checked={form.declaracao_lgpd}
                  onChange={handleChange}
                  style={{ width: 'auto' }}
                />
                Autorizo o uso dos dados para fins de abertura da empresa e trâmites contábeis.
              </label>
            </div>
          </div>
        )}

        <div
          className="fsec"
          style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}
        >
          <button
            type="button"
            className="btn-pri"
            onClick={etapaAnterior}
            disabled={etapaAtual === 0}
            style={{
              opacity: etapaAtual === 0 ? 0.5 : 1,
              cursor: etapaAtual === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            Voltar
          </button>

          {etapaAtual < etapas.length - 1 ? (
            <button type="button" className="btn-pri" onClick={proximaEtapa}>
              Próxima etapa
            </button>
          ) : (
            <button type="submit" className="btn-pri">
              Enviar solicitação
            </button>
          )}
        </div>
      </form>
    </div>
  );
}