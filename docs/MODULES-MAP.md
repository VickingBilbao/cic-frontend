# CIC — Mapa de Módulos

## Visão Geral da Arquitetura

```
┌──────────────────────────────────────────────────────────────┐
│                        LOGIN                                  │
│  Email + Senha → JWT → Seleção de Campanha → Dashboard       │
└──────────────────────────┬───────────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────────┐
│                     SIDEBAR (19 módulos)                       │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐      │
│  │  Dashboard   │  │  Demandas    │  │  Diagnóstico   │      │
│  │  (KPIs)      │  │  (Hub ops)   │  │  (4 abas)      │      │
│  └─────────────┘  └──────┬───────┘  └────────────────┘      │
│                          │                                    │
│         Distribui para ──┼──────────────────┐                │
│                          ▼                  ▼                │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐      │
│  │ Monitoramento│  │  CRM         │  │  Arrecadação   │      │
│  │ (4 abas)    │  │  (4 abas)    │  │  (3 abas)      │      │
│  └─────────────┘  └──────────────┘  └────────────────┘      │
│                                                               │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐      │
│  │ Comunicação  │  │ Voluntários  │  │  Produção IA   │      │
│  │ (4 abas)    │  │ (4 abas)     │  │  (6 ferrament.) │      │
│  └─────────────┘  └──────────────┘  └────────────────┘      │
│                                                               │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐      │
│  │ Pub. Social  │  │  Agenda      │  │ Sim. Debate IA │      │
│  │ (3 abas)    │  │ (3 abas)     │  │ (Exclusivo)    │      │
│  └─────────────┘  └──────────────┘  └────────────────┘      │
│                                                               │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐      │
│  │ Relatórios   │  │  Pesquisas   │  │ Dia Eleição    │      │
│  │ (3 abas)    │  │ (3 abas)     │  │ (GOTV)         │      │
│  └─────────────┘  └──────────────┘  └────────────────┘      │
│                                                               │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐      │
│  │ Mapa Eleit.  │  │ Estratégica  │  │ Assistente IA  │      │
│  │ (4 abas)    │  │ (4 abas)     │  │ (Chat)         │      │
│  └─────────────┘  └──────────────┘  └────────────────┘      │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐    │
│  │              Configurações (5 abas)                    │    │
│  │  Perfil · Conta · Notificações · Plano · Equipe       │    │
│  └──────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

---

## Detalhamento por Módulo

### 1. Dashboard (`dash`) → `Dash`
- **KPIs:** Intenção de voto, Menções positivas, Rejeição, Engajamento
- **Widgets:** Health Score, Countdown eleição, Calendário semanal
- **Gráficos:** Cenário eleitoral (barras), Sentimento (donut)
- **Alertas:** Banner topo com alertas de crise/oportunidade
- **Dados necessários:** GET /dashboard, GET /dashboard/health, GET /dashboard/alerts

### 2. Central de Demandas (`demandas`) → `CentralDemandas`
- **Abas:** Novas, Em Andamento, Concluídas, Todas
- **Destinos:** Produção IA, Comunicação, Estratégica, Monitoramento, Pub. Social, Voluntários, Agenda, Assistente IA
- **Features:** Formulário nova demanda, IA sugere destinos, atribuição por membro, filtro por prioridade
- **Dados necessários:** CRUD /demandas, POST /demandas/:id/ai-suggest

### 3. Diagnóstico (`diag`) → `Diag`
- **Abas:**
  - Pesquisas: Agregador 4 institutos, evolução 12 semanas, tabela comparativa
  - SWOT: 5 itens por quadrante com barras de peso
  - Cenário: Donuts 1°/2° turno, projeção IA 8 semanas, 3 cenários
  - Posicionamento: Grid comparativo 6 temas × 3 candidatos
- **Dados necessários:** GET /diagnostico/pesquisas, /swot, /cenarios, /posicionamento

### 4. Monitoramento (`mon`) → `Mon`
- **Abas:**
  - Redes Sociais: 5 plataformas, volume, sentimento, trending
  - Imprensa: Clipping + rádio/TV
  - Adversários: Comparativo 3 candidatos
  - Território & Crises: Crises ativas + menções por região + ações IA
- **WebSocket:** Dados em tempo real para menções e alertas
- **Dados necessários:** GET /monitoramento/*, WS /monitoramento/live

### 5. CRM Eleitores (`crm`) → `CRMEleitores`
- **Abas:**
  - Base Eleitoral: Tabela 8+ eleitores, busca, filtro
  - Segmentos: 4 gráficos de distribuição
  - Interações: Histórico por eleitor
  - Scoring IA: Metodologia 6 fatores + distribuição scores
- **Actions:** +Novo Contato, Importar Lista, Importar TSE, Criar Segmento
- **Dados necessários:** CRUD /crm/*, POST /crm/import, POST /crm/scoring/recalculate

### 6. Arrecadação (`fund`) → `Fundraising`
- **Abas:**
  - Visão Geral: Barra progresso R$847k/R$1.2M
  - Doadores: Lista PF/PJ com limites
  - Compliance TSE: Alertas e prazos
- **Actions:** +Nova Doação, Link de Doação, Cadastrar Doador, Importar, Relatório TSE
- **Dados necessários:** CRUD /fundraising/*

### 7. Comunicação (`comm`) → `Comunicacao`
- **Abas:**
  - Disparos: 4 canais (WhatsApp, SMS, Email, Ligação)
  - Templates: 6 prontos + criação
  - Automações: 4 fluxos configuráveis
  - Métricas: Por canal com taxas
- **Integrações:** WhatsApp Business API, Twilio, SendGrid
- **Dados necessários:** CRUD /comunicacao/*, POST /comunicacao/ai-generate

### 8. Voluntários (`vol`) → `Voluntarios`
- **Abas:**
  - Equipe: Lista com status
  - Tarefas: Kanban (Pendente/Fazendo/Concluída)
  - Ações de Campo: Histórico + próximas
  - Ranking: Top 5 com medalhas e pontos
- **Actions:** +Novo Voluntário, Importar, Nova Tarefa, Atribuir em Lote, Nova Ação de Campo
- **Dados necessários:** CRUD /voluntarios/*

### 9. Produção IA (`prod`) → `Prod`
- **KPIs:** Peças geradas 247, Aprovadas 198, Aguardando 12, Tempo médio 3.2m
- **6 Ferramentas:** Foto IA, Jingle, Roteiro TV, Roteiro Rádio, Flyer, Locução
- **Chat IA:** Pedidos em linguagem natural
- **Output:** Preview em PhoneMockup (feed + story), botões Aprovar/Editar/Refazer/Baixar
- **Integrações:** API de IA (OpenAI/Anthropic), Storage (S3/R2)
- **Dados necessários:** POST /producao/gerar, CRUD /producao/gerados

### 10. Publicação Social (`social`) → `SocialPublisher`
- **Abas:**
  - Agendar Post: 5 plataformas, preview mockup, recomendação IA de horário
  - Calendário Editorial: Vista semanal
  - Analytics: Métricas por plataforma
- **Integrações:** Meta Graph API, Twitter API, TikTok API
- **Dados necessários:** CRUD /social/*, POST /social/ai-suggest

### 11. Agenda (`agenda`) → `AgendaCandidato`
- **Abas:** Hoje, Semana, Mês
- **Features:** 6 compromissos com Briefing IA automático, cores por tipo
- **Actions:** +Novo Compromisso, Sync Google Calendar
- **Integrações:** Google Calendar API
- **Dados necessários:** CRUD /agenda/*, GET /agenda/:id/briefing

### 12. Simulador de Debate IA (`debate`) → `SimuladorDebate`
- **KPIs:** Sessões 14, Perguntas 87, Score 7.4, Tempo 4.2h
- **3 Oponentes:** Agressivo, Técnico, Moderador — baseados no monitoramento
- **Features:** Chat interativo, feedback IA, score por resposta
- **Exclusividade:** Único no mercado mundial
- **Dados necessários:** POST /debate/iniciar, POST /debate/responder, GET /debate/stats

### 13. Relatórios (`relat`) → `Relatorios`
- **Abas:** Gerar, Histórico, Configurar Envio
- **6 Tipos:** Semanal, Mensal, Pesquisas, Prestação Contas, Adversários, Personalizado
- **Features:** Geração PDF, envio automático por e-mail, histórico com download
- **Dados necessários:** POST /relatorios/gerar, GET /relatorios/historico

### 14. Pesquisas/Surveys (`pesq`) → `PesquisasSurveys`
- **Abas:** Criar Pesquisa, Ativas, Resultados
- **Features:** IA gerar perguntas, disparar por canal, NPS gauge
- **Dados necessários:** CRUD /pesquisas/*, POST /pesquisas/ai-generate

### 15. Dia da Eleição / GOTV (`gotv`) → `GOTV`
- **Features:** Countdown, 4 KPIs, checklist 8 itens, ações rápidas (SMS/WhatsApp/transporte/apuração)
- **Dados necessários:** GET /gotv/status, PATCH /gotv/checklist/:id

### 16. Mapa Eleitoral (`mapa`) → `MapaEleitoral`
- **Abas:**
  - Visão Geral: SVG mapa com bolhas + barras empilhadas 6 regiões
  - Zonas Eleitorais: Tabela 8 zonas com badge Forte/Disputada/Fraca
  - Demográfico: Faixa etária/gênero/renda/escolaridade
  - Prioridades IA: 3 regiões rankeadas com ações, investimento e ROI
- **Dados necessários:** GET /mapa/*

### 17. Estratégica (`estr`) → `Estr`
- **Abas:**
  - Decisões: 7 pendentes com contexto + integração 5 módulos + recomendação IA
  - Matriz: O QUÊ/COMO/ONDE/POR QUÊ com 4 itens cada
  - Narrativa: 4 eixos + mensagem central
  - Timeline: 4 semanas com ações
- **Dados necessários:** GET /estrategia/*, PATCH /estrategia/decisoes/:id

### 18. Assistente IA (`ia`) → `IA`
- **Features:** Chat com metodologia Fernando Carreiro, quick prompts, histórico
- **Integrações:** API de IA com system prompt customizado
- **Dados necessários:** POST /ia/chat, GET /ia/historico

### 19. Configurações (`config`) → `ConfigPage`
- **Abas:**
  - Meu Perfil: Nome, email, avatar, telefone
  - Conta e Segurança: Senha, 2FA
  - Notificações: Push, email, SMS por tipo
  - Plano: 3 planos (Essencial R$2.900, Profissional R$5.900, Enterprise R$12.900)
  - Equipe: 9 membros, 9 perfis, matriz de acesso 18 módulos × 9 membros

---

## Fluxo de Dados Críticos

```
Monitoramento (tempo real)
    ↓
Dashboard (KPIs agregados)
    ↓
Estratégica (decisões baseadas em dados)
    ↓
Produção IA (gera conteúdo)
    ↓
Publicação Social (agenda e publica)
    ↓
Monitoramento (mede resultado) → ciclo
```

```
Demandas (entrada do cliente)
    ↓
Distribui para → Produção / Comunicação / Estratégica / etc.
    ↓
Execução no módulo destino
    ↓
Volta como "Concluída" para Demandas
```
