# CIC — Schema do Banco de Dados

## Tecnologia Recomendada
- **PostgreSQL** (principal)
- **Redis** (cache, filas, sessões, WebSocket)
- **S3/R2** (storage de mídia)

---

## Tabelas

### Autenticação & Usuários

```sql
-- Usuários
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(500),
  phone VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sessões/Tokens
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Campanhas & Equipe

```sql
-- Campanhas
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  candidate_name VARCHAR(255) NOT NULL,
  candidate_position VARCHAR(100), -- prefeito, governador, etc
  city VARCHAR(100),
  state VARCHAR(2),
  color VARCHAR(7) DEFAULT '#FF2D2D',
  initials VARCHAR(3),
  election_date DATE,
  status VARCHAR(20) DEFAULT 'active', -- active, archived, completed
  plan VARCHAR(20) DEFAULT 'profissional', -- essencial, profissional, enterprise
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Membros da equipe
CREATE TABLE campaign_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  profile VARCHAR(30) NOT NULL, -- admin, gerente, produtor, analista, coordenador, financeiro, curador, roteiristaTV, roteiristaRadio
  custom_modules TEXT[], -- array de módulos permitidos, ou NULL para "todos"
  is_owner BOOLEAN DEFAULT false,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(campaign_id, user_id)
);

-- Perfis de acesso
CREATE TABLE access_profiles (
  id VARCHAR(30) PRIMARY KEY, -- admin, gerente, etc
  label VARCHAR(100) NOT NULL,
  description TEXT,
  default_modules TEXT[], -- módulos padrão do perfil
  permissions TEXT[] -- ler, criar, editar, excluir, aprovar, configurar, exportar
);
```

### Demandas

```sql
CREATE TABLE demandas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  origem VARCHAR(50), -- cliente, equipe, monitoramento, ia
  prioridade VARCHAR(20) DEFAULT 'media', -- urgente, alta, media, baixa
  status VARCHAR(20) DEFAULT 'nova', -- nova, andamento, concluida, cancelada
  destino VARCHAR(30), -- prod, comm, estr, mon, social, vol, agenda, ia
  atribuido_a UUID REFERENCES users(id),
  prazo TIMESTAMPTZ,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE demanda_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  demanda_id UUID REFERENCES demandas(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Diagnóstico

```sql
-- Pesquisas eleitorais
CREATE TABLE pesquisas_eleitorais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  instituto VARCHAR(100) NOT NULL,
  data_publicacao DATE NOT NULL,
  tipo VARCHAR(30), -- estimulada, espontanea
  margem_erro DECIMAL(3,1),
  amostra INTEGER,
  registro_tse VARCHAR(50),
  dados JSONB NOT NULL, -- {candidatos: [{nome, percentual}], cenarios: [...]}
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SWOT
CREATE TABLE swot_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  quadrante VARCHAR(20) NOT NULL, -- forca, fraqueza, oportunidade, ameaca
  texto TEXT NOT NULL,
  peso INTEGER DEFAULT 5, -- 1-10
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Posicionamento por tema
CREATE TABLE posicionamento_temas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  tema VARCHAR(100) NOT NULL,
  posicao_candidato TEXT,
  posicao_adversarios JSONB, -- [{nome, posicao}]
  relevancia INTEGER DEFAULT 5,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Monitoramento

```sql
-- Menções coletadas
CREATE TABLE mencoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  plataforma VARCHAR(30) NOT NULL, -- instagram, twitter, facebook, tiktok, youtube, imprensa, radio, tv
  tipo VARCHAR(20), -- post, comentario, materia, entrevista
  sentimento VARCHAR(10), -- positivo, neutro, negativo
  conteudo TEXT,
  autor VARCHAR(200),
  url VARCHAR(500),
  alcance INTEGER DEFAULT 0,
  engajamento INTEGER DEFAULT 0,
  coletado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_mencoes_campaign_date ON mencoes(campaign_id, coletado_em DESC);
CREATE INDEX idx_mencoes_sentimento ON mencoes(campaign_id, sentimento);

-- Crises
CREATE TABLE crises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  nivel VARCHAR(20), -- baixo, medio, alto, critico
  status VARCHAR(20) DEFAULT 'ativa', -- ativa, monitorando, resolvida
  origem VARCHAR(100),
  acao_tomada TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);
```

### CRM Eleitores

```sql
CREATE TABLE eleitores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  telefone VARCHAR(20),
  regiao VARCHAR(100),
  zona_eleitoral VARCHAR(10),
  secao VARCHAR(10),
  bairro VARCHAR(100),
  faixa_etaria VARCHAR(20),
  genero VARCHAR(20),
  renda VARCHAR(30),
  escolaridade VARCHAR(30),
  profissao VARCHAR(100),
  tags TEXT[],
  score_ia INTEGER DEFAULT 0, -- 0-100
  score_fatores JSONB, -- {historico: 25, perfil: 20, ...}
  status VARCHAR(20) DEFAULT 'potencial', -- potencial, contato, apoiador, engajado, lider
  ultima_interacao TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE eleitor_interacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  eleitor_id UUID REFERENCES eleitores(id) ON DELETE CASCADE,
  tipo VARCHAR(30), -- whatsapp, sms, email, presencial, telefone, evento
  descricao TEXT,
  sentimento VARCHAR(10),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE segmentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  nome VARCHAR(100) NOT NULL,
  filtros JSONB, -- {regiao: "zona sul", faixa_etaria: "30-50", ...}
  total_eleitores INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Arrecadação

```sql
CREATE TABLE doadores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  tipo VARCHAR(2) NOT NULL, -- PF, PJ
  cpf_cnpj VARCHAR(18),
  email VARCHAR(255),
  telefone VARCHAR(20),
  limite_legal DECIMAL(12,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE doacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  doador_id UUID REFERENCES doadores(id),
  valor DECIMAL(12,2) NOT NULL,
  metodo VARCHAR(30), -- pix, cartao, boleto, especie
  status VARCHAR(20) DEFAULT 'confirmada', -- pendente, confirmada, estornada
  comprovante_url VARCHAR(500),
  recibo_tse VARCHAR(50),
  data_doacao TIMESTAMPTZ DEFAULT NOW()
);
```

### Comunicação

```sql
CREATE TABLE templates_msg (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  nome VARCHAR(100) NOT NULL,
  canal VARCHAR(20) NOT NULL, -- whatsapp, sms, email
  conteudo TEXT NOT NULL,
  variaveis TEXT[], -- {nome}, {bairro}, etc
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE disparos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  canal VARCHAR(20) NOT NULL,
  template_id UUID REFERENCES templates_msg(id),
  segmento_id UUID REFERENCES segmentos(id),
  total_enviados INTEGER DEFAULT 0,
  total_entregues INTEGER DEFAULT 0,
  total_lidos INTEGER DEFAULT 0,
  total_cliques INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pendente', -- pendente, enviando, concluido, erro
  agendado_para TIMESTAMPTZ,
  enviado_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE automacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  nome VARCHAR(100) NOT NULL,
  trigger_tipo VARCHAR(50), -- novo_eleitor, score_alterado, aniversario, evento_proximo
  acao_tipo VARCHAR(50), -- enviar_whatsapp, enviar_sms, enviar_email, criar_tarefa
  config JSONB, -- configurações específicas
  is_active BOOLEAN DEFAULT true,
  execucoes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Voluntários

```sql
CREATE TABLE voluntarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  telefone VARCHAR(20),
  email VARCHAR(255),
  bairro VARCHAR(100),
  disponibilidade VARCHAR(50),
  habilidades TEXT[],
  horas_trabalhadas DECIMAL(6,1) DEFAULT 0,
  pontos INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'ativo',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tarefas_voluntarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  atribuido_a UUID REFERENCES voluntarios(id),
  status VARCHAR(20) DEFAULT 'pendente', -- pendente, fazendo, concluida
  prioridade VARCHAR(20) DEFAULT 'media',
  prazo TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE acoes_campo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  tipo VARCHAR(50), -- panfletagem, caminhada, comicio, reuniao, porta_a_porta
  local VARCHAR(200),
  data_hora TIMESTAMPTZ,
  voluntarios_confirmados INTEGER DEFAULT 0,
  casas_visitadas INTEGER DEFAULT 0,
  contatos_realizados INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'planejada',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Produção IA

```sql
CREATE TABLE producoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  tipo VARCHAR(30) NOT NULL, -- foto, jingle, roteiro_tv, roteiro_radio, flyer, locucao
  titulo VARCHAR(255),
  prompt TEXT,
  resultado TEXT, -- texto gerado / URL do arquivo
  status VARCHAR(20) DEFAULT 'gerado', -- gerado, aprovado, rejeitado, editado
  aprovado_por UUID REFERENCES users(id),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Publicação Social

```sql
CREATE TABLE posts_agendados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  plataformas TEXT[] NOT NULL, -- instagram, facebook, twitter, tiktok, youtube
  conteudo TEXT NOT NULL,
  midia_url VARCHAR(500),
  agendado_para TIMESTAMPTZ NOT NULL,
  status VARCHAR(20) DEFAULT 'agendado', -- agendado, publicado, cancelado, erro
  producao_id UUID REFERENCES producoes(id),
  metricas JSONB, -- {curtidas, comentarios, compartilhamentos, alcance}
  publicado_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Agenda

```sql
CREATE TABLE compromissos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  titulo VARCHAR(255) NOT NULL,
  local VARCHAR(200),
  tipo VARCHAR(30), -- reuniao, gravacao, entrevista, comicio, caminhada, digital, articulacao
  data_hora_inicio TIMESTAMPTZ NOT NULL,
  data_hora_fim TIMESTAMPTZ,
  cor VARCHAR(7),
  briefing_ia TEXT, -- gerado automaticamente
  notas TEXT,
  google_calendar_id VARCHAR(200),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Simulador de Debate

```sql
CREATE TABLE debate_sessoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  adversario_tipo VARCHAR(30), -- agressivo, tecnico, moderador
  tema VARCHAR(100),
  score_final DECIMAL(3,1),
  total_perguntas INTEGER DEFAULT 0,
  duracao_minutos INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE debate_turnos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sessao_id UUID REFERENCES debate_sessoes(id) ON DELETE CASCADE,
  pergunta TEXT NOT NULL,
  resposta_usuario TEXT,
  feedback_ia TEXT,
  score INTEGER, -- 1-10
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Relatórios

```sql
CREATE TABLE relatorios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL, -- semanal, mensal, pesquisas, prestacao_contas, adversarios, personalizado
  titulo VARCHAR(255),
  config JSONB, -- configurações do relatório
  arquivo_url VARCHAR(500),
  paginas INTEGER,
  formato VARCHAR(10) DEFAULT 'pdf', -- pdf, excel
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE relatorio_envio_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  frequencia VARCHAR(20), -- diario, semanal, quinzenal, mensal
  dia_semana INTEGER, -- 0-6 (domingo-sábado)
  hora TIME,
  destinatarios TEXT[], -- emails
  formato VARCHAR(10) DEFAULT 'pdf',
  is_active BOOLEAN DEFAULT true
);
```

### Pesquisas / Surveys

```sql
CREATE TABLE surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  perguntas JSONB NOT NULL, -- [{texto, tipo, opcoes}]
  status VARCHAR(20) DEFAULT 'rascunho', -- rascunho, ativa, encerrada
  total_respostas INTEGER DEFAULT 0,
  canal_disparo VARCHAR(20), -- whatsapp, sms, email, link
  created_at TIMESTAMPTZ DEFAULT NOW(),
  encerrada_em TIMESTAMPTZ
);

CREATE TABLE survey_respostas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
  respostas JSONB NOT NULL, -- [{pergunta_idx, resposta}]
  respondente_info JSONB, -- {regiao, faixa_etaria, ...}
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Mapa Eleitoral

```sql
CREATE TABLE regioes_eleitorais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  nome VARCHAR(100) NOT NULL,
  tipo VARCHAR(20), -- zona, bairro, distrito, regiao
  zona_eleitoral VARCHAR(10),
  total_eleitores INTEGER,
  intencao_voto DECIMAL(4,1),
  potencial VARCHAR(20), -- forte, disputada, fraca
  coordenadas JSONB, -- {lat, lng} para mapa
  dados_demograficos JSONB, -- {faixa_etaria: {...}, genero: {...}, renda: {...}}
  prioridade_ia INTEGER, -- 1-10
  acao_recomendada TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Estratégica

```sql
CREATE TABLE decisoes_estrategicas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  titulo VARCHAR(255) NOT NULL,
  contexto TEXT,
  recomendacao_ia TEXT,
  modulos_relacionados TEXT[], -- ['mon', 'diag', 'crm']
  status VARCHAR(20) DEFAULT 'pendente', -- pendente, aprovada, rejeitada
  decidido_por UUID REFERENCES users(id),
  decidido_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE matriz_comunicacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  eixo VARCHAR(20) NOT NULL, -- oque, como, onde, porque
  items JSONB NOT NULL, -- [{titulo, descricao}]
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE narrativa_campanha (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  mensagem_central TEXT,
  eixos JSONB, -- [{nome, descricao, tom}]
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE timeline_estrategica (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  semana INTEGER NOT NULL,
  titulo VARCHAR(100),
  acoes JSONB, -- [{descricao, responsavel, status}]
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Assistente IA

```sql
CREATE TABLE ia_conversas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  mensagens JSONB NOT NULL, -- [{role, content, timestamp}]
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Índices Recomendados

```sql
CREATE INDEX idx_demandas_campaign ON demandas(campaign_id, status);
CREATE INDEX idx_mencoes_campaign ON mencoes(campaign_id, coletado_em DESC);
CREATE INDEX idx_eleitores_campaign ON eleitores(campaign_id, score_ia DESC);
CREATE INDEX idx_doacoes_campaign ON doacoes(campaign_id, data_doacao DESC);
CREATE INDEX idx_compromissos_campaign ON compromissos(campaign_id, data_hora_inicio);
CREATE INDEX idx_posts_campaign ON posts_agendados(campaign_id, agendado_para);
CREATE INDEX idx_producoes_campaign ON producoes(campaign_id, created_at DESC);
```
